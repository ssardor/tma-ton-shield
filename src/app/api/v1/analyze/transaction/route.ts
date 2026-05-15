// ============================================================
// TON Shield — Transaction Analyzer (Pre-Send Security)
// ============================================================
// Real on-chain analysis of the TARGET address before sending.
// Uses Risk Engine: scam check, balance, age, amount analysis.

import { NextRequest, NextResponse } from 'next/server';
import { getAccount, getAccountEvents } from '@/lib/engine/tonapi';
import { calculateRiskScore, factor } from '@/lib/engine/scoring';
import { generateAddressFeedback } from '@/lib/engine/feedback';
import { checkRateLimit, getClientId } from '@/lib/engine/ratelimit';
import type { TonApiEvent } from '@/lib/engine/types';

// ---------- Helpers ----------

function estimateAccountAge(events: TonApiEvent[]): number | null {
  if (!events || events.length === 0) return null;
  const oldest = events[events.length - 1];
  const nowSec = Math.floor(Date.now() / 1000);
  return (nowSec - oldest.timestamp) / 3600;
}

function countTransactionPatterns(events: TonApiEvent[], targetAddress: string) {
  let incomingCount = 0;
  let outgoingCount = 0;
  let scamInteractions = 0;

  for (const event of events) {
    if (event.is_scam) scamInteractions++;
    for (const action of event.actions) {
      if (action.TonTransfer) {
        const isSender = action.TonTransfer.sender.address.includes(targetAddress.slice(-20));
        if (isSender) outgoingCount++;
        else incomingCount++;
        if (action.TonTransfer.sender.is_scam || action.TonTransfer.recipient.is_scam) {
          scamInteractions++;
        }
      }
    }
  }

  return { incomingCount, outgoingCount, scamInteractions };
}

// ---------- Main Handler ----------

export async function POST(request: NextRequest) {
  // Rate limiting
  const clientId = getClientId(request);
  const rateCheck = checkRateLimit(`tx:${clientId}`, 10, 60_000);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: 'RATE_LIMITED', message: `Too many requests. Retry in ${Math.ceil(rateCheck.retryAfterMs / 1000)}s` },
      { status: 429 }
    );
  }

  const body = await request.json();
  const { user_wallet, target_address, amount_nanoton } = body;

  if (!target_address) {
    return NextResponse.json(
      { error: 'MISSING_TARGET', message: 'Target address is required' },
      { status: 400 }
    );
  }

  try {
    // Fetch target account data from TON API
    const [targetAccount, eventsData] = await Promise.all([
      getAccount(target_address),
      getAccountEvents(target_address, 15).catch(() => ({ events: [] as TonApiEvent[] })),
    ]);

    const balanceTon = targetAccount.balance / 1e9;
    const amountTon = amount_nanoton ? parseInt(amount_nanoton) / 1e9 : 0;
    const accountAgeHours = estimateAccountAge(eventsData.events || []);
    const txPatterns = countTransactionPatterns(
      eventsData.events || [],
      targetAccount.address || target_address
    );

    const isNewHighActivity = accountAgeHours !== null &&
      accountAgeHours < 24 &&
      (eventsData.events?.length || 0) > 10;

    // ---------- Risk Factors ----------

    const factors = [
      // INSTANT CRITICAL: is_scam (weight 1.0)
      factor(
        'scam_flag',
        'Scam Detection',
        'TARGET ADDRESS IS A CONFIRMED SCAM — do NOT send funds!',
        1.0,
        targetAccount.is_scam === true,
        'high'
      ),

      // New account
      factor(
        'new_account',
        'Account Age',
        accountAgeHours !== null
          ? `Target account is approximately ${Math.round(accountAgeHours)} hours old`
          : 'Unable to determine account age',
        0.20,
        accountAgeHours !== null && accountAgeHours < 24,
        'medium'
      ),

      // Zero balance target
      factor(
        'zero_balance',
        'Balance Check',
        'Target wallet has zero balance — potentially a fresh drainer address',
        0.15,
        balanceTon === 0 && targetAccount.status !== 'active',
        'medium'
      ),

      // Drainer pattern: new + high activity
      factor(
        'drainer_pattern',
        'Drainer Detection',
        `New account with abnormally high activity (${eventsData.events?.length || 0} transactions in <24h)`,
        0.35,
        isNewHighActivity,
        'high'
      ),

      // Large amount relative to target balance
      factor(
        'large_amount',
        'Amount Analysis',
        `Sending ${amountTon.toFixed(2)} TON to a wallet with only ${balanceTon.toFixed(2)} TON balance`,
        0.15,
        amountTon > 0 && balanceTon > 0 && amountTon > balanceTon * 10,
        'medium'
      ),

      // Very large transaction (> 1000 TON)
      factor(
        'whale_transfer',
        'High-Value Transfer',
        `Transaction amount (${amountTon.toFixed(2)} TON) is very large — double-check the recipient`,
        0.10,
        amountTon > 1000,
        'medium'
      ),

      // Scam interactions in target's history
      factor(
        'scam_connections',
        'Scam Connections',
        'Target has recent transactions with known scam addresses',
        0.30,
        txPatterns.scamInteractions > 0,
        'high'
      ),

      // Not a wallet (contract interaction)
      factor(
        'is_contract',
        'Contract Type',
        'Target is a smart contract, not a regular wallet — verify contract before interacting',
        0.10,
        !targetAccount.is_wallet,
        'low'
      ),

      // Mostly outgoing = possible drainer
      factor(
        'mostly_outgoing',
        'Suspicious Pattern',
        'Target has overwhelmingly outgoing transactions — potential fund drainer',
        0.25,
        txPatterns.outgoingCount > txPatterns.incomingCount * 3 && txPatterns.outgoingCount > 5,
        'high'
      ),
    ];

    const riskResult = calculateRiskScore(factors);

    // ---------- Generate Feedback ----------

    const feedback = generateAddressFeedback(riskResult.signals, riskResult.score, {
      address: targetAccount.address || target_address,
      isScam: targetAccount.is_scam,
      balanceTon,
      accountAgeHours,
      isWallet: targetAccount.is_wallet,
      transactionCount: eventsData.events?.length || 0,
    });

    // ---------- Build Response ----------

    const response = {
      user_wallet: user_wallet || null,
      target_address: targetAccount.address || target_address,
      amount_nanoton: amount_nanoton || '0',
      risk_level: riskResult.level,
      risk_score: riskResult.score,
      target_account_info: {
        address: targetAccount.address || target_address,
        is_wallet: targetAccount.is_wallet,
        is_scam: targetAccount.is_scam,
        balance: targetAccount.balance.toString(),
        status: targetAccount.status,
        name: targetAccount.name,
      },
      signals: riskResult.signals,
      ai_summary: feedback,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('Transaction analysis error:', error);
    const message = error instanceof Error ? error.message : 'Failed to analyze transaction';
    return NextResponse.json(
      { error: 'ANALYSIS_FAILED', message },
      { status: 500 }
    );
  }
}
