import { Response, NextFunction } from 'express';
import { cache } from '../config/redis.js';
import { AuthenticatedRequest } from './auth.js';
import { logger } from '../config/logger.js';

interface RateLimitConfig {
  windowSeconds: number;
  maxRequests: number;
}

const defaultLimits: RateLimitConfig = {
  windowSeconds: 60,
  maxRequests: 100, // 100 requests per minute by default
};

/**
 * Highly resilient sliding-window rate limiter utilizing Redis hashes and transaction multi-pipelines.
 * Gracefully registers fallbacks to local memory keys if Redis becomes unreachable.
 */
export function rateLimiter(config: RateLimitConfig = defaultLimits) {
  // Simple in-memory fallback array in case Redis is compromised
  const memoryFallback = new Map<string, { timestamp: number; count: number }>();

  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const identifier = req.user?.id || req.clientIp || req.ip || 'anonymous';
    const redisKey = `ratelimit:${identifier}`;
    const now = Math.floor(Date.now() / 1000);

    // Skip limiting system health checks
    if (req.originalUrl === '/api/health') return next();

    try {
      // 1. Redis transaction pipeline (atomic check-and-push pattern)
      const pipeline = cache.client.multi();
      
      // Add current request timestamp to the sorted-set hash key
      pipeline.zadd(redisKey, now, `${now}-${Math.random().toString(36).substr(2, 5)}`);
      
      // Remove elements older than window interval
      pipeline.zremrangebyscore(redisKey, 0, now - config.windowSeconds);
      
      // Count total queries remaining within window
      pipeline.zcard(redisKey);
      
      // Reset TTL for entire key to keep memory clean
      pipeline.expire(redisKey, config.windowSeconds + 20);

      const results = await pipeline.exec();
      
      if (!results || !results[2]) {
        throw new Error('Redis transaction did not resolve counts correctly');
      }

      const [, , countResult] = results;
      const requestCount = countResult[1] as number;

      // Append standard limits to response headers for API compliance
      res.setHeader('X-RateLimit-Limit', config.maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, config.maxRequests - requestCount));
      res.setHeader('X-RateLimit-Reset', now + config.windowSeconds);

      if (requestCount > config.maxRequests) {
        logger.warn(`Rate limit triggered for user/IP: ${identifier}`, { count: requestCount });
        return res.status(429).json({
          error: 'Excessive requests rate',
          message: `Too many transaction requests submitted. Try again in ${config.windowSeconds} seconds.`
        });
      }

      next();
    } catch (err) {
      // 2. High robustness fallback: In-memory tracker
      logger.error('Redis Rate Limiter failed, engaging memory fallback checks', err as Error);
      
      const currentTime = Date.now();
      const clientRecord = memoryFallback.get(identifier);

      if (!clientRecord || (currentTime - clientRecord.timestamp > config.windowSeconds * 1000)) {
        memoryFallback.set(identifier, { timestamp: currentTime, count: 1 });
        return next();
      }

      clientRecord.count += 1;
      
      if (clientRecord.count > config.maxRequests) {
        return res.status(429).json({
          error: 'Excessive requests rate (Fallback mode)',
          message: 'Rate limit triggered. Calm your request frequency.'
        });
      }

      next();
    }
  };
}
