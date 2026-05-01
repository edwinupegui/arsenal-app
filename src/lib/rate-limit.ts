interface Bucket {
  count: number;
  resetAt: number;
}

interface RateLimitConfig {
  windowMs: number;
  max: number;
}

interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
  remaining: number;
}

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;

function sweepExpired(now: number): void {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();

  if (buckets.size >= MAX_BUCKETS) sweepExpired(now);

  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, retryAfterSeconds: 0, remaining: config.max - 1 };
  }

  if (bucket.count >= config.max) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
      remaining: 0,
    };
  }

  bucket.count += 1;
  return {
    allowed: true,
    retryAfterSeconds: 0,
    remaining: config.max - bucket.count,
  };
}

export const LOGIN_RATE_LIMIT: RateLimitConfig = {
  windowMs: 15 * 60 * 1000,
  max: 5,
};
