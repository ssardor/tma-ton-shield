'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTonAddress } from '@tonconnect/ui-react';
import { 
  ArrowLeft, 
  Globe, 
  Coins, 
  Image, 
  AlertCircle, 
  CheckCircle,
  XCircle,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import type { WalletConnectionsResponse, JettonBalance, NFTItem } from '@/lib/api/types';

export default function WalletConnectionsPage() {
  const router = useRouter();
  const userWallet = useTonAddress();
  const [connections, setConnections] = useState<WalletConnectionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'domains' | 'jettons' | 'nfts'>('domains');

  const loadConnections = async () => {
    if (!userWallet) {
      setError('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const data = await apiClient.getWalletConnections(userWallet);
      setConnections(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load wallet connections');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userWallet) {
      loadConnections();
    }
  }, [userWallet]);

  const formatBalance = (balance: string, decimals: number) => {
    const value = parseFloat(balance) / Math.pow(10, decimals);
    if (value === 0) return '0';
    if (value < 0.01) return '< 0.01';
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  const getVerificationIcon = (verification: string) => {
    if (verification === 'whitelist') return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (verification === 'blacklist') return <XCircle className="w-4 h-4 text-red-600" />;
    return null;
  };

  const getTrustBadge = (trust: string) => {
    if (trust === 'whitelist') {
      return (
        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
          Verified
        </span>
      );
    }
    if (trust === 'blacklist') {
      return (
        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">
          Scam
        </span>
      );
    }
    return null;
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
          <h1 className="text-2xl font-bold text-gray-900">Wallet Connections</h1>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-amber-600 mx-auto mb-3" />
          <p className="text-amber-900 font-semibold mb-2">
            Wallet Not Connected
          </p>
          <p className="text-sm text-amber-700">
            Please connect your wallet from the home page to view connections
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
              <Globe className="w-6 h-6 text-purple-600" />
              Connections
            </h1>
            <p className="text-sm text-gray-600 font-mono">
              {userWallet.slice(0, 8)}...{userWallet.slice(-6)}
            </p>
          </div>
        </div>

        <button
          onClick={loadConnections}
          disabled={isLoading}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 text-gray-700 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats */}
      {connections && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 p-4">
            <p className="text-sm text-purple-700 mb-1">Domains</p>
            <p className="text-2xl font-bold text-purple-900">{connections.domains.length}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-4">
            <p className="text-sm text-blue-700 mb-1">Tokens</p>
            <p className="text-2xl font-bold text-blue-900">{connections.total_jettons}</p>
          </div>
          <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg border border-pink-200 p-4">
            <p className="text-sm text-pink-700 mb-1">NFTs</p>
            <p className="text-2xl font-bold text-pink-900">{connections.total_nfts}</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading && !connections && (
        <div className="flex justify-center items-center py-12">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Tabs */}
      {connections && (
        <>
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('domains')}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === 'domains'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Globe className="w-4 h-4 inline mr-2" />
              Domains
            </button>
            <button
              onClick={() => setActiveTab('jettons')}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === 'jettons'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Coins className="w-4 h-4 inline mr-2" />
              Tokens
            </button>
            <button
              onClick={() => setActiveTab('nfts')}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === 'nfts'
                  ? 'text-pink-600 border-b-2 border-pink-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Image className="w-4 h-4 inline mr-2" />
              NFTs
            </button>
          </div>

          {/* Content */}
          <div className="space-y-3">
            {/* Domains Tab */}
            {activeTab === 'domains' && (
              <>
                {connections.domains.length === 0 ? (
                  <div className="text-center py-12">
                    <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No domains found</p>
                  </div>
                ) : (
                  connections.domains.map((domain, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between hover:border-purple-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <Globe className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{domain}</p>
                          <p className="text-xs text-gray-500">
                            {domain.endsWith('.ton') ? 'TON DNS' : 'Telegram Username'}
                          </p>
                        </div>
                      </div>
                      <a
                        href={domain.endsWith('.ton') 
                          ? `https://dns.ton.org/#${domain}`
                          : `https://t.me/${domain.replace('.t.me', '')}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 text-gray-600" />
                      </a>
                    </div>
                  ))
                )}
              </>
            )}

            {/* Jettons Tab */}
            {activeTab === 'jettons' && (
              <>
                {connections.jettons.length === 0 ? (
                  <div className="text-center py-12">
                    <Coins className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No tokens found</p>
                  </div>
                ) : (
                  connections.jettons
                    .filter(j => parseFloat(j.balance) > 0)
                    .map((jetton, idx) => (
                      <div
                        key={idx}
                        className={`bg-white rounded-lg border p-4 ${
                          jetton.jetton.verification === 'blacklist'
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            {jetton.jetton.image ? (
                              <img
                                src={jetton.jetton.image}
                                alt={jetton.jetton.symbol}
                                className="w-10 h-10 rounded-full"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Coins className="w-5 h-5 text-blue-600" />
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-gray-900">{jetton.jetton.name}</p>
                                {getVerificationIcon(jetton.jetton.verification)}
                              </div>
                              <p className="text-sm text-gray-600">{jetton.jetton.symbol}</p>
                            </div>
                          </div>
                          {getTrustBadge(jetton.jetton.verification)}
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-lg font-bold text-gray-900">
                            {formatBalance(jetton.balance, jetton.jetton.decimals)} {jetton.jetton.symbol}
                          </p>
                        </div>

                        {jetton.jetton.verification === 'blacklist' && (
                          <div className="mt-3 bg-red-100 border border-red-200 rounded-lg p-2 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-600" />
                            <p className="text-xs text-red-800 font-semibold">
                              ⚠️ This token is flagged as scam!
                            </p>
                          </div>
                        )}
                      </div>
                    ))
                )}
              </>
            )}

            {/* NFTs Tab */}
            {activeTab === 'nfts' && (
              <>
                {connections.nfts.length === 0 ? (
                  <div className="text-center py-12">
                    <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No NFTs found</p>
                  </div>
                ) : (
                  connections.nfts.map((nft, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-lg border border-gray-200 p-4"
                    >
                      <div className="flex gap-4">
                        {nft.previews && nft.previews.length > 0 ? (
                          <img
                            src={nft.previews.find(p => p.resolution === '100x100')?.url || nft.previews[0].url}
                            alt={nft.metadata.name || 'NFT'}
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-pink-100 rounded-lg flex items-center justify-center">
                            <Image className="w-8 h-8 text-pink-600" />
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-1">
                            <p className="font-semibold text-gray-900">
                              {nft.metadata.name || nft.dns || `NFT #${nft.index}`}
                            </p>
                            {getTrustBadge(nft.trust)}
                          </div>
                          
                          {nft.collection && (
                            <p className="text-sm text-gray-600 mb-2">
                              {nft.collection.name}
                            </p>
                          )}

                          {nft.metadata.description && (
                            <p className="text-xs text-gray-500 line-clamp-2">
                              {nft.metadata.description}
                            </p>
                          )}

                          {nft.dns && (
                            <div className="mt-2 flex items-center gap-2">
                              <Globe className="w-4 h-4 text-purple-600" />
                              <span className="text-sm font-mono text-purple-700">{nft.dns}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
