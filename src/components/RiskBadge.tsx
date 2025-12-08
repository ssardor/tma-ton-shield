import { RiskLevel } from '@/lib/api/types';
import { getRiskColor, getRiskIcon } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface RiskBadgeProps {
  riskLevel: RiskLevel;
  score?: number;
  className?: string;
}

export function RiskBadge({ riskLevel, score, className }: RiskBadgeProps) {
  const colors = getRiskColor(riskLevel);
  const icon = getRiskIcon(riskLevel);

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border',
        colors.bg,
        colors.text,
        colors.border,
        className
      )}
    >
      <span className="text-base">{icon}</span>
      <span>{riskLevel}</span>
      {score !== undefined && (
        <span className="text-xs opacity-75">({score}/100)</span>
      )}
    </div>
  );
}
