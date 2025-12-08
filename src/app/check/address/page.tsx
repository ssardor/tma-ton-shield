'use client';

import { useState } from 'react';
import { useAnalyze } from '@/lib/hooks/useAnalyze';
import { useTelegram } from '@/lib/hooks/useTelegram';
import { AddressResponse } from '@/lib/api/types';
import { RiskBadge } from '@/components/RiskBadge';
import { isValidTonAddress, shortenAddress, formatTon, formatDate } from '@/lib/utils';
import { FileText, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AddressCheckPage() {
  const router = useRouter();
  const { analyzeAddress, isLoading, error } = useAnalyze();
  const { hapticFeedback } = useTelegram();

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
