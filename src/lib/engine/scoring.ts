// ============================================================
// TON Shield — Risk Scoring Engine
// ============================================================
// Formula: Score = Σ(wᵢ × rᵢ × 100), clamped to [0, 100]
// Thresholds: SAFE < 30, 30 ≤ WARNING < 70, CRITICAL ≥ 70

import type { RiskFactor, RiskResult, RiskSignalOutput } from './types';

/**
 * Calculate the final risk score from an array of risk factors.
 *
 * Each factor has:
 *   - weight: 0..1 (importance)
 *   - triggered: boolean (whether this risk was detected)
 *
 * Score = Σ(weight × 100) for all triggered factors, clamped to [0, 100].
 */
export function calculateRiskScore(factors: RiskFactor[]): RiskResult {
  let rawScore = 0;

  const signals: RiskSignalOutput[] = [];

  for (const factor of factors) {
    if (!factor.triggered) continue;

    const points = Math.round(factor.weight * 100);
    rawScore += points;

    signals.push({
      category: factor.category,
      message: factor.message,
      severity: factor.severity,
      points,
    });
  }

  // Clamp to [0, 100]
  const score = Math.max(0, Math.min(100, rawScore));

  // Determine level
  let level: 'SAFE' | 'WARNING' | 'CRITICAL';
  if (score >= 70) {
    level = 'CRITICAL';
  } else if (score >= 30) {
    level = 'WARNING';
  } else {
    level = 'SAFE';
  }

  return { score, level, signals, factors };
}

// ---------- Pre-built Factor Constructors ----------

/**
 * Create a risk factor (convenience helper)
 */
export function factor(
  id: string,
  category: string,
  message: string,
  weight: number,
  triggered: boolean,
  severity: 'low' | 'medium' | 'high' = 'medium'
): RiskFactor {
  return { id, category, message, weight, triggered, severity };
}
