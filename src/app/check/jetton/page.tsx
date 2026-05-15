'use client';

import { useState } from 'react';
import { useAnalyze } from '@/lib/hooks/useAnalyze';
import { useTelegram } from '@/lib/hooks/useTelegram';
import { JettonResponse } from '@/lib/api/types';
import { RiskBadge } from '@/components/RiskBadge';
import { SkiplistButtons } from '@/components/SkiplistButtons';
import { ScanningAnimation } from '@/components/ScanningAnimation';
import { isValidTonAddress, shortenAddress } from '@/lib/utils';
import { saveToHistory } from '@/lib/storage/history';
import { Coins, ArrowLeft, AlertCircle, CheckCircle, Image as ImageIcon, ShieldAlert, ShieldCheck, Users, Unlock, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

const POPULAR_JETTONS = [
  { name: 'USDT', address: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs' },
  { name: 'NOT', address: 'EQAvlWFDxGF2lXm67y4yzC17wYKD9A0guwPkMs1gOsM__NOT' },
];

export default function JettonAnalysisPage() {
  const router = useRouter();
  const { analyzeJetton, isLoading, error } = useAnalyze();
  const { user, hapticFeedback } = useTelegram();

  const [address, setAddress] = useState('');
  const [result, setResult] = useState<JettonResponse | null>(null);
  const [addressError, setAddressError] = useState('');

  const handleAnalyze = async (jettonAddress?: string) => {
    const addressToCheck = jettonAddress || address;
    setAddressError('');
    setResult(null);

    if (!addressToCheck.trim()) {
      setAddressError('Please enter a jetton address');
      return;
    }

    if (!isValidTonAddress(addressToCheck)) {
      setAddressError('Invalid TON address format');
      return;
    }

    hapticFeedback('light');

    const data = await analyzeJetton(addressToCheck);
    if (data) {
      setResult(data);
      
      // Save to history
      if (user) {
        saveToHistory(user.id.toString(), {
          type: 'jetton',
          target: addressToCheck,
          risk_level: data.risk_level,
          risk_score: data.risk_score,
          result_summary: data.ai_summary?.verdict || `${data.metadata.name} (${data.metadata.symbol})`,
        });
      }
      
      if (data.risk_level === 'CRITICAL') {
        hapticFeedback('error');
      } else if (data.risk_level === 'WARNING') {
        hapticFeedback('warning');
      } else {
        hapticFeedback('success');
      }
    }
  };

  const getVerificationBadge = (verification?: string) => {
    if (verification === 'whitelist') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
          <ShieldCheck className="w-3.5 h-3.5" />
          Verified
        </span>
      );
    }
    if (verification === 'blacklist') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">
          <ShieldAlert className="w-3.5 h-3.5" />
          Blacklisted
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">
        Unverified
      </span>
    );
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-black" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Coins className="w-6 h-6 text-amber-600" />
            Jetton Analysis
          </h1>
          <p className="text-sm text-gray-600">Anti-rugpull scanner</p>
        </div>
      </div>

      {/* Popular Jettons */}
      <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border border-amber-200 p-4">
        <p className="text-sm font-medium text-amber-900 mb-3">
          Quick Check Popular Tokens
        </p>
        <div className="flex gap-2">
          {POPULAR_JETTONS.map((jetton) => (
            <button
              key={jetton.name}
              onClick={() => {
                setAddress(jetton.address);
                handleAnalyze(jetton.address);
              }}
              disabled={isLoading}
              className="px-4 py-2 bg-white border border-amber-300 rounded-lg font-semibold text-amber-900 hover:bg-amber-50 transition-all disabled:opacity-50"
            >
              {jetton.name}
            </button>
          ))}
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Jetton Master Address
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              setAddressError('');
            }}
            placeholder="EQD..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-mono text-sm text-black"
            disabled={isLoading}
          />
          {addressError && (
            <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {addressError}
            </p>
          )}
        </div>

        <button
          onClick={() => handleAnalyze()}
          disabled={isLoading || !address.trim()}
          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Analyzing...
            </span>
          ) : (
            'Analyze Jetton'
          )}
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
            {error}
          </div>
        )}
      </div>

      {/* Loading Animation */}
      {isLoading && <ScanningAnimation />}

      {/* Result */}
      {!isLoading && result && (
        <div className="space-y-4">
          {/* Jetton Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {result.metadata.image ? (
                  <img
                    src={result.metadata.image}
                    alt={result.metadata.name}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-amber-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-lg text-gray-900">
                      {result.metadata.name}
                    </h3>
                    {getVerificationBadge(result.verification)}
                  </div>
                  <p className="text-sm text-gray-600 font-mono">
                    {result.metadata.symbol}
                  </p>
                </div>
              </div>
              <RiskBadge riskLevel={result.risk_level} score={result.risk_score} />
            </div>

            {result.metadata.description && (
              <p className="text-sm text-gray-700 pt-3 border-t border-gray-100">
                {result.metadata.description}
              </p>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
              {result.total_supply && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Total Supply</p>
                  <p className="font-mono text-sm font-medium text-gray-900">
                    {parseFloat(result.total_supply).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                </div>
              )}
              {result.holder_count !== undefined && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Holders</p>
                  <p className="font-mono text-sm font-medium text-gray-900 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-gray-500" />
                    {result.holder_count.toLocaleString()}
                  </p>
                </div>
              )}
              {result.mintable !== undefined && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Mintable</p>
                  <p className={`text-sm font-medium flex items-center gap-1 ${result.mintable && result.admin_address ? 'text-red-700' : result.mintable ? 'text-amber-700' : 'text-green-700'}`}>
                    {result.mintable ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    {result.mintable ? (result.admin_address ? 'Yes (Admin Active)' : 'Yes (No Admin)') : 'No'}
                  </p>
                </div>
              )}
              {result.holder_concentration_pct !== undefined && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Top-3 Concentration</p>
                  <p className={`font-mono text-sm font-bold ${
                    result.holder_concentration_pct > 50 ? 'text-red-700' :
                    result.holder_concentration_pct > 30 ? 'text-amber-700' :
                    'text-green-700'
                  }`}>
                    {result.holder_concentration_pct.toFixed(1)}%
                  </p>
                </div>
              )}
            </div>

            {result.admin_address && (
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Admin Address</p>
                <p className="font-mono text-sm text-gray-900 break-all bg-gray-50 p-2 rounded">
                  {result.admin_address}
                </p>
              </div>
            )}
          </div>

          {/* Holder Distribution */}
          {result.top_holders && result.top_holders.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Top Holders
              </h3>
              
              {/* Bar visualization */}
              {result.holder_concentration_pct !== undefined && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Top-3 non-DEX holders</span>
                    <span className={`font-bold ${
                      result.holder_concentration_pct > 50 ? 'text-red-700' :
                      result.holder_concentration_pct > 30 ? 'text-amber-700' :
                      'text-green-700'
                    }`}>
                      {result.holder_concentration_pct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        result.holder_concentration_pct > 50 ? 'bg-red-500' :
                        result.holder_concentration_pct > 30 ? 'bg-amber-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(result.holder_concentration_pct, 100)}%` }}
                    />
                  </div>
                  {result.holder_concentration_pct > 50 && (
                    <p className="text-xs text-red-700 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Extreme concentration — high rugpull risk!
                    </p>
                  )}
                </div>
              )}

              {/* Holder list */}
              <div className="space-y-2 mt-3">
                {result.top_holders.slice(0, 5).map((holder, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-bold text-gray-400 w-5">#{idx + 1}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {holder.name || shortenAddress(holder.address, 6)}
                        </p>
                        {holder.is_dex && (
                          <span className="text-xs text-blue-600 font-semibold">DEX / Exchange</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-bold ${
                        holder.percentage > 20 ? 'text-red-700' :
                        holder.percentage > 10 ? 'text-amber-700' :
                        'text-gray-700'
                      }`}>
                        {holder.percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              Risk Analysis
            </h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-700">{result.ai_summary.verdict}</p>
              
              {result.ai_summary.key_risks.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">Key Risks:</p>
                  <ul className="space-y-1">
                    {result.ai_summary.key_risks.map((risk, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-red-500 mt-1">•</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-2 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-900 mb-1">Recommendation:</p>
                <p className="text-sm text-gray-700">{result.ai_summary.recommendation}</p>
              </div>
            </div>
          </div>

          {/* Risk Signals */}
          {result.signals.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
              <h3 className="font-semibold text-gray-900">
                Risk Signals ({result.signals.length})
              </h3>
              <div className="space-y-2">
                {result.signals.map((signal, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {signal.category}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {signal.message}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded ${
                          signal.severity === 'high'
                            ? 'bg-red-100 text-red-700'
                            : signal.severity === 'medium'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {signal.severity}
                      </span>
                      <span className="text-xs font-mono text-gray-500">
                        {signal.points > 0 ? '+' : ''}{signal.points}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skiplist Actions */}
          <SkiplistButtons
            target={address || result.metadata.symbol}
            type="jetton"
            label={`${result.metadata.name} (${result.metadata.symbol})`}
          />
        </div>
      )}
    </div>
  );
}
