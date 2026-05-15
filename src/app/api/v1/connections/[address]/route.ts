// ============================================================
// TON Shield — Wallet Connections API (Ecosystem Map)
// ============================================================
// Server-side route that uses TONAPI_KEY for auth.
// Returns domains, jettons with USD prices, and NFTs.

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientId } from '@/lib/engine/ratelimit';

const TONAPI_BASE = 'https://tonapi.io/v2';

function getApiKey(): string {
  return process.env.TONAPI_KEY || '';
}

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const key = getApiKey();
  if (key) {
    headers['Authorization'] = `Bearer ${key}`;
  }
  return headers;
}

async function safeFetch(path: string, fallback: unknown) {
  try {
    const response = await fetch(`${TONAPI_BASE}${path}`, {
      headers: getHeaders(),
      next: { revalidate: 30 },
    });
    if (!response.ok) return fallback;
    return await response.json();
  } catch {
    return fallback;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;

  // Rate limiting
  const clientId = getClientId(request);
  const rateCheck = checkRateLimit(`conn:${clientId}`, 5, 60_000);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: 'RATE_LIMITED', message: `Too many requests. Retry in ${Math.ceil(rateCheck.retryAfterMs / 1000)}s` },
      { status: 429 }
    );
  }

  try {
    // Fetch all data in parallel
    const [domainsData, jettonsData, nftsData, accountData] = await Promise.all([
      safeFetch(`/accounts/${encodeURIComponent(address)}/dns/backresolve`, { domains: [] }),
      safeFetch(`/accounts/${encodeURIComponent(address)}/jettons?limit=100`, { balances: [] }),
      safeFetch(`/accounts/${encodeURIComponent(address)}/nfts?limit=100`, { nft_items: [] }),
      safeFetch(`/accounts/${encodeURIComponent(address)}`, { balance: 0 }),
    ]);

    const jettons = (jettonsData as any).balances || [];
    const tonBalanceNano = (accountData as any).balance || 0;

    // Collect jetton addresses for price lookup
    const tokenAddresses: string[] = ['TON'];
    for (const j of jettons) {
      if (j.jetton?.address) {
        tokenAddresses.push(j.jetton.address);
      }
    }

    // Fetch prices (batch)
    let prices: Record<string, { usd?: number; ton?: number }> = {};
    try {
      if (tokenAddresses.length > 0) {
        const tokensParam = tokenAddresses.join(',');
        const ratesData = await safeFetch(
          `/rates?tokens=${encodeURIComponent(tokensParam)}&currencies=usd,ton`,
          { rates: {} }
        ) as { rates: Record<string, { prices?: Record<string, number> }> };

        for (const [token, info] of Object.entries(ratesData.rates || {})) {
          prices[token] = {
            usd: info.prices?.USD || info.prices?.usd,
            ton: info.prices?.TON || info.prices?.ton,
          };
        }
      }
    } catch {
      // Prices are optional
    }

    // Calculate TON balance in USD
    const tonBalance = tonBalanceNano / 1e9;
    const tonUsdPrice = prices['TON']?.usd || 0;
    const tonUsdValue = tonBalance * tonUsdPrice;

    // Enrich jettons with USD values
    const enrichedJettons = jettons.map((j: any) => {
      const decimals = j.jetton?.decimals || 9;
      const balance = parseFloat(j.balance || '0') / Math.pow(10, decimals);
      const tokenPrice = prices[j.jetton?.address]?.usd || 0;
      const usdValue = balance * tokenPrice;

      return {
        ...j,
        price_usd: tokenPrice,
        value_usd: usdValue,
        balance_formatted: balance,
      };
    });

    // Calculate total portfolio value
    const totalJettonValue = enrichedJettons.reduce(
      (sum: number, j: any) => sum + (j.value_usd || 0),
      0
    );
    const totalPortfolioUsd = tonUsdValue + totalJettonValue;

    const result = {
      domains: (domainsData as any).domains || [],
      jettons: enrichedJettons,
      nfts: (nftsData as any).nft_items || [],
      total_jettons: jettons.length,
      total_nfts: ((nftsData as any).nft_items || []).length,
      ton_balance: tonBalance,
      ton_balance_usd: tonUsdValue,
      ton_price_usd: tonUsdPrice,
      total_portfolio_usd: totalPortfolioUsd,
    };

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Connections fetch error:', error);
    const message = error instanceof Error ? error.message : 'Failed to load connections';
    return NextResponse.json(
      { error: 'FETCH_FAILED', message },
      { status: 500 }
    );
  }
}
