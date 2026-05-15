// ============================================================
// TON Shield — Address Checker (Wallet Auditor)
// ============================================================
// Real on-chain analysis via TON API.
// is_scam = instant CRITICAL (weight 1.0).
// Drainer pattern detection, transaction analysis.

import { NextRequest, NextResponse } from 'next/server';
import { getAccount, getAccountEvents } from '@/lib/engine/tonapi';
import { calculateRiskScore, factor } from '@/lib/engine/scoring';
import { generateAddressFeedback } from '@/lib/engine/feedback';
import { checkRateLimit, getClientId } from '@/lib/engine/ratelimit';
import type { RecentTransaction, TonApiEvent } from '@/lib/engine/types';

// ---------- Transaction Pattern Analysis ----------

function analyzeTransactionPatterns(
  events: TonApiEvent[],
  targetAddress: string
): {
  recentTransactions: RecentTransaction[];
  transactionCount: number;
  suspiciousPatterns: string[];
  riskIndicators: string[];
  hasManySmallIncoming: boolean;
  highActivityNewAccount: boolean;
  incomingCount: number;
  outgoingCount: number;
} {
  const recentTransactions: RecentTransaction[] = [];
  const suspiciousPatterns: string[] = [];
  const riskIndicators: string[] = [];
  let incomingCount = 0;
  let outgoingCount = 0;
  let smallIncomingCount = 0;
  const uniqueCounterparties = new Set<string>();

  for (const event of events) {
    for (const action of event.actions) {
      let direction: 'in' | 'out' = 'in';
      let amount: string | undefined;
      let counterparty: RecentTransaction['counterparty'];
      let type = action.type;

      if (action.TonTransfer) {
        const transfer = action.TonTransfer;
        const isSender = transfer.sender.address === targetAddress ||
          transfer.sender.address.includes(targetAddress.slice(-20));

        direction = isSender ? 'out' : 'in';
        amount = `${(transfer.amount / 1e9).toFixed(4)} TON`;
        counterparty = isSender ? {
          address: transfer.recipient.address,
          name: transfer.recipient.name,
          is_scam: transfer.recipient.is_scam,
        } : {
          address: transfer.sender.address,
          name: transfer.sender.name,
          is_scam: transfer.sender.is_scam,
        };

        // Track small incoming (dust attack detection)
        if (!isSender && transfer.amount < 0.01 * 1e9) {
          smallIncomingCount++;
        }

        if (counterparty.is_scam) {
          suspiciousPatterns.push('scam_counterparty');
          riskIndicators.push(`Transaction with known scam address: ${counterparty.name || counterparty.address.slice(0, 12)}...`);
        }

        uniqueCounterparties.add(counterparty.address);
      } else if (action.JettonTransfer) {
        const transfer = action.JettonTransfer;
        const isSender = transfer.sender.address === targetAddress ||
          transfer.sender.address.includes(targetAddress.slice(-20));

        direction = isSender ? 'out' : 'in';
        type = 'JettonTransfer';
        const decimals = transfer.jetton.decimals || 9;
        const amountNum = parseFloat(transfer.amount) / Math.pow(10, decimals);
        amount = `${amountNum.toFixed(2)} ${transfer.jetton.symbol}`;
        counterparty = isSender ? {
          address: transfer.recipient.address,
          name: transfer.recipient.name,
          is_scam: transfer.recipient.is_scam,
        } : {
          address: transfer.sender.address,
          name: transfer.sender.name,
          is_scam: transfer.sender.is_scam,
        };
      }

      if (direction === 'in') incomingCount++;
      else outgoingCount++;

      // Only collect top 3 for display
      if (recentTransactions.length < 3) {
        recentTransactions.push({
          event_id: event.event_id,
          timestamp: event.timestamp,
          type,
          direction,
          amount,
          counterparty,
          description: action.simple_preview?.description || `${type} ${direction}`,
        });
      }
    }
  }

  // Detect patterns
  const hasManySmallIncoming = smallIncomingCount >= 5;
  if (hasManySmallIncoming) {
    suspiciousPatterns.push('dust_attack');
    riskIndicators.push(`${smallIncomingCount} very small incoming transactions detected (possible dust attack)`);
  }

  // Rapid transactions from many unique sources
  if (uniqueCounterparties.size > 15 && events.length <= 20) {
    suspiciousPatterns.push('high_counterparty_diversity');
    riskIndicators.push(`Interactions with ${uniqueCounterparties.size} different addresses in recent history`);
  }

  // Mostly outgoing = potential drainer
  if (outgoingCount > incomingCount * 3 && outgoingCount > 5) {
    suspiciousPatterns.push('mostly_outgoing');
    riskIndicators.push('Overwhelmingly outgoing transactions — possible drainer behavior');
  }

  return {
    recentTransactions,
    transactionCount: events.length,
    suspiciousPatterns: [...new Set(suspiciousPatterns)],
    riskIndicators,
    hasManySmallIncoming,
    highActivityNewAccount: false, // Will be set below
    incomingCount,
    outgoingCount,
  };
}

