// ============================================================
// TON Shield — Jetton Analyzer (Anti-Rugpull)
// ============================================================
// Real on-chain analysis via TON API.
// Validates jetton_master, holder concentration, mintable/admin,
// blacklist/whitelist, honeypot indicators.

import { NextRequest, NextResponse } from 'next/server';
import { getAccount, getJettonInfo, getJettonHolders } from '@/lib/engine/tonapi';
import { calculateRiskScore, factor } from '@/lib/engine/scoring';
import { generateJettonFeedback } from '@/lib/engine/feedback';
import { checkRateLimit, getClientId } from '@/lib/engine/ratelimit';
import type { TopHolder, TonApiHolder } from '@/lib/engine/types';

// ---------- Known DEX / Exchange Addresses ----------

const KNOWN_DEX_NAMES = new Set([
  'ston.fi', 'stonfi', 'ston fi',
  'dedust', 'de dust', 'dedust.io',
  'megaton', 'megaton finance',
  'binance', 'binance hot wallet',
  'bybit', 'okx', 'htx', 'kucoin', 'gate.io',
  'mexc', 'bitget',
  'tether-treasury', 'tether treasury',
  // Pool identifiers
  'pool', 'dex pool', 'lp pool', 'liquidity',
  'vault', 'staking',
]);

function isDexOrExchange(holder: TonApiHolder): boolean {
  const name = (holder.owner?.name || '').toLowerCase();
  if (!name) return false;

  for (const dex of KNOWN_DEX_NAMES) {
    if (name.includes(dex)) return true;
  }

  return false;
}

// ---------- Holder Concentration Analysis ----------

function analyzeHolders(
  holders: TonApiHolder[],
  totalSupply: string
): {
  topHolders: TopHolder[];
  topHolderConcentration: number;   // top-3 non-DEX %
  totalConcentration: number;       // all displayed holders %
} {
  const totalSupplyNum = parseFloat(totalSupply);
  if (totalSupplyNum === 0) {
    return { topHolders: [], topHolderConcentration: 0, totalConcentration: 0 };
  }

  const topHolders: TopHolder[] = holders.map(h => {
    const balance = parseFloat(h.balance);
    const percentage = (balance / totalSupplyNum) * 100;
    const is_dex = isDexOrExchange(h);

    return {
      address: h.owner?.address || h.address,
      name: h.owner?.name || undefined,
      balance: h.balance,
      percentage,
      is_dex,
    };
  });

  // Top-3 non-DEX concentration
  const nonDexHolders = topHolders.filter(h => !h.is_dex);
  const top3NonDex = nonDexHolders.slice(0, 3);
  const topHolderConcentration = top3NonDex.reduce((sum, h) => sum + h.percentage, 0);

  const totalConcentration = topHolders.reduce((sum, h) => sum + h.percentage, 0);

  return { topHolders, topHolderConcentration, totalConcentration };
}

