'use client';

import { useState } from 'react';
import { useTelegram } from '@/lib/hooks/useTelegram';
import { useDashboard, useHistory } from '@/lib/hooks/useDashboard';
import { StatsOverview } from '@/components/StatsOverview';
import { HistoryList } from '@/components/HistoryList';
import { RiskTimelinePoint, AssessmentType, RiskLevel } from '@/lib/api/types';
import { BarChart3, RefreshCw, Filter } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function DashboardPage() {
  const { user } = useTelegram();
  const { dashboard, isLoading, refresh } = useDashboard(user?.id.toString() || null);
  const [filterType, setFilterType] = useState<AssessmentType | 'all'>('all');
  const [filterRisk, setFilterRisk] = useState<RiskLevel | 'all'>('all');

  const { history, isLoading: historyLoading } = useHistory(
    user?.id.toString() || null,
    {
      limit: 20,
      type: filterType !== 'all' ? filterType : undefined,
      risk_level: filterRisk !== 'all' ? filterRisk : undefined,
    }
  );

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
      </div>

      {/* History */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">History</h3>
        {historyLoading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="animate-pulse text-gray-600">Loading history...</div>
          </div>
        ) : (
          <HistoryList
            items={history?.items || []}
            onItemClick={(item) => {
              window.location.href = `/check/${item.type}?target=${encodeURIComponent(item.target)}`;
            }}
          />
        )}
      </div>
    </div>
  );
}
