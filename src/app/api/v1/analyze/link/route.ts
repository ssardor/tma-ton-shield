// ============================================================
// TON Shield — Link & Bot Scanner (Phishing Detector)
// ============================================================
// Real analysis: keyword detection, typosquatting, Telegram bot checks.
// No external AI — uses weighted scoring formula.

import { NextRequest, NextResponse } from 'next/server';
import { calculateRiskScore, factor } from '@/lib/engine/scoring';
import { generateLinkFeedback } from '@/lib/engine/feedback';
import { checkRateLimit, getClientId } from '@/lib/engine/ratelimit';

// ---------- Known Brand Databases ----------

const KNOWN_BRANDS: Record<string, string[]> = {
  'tonkeeper': ['tonkeeper', 'ton_keeper', 'tonkeepeer', 'tonkeper', 'tonkeeperr'],
  'ston.fi': ['stonfi', 'ston_fi', 'st0nfi', 'stonfl', 'stonefi'],
  'dedust': ['dedust', 'de_dust', 'deduust', 'dedast'],
  'notcoin': ['notcoin', 'not_coin', 'notcoiin'],
  'fragment': ['fragment', 'fragmentt', 'fragmeent'],
  'getgems': ['getgems', 'get_gems', 'getgemss'],
  'tonviewer': ['tonviewer', 'ton_viewer', 'tonviewerr'],
  'tonstakers': ['tonstakers', 'ton_stakers'],
  'megaton': ['megaton', 'mega_ton'],
};

// Official bots/domains that are legitimate
const OFFICIAL_BOTS = new Set([
  'notcoin_bot', 'wallet', 'tonkeeper_bot', 'stonfidex_bot',
  'dedust_bot', 'fragment', 'getgems_bot', 'tonraffles_bot',
  'tapswap_bot', 'hamster_kombat_bot', 'catizenbot',
  'major_bot', 'dogs_community_bot', 'blum_bot',
]);

const OFFICIAL_DOMAINS = new Set([
  'ton.org', 'tonkeeper.com', 'ston.fi', 'dedust.io',
  'getgems.io', 'fragment.com', 'tonviewer.com',
  'tonscan.org', 't.me', 'telegram.org', 'notcoin.io',
]);

// Suspicious keywords
const SUSPICIOUS_KEYWORDS = [
  'airdrop', 'free', 'claim', 'giveaway', 'bonus',
  'reward', 'prize', 'lottery', 'gift', 'mining',
  'double', 'multiply', 'profit', 'earn', 'income',
];

// Short URL services
const SHORT_URL_DOMAINS = new Set([
  'bit.ly', 'goo.gl', 't.co', 'tinyurl.com', 'is.gd',
  'buff.ly', 'ow.ly', 'rebrand.ly', 'cutt.ly',
]);

// ---------- Helper Functions ----------

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

function extractTelegramUsername(url: string): string | null {
  // Handle @username format
  if (url.startsWith('@')) return url.slice(1).toLowerCase();

  // Handle t.me/username
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 't.me' || parsed.hostname === 'telegram.me') {
      const parts = parsed.pathname.split('/').filter(Boolean);
      if (parts.length > 0) return parts[0].toLowerCase();
    }
  } catch {
    // Might be a plain username
    if (/^[a-zA-Z0-9_]{5,32}$/.test(url)) return url.toLowerCase();
  }
  return null;
}

function isTelegramUrl(url: string): boolean {
  if (url.startsWith('@')) return true;
  if (/^[a-zA-Z0-9_]{5,32}$/.test(url)) return true;
  try {
    const parsed = new URL(url);
    return parsed.hostname === 't.me' || parsed.hostname === 'telegram.me';
  } catch {
    return false;
  }
}

function findSuspiciousKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  return SUSPICIOUS_KEYWORDS.filter(kw => lower.includes(kw));
}

function checkTyposquatting(text: string): string | null {
  const lower = text.toLowerCase().replace(/[^a-z0-9]/g, '');

  for (const [brand, variants] of Object.entries(KNOWN_BRANDS)) {
    for (const variant of variants) {
      if (lower.includes(variant) && !OFFICIAL_DOMAINS.has(text.toLowerCase())) {
        // Check if it's NOT the official one
        const isOfficial = OFFICIAL_BOTS.has(text.toLowerCase()) ||
                           OFFICIAL_BOTS.has(lower) ||
                           OFFICIAL_DOMAINS.has(extractDomain(text));
        if (!isOfficial) return brand;
      }
    }
  }
  return null;
}

function hasStartappParam(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.searchParams.has('startapp') || parsed.searchParams.has('start');
  } catch {
    return false;
  }
}

// ---------- Main Handler ----------

