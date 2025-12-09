'use client';

import { useTelegram } from '@/lib/hooks/useTelegram';
import { useHistory } from '@/lib/hooks/useDashboard';
import { useApp } from '@/lib/i18n/AppContext';
import { TonConnectButton } from '@tonconnect/ui-react';
import { Shield, Link2, FileText, Coins, Globe, Moon, Sun, Languages } from 'lucide-react';
import Link from 'next/link';
import { HistoryList } from '@/components/HistoryList';

export default function Home() {
  const { user } = useTelegram();
  const { history, isLoading } = useHistory(user?.id.toString() || null, { limit: 3 });
  const { theme, language, toggleTheme, setLanguage, t } = useApp();

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            {t('appName')}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {t('appDescription')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'ru' : 'en')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title={language === 'en' ? 'Русский' : 'English'}
          >
            <Languages className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <span className="text-xs font-bold ml-1">{language.toUpperCase()}</span>
          </button>
          
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title={theme === 'light' ? t('darkMode') : t('lightMode')}
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-gray-700" />
            ) : (
              <Sun className="w-5 h-5 text-yellow-400" />
            )}
          </button>
        </div>
      </div>

      {/* TON Connect */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              {t('connectWallet')}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('forTransactionAnalysis')}
            </p>
          </div>
          <TonConnectButton />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          {t('quickCheck')}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/check/link"
            className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white rounded-lg p-4 hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 transition-all shadow-sm hover:shadow-md"
          >
            <Link2 className="w-6 h-6 mb-2" />
            <p className="font-semibold">{t('scanLinkBot')}</p>
            <p className="text-xs opacity-90 mt-1">{t('checkURLBotSafety')}</p>
          </Link>

          <Link
            href="/check/address"
            className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white rounded-lg p-4 hover:from-green-600 hover:to-green-700 dark:hover:from-green-700 dark:hover:to-green-800 transition-all shadow-sm hover:shadow-md"
          >
            <FileText className="w-6 h-6 mb-2" />
            <p className="font-semibold">{t('address')}</p>
            <p className="text-xs opacity-90 mt-1">{t('checkWallet')}</p>
          </Link>

          <Link
            href="/check/jetton"
            className="bg-gradient-to-br from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 text-white rounded-lg p-4 hover:from-amber-600 hover:to-amber-700 dark:hover:from-amber-700 dark:hover:to-amber-800 transition-all shadow-sm hover:shadow-md"
          >
            <Coins className="w-6 h-6 mb-2" />
            <p className="font-semibold">{t('jetton')}</p>
            <p className="text-xs opacity-90 mt-1">{t('analyzeToken')}</p>
          </Link>

          <Link
            href="/connections"
            className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 text-white rounded-lg p-4 hover:from-purple-600 hover:to-purple-700 dark:hover:from-purple-700 dark:hover:to-purple-800 transition-all shadow-sm hover:shadow-md"
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
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('recentActivity')}
          </h2>
          <Link
            href="/dashboard"
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            {t('viewAll')}
          </Link>
        </div>
        {isLoading ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="animate-pulse text-gray-600 dark:text-gray-400">{t('loading')}</div>
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
