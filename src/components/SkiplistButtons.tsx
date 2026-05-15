'use client';

import { useState, useEffect } from 'react';
import { Shield, ShieldOff, ShieldCheck, X } from 'lucide-react';
import { useTelegram } from '@/lib/hooks/useTelegram';
import {
  addToSkiplist,
  removeFromSkiplist,
  checkSkiplist,
  type SkiplistEntry,
  type SkiplistAction,
} from '@/lib/storage/skiplist';

interface SkiplistButtonsProps {
  target: string;
  type: 'address' | 'link' | 'jetton';
  label?: string;
  compact?: boolean;
}

export function SkiplistButtons({ target, type, label, compact }: SkiplistButtonsProps) {
  const { user, hapticFeedback } = useTelegram();
  const [entry, setEntry] = useState<SkiplistEntry | null>(null);
  const [showConfirm, setShowConfirm] = useState<SkiplistAction | null>(null);

  const userId = user?.id?.toString() || 'anonymous';

  useEffect(() => {
    const existing = checkSkiplist(userId, target, type);
    setEntry(existing);
  }, [userId, target, type]);

  const handleAction = (action: SkiplistAction) => {
    if (entry && entry.action === action) {
      // Remove existing
      removeFromSkiplist(userId, entry.id);
      setEntry(null);
      hapticFeedback('light');
      return;
    }

    // Show confirmation for block action
    if (action === 'block' && !showConfirm) {
      setShowConfirm(action);
      return;
    }

    const newEntry = addToSkiplist(userId, {
      type,
      target,
      action,
      label,
    });
    setEntry(newEntry);
    setShowConfirm(null);
    hapticFeedback(action === 'trust' ? 'success' : 'warning');
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
        <p className="text-xs text-red-800 flex-1">
          Block this {type}? Future scans will show it as blocked.
        </p>
        <button
          onClick={() => handleAction('block')}
          className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors"
        >
          Block
        </button>
        <button
          onClick={() => setShowConfirm(null)}
          className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-red-600" />
        </button>
      </div>
    );
  }

  // Show current status badge if already in skiplist
  if (entry) {
    return (
      <div className={`flex items-center justify-between gap-2 rounded-lg p-3 ${
        entry.action === 'trust'
          ? 'bg-green-50 border border-green-200'
          : 'bg-red-50 border border-red-200'
      }`}>
        <div className="flex items-center gap-2">
          {entry.action === 'trust' ? (
            <ShieldCheck className="w-5 h-5 text-green-600" />
          ) : (
            <ShieldOff className="w-5 h-5 text-red-600" />
          )}
          <span className={`text-sm font-semibold ${
            entry.action === 'trust' ? 'text-green-800' : 'text-red-800'
          }`}>
            {entry.action === 'trust' ? 'Trusted' : 'Blocked'}
          </span>
        </div>
        <button
          onClick={() => handleAction(entry.action)}
          className="text-xs text-gray-500 hover:text-gray-700 underline"
        >
          Remove
        </button>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleAction('trust')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-800 text-xs font-semibold rounded-lg hover:bg-green-200 transition-colors"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Trust
        </button>
        <button
          onClick={() => handleAction('block')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-800 text-xs font-semibold rounded-lg hover:bg-red-200 transition-colors"
        >
          <ShieldOff className="w-3.5 h-3.5" />
          Block
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="w-5 h-5 text-gray-600" />
        <p className="text-sm font-semibold text-gray-900">Quick Actions</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleAction('trust')}
          className="flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm"
        >
          <ShieldCheck className="w-4 h-4" />
          Trust
        </button>
        <button
          onClick={() => handleAction('block')}
          className="flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-sm"
        >
          <ShieldOff className="w-4 h-4" />
          Block
        </button>
      </div>
    </div>
  );
}
