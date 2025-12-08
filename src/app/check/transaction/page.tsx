'use client';

import { useState } from 'react';
import { useAnalyze } from '@/lib/hooks/useAnalyze';
import { useTelegram } from '@/lib/hooks/useTelegram';
import { useTonAddress } from '@tonconnect/ui-react';
import { TransactionResponse } from '@/lib/api/types';
import { RiskBadge } from '@/components/RiskBadge';
import { isValidTonAddress, tonToNanoton, formatTon } from '@/lib/utils';
import { Wallet, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TransactionCheckPage() {
  const router = useRouter();
  const { analyzeTransaction, isLoading, error } = useAnalyze();
  const { hapticFeedback } = useTelegram();
  const userWallet = useTonAddress();

  const [targetAddress, setTargetAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [originDomain, setOriginDomain] = useState('');
  const [result, setResult] = useState<TransactionResponse | null>(null);
  const [errors, setErrors] = useState({ target: '', amount: '' });

  const handleAnalyze = async () => {
    const newErrors = { target: '', amount: '' };

    // Validation
    if (!userWallet) {
      alert('Please connect your wallet first');
      return;
    }

    if (!targetAddress.trim()) {
      newErrors.target = 'Target address is required';
    } else if (!isValidTonAddress(targetAddress)) {
      newErrors.target = 'Invalid TON address format';
    }

    if (amount && isNaN(parseFloat(amount))) {
      newErrors.amount = 'Invalid amount';
    }

    setErrors(newErrors);
    if (newErrors.target || newErrors.amount) return;

    hapticFeedback('light');
    setResult(null);

    const data = await analyzeTransaction({
      user_wallet: userWallet,
      target_address: targetAddress,
      amount_nanoton: amount ? tonToNanoton(amount) : undefined,
      origin_domain: originDomain || undefined,
    });

    if (data) {
      setResult(data);
      
      if (data.risk_level === 'CRITICAL') {
        hapticFeedback('error');
      } else if (data.risk_level === 'WARNING') {
        hapticFeedback('warning');
      } else {
        hapticFeedback('success');
      }
    }
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
            <Wallet className="w-6 h-6 text-purple-600" />
            Transaction Check
          </h1>
          <p className="text-sm text-gray-600">Analyze transfer safety</p>
        </div>
      </div>

      {/* Your Wallet */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Your Wallet</p>
        {userWallet ? (
          <p className="font-mono text-sm text-gray-900 break-all bg-gray-50 p-2 rounded">
            {userWallet}
          </p>
        ) : (
          <p className="text-sm text-amber-600">
            Please connect your wallet from the home page
          </p>
        )}
      </div>

      {/* Input Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Address *
          </label>
          <input
            type="text"
            value={targetAddress}
            onChange={(e) => {
              setTargetAddress(e.target.value);
              setErrors({ ...errors, target: '' });
            }}
            placeholder="EQD..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm text-black"
            disabled={isLoading}
          />
          {errors.target && (
            <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.target}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount (TON) - Optional
          </label>
          <input
            type="number"
            step="0.0001"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setErrors({ ...errors, amount: '' });
            }}
            placeholder="1.5"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
            disabled={isLoading}
          />
          {errors.amount && (
            <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.amount}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Origin Domain - Optional
          </label>
          <input
            type="text"
            value={originDomain}
            onChange={(e) => setOriginDomain(e.target.value)}
            placeholder="example.com"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
            disabled={isLoading}
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={isLoading || !userWallet || !targetAddress}
          className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Analyzing...
            </span>
          ) : (
            'Analyze Transaction'
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

            {/* Target Account Info */}
            {result.target_account_info && (
              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Target Account</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">
                      {result.target_account_info.is_wallet ? 'Wallet' : 'Contract'}
                    </span>
                  </div>
                  {result.target_account_info.balance && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Balance:</span>
                      <span className="font-medium font-mono">
                        {formatTon(result.target_account_info.balance)} TON
                      </span>
                    </div>
                  )}
                  {result.target_account_info.is_scam && (
                    <div className="bg-red-50 border border-red-200 rounded p-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span className="text-red-800 font-medium">Flagged as scam</span>
                    </div>
                  )}
                </div>
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
                        +{signal.points}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => router.back()}
              className="bg-gray-100 text-gray-900 font-semibold py-3 px-6 rounded-lg hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
            <button
              className="bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-sm hover:shadow-md"
            >
              Proceed Anyway
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
