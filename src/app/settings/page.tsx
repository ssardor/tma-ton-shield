'use client';

import { useTelegram } from '@/lib/hooks/useTelegram';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { Settings as SettingsIcon, User, Wallet, LogOut, Info, Shield } from 'lucide-react';
import { shortenAddress } from '@/lib/utils';

export default function SettingsPage() {
  const { user } = useTelegram();
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress();

  const handleDisconnect = async () => {
    if (userAddress) {
      await tonConnectUI.disconnect();
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-blue-600" />
          Settings
        </h1>
        <p className="text-sm text-gray-600">Manage your preferences</p>
      </div>

      {/* User Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-gray-600" />
          <h2 className="font-semibold text-gray-900">User Information</h2>
        </div>
        
        {user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {user.photo_url && (
                <img
                  src={user.photo_url}
                  alt={user.first_name}
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div>
                <p className="font-medium text-gray-900">
                  {user.first_name} {user.last_name || ''}
                </p>
                {user.username && (
                  <p className="text-sm text-gray-600">@{user.username}</p>
                )}
              </div>
            </div>
            
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Telegram User ID</p>
              <p className="font-mono text-sm text-gray-900">{user.id}</p>
            </div>

            {user.language_code && (
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Language</p>
                <p className="text-sm text-gray-900 uppercase">{user.language_code}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No user data available</p>
        )}
      </div>

      {/* Wallet */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="w-5 h-5 text-gray-600" />
          <h2 className="font-semibold text-gray-900">Connected Wallet</h2>
        </div>

        {userAddress ? (
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-600 mb-1">Address</p>
              <p className="font-mono text-sm text-blue-900 break-all">
                {userAddress}
              </p>
            </div>

            <button
              onClick={handleDisconnect}
              className="w-full bg-red-50 text-red-700 font-semibold py-2.5 px-4 rounded-lg hover:bg-red-100 transition-all flex items-center justify-center gap-2 border border-red-200"
            >
              <LogOut className="w-4 h-4" />
              Disconnect Wallet
            </button>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-gray-500 mb-3">No wallet connected</p>
            <p className="text-xs text-gray-400">
              Connect your wallet from the home page
            </p>
          </div>
        )}
      </div>

      {/* About */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-gray-600" />
          <h2 className="font-semibold text-gray-900">About</h2>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900 mb-1">TON Shield AI</p>
              <p className="text-gray-600">
                AI-powered security scanner for TON blockchain transactions, tokens, and links.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Version</p>
            <p className="text-gray-900">1.0.0</p>
          </div>

          <div className="pt-3 border-t border-gray-100 space-y-2">
            <a
              href="https://yourapp.com/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-600 hover:text-blue-700"
            >
              Terms of Service
            </a>
            <a
              href="https://yourapp.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-600 hover:text-blue-700"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 pb-4">
        <p>Made with ❤️ for TON Community</p>
        <p className="mt-1">© 2025 TON Shield</p>
      </div>
    </div>
  );
}
