'use client';

import { useState, useMemo } from 'react';
import { useTelegram } from '@/lib/hooks/useTelegram';
import { useDashboard, useHistory } from '@/lib/hooks/useDashboard';
import { useWalletTransactions } from '@/lib/hooks/useWalletTransactions';
import { useTonAddress } from '@tonconnect/ui-react';
import { StatsOverview } from '@/components/StatsOverview';
import { HistoryList } from '@/components/HistoryList';
import { RiskTimelinePoint, AssessmentType, RiskLevel } from '@/lib/api/types';
import { BarChart3, RefreshCw, Filter, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function DashboardPage() {
  const { user } = useTelegram();
  const walletAddress = useTonAddress();
  const { dashboard, isLoading, refresh } = useDashboard(user?.id.toString() || null);
  const [filterType, setFilterType] = useState<AssessmentType | 'all'>('all');
  const [filterRisk, setFilterRisk] = useState<RiskLevel | 'all'>('all');
  const [showTransactions, setShowTransactions] = useState(true);

  const { history, isLoading: historyLoading } = useHistory(
    user?.id.toString() || null,
    {
      limit: 50,
      type: filterType !== 'all' ? filterType : undefined,
      risk_level: filterRisk !== 'all' ? filterRisk : undefined,
    }
  );

  const { transactions, isLoading: txLoading } = useWalletTransactions(
    walletAddress || null,
    20
  );

  // Combine history and transactions
  const combinedHistory = useMemo(() => {
    const items = [];
    
    // Add check history
    if (history?.items) {
      items.push(...history.items.map(item => ({
        ...item,
        activityType: 'check' as const,
      })));
    }
    
    // Add wallet transactions if enabled
    if (showTransactions && transactions?.events) {
      items.push(...transactions.events.map(event => ({
        id: event.event_id,
        type: 'transaction' as const,
        activityType: 'transaction' as const,
        target: event.actions?.[0]?.simple_preview?.description || 'Transaction',
        risk_level: 'SAFE' as const,
        risk_score: 0,
        created_at: new Date(event.timestamp * 1000).toISOString(),
        summary: event.actions?.[0]?.simple_preview?.description,
        event_data: event,
      })));
    }
    
    // Sort by timestamp
    return items.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [history, transactions, showTransactions]);

  const handleRefresh = () => {
    refresh();
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Dashboard
          </h1>
          <p className="text-sm text-gray-600">Security overview</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats Overview */}
      {isLoading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="animate-pulse text-gray-600">Loading stats...</div>
        </div>
      ) : dashboard ? (
        <StatsOverview stats={dashboard.stats} />
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
          No data available
        </div>
      )}

      {/* Risk Timeline Chart */}
      {dashboard && dashboard.risk_timeline.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Risk Timeline (30 days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dashboard.risk_timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
              />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="safe"
                stroke="#10b981"
                strokeWidth={2}
                name="Safe"
              />
              <Line
                type="monotone"
                dataKey="warning"
                stroke="#f59e0b"
                strokeWidth={2}
                name="Warning"
              />
              <Line
                type="monotone"
                dataKey="critical"
                stroke="#ef4444"
                strokeWidth={2}
                name="Critical"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Critical Findings */}
      {dashboard && dashboard.recent_critical.length > 0 && (
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200 p-4">
          <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
            🚨 Recent Critical Findings
          </h3>
          <div className="space-y-2">
            {dashboard.recent_critical.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg p-3 border border-red-200"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-red-700 uppercase">
                    {item.type}
                  </span>
                  <span className="text-xs text-red-600 font-mono">
                    {item.risk_score}/100
                  </span>
                </div>
                <p className="text-sm font-mono text-gray-900 truncate">
                  {item.target}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as AssessmentType | 'all')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="transaction">Transaction</option>
                <option value="address">Address</option>
                <option value="jetton">Jetton</option>
                <option value="link">Link</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Risk Level
              </label>
              <select
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value as RiskLevel | 'all')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Levels</option>
                <option value="SAFE">Safe</option>
                <option value="WARNING">Warning</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>
          
          {/* Toggle for Wallet Transactions */}
          {walletAddress && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <label className="text-sm font-medium text-gray-700">
                Show Wallet Transactions
              </label>
              <button
                onClick={() => setShowTransactions(!showTransactions)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  showTransactions ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showTransactions ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* History */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">
            History ({combinedHistory.length})
          </h3>
          {walletAddress && (
            <span className="text-xs text-gray-500">
              {showTransactions ? 'Checks + Transactions' : 'Checks only'}
            </span>
          )}
        </div>
        {historyLoading || txLoading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="animate-pulse text-gray-600">Loading history...</div>
          </div>
        ) : combinedHistory.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-gray-500">No activity yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {combinedHistory.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg border border-gray-200 p-3 hover:border-blue-300 transition-colors cursor-pointer"
                onClick={() => {
                  if (item.activityType === 'check') {
                    window.location.href = `/check/${item.type}?target=${encodeURIComponent(item.target)}`;
                  }
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {item.activityType === 'transaction' ? (
                        <>
                          <ArrowUpRight className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                          <span className="text-xs font-medium text-gray-500 uppercase">Transaction</span>
                        </>
                      ) : (
                        <span className="text-xs font-medium text-gray-500 uppercase">
                          {item.type}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {'summary' in item && item.summary ? item.summary : item.target}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {item.activityType === 'check' && (
                    <div className={`text-xs font-bold px-2 py-1 rounded flex-shrink-0 ${
                      item.risk_level === 'SAFE' ? 'bg-green-100 text-green-700' :
                      item.risk_level === 'WARNING' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {item.risk_level}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