// ---------- Main Handler ----------

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;

  // Rate limiting
  const clientId = getClientId(request);
  const rateCheck = checkRateLimit(`jetton:${clientId}`, 10, 60_000);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: 'RATE_LIMITED', message: `Too many requests. Retry in ${Math.ceil(rateCheck.retryAfterMs / 1000)}s` },
      { status: 429 }
    );
  }

  try {
    // Step 1: Validate that this is a Jetton Master contract
    const accountInfo = await getAccount(address).catch(() => null);

    if (accountInfo) {
      const interfaces = accountInfo.interfaces || [];
      if (!interfaces.includes('jetton_master')) {
        return NextResponse.json({
          error: 'NOT_JETTON_MASTER',
          message: 'This address is not a Jetton Master contract. Please provide a valid Jetton token address.',
          account_type: accountInfo.is_wallet ? 'wallet' : 'contract',
          interfaces,
        }, { status: 400 });
      }
    }

    // Step 2: Get jetton info + holders in parallel
    const [jettonInfo, holdersData] = await Promise.all([
      getJettonInfo(address),
      getJettonHolders(address, 20).catch(() => ({ addresses: [], total: 0 })),
    ]);

    // Step 3: Analyze holder concentration
    const holderAnalysis = analyzeHolders(
      holdersData.addresses || [],
      jettonInfo.total_supply
    );

    const hasAdmin = jettonInfo.admin !== null && jettonInfo.admin !== undefined;
    const holdersCount = jettonInfo.holders_count || holdersData.total || 0;

    // ---------- Risk Factors ----------

    const factors = [
      // INSTANT CRITICAL: Blacklisted token
      factor(
        'blacklisted',
        'Blacklist Status',
        'This token has been officially BLACKLISTED as a scam/malicious token',
        0.60,
        jettonInfo.verification === 'blacklist',
        'high'
      ),

      // Holder concentration: top-3 > 50%
      factor(
        'high_concentration',
        'Holder Concentration',
        `Top 3 non-exchange holders control ${holderAnalysis.topHolderConcentration.toFixed(1)}% of total supply — extreme rugpull risk`,
        0.35,
        holderAnalysis.topHolderConcentration > 50,
        'high'
      ),

      // Holder concentration: top-3 > 30% (warning zone)
      factor(
        'medium_concentration',
        'Holder Concentration',
        `Top 3 non-exchange holders control ${holderAnalysis.topHolderConcentration.toFixed(1)}% of total supply`,
        0.20,
        holderAnalysis.topHolderConcentration > 30 && holderAnalysis.topHolderConcentration <= 50,
        'medium'
      ),

      // Mintable + active admin = unlimited supply risk
      factor(
        'mintable_admin',
        'Minting Risk',
        'Token is mintable with an active admin — unlimited supply inflation is possible',
        0.25,
        jettonInfo.mintable === true && hasAdmin,
        'high'
      ),

      // Mintable but no admin (lower risk)
      factor(
        'mintable_no_admin',
        'Minting Status',
        'Token is mintable but admin ownership has been renounced',
        0.05,
        jettonInfo.mintable === true && !hasAdmin,
        'low'
      ),

      // Very few holders
      factor(
        'few_holders',
        'Low Adoption',
        `Token has only ${holdersCount} holders — very low adoption and liquidity`,
        0.20,
        holdersCount < 100,
        'medium'
      ),

      // No verification (unknown token)
      factor(
        'unverified',
        'Verification Status',
        'Token is not verified by any trusted authority',
        0.10,
        jettonInfo.verification === 'none',
        'low'
      ),

      // POSITIVE: Whitelisted token (reduces score)
      factor(
        'whitelisted',
        'Verified Token',
        'This token is officially verified and whitelisted',
        -0.30,
        jettonInfo.verification === 'whitelist',
        'low'
      ),

      // POSITIVE: Large holder base
      factor(
        'large_holder_base',
        'Strong Adoption',
        `Token has ${holdersCount.toLocaleString()} holders — strong community adoption`,
        -0.10,
        holdersCount > 10000,
        'low'
      ),
    ];

    const riskResult = calculateRiskScore(factors);

    // ---------- Generate Feedback ----------

    const feedback = generateJettonFeedback(riskResult.signals, riskResult.score, {
      name: jettonInfo.metadata.name,
      symbol: jettonInfo.metadata.symbol,
      verification: jettonInfo.verification,
      holdersCount,
      mintable: jettonInfo.mintable,
      hasAdmin,
      topHolderConcentration: holderAnalysis.topHolderConcentration,
    });

    // ---------- Build Response ----------

    const decimals = parseInt(jettonInfo.metadata.decimals || '9');
    const totalSupplyHuman = (parseFloat(jettonInfo.total_supply) / Math.pow(10, decimals)).toString();

    const response = {
      address,
      risk_level: riskResult.level,
      risk_score: riskResult.score,
      metadata: {
        name: jettonInfo.metadata.name,
        symbol: jettonInfo.metadata.symbol,
        decimals,
        description: jettonInfo.metadata.description,
        image: jettonInfo.preview || jettonInfo.metadata.image,
      },
      total_supply: totalSupplyHuman,
      holder_count: holdersCount,
      admin_address: jettonInfo.admin?.address || null,
      mintable: jettonInfo.mintable,
      verification: jettonInfo.verification,
      top_holders: holderAnalysis.topHolders.slice(0, 10),
      holder_concentration_pct: Math.round(holderAnalysis.topHolderConcentration * 10) / 10,
      signals: riskResult.signals,
      ai_summary: feedback,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('Jetton analysis error:', error);
    const message = error instanceof Error ? error.message : 'Failed to analyze jetton';
    return NextResponse.json(
      { error: 'ANALYSIS_FAILED', message },
      { status: 500 }
    );
  }
}
