import { Response, NextFunction } from 'express';
import { db } from '../config/db.js';
import { logger } from '../config/logger.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { AiPipelineRunner } from '../services/aiPipelineRunner.js';
import { ProcessingOptions } from '../types/engine.js';

export class EngineController {

  /**
   * Accepts files and options parameters to kickstart the asynchronously executed 8-stage processing loop.
   */
  static async startPipeline(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const { s3Key, fileMimeType, fileSizeBytes, options } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthenticated', message: 'You must supply a valid JWT.' });
    }

    if (!s3Key || !fileMimeType || !fileSizeBytes || !options) {
      return res.status(400).json({
        error: 'Missing parameters',
        message: 'Properties (s3Key, fileMimeType, fileSizeBytes, options) are strictly required.'
      });
    }

    const typedOptions = options as ProcessingOptions;
    if (!typedOptions.modelProvider || !typedOptions.modelName || !typedOptions.promptKey) {
      return res.status(400).json({
        error: 'Invalid options config',
        message: 'Processing options (modelProvider, modelName, promptKey) configured incorrectly.'
      });
    }

    try {
      // 1. Transactionally insert raw Pending Job metadata records
      const insertRes = await db.query(
        `INSERT INTO queue_jobs (user_id, status, payload)
         VALUES ($1, 'pending', $2)
         RETURNING id`,
        [userId, JSON.stringify({ s3Key, fileMimeType, fileSizeBytes, options: typedOptions })]
      );

      const jobId = insertRes.rows[0].id;
      logger.info(`Initialized asynchronous database schema tracking for job ID: ${jobId}`);

      // 2. Spawn / dispatch non-blocking pipeline executing worker loop thread
      // Uses setImmediate to offload CPU execution from Express main rendering thread
      setImmediate(() => {
        AiPipelineRunner.executePipeline(
          jobId,
          userId,
          s3Key,
          fileMimeType,
          fileSizeBytes,
          typedOptions
        ).catch(err => logger.error(`Immediate pipeline deployment failed for Job ID: ${jobId}`, err));
      });

      // 3. Inform client that task has been successfully scheduled
      res.status(202).json({
        success: true,
        jobId,
        status: 'pending',
        message: '8-stage unified AI processing pipeline successfully verified and deployed.'
      });

    } catch (err) {
      logger.error('Failed to trigger AI Engine execution pipeline', err as Error);
      next(err);
    }
  }

  /**
   * Fetch diagnostics logs for an active pipeline run
   */
  static async getPipelineDiagnostics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const { jobId } = req.params;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: 'Unauthenticated' });

    try {
      const jobRes = await db.query(
        `SELECT id, status, payload, result, error_message as "errorMessage", 
                created_at as "createdAt", updated_at as "updatedAt"
         FROM queue_jobs 
         WHERE id = $1 AND user_id = $2`,
        [jobId, userId]
      );

      if (jobRes.rows.length === 0) {
        return res.status(404).json({ error: 'Job not found', message: 'Requested processing run trace doesn\'t exist.' });
      }

      const rawJob = jobRes.rows[0];

      res.status(200).json({
        success: true,
        diagnosticTrace: {
          jobId: rawJob.id,
          status: rawJob.status,
          inputParameters: rawJob.payload,
          finalizedData: rawJob.result,
          errorTraceLog: rawJob.errorMessage,
          timestamps: {
            started: rawJob.createdAt,
            lastUpdated: rawJob.updatedAt
          }
        }
      });

    } catch (err) {
      next(err);
    }
  }
}
