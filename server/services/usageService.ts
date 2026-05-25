import { db } from '../config/db.js';
import { cache } from '../config/redis.js';
import { logger } from '../config/logger.js';

export class UsageService {

  /**
   * Generates cache key for atomic tracking
   */
  private static getUserWordsKey(userId: string): string {
    return `user:usage:words:${userId}`;
  }

  /**
   * Atomically records usage both in Redis (for fast limit gate check-outs) 
   * and logs it persistently to PG for historical analytical analytics.
   */
  static async recordUsage(params: {
    userId: string;
    requestType: 'ai_analyze' | 'document_upload';
    units: number;
    modelUsed?: string;
    isCached?: boolean;
    durationMs?: number;
  }): Promise<number> {
    const { userId, requestType, units, modelUsed, isCached, durationMs } = params;
    
    const redisKey = this.getUserWordsKey(userId);

    try {
      // 1. Increment atomic client-side quota limit count inside Redis Cache
      let newCount = await cache.client.incrby(redisKey, units);
      
      // If redis key had expired or wasn't set, pull it from DB and append
      if (newCount === units) {
        const userRes = await db.query('SELECT words_used FROM users WHERE id = $1', [userId]);
        if (userRes.rows.length > 0) {
          const dbUsed = userRes.rows[0].words_used;
          newCount = await cache.client.incrby(redisKey, dbUsed);
        }
      }

      // 2. Schedule non-blocking PostgreSQL synchronizations
      // Avoid blocking HTTP responses; dispatch as fires-and-forgets with error boundaries
      this.syncUsageToDatabase(userId, requestType, units, newCount, modelUsed, isCached, durationMs)
        .catch(err => logger.error('Fires-and-forgets Postgres sync of AI usage crashed', err));

      return newCount;
    } catch (err) {
      logger.error(`Failed to register unified telemetry usage for User: ${userId}`, err as Error);
      // Fall back directly to synchronous disk updates
      const fallbackQuery = 'UPDATE users SET words_used = words_used + $1 WHERE id = $2 RETURNING words_used';
      const fallbackRes = await db.query(fallbackQuery, [units, userId]);
      return fallbackRes.rows[0]?.words_used || 0;
    }
  }

  /**
   * Private worker to synchronise volatile cache values back to PostgreSQL
   */
  private static async syncUsageToDatabase(
    userId: string,
    requestType: string,
    units: number,
    redisTotalValue: number,
    modelUsed?: string,
    isCached = false,
    durationMs?: number
  ): Promise<void> {
    const pgClient = await db.getClient();
    try {
      await pgClient.query('BEGIN');

      // Update total words utilized in user record
      await pgClient.query(
        'UPDATE users SET words_used = $1 WHERE id = $2',
        [redisTotalValue, userId]
      );

      // Append standard auditable index analytical logs
      await pgClient.query(
        `INSERT INTO usage_logs (user_id, request_type, units_metered, model_used, is_cached_hit, response_duration_ms)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, requestType, units, modelUsed || null, isCached, durationMs || null]
      );

      await pgClient.query('COMMIT');
      logger.debug(`Background persistence complete: Synced user ${userId} telemetry total usages to ${redisTotalValue} words.`);
    } catch (err) {
      await pgClient.query('ROLLBACK');
      logger.error(`Background persistence failed during SQL sync transaction of user ${userId}`, err as Error);
    } finally {
      pgClient.release();
    }
  }

  /**
   * Fast Redis cache-gate checking system limits.
   * If Redis experiences disconnects, defaults safely to database disk lookup checks.
   */
  static async gateCheckUsageLimit(userId: string): Promise<{ allowed: boolean; used: number; limit: number }> {
    const redisKey = this.getUserWordsKey(userId);

    try {
      // Fetch Redis metrics and user limit info concurrently
      const [redisVal, dbUser] = await Promise.all([
        cache.get(redisKey),
        db.query('SELECT words_limit, words_used FROM users WHERE id = $1', [userId])
      ]);

      if (dbUser.rows.length === 0) {
        return { allowed: false, used: 0, limit: 0 };
      }

      const limit = dbUser.rows[0].words_limit;
      let used = dbUser.rows[0].words_used;

      if (redisVal !== null) {
        used = parseInt(redisVal, 10);
      } else {
        // Pre-warm local cache key values if missing
        await cache.set(redisKey, used.toString(), 1800); // 30 mins TTL
      }

      return {
        allowed: used < limit,
        used,
        limit
      };
    } catch (err) {
      logger.error('Gatekeeper telemetry lookup collapsed; fallback to direct DB lookup', err as Error);
      const fallbackUser = await db.query('SELECT words_limit, words_used FROM users WHERE id = $1', [userId]);
      if (fallbackUser.rows.length === 0) return { allowed: false, used: 0, limit: 0 };
      return {
        allowed: fallbackUser.rows[0].words_used < fallbackUser.rows[0].words_limit,
        used: fallbackUser.rows[0].words_used,
        limit: fallbackUser.rows[0].words_limit
      };
    }
  }
}
