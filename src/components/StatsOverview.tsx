import { DashboardStats } from '@/lib/api/types';
import { Shield, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';

interface StatsOverviewProps {
  stats: DashboardStats;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 text-gray-600 mb-2">
          <Shield className="w-4 h-4" />
          <span className="text-xs font-medium">Total Checks</span>
        </div>
        <p className="text-2xl font-bold text-gray-900">{stats.total_checks}</p>
        <p className="text-xs text-gray-500 mt-1">
          {stats.checks_today} today
        </p>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-4">
        <div className="flex items-center gap-2 text-green-700 mb-2">
          <CheckCircle className="w-4 h-4" />
          <span className="text-xs font-medium">Safe</span>
        </div>
        <p className="text-2xl font-bold text-green-800">{stats.safe_count}</p>
        <p className="text-xs text-green-600 mt-1">
          {stats.safe_percentage.toFixed(1)}%
        </p>
      </div>

      <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border border-amber-200 p-4">
        <div className="flex items-center gap-2 text-amber-700 mb-2">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-xs font-medium">Warning</span>
        </div>
        <p className="text-2xl font-bold text-amber-800">{stats.warning_count}</p>
        <p className="text-xs text-amber-600 mt-1">
          {stats.warning_percentage.toFixed(1)}%
        </p>
      </div>

      <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200 p-4">
        <div className="flex items-center gap-2 text-red-700 mb-2">
          <AlertCircle className="w-4 h-4" />
          <span className="text-xs font-medium">Critical</span>
        </div>
        <p className="text-2xl font-bold text-red-800">{stats.critical_count}</p>
        <p className="text-xs text-red-600 mt-1">
          {stats.critical_percentage.toFixed(1)}%
        </p>
      </div>
    </div>
  );
}
