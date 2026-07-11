import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";

// Fallback in-memory map for local development if KV is not configured
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Try to initialize Upstash Ratelimit if KV is available
let upstashRateLimit: Ratelimit | null = null;
const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

if (kvUrl && kvToken) {
  // We use standard fetch-based Redis client from upstash since Vercel KV is deprecated
  const { Redis } = require("@upstash/redis");
  const redis = new Redis({ url: kvUrl, token: kvToken });
  
  upstashRateLimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(5, "1 h"),
    analytics: true,
  });
}

export async function rateLimit(
  identifier: string,
  limit: number = 5,
  windowMs: number = 60 * 60 * 1000 // 1 hour
): Promise<{ success: boolean; remaining: number }> {
  // Use distributed Vercel KV rate limiting if configured (Production)
  if (upstashRateLimit) {
    const { success, remaining } = await upstashRateLimit.limit(identifier);
    return { success, remaining };
  }

  // Fallback to in-memory rate limiting (Local Dev)
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0 };
  }

  record.count++;
  return { success: true, remaining: limit - record.count };
}

// Cleanup old entries periodically (only affects fallback map)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }, 60 * 1000);
}
