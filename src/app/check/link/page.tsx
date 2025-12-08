'use client';

import { useState } from 'react';
import { useAnalyze } from '@/lib/hooks/useAnalyze';
import { useTelegram } from '@/lib/hooks/useTelegram';
import { LinkResponse } from '@/lib/api/types';
import { RiskBadge } from '@/components/RiskBadge';
import { isValidUrl, normalizeUrl } from '@/lib/utils';
import { Link2, AlertCircle, CheckCircle, Share2, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

const EXAMPLE_LINKS = [
  { name: 'Notcoin Bot', url: '@notcoin_bot' },
  { name: 'STON.fi Fake', url: '@stonfi_bonus_airdrop_bot' },
];

export default function LinkScannerPage() {
  const router = useRouter();
  const { analyzeLink, isLoading, error } = useAnalyze();
  const { hapticFeedback, share } = useTelegram();
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<LinkResponse | null>(null);
  const [urlError, setUrlError] = useState('');

  const handleScan = async () => {
    setUrlError('');
    setResult(null);

    // Validate URL
    if (!url.trim()) {
      setUrlError('Please enter a URL or Telegram username');
      return;
    }

    if (!isValidUrl(url)) {
      setUrlError('Please enter a valid URL or Telegram username (@username or t.me/username)');
      return;
    }

    hapticFeedback('light');

    // Нормализуем URL перед отправкой
    const normalizedUrl = normalizeUrl(url);
    const data = await analyzeLink(normalizedUrl);
    if (data) {
      setResult(data);
      
      // Haptic feedback based on risk level
      if (data.risk_level === 'CRITICAL') {
        hapticFeedback('error');
      } else if (data.risk_level === 'WARNING') {
        hapticFeedback('warning');
      } else {
        hapticFeedback('success');
      }
    }
  };

  const handleShare = () => {
    if (!result) return;
    const message = `TON Shield Link Scan:\n${result.url}\nRisk: ${result.risk_level} (${result.risk_score}/100)`;
    share(window.location.href, message);
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
            <Link2 className="w-6 h-6 text-blue-600" />
            Link Scanner
          </h1>
          <p className="text-sm text-gray-600">Check URL safety</p>
        </div>
      </div>

      {/* Example Links */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 p-4">
        <p className="text-sm font-medium text-purple-900 mb-3">
          Quick Test Examples
        </p>
        <div className="flex gap-2">
          {EXAMPLE_LINKS.map((example) => (
            <button
              key={example.name}
              onClick={() => {
                setUrl(example.url);
                handleScan();
              }}
              disabled={isLoading}
              className="px-3 py-2 bg-white border border-purple-300 rounded-lg text-xs font-semibold text-purple-900 hover:bg-purple-50 transition-all disabled:opacity-50"
            >
              {example.name}
            </button>
          ))}
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter URL or Telegram username
          </label>
          <input
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setUrlError('');
            }}
            placeholder="@notcoin_bot or https://example.com"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
            disabled={isLoading}
          />
          {urlError && (
            <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {urlError}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-2">
            💡 Tip: You can use @username, t.me/username, or full URL
          </p>
        </div>

        <button
          onClick={handleScan}
          disabled={isLoading || !url.trim()}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Scanning...
            </span>
          ) : (
            'Scan Link'
          )}
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
            {error}
          </div>
        )}
      </div>

      {/* Result Section */}
      {result && (
        <div className="space-y-4">
          {/* Telegram Bot/Mini App Info */}
          {result.is_telegram_link && (
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">📱</span>
                </div>
                <div>
                  <p className="font-semibold text-blue-900">Telegram Bot</p>
                  {result.bot_username && (
                    <p className="text-sm text-blue-700 font-mono">
                      @{result.bot_username}
                    </p>
                  )}
                </div>
              </div>

              {result.telegram_analysis && (
                <div className="space-y-2 pt-2 border-t border-blue-200">
                  {result.telegram_analysis.is_mini_app && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-blue-900">🎮</span>
                      <span className="font-medium text-blue-900">Mini App</span>
                      {result.telegram_analysis.app_domain && (
                        <span className="text-blue-700 font-mono text-xs">
                          → {result.telegram_analysis.app_domain}
                        </span>
                      )}
                    </div>
                  )}

                  {result.telegram_analysis.is_official_bot && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-green-600">✅</span>
                      <span className="font-medium text-green-900">
                        Official: {result.telegram_analysis.official_brand}
                      </span>
                    </div>
                  )}

                  {result.telegram_analysis.permissions_requested?.length > 0 && (
                    <div className="bg-white/50 rounded p-2 mt-2">
                      <p className="text-xs font-semibold text-blue-900 mb-1">
                        Requested Permissions:
                      </p>
                      <div className="space-y-1">
                        {result.telegram_analysis.permissions_requested.map((perm, idx) => (
                          <div key={idx} className="flex items-center gap-1 text-xs">
                            <span className={perm.includes('sign') || perm.includes('send') ? 'text-amber-600' : 'text-blue-700'}>
                              {perm.includes('sign') || perm.includes('send') ? '⚠️' : '🔑'}
                            </span>
                            <span className="text-blue-800 font-mono">{perm}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.telegram_analysis.brands_detected.length > 0 && !result.telegram_analysis.is_official_bot && (
                    <div className="bg-amber-50 border border-amber-200 rounded p-2 mt-2">
                      <p className="text-xs font-semibold text-amber-900 mb-1 flex items-center gap-1">
                        <span>⚠️</span>
                        <span>Brand Impersonation Detected:</span>
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {result.telegram_analysis.brands_detected.map((brand, idx) => (
                          <span key={idx} className="text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-medium">
                            {brand}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Risk Overview */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0 mr-3">
                <p className="text-sm text-gray-500 mb-1">Domain</p>
                <p className="font-mono text-sm text-gray-900 break-all">
                  {result.domain}
                </p>
              </div>
              <RiskBadge riskLevel={result.risk_level} score={result.risk_score} />
            </div>

            {result.is_phishing && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-900">
                    Phishing Detected
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    This URL has been identified as a phishing attempt
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* AI Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              AI Analysis
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
                        +{signal.points}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="w-full bg-gray-100 text-gray-900 font-semibold py-3 px-6 rounded-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
          >
            <Share2 className="w-5 h-5" />
            Share Result
          </button>
        </div>
      )}
    </div>
  );
}
