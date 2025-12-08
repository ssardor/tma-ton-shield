import { HistoryItem } from '@/lib/api/types';
import { RiskBadge } from './RiskBadge';
import { formatDate, shortenAddress } from '@/lib/utils';
import { FileText, Link2, Coins, Wallet } from 'lucide-react';

interface HistoryListProps {
  items: HistoryItem[];
  onItemClick?: (item: HistoryItem) => void;
}

function getTypeIcon(type: string) {
  switch (type) {
    case 'transaction':
      return <Wallet className="w-5 h-5" />;
    case 'jetton':
      return <Coins className="w-5 h-5" />;
    case 'address':
      return <FileText className="w-5 h-5" />;
    case 'link':
      return <Link2 className="w-5 h-5" />;
    default:
      return <FileText className="w-5 h-5" />;
  }
}

export function HistoryList({ items, onItemClick }: HistoryListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>No history yet</p>
        <p className="text-sm mt-1">Start checking transactions, addresses, or links</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onItemClick?.(item)}
          className="w-full text-left bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 hover:shadow-sm transition-all"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="mt-1 text-gray-600">
                {getTypeIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    {item.type}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDate(item.created_at)}
                  </span>
                </div>
                <p className="text-sm font-mono text-gray-900 truncate">
                  {item.type === 'link' 
                    ? item.target 
                    : shortenAddress(item.target, 6)}
                </p>
              </div>
            </div>
            <RiskBadge riskLevel={item.risk_level} score={item.risk_score} />
          </div>
        </button>
      ))}
    </div>
  );
}
