'use client';

import { useState } from 'react';
import { useAnalyze } from '@/lib/hooks/useAnalyze';
import { useTelegram } from '@/lib/hooks/useTelegram';
import { AddressResponse } from '@/lib/api/types';
import { RiskBadge } from '@/components/RiskBadge';
import { isValidTonAddress, shortenAddress, formatTon, formatDate } from '@/lib/utils';
import { saveToHistory } from '@/lib/storage/history';
import { FileText, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
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

    console.log('Analyzing address:', address);
    const data = await analyzeAddress(address);
    console.log('Analysis result:', data);
    
    if (data) {
      setResult(data);
      console.log('Result set successfully');
      
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
    } else {
      console.log('No data received from API');
    }
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
            <p className="text-sm text-gray-600">Verify wallet safety</p>
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

      {/* Result */}
      {result && (
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
                    <p className="font-medium">
                      {result.account_info.is_wallet ? '👛 Wallet' : '📄 Contract'}
                    </p>
                  </div>
                  {result.account_info.balance && (
                    <div>
                      <p className="text-gray-600 mb-1">Balance</p>
                      <p className="font-medium font-mono">
                        {formatTon(result.account_info.balance)} TON
                      </p>
                    </div>
                  )}
                </div>

                {result.account_info.last_activity && (
                  <div className="text-sm">
                    <p className="text-gray-600 mb-1">Last Activity</p>
                    <p className="font-medium">
                      {formatDate(result.account_info.last_activity)}
                    </p>
                  </div>
                )}

                {result.account_info.is_scam && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-red-900">
                        Scam Warning
                      </p>
                      <p className="text-sm text-red-700 mt-1">
                        This address has been flagged as potentially malicious
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* AI Summary */}
          {result.ai_summary && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                AI Analysis
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

          {/* Transaction Pattern Analysis (NEW) */}
          {result.transaction_analysis && result.transaction_analysis.total_analyzed > 0 && (
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
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

              {result.transaction_analysis.suspicious_patterns.length > 0 && (
                <div className="bg-white rounded-lg p-3 space-y-2">
                  <p className="text-sm font-semibold text-red-700 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Suspicious Patterns Detected ({result.transaction_analysis.suspicious_patterns.length})
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
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
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
                        +{signal.points}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
