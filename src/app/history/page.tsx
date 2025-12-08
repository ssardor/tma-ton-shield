'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTonAddress } from '@tonconnect/ui-react';
import { ArrowLeft, Clock, TrendingUp, TrendingDown, AlertCircle, RefreshCw } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import type { TransactionEvent, TransactionAction } from '@/lib/api/types';

export default function TransactionHistoryPage() {
  const router = useRouter();
  const userWallet = useTonAddress();
  const [events, setEvents] = useState<TransactionEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [nextFrom, setNextFrom] = useState<number | undefined>();
  const [hasMore, setHasMore] = useState(false);

  const loadHistory = async (beforeLt?: number) => {
    if (!userWallet) {
      setError('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await apiClient.getTransactionHistory(userWallet, 20, beforeLt);
      
      if (beforeLt) {
        // Загружаем больше транзакций
        setEvents(prev => [...prev, ...response.events]);
      } else {
        // Первая загрузка
        setEvents(response.events);
      }

      setNextFrom(response.next_from);
      setHasMore(!!response.next_from);
    } catch (err: any) {
      setError(err.message || 'Failed to load transaction history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userWallet) {
      loadHistory();
    }
  }, [userWallet]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatAmount = (amount: number) => {
    return (amount / 1e9).toFixed(4);
  };

  const getActionIcon = (type: string) => {
    if (type === 'TonTransfer') return TrendingUp;
    if (type === 'JettonTransfer') return TrendingDown;
    return Clock;
  };

  const getActionColor = (type: string) => {
    if (type === 'TonTransfer') return 'text-green-600';
    if (type === 'JettonTransfer') return 'text-blue-600';
    return 'text-gray-600';
  };

  const renderAction = (action: TransactionAction, index: number) => {
    const Icon = getActionIcon(action.type);
    const colorClass = getActionColor(action.type);

    return (
      <div key={index} className="border-l-2 border-gray-200 pl-4 py-2">
        <div className="flex items-start gap-3">
          <Icon className={`w-5 h-5 ${colorClass} mt-1`} />
          <div className="flex-1">
            <p className="font-medium text-gray-900">
              {action.simple_preview.name}
            </p>
            <p className="text-sm text-gray-600">
              {action.simple_preview.description}
            </p>

            {/* TON Transfer Details */}
            {action.TonTransfer && (
              <div className="mt-2 bg-green-50 rounded-lg p-3 text-sm">
                <p className="font-medium text-green-900">
                  {formatAmount(action.TonTransfer.amount)} TON
                </p>
                <p className="text-xs text-green-700 mt-1 font-mono">
                  From: {action.TonTransfer.sender.address.slice(0, 8)}...
                </p>
                <p className="text-xs text-green-700 font-mono">
                  To: {action.TonTransfer.recipient.address.slice(0, 8)}...
                </p>
                {action.TonTransfer.comment && (
                  <p className="text-xs text-green-600 mt-1 italic">
                    "{action.TonTransfer.comment}"
                  </p>
                )}
              </div>
            )}

            {/* Jetton Transfer Details */}
            {action.JettonTransfer && (
              <div className="mt-2 bg-blue-50 rounded-lg p-3 text-sm">
                <div className="flex items-center gap-2">
                  {action.JettonTransfer.jetton.image && (
                    <img 
                      src={action.JettonTransfer.jetton.image} 
                      alt={action.JettonTransfer.jetton.symbol}
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <p className="font-medium text-blue-900">
                    {action.JettonTransfer.amount} {action.JettonTransfer.jetton.symbol}
                  </p>
                </div>
                <p className="text-xs text-blue-700 mt-1">
                  {action.JettonTransfer.jetton.name}
                </p>
              </div>
            )}

            {/* Smart Contract Execution */}
            {action.SmartContractExec && (
              <div className="mt-2 bg-purple-50 rounded-lg p-3 text-sm">
                <p className="text-xs text-purple-700">
                  Contract: {action.SmartContractExec.contract.name || 
                    action.SmartContractExec.contract.address.slice(0, 12)}...
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  Gas: {formatAmount(action.SmartContractExec.ton_attached)} TON
                </p>
              </div>
            )}

            {/* Scam Warning */}
            {action.simple_preview.accounts?.some(acc => acc.is_scam) && (
              <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <p className="text-xs text-red-800 font-semibold">
                  ⚠️ Scam address detected!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!userWallet) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-black" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-amber-600 mx-auto mb-3" />
          <p className="text-amber-900 font-semibold mb-2">
            Wallet Not Connected
          </p>
          <p className="text-sm text-amber-700">
            Please connect your wallet from the home page to view transaction history
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-black" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-6 h-6 text-indigo-600" />
              Transaction History
            </h1>
            <p className="text-sm text-gray-600 font-mono">
              {userWallet.slice(0, 8)}...{userWallet.slice(-6)}
            </p>
          </div>
        </div>

        <button
          onClick={() => loadHistory()}
          disabled={isLoading}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 text-gray-700 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg border border-indigo-200 p-4">
          <p className="text-sm text-indigo-700 mb-1">Total Events</p>
          <p className="text-2xl font-bold text-indigo-900">{events.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-4">
          <p className="text-sm text-green-700 mb-1">Safe Transactions</p>
          <p className="text-2xl font-bold text-green-900">
            {events.filter(e => !e.is_scam).length}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading && events.length === 0 && (
        <div className="flex justify-center items-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Transaction Events */}
      <div className="space-y-4">
        {events.map((event) => (
          <div
            key={event.event_id}
            className={`bg-white rounded-lg border ${
              event.is_scam ? 'border-red-300 bg-red-50' : 'border-gray-200'
            } p-4`}
          >
            {/* Event Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs text-gray-500">
                  {formatDate(event.timestamp)}
                </p>
                {event.is_scam && (
                  <div className="flex items-center gap-1 mt-1">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-xs font-semibold text-red-800">
                      SCAM DETECTED
                    </span>
                  </div>
                )}
              </div>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                {event.actions.length} action{event.actions.length > 1 ? 's' : ''}
              </span>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              {event.actions.map((action, idx) => renderAction(action, idx))}
            </div>

            {/* Fee */}
            {event.fee && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Fee: {formatAmount(Math.abs(event.fee))} TON
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Load More */}
      {hasMore && !isLoading && (
        <button
          onClick={() => loadHistory(nextFrom)}
          className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-sm hover:shadow-md"
        >
          Load More
        </button>
      )}

      {isLoading && events.length > 0 && (
        <div className="flex justify-center py-4">
          <div className="w-6 h-6 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!isLoading && events.length === 0 && !error && (
        <div className="text-center py-12">
          <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No transactions found</p>
        </div>
      )}
    </div>
  );
}
