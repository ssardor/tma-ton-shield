'use client';

import { useState } from 'react';
import { useAnalyze } from '@/lib/hooks/useAnalyze';
import { useTelegram } from '@/lib/hooks/useTelegram';
import { AddressResponse } from '@/lib/api/types';
import { RiskBadge } from '@/components/RiskBadge';
import { SkiplistButtons } from '@/components/SkiplistButtons';
import { ScanningAnimation } from '@/components/ScanningAnimation';
import { isValidTonAddress, shortenAddress, formatTon, formatDate } from '@/lib/utils';
import { saveToHistory } from '@/lib/storage/history';
import { FileText, ArrowLeft, AlertCircle, CheckCircle, ArrowUpRight, ArrowDownLeft, Clock, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AddressCheckPage() {
  const router = useRouter();
  const { analyzeAddress, isLoading, error } = useAnalyze();
  const { user, hapticFeedback } = useTelegram();

  const [address, setAddress] = useState('');
  const [result, setResult] = useState<AddressResponse | null>(null);
  const [addressError, setAddressError] = useState('');

  const handleAnalyze = async () => {
    setAddressError('');
    setResult(null);

    if (!address.trim()) {
      setAddressError('Please enter an address');
      return;
    }

    if (!isValidTonAddress(address)) {
      setAddressError('Invalid TON address format');
      return;
    }

    hapticFeedback('light');

    const data = await analyzeAddress(address);
    
    if (data) {
      setResult(data);
      
      // Save to history
      if (user) {
        saveToHistory(user.id.toString(), {
          type: 'address',
          target: data.account_info.address,
          risk_level: data.risk_level,
          risk_score: data.risk_score,
          result_summary: data.ai_summary?.verdict,
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

  const formatAccountAge = (hours: number | null | undefined): string => {
    if (hours === null || hours === undefined) return 'Unknown';
    if (hours < 1) return `${Math.round(hours * 60)} minutes`;
    if (hours < 24) return `${Math.round(hours)} hours`;
    const days = Math.round(hours / 24);
    if (days < 30) return `${days} days`;
    const months = Math.round(days / 30);
    if (months < 12) return `${months} months`;
    const years = (days / 365).toFixed(1);
    return `${years} years`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white rounded-lg transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-black" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-green-600" />
              Address Check
            </h1>
            <p className="text-sm text-gray-600">Wallet security audit</p>
          </div>
        </div>

      {/* Input Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            TON Address
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              setAddressError('');
            }}
            placeholder="EQD..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm text-black"
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
          onClick={handleAnalyze}
          disabled={isLoading || !address.trim()}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Analyzing...
            </span>
          ) : (
            'Analyze Address'
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
          {/* Risk Overview */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Risk Assessment</h3>
              <RiskBadge riskLevel={result.risk_level} score={result.risk_score} />
            </div>

            {/* Account Info */}
            {result.account_info && (
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Address</p>
                  <p className="font-mono text-sm text-gray-900 break-all bg-gray-50 p-2 rounded">
                    {result.account_info.address}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">Type</p>
                    <p className="font-medium text-gray-900">
                      {result.account_info.is_wallet ? '👛 Wallet' : '📄 Contract'}
                    </p>
                  </div>
                  {result.account_info.balance && (
                    <div>
                      <p className="text-gray-600 mb-1">Balance</p>
                      <p className="font-medium font-mono text-gray-900">
                        {formatTon(result.account_info.balance)} TON
                      </p>
                    </div>
                  )}
                </div>

                {/* Account Age */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Account Age
                    </p>
                    <p className={`font-medium ${
                      result.account_age_hours !== undefined && result.account_age_hours !== null && result.account_age_hours < 24 
                        ? 'text-red-700' 
                        : 'text-gray-900'
                    }`}>
                      {formatAccountAge(result.account_age_hours)}
                    </p>
                  </div>
                  {result.account_info.last_activity && (
                    <div>
                      <p className="text-gray-600 mb-1">Last Activity</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(result.account_info.last_activity)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Account name (if TON DNS) */}
                {result.account_info.name && (
                  <div className="text-sm">
                    <p className="text-gray-600 mb-1">Name</p>
                    <p className="font-medium text-purple-700">{result.account_info.name}</p>
                  </div>
                )}

                {result.account_info.is_scam && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-red-900">
                        ⚠️ CONFIRMED SCAM
                      </p>
                      <p className="text-sm text-red-700 mt-1">
                        This address is flagged as scam in the TON security database
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Recent Transactions */}
          {result.recent_transactions && result.recent_transactions.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Recent Transactions ({result.recent_transactions.length})
              </h3>
              <div className="space-y-2">
                {result.recent_transactions.map((tx, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      tx.direction === 'in' ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      {tx.direction === 'in' 
                        ? <ArrowDownLeft className="w-4 h-4 text-green-600" />
                        : <ArrowUpRight className="w-4 h-4 text-blue-600" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {tx.counterparty?.name || (tx.counterparty?.address ? shortenAddress(tx.counterparty.address, 6) : tx.type)}
                        </p>
                        {tx.amount && (
                          <p className={`text-sm font-bold flex-shrink-0 ${
                            tx.direction === 'in' ? 'text-green-700' : 'text-gray-900'
                          }`}>
                            {tx.direction === 'in' ? '+' : '-'}{tx.amount}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-gray-500">
                          {new Date(tx.timestamp * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {tx.counterparty?.is_scam && (
                          <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-semibold">
                            ⚠️ SCAM
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Summary */}
          {result.ai_summary && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                Risk Analysis
              </h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-700">{result.ai_summary.verdict}</p>
                
                {result.ai_summary.key_risks && result.ai_summary.key_risks.length > 0 && (
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
          )}

          {/* Transaction Pattern Analysis */}
          {result.transaction_analysis && result.transaction_analysis.total_analyzed > 0 && (
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Transaction Pattern Analysis
                  </h3>
                  <p className="text-xs text-gray-600">
                    Analyzed {result.transaction_analysis.total_analyzed} recent transactions
                  </p>
                </div>
              </div>

              {/* TX Direction Stats */}
              {(result.transaction_analysis as any).incoming_count !== undefined && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-green-700">{(result.transaction_analysis as any).incoming_count}</p>
                    <p className="text-xs text-gray-500">Incoming</p>
                  </div>
                  <div className="bg-white rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-blue-700">{(result.transaction_analysis as any).outgoing_count}</p>
                    <p className="text-xs text-gray-500">Outgoing</p>
                  </div>
                </div>
              )}

              {result.transaction_analysis.suspicious_patterns.length > 0 && (
                <div className="bg-white rounded-lg p-3 space-y-2">
                  <p className="text-sm font-semibold text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Suspicious Patterns ({result.transaction_analysis.suspicious_patterns.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {result.transaction_analysis.suspicious_patterns.map((pattern, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full"
                      >
                        {pattern.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {result.transaction_analysis.risk_indicators.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-900">Risk Indicators:</p>
                  <ul className="space-y-1">
                    {result.transaction_analysis.risk_indicators.map((indicator, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start gap-2 bg-white rounded px-3 py-2">
                        <span className="text-amber-500 mt-0.5">⚠️</span>
                        <span>{indicator}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.transaction_analysis.suspicious_patterns.length === 0 && (
                <div className="bg-green-50 rounded-lg p-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-sm text-green-800 font-medium">
                    No suspicious transaction patterns detected
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Risk Signals */}
          {result.signals && result.signals.length > 0 && (
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
            target={result.account_info.address}
            type="address"
            label={result.account_info.name || undefined}
          />
        </div>
      )}
      </div>
    </div>
  );
}
