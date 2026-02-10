import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Create Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Rate limiters
export const rateLimiters = {
  // Free tier: 10 captions per day (checked separately)
  // Pro tier: 100 requests per minute
  captionGeneration: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    analytics: true,
    prefix: '@upstash/ratelimit/caption',
  }),

  // General API rate limiting
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, '1 m'),
    analytics: true,
    prefix: '@upstash/ratelimit/api',
  }),
};

// Helper function to check rate limit
export async function checkRateLimit(
  identifier: string,
  limiter: keyof typeof rateLimiters
) {
  try {
    const result = await rateLimiters[limiter].limit(identifier);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // Allow request if rate limiting fails
    return { success: true, limit: 0, remaining: 0, reset: 0 };
  }
}
