import { Response, NextFunction } from 'express';
import crypto from 'crypto';
import { db } from '../config/db.js';
import { cache } from '../config/redis.js';
import { logger } from '../config/logger.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { AiQueueService } from '../services/aiQueueService.js';
import { PromptService } from '../services/promptService.js';
import { GoogleGenAI } from '@google/genai';
import { UsageService } from '../services/usageService.js';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Lazy initialization of SDK to prevent cold crashes
let aiInstance: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiInstance) {
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is undefined on active host environment wrapper.');
    }
    aiInstance = new GoogleGenAI({ 
      apiKey: GEMINI_API_KEY,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });
  }
  return aiInstance;
}

export class AiController {

  /**
   * Generates input hash to check AI Response Caches
   */
  private static generateInputHash(text: string, style: string, promptKey: string): string {
    const rawKey = `${text.trim()}:${style}:${promptKey}`;
    return crypto.createHash('sha256').update(rawKey).digest('hex');
  }

  /**
   * Unified interface handling rewrite, proofread, and analysis.
   * Leverages caching, quota limits checks, and model generation.
   */
  static async processAnalyze(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const { text, style, promptKey = 'default' } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: 'Unauthenticated' });
    if (!text || !text.trim()) return res.status(400).json({ error: 'Missing content payload' });

    const sanitizedStyle = style || 'Professional';
    const wordCount = text.trim().split(/\s+/).length;
    const inputHash = AiController.generateInputHash(text, sanitizedStyle, promptKey);

    const startTime = Date.now();

    try {
      // 1. CHECKS CACHE FIRST (Cost efficiency layer)
      // Check Redis Cache
      const cachedResponse = await cache.get(`aicache:${inputHash}`);
      if (cachedResponse) {
        logger.info('AI Response: Cache Hit in Redis', { hash: inputHash });
        res.setHeader('X-AI-Cache-Hit', 'true');
        
        // Asynchronously track cached telemetry log usage with 0 elapsed cost
        UsageService.recordUsage({
          userId,
          requestType: 'ai_analyze',
          units: wordCount,
          isCached: true,
          durationMs: 0
        }).catch(err => logger.error('Cache logging error', err));

        return res.json(JSON.parse(cachedResponse));
      }

      // Check PostgreSQL DB cache in case Redis was evicted
      const dbCacheRes = await db.query(
        'SELECT response_payload FROM ai_cache WHERE input_hash = $1 AND expires_at > NOW()',
        [inputHash]
      );
      if (dbCacheRes.rows.length > 0) {
        logger.info('AI Response: Cache Hit in PostgreSQL DB', { hash: inputHash });
        const payload = dbCacheRes.rows[0].response_payload;
        
        // Pre-warm Redis with cached payload
        await cache.set(`aicache:${inputHash}`, JSON.stringify(payload), 86400); // 24hr Redis TTL
        
        res.setHeader('X-AI-Cache-Hit', 'true');
        return res.json(payload);
      }

      // 2. RUN AI ENGINE OR ASYNC QUEUE PATHWAYS
      // Large texts (> 1000 words) are routed into the Redis background job queue otomatis
      const queueThreshold = parseInt(process.env.QUEUE_WORDS_THRESHOLD || '1000', 10);
      
      if (wordCount > queueThreshold) {
        logger.info(`Text exceeds size thresholds. Enqueuing task to background worker...`, { words: wordCount });
        const jobId = await AiQueueService.submitJob(userId, {
          originalText: text,
          style: sanitizedStyle,
          promptKey
        });

        return res.status(202).json({
          success: true,
          status: 'queued',
          jobId,
          message: 'Document length exceeds immediate processing thread capacity limit. Task has been queued in secure background worker pools.'
        });
      }

      // 3. EXECUTE RE-WRITE DIRECTLY USING GEMINI DEPUTY
      const promptModule = await PromptService.getActivePrompt(promptKey);
      const contextualTemplate = PromptService.renderTemplate(promptModule.template_format, {
        text,
        style: sanitizedStyle
      });

      const ai = getAi();
      logger.info(`Sending model generation query...`, { userId, words: wordCount });

      const modelResponse = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: contextualTemplate,
        config: {
          systemInstruction: promptModule.system_instruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT' as any,
            properties: {
              grammarScore: { type: 'INTEGER' as any },
              clarityScore: { type: 'INTEGER' as any },
              spellingErrorsCount: { type: 'INTEGER' as any },
              tone: { type: 'STRING' as any },
              keyImprovements: { type: 'ARRAY' as any, items: { type: 'STRING' as any } },
              improvedText: { type: 'STRING' as any }
            },
            required: ['grammarScore', 'clarityScore', 'spellingErrorsCount', 'tone', 'keyImprovements', 'improvedText']
          }
        }
      });

      const rawJson = modelResponse.text;
      if (!rawJson) {
        throw new Error('Null text returned from Gemini API processing layer.');
      }

      const generatedPayload = JSON.parse(rawJson.trim());
      const durationMs = Date.now() - startTime;

      // 4. PERSIST CACHE RECORDS (Redis for speed + PostgreSQL for long-term consistency)
      const cachedExpirationDays = parseInt(process.env.CACHE_TTL_DAYS || '7', 10);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + cachedExpirationDays);

      await Promise.all([
        cache.set(`aicache:${inputHash}`, JSON.stringify(generatedPayload), 86400 * cachedExpirationDays),
        db.query(
          `INSERT INTO ai_cache (input_hash, response_payload, model_name, expires_at)
           VALUES ($1, $2, 'gemini-3.5-flash', $3)
           ON CONFLICT (input_hash) DO NOTHING`,
          [inputHash, JSON.stringify(generatedPayload), expiresAt]
        )
      ]);

      // 5. UPDATE ACCOUNT USAGE COUNTERS & LOG AUDITS
      await UsageService.recordUsage({
        userId,
        requestType: 'ai_analyze',
        units: wordCount,
        modelUsed: 'gemini-3.5-flash',
        isCached: false,
        durationMs
      });

      res.setHeader('X-AI-Cache-Hit', 'false');
      return res.json(generatedPayload);

    } catch (err: any) {
      logger.error('Critical collapse in AI controller processing pipeline', err);
      next(err);
    }
  }

  /**
   * Endpoint allowing clients to poll queue statuses
   */
  static async getJobStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const { jobId } = req.params;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: 'Unauthenticated' });

    try {
      const jobRes = await db.query(
        'SELECT status, result, error_message as "errorMessage", created_at as "createdAt" FROM queue_jobs WHERE id = $1 AND user_id = $2',
        [jobId, userId]
      );

      if (jobRes.rows.length === 0) {
        return res.status(404).json({ error: 'Job not found', message: 'Requested queue execution does not exist inside our active systems.' });
      }

      const job = jobRes.rows[0];
      return res.json({
        success: true,
        jobId,
        status: job.status,
        result: job.result ? JSON.parse(JSON.stringify(job.result)) : null,
        errorMessage: job.errorMessage,
        createdAt: job.createdAt
      });
    } catch (err) {
      next(err);
    }
  }
}