// ---------- Main Handler ----------

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;

  // Rate limiting
  const clientId = getClientId(request);
  const rateCheck = checkRateLimit(`addr:${clientId}`, 10, 60_000);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: 'RATE_LIMITED', message: `Too many requests. Retry in ${Math.ceil(rateCheck.retryAfterMs / 1000)}s` },
      { status: 429 }
    );
  }

  try {
    // Fetch real data from TON API
    const [accountInfo, eventsData] = await Promise.all([
      getAccount(address),
      getAccountEvents(address, 20).catch(() => ({ events: [] })),
    ]);

    const balanceTon = accountInfo.balance / 1e9;
    const nowSec = Math.floor(Date.now() / 1000);

    // Calculate account age
    let accountAgeHours: number | null = null;
    if (accountInfo.last_activity) {
      // last_activity is the latest activity, not creation time
      // We approximate age by looking at the oldest event in our fetch
      const oldestEvent = eventsData.events?.[eventsData.events.length - 1];
      if (oldestEvent) {
        accountAgeHours = (nowSec - oldestEvent.timestamp) / 3600;
      }
    }

    // Analyze transactions
    const txAnalysis = analyzeTransactionPatterns(
      eventsData.events || [],
      accountInfo.address || address
    );

    // High activity + new account = drainer pattern
    const isNewHighActivity = accountAgeHours !== null &&
      accountAgeHours < 24 &&
      txAnalysis.transactionCount > 10;
    txAnalysis.highActivityNewAccount = isNewHighActivity;

    if (isNewHighActivity) {
      txAnalysis.suspiciousPatterns.push('new_high_activity');
      txAnalysis.riskIndicators.push(
        `Account is less than ${Math.round(accountAgeHours!)} hours old but has ${txAnalysis.transactionCount}+ transactions — possible drainer`
      );
    }

    // ---------- Risk Factors ----------

    const factors = [
      // INSTANT CRITICAL: is_scam flag from TON Foundation (weight 1.0)
      factor(
        'scam_flag',
        'Scam Detection',
        'This address is flagged as a CONFIRMED SCAM in the TON security database',
        1.0,
        accountInfo.is_scam === true,
        'high'
      ),

      // Account age
      factor(
        'new_account',
        'Account Age',
        accountAgeHours !== null
          ? `Account is approximately ${Math.round(accountAgeHours)} hours old`
          : 'Unable to determine account age',
        0.20,
        accountAgeHours !== null && accountAgeHours < 24,
        'medium'
      ),

      // Zero balance
      factor(
        'zero_balance',
        'Balance Check',
        'Wallet has zero balance',
        0.10,
        balanceTon === 0,
        'low'
      ),

      // Low balance
      factor(
        'low_balance',
        'Balance Check',
        `Wallet has very low balance: ${balanceTon.toFixed(4)} TON`,
        0.05,
        balanceTon > 0 && balanceTon < 1,
        'low'
      ),

      // Drainer pattern: new + high activity
      factor(
        'drainer_pattern',
        'Drainer Detection',
        `New account with abnormally high activity (${txAnalysis.transactionCount} transactions)`,
        0.35,
        isNewHighActivity,
        'high'
      ),

      // Dust attack
      factor(
        'dust_attack',
        'Dust Attack',
        'Multiple very small incoming transactions detected — possible dust attack',
        0.20,
        txAnalysis.hasManySmallIncoming,
        'medium'
      ),

      // Contract (not a wallet)
      factor(
        'is_contract',
        'Contract Type',
        'This is a smart contract, not a regular wallet',
        0.05,
        !accountInfo.is_wallet,
        'low'
      ),

      // Scam counterparties in transactions
      factor(
        'scam_counterparties',
        'Scam Connections',
        'Recent transactions involve addresses flagged as scam',
        0.30,
        txAnalysis.suspiciousPatterns.includes('scam_counterparty'),
        'high'
      ),

      // Mostly outgoing (drainer)
      factor(
        'mostly_outgoing',
        'Transaction Pattern',
        'Overwhelmingly outgoing transactions — potential drainer behavior',
        0.25,
        txAnalysis.suspiciousPatterns.includes('mostly_outgoing'),
        'high'
      ),
    ];

    const riskResult = calculateRiskScore(factors);

    // ---------- Generate Feedback ----------

    const feedback = generateAddressFeedback(riskResult.signals, riskResult.score, {
      address: accountInfo.address || address,
      isScam: accountInfo.is_scam,
      balanceTon,
      accountAgeHours,
      isWallet: accountInfo.is_wallet,
      transactionCount: txAnalysis.transactionCount,
    });

    // ---------- Build Response ----------

    const response = {
      address: accountInfo.address || address,
      risk_level: riskResult.level,
      risk_score: riskResult.score,
      account_info: {
        address: accountInfo.address || address,
        is_wallet: accountInfo.is_wallet,
        is_scam: accountInfo.is_scam,
        balance: accountInfo.balance.toString(),
        last_activity: accountInfo.last_activity
          ? new Date(accountInfo.last_activity * 1000).toISOString()
          : null,
        status: accountInfo.status,
        interfaces: accountInfo.interfaces || [],
        name: accountInfo.name,
      },
      account_age_hours: accountAgeHours !== null ? Math.round(accountAgeHours) : null,
      recent_transactions: txAnalysis.recentTransactions,
      transaction_analysis: {
        total_analyzed: txAnalysis.transactionCount,
        suspicious_patterns: txAnalysis.suspiciousPatterns,
        risk_indicators: txAnalysis.riskIndicators,
        incoming_count: txAnalysis.incomingCount,
        outgoing_count: txAnalysis.outgoingCount,
      },
      signals: riskResult.signals,
      ai_summary: feedback,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('Address analysis error:', error);
    const message = error instanceof Error ? error.message : 'Failed to analyze address';
    return NextResponse.json(
      { error: 'ANALYSIS_FAILED', message },
      { status: 500 }
    );
  }
}
