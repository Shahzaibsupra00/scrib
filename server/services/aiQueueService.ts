import { db } from '../config/db.js';
import { cache } from '../config/redis.js';
import { logger } from '../config/logger.js';
import { GoogleGenAI } from '@google/genai';
import { UsageService } from './usageService.js';
import { PromptService } from './promptService.js';

interface JobPayload {
  userId: string;
  originalText: string;
  style: string;
  promptKey: string;
  title?: string;
}

const REDIS_QUEUE_KEY = 'ai_jobs_queue:list';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Lazy initialization of GoogleGenAI SDK
let aiClientInstance: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClientInstance) {
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY variable is absent on system runtime environment.');
    }
    aiClientInstance = new GoogleGenAI({ 
      apiKey: GEMINI_API_KEY,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });
  }
  return aiClientInstance;
}

export class AiQueueService {

  /**
   * Dispatches a new task into the asynchronous Redis-backed pipeline
   */
  static async submitJob(userId: string, payload: Omit<JobPayload, 'userId'>): Promise<string> {
    const jobPayload: JobPayload = { userId, ...payload };

    // 1. Transactionally record job state in core relational DB
    const dbRes = await db.query(
      `INSERT INTO queue_jobs (user_id, status, payload)
       VALUES ($1, 'pending', $2)
       RETURNING id`,
      [userId, JSON.stringify(jobPayload)]
    );
    const jobId = dbRes.rows[0].id;

    // 2. Queue job ID in Redis queue list (LPUSH index schema)
    await cache.client.lpush(REDIS_QUEUE_KEY, jobId);
    logger.info(`AI Worker Pipeline: Queued task register ID: ${jobId} for user ${userId}`);

    // Trigger immediate background polling sweep so processor wakes up
    this.signalWorkerPulse();

    return jobId;
  }

  /**
   * Background signaling method
   */
  private static signalWorkerPulse() {
    setImmediate(() => {
      this.processNextJobAndPoll().catch(err => {
        logger.error('SaaS AI Worker execution error encountered during active job sweeps', err);
      });
    });
  }

  /**
   * Pops, locks, and executes the next job in the queue.
   * Utilizes a Redis distributed lock mechanism to ensure safe multi-replica execution.
   */
  static async processNextJobAndPoll(): Promise<void> {
    // 1. Fetch next Job with RPOP directly from Redis Queue
    const jobId = await cache.client.rpop(REDIS_QUEUE_KEY);
    if (!jobId) {
      return; // Queue is empty, rest worker
    }

    const lockKey = `lock:job:${jobId}`;
    const acquiredLock = await cache.set(lockKey, 'locked', 30); // 30s distributed lock

    if (!acquiredLock) {
      // Re-queue the job if locked by another active server worker replica
      await cache.client.lpush(REDIS_QUEUE_KEY, jobId);
      return;
    }

    logger.debug(`Processor acquired lock for job: ${jobId}. Beginning execution...`);
    const startTime = Date.now();

    try {
      // 2. Set database state to 'processing'
      await db.query(`UPDATE queue_jobs SET status = 'processing', updated_at = NOW() WHERE id = $1`, [jobId]);

      // Load Job payload parameters
      const jobRes = await db.query('SELECT payload FROM queue_jobs WHERE id = $1', [jobId]);
      if (jobRes.rows.length === 0) {
        throw new Error(`Orphaned Job entity metadata inside PostgreSQL DB for job key: ${jobId}`);
      }

      const payload = jobRes.rows[0].payload as JobPayload;
      const wordCount = payload.originalText.trim().split(/\s+/).length;

      // Ensure user profile limits remain compliant before rendering queries
      const limitState = await UsageService.gateCheckUsageLimit(payload.userId);
      if (!limitState.allowed) {
        throw new Error(`SaaS credit checkpoint failed. User consumed words quota: ${limitState.used}/${limitState.limit}`);
      }

      // 3. Dynamic Prompt evaluation
      const promptModule = await PromptService.getActivePrompt(payload.promptKey);
      const contextualTemplate = PromptService.renderTemplate(promptModule.template_format, {
        text: payload.originalText,
        style: payload.style
      });

      // 4. Interface Gemini API
      const ai = getAiClient();
      logger.info(`Contacting Google Gemini API for Job ID: ${jobId}...`);
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: contextualTemplate,
        config: {
          systemInstruction: promptModule.system_instruction,
          responseMimeType: 'application/json',
          responseSchema: {
            // Re-uses similar JSON grammar schema as baseline ScribeStone logic
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

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Gemini API return structure was empty of responses.');
      }

      const resultPayload = JSON.parse(responseText.trim());
      const elapsedMs = Date.now() - startTime;

      // 5. Update user analytics record asynchronously and track words used
      await UsageService.recordUsage({
        userId: payload.userId,
        requestType: 'ai_analyze',
        units: wordCount,
        modelUsed: 'gemini-3.5-flash',
        isCached: false,
        durationMs: elapsedMs
      });

      // 6. Set database job status to 'completed' with results
      await db.query(
        `UPDATE queue_jobs 
         SET status = 'completed', result = $1, updated_at = NOW() 
         WHERE id = $2`,
        [JSON.stringify(resultPayload), jobId]
      );

      logger.info(`AI Worker Pipeline: Job ID #${jobId} processed completed and saved in ${elapsedMs}ms`);

    } catch (err: any) {
      logger.error(`Error failed processing AI job id: ${jobId}`, err);

      // Re-read attempts metrics for linear backup retry policies
      const attemptRes = await db.query('SELECT backoff_attempts FROM queue_jobs WHERE id = $1', [jobId]);
      const attempts = (attemptRes.rows[0]?.backoff_attempts || 0) + 1;

      if (attempts < 3) {
        // Schedule job retry with exponential backoff
        await db.query(
          `UPDATE queue_jobs 
           SET status = 'pending', backoff_attempts = $1, error_message = $2, updated_at = NOW() 
           WHERE id = $3`,
          [attempts, err.message, jobId]
        );
        logger.warn(`AI Worker Queue: Resubmitted retry loop #${attempts} for job ID: ${jobId}`);
        // Delay inserting key to Redis to prevent spinning hot queues
        setTimeout(async () => {
          await cache.client.lpush(REDIS_QUEUE_KEY, jobId);
        }, 3000 * Math.pow(2, attempts));
      } else {
        // Exhausted attempts, mark job as permanently 'failed'
        await db.query(
          `UPDATE queue_jobs 
           SET status = 'failed', error_message = $1, updated_at = NOW() 
           WHERE id = $2`,
          [err.message, jobId]
        );
        logger.error(`AI Worker Queue: Permanent failure triggered on task ID: ${jobId}`);
      }

    } finally {
      // Remove lock
      await cache.del(lockKey);
      
      // Sweep and poll next job
      this.signalWorkerPulse();
    }
  }
}
