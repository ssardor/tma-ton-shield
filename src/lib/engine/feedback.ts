// ============================================================
// TON Shield — Template-Based Feedback Generator
// ============================================================
// No LLM calls. Returns standardized English strings.
// Frontend handles i18n translation via signal codes.

import type { RiskSignalOutput, FeedbackResult } from './types';

// ---------- Link / Bot Feedback ----------

export function generateLinkFeedback(
  signals: RiskSignalOutput[],
  score: number,
  context: {
    domain?: string;
    isTelegram?: boolean;
    botUsername?: string;
    typosquattingTarget?: string;
    suspiciousKeywords?: string[];
  }
): FeedbackResult {
  const keyRisks: string[] = [];
  let verdict: string;
  let recommendation: string;

  // Build key risks from signals
  for (const s of signals) {
    if (s.severity === 'high' || s.severity === 'medium') {
      keyRisks.push(s.message);
    }
  }

  if (score >= 70) {
    if (context.typosquattingTarget) {
      verdict = `DANGER: This ${context.isTelegram ? 'bot' : 'domain'} appears to impersonate "${context.typosquattingTarget}". This is a common phishing technique.`;
    } else if (context.isTelegram && context.botUsername) {
      verdict = `DANGER: Bot @${context.botUsername} shows multiple high-risk indicators including suspicious keywords commonly used in scam bots.`;
    } else {
      verdict = `DANGER: ${context.domain || 'This URL'} is highly suspicious and likely a phishing or scam attempt.`;
    }
    recommendation = 'Do NOT interact with this resource. It shows clear signs of being malicious.';
  } else if (score >= 30) {
    if (context.isTelegram && context.botUsername) {
      verdict = `CAUTION: Bot @${context.botUsername} has some suspicious characteristics that require attention.`;
    } else {
      verdict = `CAUTION: ${context.domain || 'This URL'} has some risk factors. Proceed with care.`;
    }
    recommendation = 'Proceed with caution. Verify the authenticity of this resource before entering any personal data or connecting your wallet.';
  } else {
    if (context.isTelegram && context.botUsername) {
      verdict = `Bot @${context.botUsername} appears to be legitimate with no major risk indicators detected.`;
    } else {
      verdict = `${context.domain || 'This URL'} appears safe. No significant risk indicators were detected.`;
    }
    recommendation = 'This resource appears safe to interact with. Always remain vigilant and never share your seed phrase.';
  }

  return { verdict, key_risks: keyRisks, recommendation };
}

// ---------- Address Feedback ----------

export function generateAddressFeedback(
  signals: RiskSignalOutput[],
  score: number,
  context: {
    address: string;
    isScam: boolean;
    balanceTon: number;
    accountAgeHours: number | null;
    isWallet: boolean;
    transactionCount: number;
  }
): FeedbackResult {
  const keyRisks: string[] = [];

  for (const s of signals) {
    if (s.severity === 'high' || s.severity === 'medium') {
      keyRisks.push(s.message);
    }
  }

  let verdict: string;
  let recommendation: string;

  if (context.isScam) {
    verdict = `CRITICAL: This address has been flagged as a CONFIRMED SCAM by the TON security database. Do not interact with it under any circumstances.`;
    recommendation = 'BLOCK this address immediately. Do not send any funds or approve any transactions.';
  } else if (score >= 70) {
    verdict = `HIGH RISK: This address shows dangerous patterns — ${context.accountAgeHours !== null && context.accountAgeHours < 24 ? `created only ${Math.round(context.accountAgeHours)} hours ago` : 'multiple risk factors detected'}${context.transactionCount > 10 && context.accountAgeHours !== null && context.accountAgeHours < 24 ? ' with unusually high activity (possible drainer)' : ''}.`;
    recommendation = 'Avoid interacting with this address. The risk profile strongly suggests malicious intent.';
  } else if (score >= 30) {
    verdict = `MODERATE RISK: This ${context.isWallet ? 'wallet' : 'contract'} has some risk indicators. Balance: ${context.balanceTon.toFixed(2)} TON.`;
    recommendation = 'Proceed with caution. Consider sending a small test transaction first and verifying the recipient identity.';
  } else {
    verdict = `This ${context.isWallet ? 'wallet' : 'contract'} appears safe. Balance: ${context.balanceTon.toFixed(2)} TON. No risk indicators detected.`;
    recommendation = 'Safe to interact with. Always double-check the address before sending large amounts.';
  }

  return { verdict, key_risks: keyRisks, recommendation };
}

// ---------- Jetton Feedback ----------

export function generateJettonFeedback(
  signals: RiskSignalOutput[],
  score: number,
  context: {
    name: string;
    symbol: string;
    verification: 'whitelist' | 'blacklist' | 'none';
    holdersCount: number;
    mintable: boolean;
    hasAdmin: boolean;
    topHolderConcentration: number; // percentage
  }
): FeedbackResult {
  const keyRisks: string[] = [];

  for (const s of signals) {
    if (s.severity === 'high' || s.severity === 'medium') {
      keyRisks.push(s.message);
    }
  }

  let verdict: string;
  let recommendation: string;

  if (context.verification === 'blacklist') {
    verdict = `BLACKLISTED: ${context.name} (${context.symbol}) has been officially BLACKLISTED. This token is confirmed as malicious.`;
    recommendation = 'Do NOT buy, hold, or interact with this token. If you hold any, be aware it may be a scam token.';
  } else if (score >= 70) {
    const reasons: string[] = [];
    if (context.topHolderConcentration > 50) {
      reasons.push(`top holders control ${context.topHolderConcentration.toFixed(1)}% of supply`);
    }
    if (context.mintable && context.hasAdmin) {
      reasons.push('unlimited minting is possible by admin');
    }
    if (context.holdersCount < 100) {
      reasons.push(`only ${context.holdersCount} holders`);
    }
    verdict = `HIGH RISK: ${context.name} (${context.symbol}) shows critical rugpull indicators — ${reasons.join(', ')}.`;
    recommendation = 'Avoid buying this token. High probability of rugpull or honeypot.';
  } else if (score >= 30) {
    verdict = `CAUTION: ${context.name} (${context.symbol}) has some risk factors that need attention. Holders: ${context.holdersCount.toLocaleString()}.`;
    recommendation = 'Invest with caution. Do your own research and never invest more than you can afford to lose.';
  } else {
    if (context.verification === 'whitelist') {
      verdict = `VERIFIED: ${context.name} (${context.symbol}) is an officially verified and whitelisted token with ${context.holdersCount.toLocaleString()} holders.`;
      recommendation = 'This is a verified token. Safe to trade and hold.';
    } else {
      verdict = `${context.name} (${context.symbol}) appears relatively safe with ${context.holdersCount.toLocaleString()} holders and no major red flags.`;
      recommendation = 'Low risk detected, but always verify token contracts independently.';
    }
  }

  return { verdict, key_risks: keyRisks, recommendation };
}
