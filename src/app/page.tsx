'use client';

import { useTelegram } from '@/lib/hooks/useTelegram';
import { useHistory } from '@/lib/hooks/useDashboard';
import { TonConnectButton } from '@tonconnect/ui-react';
import { Shield, Link2, FileText, Coins, Wallet, Clock, Globe } from 'lucide-react';
import Link from 'next/link';
import { HistoryList } from '@/components/HistoryList';

export default function Home() {
  const { user } = useTelegram();
  const { history, isLoading } = useHistory(user?.id.toString() || null, { limit: 3 });

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-7 h-7 text-blue-600" />
            TON Shield
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            AI-powered security scanner
          </p>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {user.first_name}
              </p>
              <p className="text-xs text-gray-500">
                @{user.username || 'user'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* TON Connect */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 mb-1">
              Connect Wallet
            </p>
            <p className="text-xs text-gray-500">
              For transaction analysis
            </p>
          </div>
          <TonConnectButton />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Quick Check
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/check/link"
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-4 hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md"
          >
            <Link2 className="w-6 h-6 mb-2" />
            <p className="font-semibold">Scan Link</p>
            <p className="text-xs opacity-90 mt-1">Check URL safety</p>
          </Link>

          <Link
            href="/check/transaction"
            className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-4 hover:from-purple-600 hover:to-purple-700 transition-all shadow-sm hover:shadow-md"
          >
            <Wallet className="w-6 h-6 mb-2" />
            <p className="font-semibold">Transaction</p>
            <p className="text-xs opacity-90 mt-1">Analyze transfer</p>
          </Link>

          <Link
            href="/check/address"
            className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-4 hover:from-green-600 hover:to-green-700 transition-all shadow-sm hover:shadow-md"
          >
            <FileText className="w-6 h-6 mb-2" />
            <p className="font-semibold">Address</p>
            <p className="text-xs opacity-90 mt-1">Check wallet</p>
          </Link>

          <Link
            href="/check/jetton"
            className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-lg p-4 hover:from-amber-600 hover:to-amber-700 transition-all shadow-sm hover:shadow-md"
          >
            <Coins className="w-6 h-6 mb-2" />
            <p className="font-semibold">Jetton</p>
            <p className="text-xs opacity-90 mt-1">Analyze token</p>
          </Link>

          <Link
            href="/history"
            className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-lg p-4 hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-sm hover:shadow-md"
          >
            <Clock className="w-6 h-6 mb-2" />
            <p className="font-semibold">Transaction History</p>
            <p className="text-xs opacity-90 mt-1">View all transactions</p>
          </Link>

          <Link
            href="/connections"
            className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-4 hover:from-purple-600 hover:to-purple-700 transition-all shadow-sm hover:shadow-md"
          >
            <Globe className="w-6 h-6 mb-2" />
            <p className="font-semibold">Wallet Connections</p>
            <p className="text-xs opacity-90 mt-1">Domains, Tokens, NFTs</p>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Activity
          </h2>
          <Link
            href="/dashboard"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View All
          </Link>
        </div>
        {isLoading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="animate-pulse text-gray-600">Loading...</div>
          </div>
        ) : (
          <HistoryList 
            items={history?.items || []}
            onItemClick={(item) => {
              // Navigate to detail page based on type
              window.location.href = `/check/${item.type}?target=${encodeURIComponent(item.target)}`;
            }}
          />
        )}
      </div>
    </div>
  );
}
