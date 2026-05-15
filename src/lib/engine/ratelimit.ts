// ============================================================
// TON Shield — In-Memory Rate Limiter for API Routes
// ============================================================
// Simple sliding window rate limiter. No external dependencies.
// Designed for serverless/edge: uses in-memory Map.

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up old entries periodically
const CLEANUP_INTERVAL = 60_000; // 1 min
let lastCleanup = Date.now();

function cleanup(windowMs: number): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  for (const [key, entry] of store.entries()) {
    if (now - entry.windowStart > windowMs * 2) {
      store.delete(key);
    }
  }
}

/**
 * Check rate limit for a given key (e.g., IP or user ID).
 *
 * @param key - Unique identifier for the client
 * @param maxRequests - Max requests per window (default: 10)
 * @param windowMs - Window duration in ms (default: 60s)
 * @returns { allowed, remaining, retryAfterMs }
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60_000
): {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
} {
  cleanup(windowMs);

  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now - entry.windowStart > windowMs) {
    // New window
    store.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: maxRequests - 1, retryAfterMs: 0 };
  }

  if (entry.count >= maxRequests) {
    const retryAfterMs = windowMs - (now - entry.windowStart);
    return { allowed: false, remaining: 0, retryAfterMs };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, retryAfterMs: 0 };
}

/**
 * Extract client identifier from request headers.
 * Falls back to 'anonymous' if no identifier found.
 */
export function getClientId(request: Request): string {
  // Try X-Forwarded-For (Cloudflare/proxy)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();

  // Try CF-Connecting-IP (Cloudflare)
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp;

  // Try X-Real-IP
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;

  // Try X-User-ID (custom header from our frontend)
  const userId = request.headers.get('x-user-id');
  if (userId) return `user:${userId}`;

  return 'anonymous';
}
