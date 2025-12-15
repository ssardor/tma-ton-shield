'use client';

import { useTelegram } from '@/lib/hooks/useTelegram';
import { useHistory } from '@/lib/hooks/useDashboard';
import { useWalletTransactions } from '@/lib/hooks/useWalletTransactions';
import { useApp } from '@/lib/i18n/AppContext';
import { useTonAddress } from '@tonconnect/ui-react';
import { TonConnectButton } from '@tonconnect/ui-react';
import { Shield, Link2, FileText, Coins, Globe, Languages, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import Link from 'next/link';
import { HistoryList } from '@/components/HistoryList';
import { useMemo } from 'react';

export default function Home() {
  const { user } = useTelegram();
  const walletAddress = useTonAddress();
  const { history, isLoading: historyLoading } = useHistory(user?.id.toString() || null, { limit: 3 });
  const { transactions, isLoading: txLoading } = useWalletTransactions(walletAddress || null, 5);
  const { language, setLanguage, t } = useApp();

  // Combine history and transactions
  const combinedActivity = useMemo(() => {
    const items = [];
    
    // Add check history
    if (history?.items) {
      items.push(...history.items.map(item => ({
        ...item,
        activityType: 'check' as const,
      })));
    }
    
    // Add wallet transactions
    if (transactions?.events) {
      items.push(...transactions.events.slice(0, 3).map(event => ({
        id: event.event_id,
        type: 'transaction' as const,
        activityType: 'transaction' as const,
        target: event.actions?.[0]?.simple_preview?.description || 'Transaction',
        risk_level: 'SAFE' as const,
        risk_score: 0,
        created_at: new Date(event.timestamp * 1000).toISOString(),
        summary: event.actions?.[0]?.simple_preview?.description,
        event_data: event, // Keep full event data
      })));
    }
    
    // Sort by timestamp
    return items
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [history, transactions]);

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-7 h-7 text-blue-600" />
            {t('appName')}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {t('appDescription')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'ru' : 'en')}
            className="flex items-center gap-1 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
            title={language === 'en' ? 'Русский' : 'English'}
          >
            <Languages className="w-4 h-4 text-gray-700" />
            <span className="text-sm font-bold">{language.toUpperCase()}</span>
          </button>
        </div>
      </div>

      {/* TON Connect */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 mb-1">
              {t('connectWallet')}
            </p>
            <p className="text-xs text-gray-500">
              {t('forTransactionAnalysis')}
            </p>
          </div>
          <TonConnectButton />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          {t('quickCheck')}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/check/link"
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-4 hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md"
          >
            <Link2 className="w-6 h-6 mb-2" />
            <p className="font-semibold">{t('scanLinkBot')}</p>
            <p className="text-xs opacity-90 mt-1">{t('checkURLBotSafety')}</p>
          </Link>

          <Link
            href="/check/address"
            className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-4 hover:from-green-600 hover:to-green-700 transition-all shadow-sm hover:shadow-md"
          >
            <FileText className="w-6 h-6 mb-2" />
            <p className="font-semibold">{t('address')}</p>
            <p className="text-xs opacity-90 mt-1">{t('checkWallet')}</p>
          </Link>

          <Link
            href="/check/jetton"
            className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-lg p-4 hover:from-amber-600 hover:to-amber-700 transition-all shadow-sm hover:shadow-md"
          >
            <Coins className="w-6 h-6 mb-2" />
            <p className="font-semibold">{t('jetton')}</p>
            <p className="text-xs opacity-90 mt-1">{t('analyzeToken')}</p>
          </Link>

          <Link
            href="/connections"
            className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-4 hover:from-purple-600 hover:to-purple-700 transition-all shadow-sm hover:shadow-md"
          >
            <Globe className="w-6 h-6 mb-2" />
            <p className="font-semibold">{t('walletConnections')}</p>
            <p className="text-xs opacity-90 mt-1">{t('domainsTokensNFTs')}</p>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">
            {t('recentActivity')}
          </h2>
          <Link
            href="/dashboard"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {t('viewAll')}
          </Link>
        </div>
        {historyLoading || txLoading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="animate-pulse text-gray-600">{t('loading')}</div>
          </div>
        ) : combinedActivity.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-gray-500">{t('noActivity')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {combinedActivity.map((item) => (
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
                        <ArrowUpRight className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                      ) : item.type === 'link' ? (
                        <Link2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                      ) : item.type === 'address' ? (
                        <FileText className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                      ) : (
                        <Coins className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                      )}
                      <span className="text-xs font-medium text-gray-500 uppercase">
                        {item.activityType === 'transaction' ? 'Transaction' : item.type}
                      </span>
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
