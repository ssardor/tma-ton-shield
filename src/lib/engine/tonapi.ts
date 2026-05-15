// ============================================================
// TON Shield — Centralized TON API Client (Server-Side Only)
// ============================================================
// Uses TONAPI_KEY from env (no NEXT_PUBLIC_ prefix).
// Includes in-memory cache (60s TTL) and request deduplication.

import type {
  TonApiAccount,
  TonApiJetton,
  TonApiHoldersResponse,
  TonApiEventsResponse,
  TonApiRatesResponse,
} from './types';

const TONAPI_BASE = 'https://tonapi.io/v2';
const CACHE_TTL_MS = 60_000; // 60 seconds

// ---------- In-memory Cache ----------

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache<T>(key: string, data: T, ttlMs: number = CACHE_TTL_MS): void {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

// ---------- Request Queue (1 req/sec throttle) ----------

let lastRequestTime = 0;
const MIN_INTERVAL_MS = 200; // 5 req/sec with API key (paid tier allows more)

async function throttle(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < MIN_INTERVAL_MS) {
    await new Promise(resolve => setTimeout(resolve, MIN_INTERVAL_MS - elapsed));
  }
  lastRequestTime = Date.now();
}

// ---------- Base Fetcher ----------

function getApiKey(): string {
  return process.env.TONAPI_KEY || '';
}

async function tonApiFetch<T>(path: string, cacheKey?: string): Promise<T> {
  const key = cacheKey || path;

  // Check cache first
  const cached = getCached<T>(key);
  if (cached) return cached;

  await throttle();

  const apiKey = getApiKey();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const response = await fetch(`${TONAPI_BASE}${path}`, {
    headers,
    next: { revalidate: 30 },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`TON API error ${response.status}: ${errorText}`);
  }

  const data = await response.json() as T;
  setCache(key, data);
  return data;
}

// ---------- Public API ----------

/**
 * Get account info (balance, status, interfaces, is_scam, etc.)
 */
export async function getAccount(address: string): Promise<TonApiAccount> {
  return tonApiFetch<TonApiAccount>(`/accounts/${encodeURIComponent(address)}`);
}

/**
 * Get account events (transaction history)
 */
export async function getAccountEvents(
  address: string,
  limit: number = 20
): Promise<TonApiEventsResponse> {
  return tonApiFetch<TonApiEventsResponse>(
    `/accounts/${encodeURIComponent(address)}/events?limit=${limit}`
  );
}

/**
 * Get jetton master info (metadata, supply, admin, verification)
 */
export async function getJettonInfo(address: string): Promise<TonApiJetton> {
  return tonApiFetch<TonApiJetton>(`/jettons/${encodeURIComponent(address)}`);
}

/**
 * Get jetton holders (top N)
 */
export async function getJettonHolders(
  address: string,
  limit: number = 20
): Promise<TonApiHoldersResponse> {
  return tonApiFetch<TonApiHoldersResponse>(
    `/jettons/${encodeURIComponent(address)}/holders?limit=${limit}`
  );
}

/**
 * Get account jetton balances
 */
export async function getAccountJettons(address: string) {
  return tonApiFetch<{ balances: unknown[] }>(
    `/accounts/${encodeURIComponent(address)}/jettons?limit=100`
  );
}

/**
 * Get account NFTs
 */
export async function getAccountNfts(address: string) {
  return tonApiFetch<{ nft_items: unknown[] }>(
    `/accounts/${encodeURIComponent(address)}/nfts?limit=100`
  );
}

/**
 * Get DNS backresolve for account
 */
export async function getDnsBackresolve(address: string) {
  return tonApiFetch<{ domains: string[] }>(
    `/accounts/${encodeURIComponent(address)}/dns/backresolve`
  );
}

/**
 * Get exchange rates for tokens
 */
export async function getRates(
  tokens: string[],
  currencies: string[] = ['usd', 'ton']
): Promise<TonApiRatesResponse> {
  const tokenParam = tokens.join(',');
  const currencyParam = currencies.join(',');
  return tonApiFetch<TonApiRatesResponse>(
    `/rates?tokens=${encodeURIComponent(tokenParam)}&currencies=${encodeURIComponent(currencyParam)}`
  );
}