export async function POST(request: NextRequest) {
  // Rate limiting
  const clientId = getClientId(request);
  const rateCheck = checkRateLimit(`link:${clientId}`, 15, 60_000);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: 'RATE_LIMITED', message: `Too many requests. Retry in ${Math.ceil(rateCheck.retryAfterMs / 1000)}s` },
      { status: 429 }
    );
  }

  const body = await request.json();
  const { url } = body;

  if (!url) {
    return NextResponse.json(
      { error: 'MISSING_URL', message: 'URL is required' },
      { status: 400 }
    );
  }

  const isTelegram = isTelegramUrl(url);
  const botUsername = extractTelegramUsername(url);
  const domain = isTelegram ? 't.me' : extractDomain(url);
  const fullText = `${url} ${botUsername || ''} ${domain}`;

  // ---------- Analyze ----------

  const suspiciousKeywords = findSuspiciousKeywords(fullText);
  const typosquattingTarget = checkTyposquatting(botUsername || domain);
  const isShortUrl = SHORT_URL_DOMAINS.has(domain);
  const hasStartApp = hasStartappParam(url);

  // Determine if this is an official bot
  const isOfficialBot = botUsername ? OFFICIAL_BOTS.has(botUsername) : false;
  const isOfficialDomain = OFFICIAL_DOMAINS.has(domain);

  // Brand impersonation: uses brand name but is NOT official
  const brandsDetected: string[] = [];
  if (!isOfficialBot && botUsername) {
    // For Telegram bots, we only check the bot username (domain is always t.me)
    for (const [brand, variants] of Object.entries(KNOWN_BRANDS)) {
      for (const variant of variants) {
        if (botUsername.includes(variant)) {
          brandsDetected.push(brand);
          break;
        }
      }
    }
  } else if (!isOfficialDomain && !isTelegram && domain) {
    // For regular URLs, check domain
    for (const [brand, variants] of Object.entries(KNOWN_BRANDS)) {
      for (const variant of variants) {
        if (domain.includes(variant)) {
          brandsDetected.push(brand);
          break;
        }
      }
    }
  }

  // ---------- Risk Factors ----------

  const factors = [
    factor(
      'suspicious_keywords',
      'Suspicious Keywords',
      `URL/bot contains suspicious words: ${suspiciousKeywords.join(', ')}`,
      0.25,
      suspiciousKeywords.length > 0,
      suspiciousKeywords.length >= 2 ? 'high' : 'medium'
    ),
    factor(
      'typosquatting',
      'Typosquatting Detection',
      `This resource appears to impersonate "${typosquattingTarget}" — a known legitimate brand`,
      0.35,
      typosquattingTarget !== null,
      'high'
    ),
    factor(
      'brand_impersonation',
      'Brand Impersonation',
      `Bot/domain uses brand names (${brandsDetected.join(', ')}) but is NOT an official account`,
      0.40,
      brandsDetected.length > 0 && !isOfficialBot,
      'high'
    ),
    factor(
      'short_url',
      'URL Shortener',
      'Link uses a URL shortening service which can hide the real destination',
      0.15,
      isShortUrl,
      'medium'
    ),
    factor(
      'startapp_param',
      'Mini App Launch',
      'URL contains a startapp parameter — launches a Telegram Mini App',
      0.10,
      hasStartApp && !isOfficialBot,
      'low'
    ),
    factor(
      'multiple_keywords',
      'Multiple Scam Indicators',
      `Multiple suspicious words detected: ${suspiciousKeywords.join(', ')}`,
      0.20,
      suspiciousKeywords.length >= 3,
      'high'
    ),
    // Positive factor: reduce score if official
    factor(
      'official_verified',
      'Official Verification',
      isOfficialBot
        ? `@${botUsername} is a known official bot`
        : `${domain} is a known legitimate domain`,
      -0.30,
      isOfficialBot || (isOfficialDomain && !isTelegram),
      'low'
    ),
  ];

  const riskResult = calculateRiskScore(factors);

  // ---------- Generate Feedback ----------

  const feedback = generateLinkFeedback(riskResult.signals, riskResult.score, {
    domain,
    isTelegram,
    botUsername: botUsername || undefined,
    typosquattingTarget: typosquattingTarget || undefined,
    suspiciousKeywords,
  });

  // ---------- Build Response ----------

  const telegramAnalysis = isTelegram ? {
    is_mini_app: hasStartApp,
    is_official_bot: isOfficialBot,
    official_brand: isOfficialBot ? (typosquattingTarget || botUsername || null) : null,
    brands_detected: brandsDetected,
    app_domain: null as string | null,
    permissions_requested: [] as string[],
    linked_wallets: [] as string[],
  } : undefined;

  const response = {
    url,
    domain,
    risk_level: riskResult.level,
    risk_score: riskResult.score,
    is_phishing: riskResult.score >= 70,
    is_telegram_link: isTelegram,
    bot_username: botUsername || undefined,
    telegram_analysis: telegramAnalysis,
    suspicious_keywords: suspiciousKeywords,
    typosquatting_target: typosquattingTarget,
    signals: riskResult.signals,
    ai_summary: feedback,
  };

  return NextResponse.json(response);
}
