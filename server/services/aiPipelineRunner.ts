import { db } from '../config/db.js';
import { logger } from '../config/logger.js';
import { ParsingService } from './parsingService.js';
import { AiProviderService } from './aiProviderService.js';
import { UsageService } from './usageService.js';
import { ProcessingOptions, EngineStatus, PipelineStageResult } from '../types/engine.js';

export class AiPipelineRunner {

  /**
   * Universal executor coordinating all 8 stages of the AI processing pipeline.
   * Runs gracefully in isolated runtime context, registering progress ticks.
   */
  static async executePipeline(
    jobId: string,
    userId: string,
    s3Key: string,
    mimeType: string,
    fileSizeBytes: number,
    options: ProcessingOptions
  ): Promise<void> {
    const totalStart = Date.now();
    logger.info(`Starting 8-Stage Unified Pipeline for Job ID: ${jobId}`, { userId, s3Key, options });

    try {
      // --- STAGE 1: INPUT VALIDATION (Step 1) ---
      logger.info(`[Stage 1/8]: Performing parameter validation...`);
      if (!jobId || !userId || !s3Key) {
        throw new Error('Pipeline Input validation checks failed: base metadata parameters are absent.');
      }
      
      const wordsLimitCheck = await UsageService.gateCheckUsageLimit(userId);
      if (!wordsLimitCheck.allowed) {
        throw new Error(`ScribeStone limit boundary exceeded. Current: ${wordsLimitCheck.used}, allowed: ${wordsLimitCheck.limit}`);
      }
      await this.updateJobStatusInDb(jobId, 'pending');

      // --- STAGE 2: FILE PARSING (Step 2) ---
      logger.info(`[Stage 2/8]: Retriving text structures from S3 file...`);
      const parseResult = await ParsingService.parseS3Document(s3Key, mimeType as any);
      if (!parseResult.success || !parseResult.data) {
        throw new Error(`File parsing pipeline collapsed. Trace: ${parseResult.error || 'Empty Output'}`);
      }
      const rawText = parseResult.data;
      await this.updateJobStatusInDb(jobId, 'parsed');

      // --- STAGE 3: OCR PROCESSING (Step 3) ---
      logger.info(`[Stage 3/8]: Initiating layout OCR scanners...`);
      const ocrResult = await ParsingService.runOcrEngine(rawText, mimeType as any);
      if (!ocrResult.success || !ocrResult.data) {
        throw new Error(`OCR processing stage failed. Trace: ${ocrResult.error || 'Empty Output'}`);
      }
      const parsedProse = ocrResult.data;
      await this.updateJobStatusInDb(jobId, 'ocr_processed');

      // --- STAGES 4-7: PROMPT, API, RESPONSES AND JSON FORMATTING (Steps 4, 5, 6, 7) ---
      logger.info(`[Stages 4-7/8]: Connecting prompt models and executing LLM queries...`);
      await this.updateJobStatusInDb(jobId, 'analyzing');

      const aiResponseResult = await AiProviderService.callAiVendor(
        options.modelProvider,
        options.modelName,
        options.promptKey,
        options.styleTone,
        parsedProse
      );

      if (!aiResponseResult.success || !aiResponseResult.data) {
        throw new Error(`AI model transaction failed to resolve output. Trace: ${aiResponseResult.error}`);
      }

      const aiData = aiResponseResult.data;

      // --- STAGE 8: DATABASE STORAGE & TELEMETRY SAVING (Step 8) ---
      logger.info(`[Stage 8/8]: Saving state and flushing analytical telemetry metrics to disk...`);
      const elapsedTotalMs = Date.now() - totalStart;

      const pgClient = await db.getClient();
      try {
        await pgClient.query('BEGIN');

        // 1. Mark Job status as 'completed' carrying finalized JSON schemas payload
        const updateJobQuery = `
          UPDATE queue_jobs 
          SET status = 'completed', 
              result = $1, 
              updated_at = NOW() 
          WHERE id = $2
        `;
        await pgClient.query(updateJobQuery, [JSON.stringify(aiData.structuredOutput), jobId]);

        // 2. Transmit and commit credit tokens totals utilized
        const wordsUsed = parsedProse.trim().split(/\s+/).length;
        await UsageService.recordUsage({
          userId,
          requestType: 'ai_analyze',
          units: wordsUsed,
          modelUsed: `${options.modelProvider}/${options.modelName}`,
          isCached: false,
          durationMs: elapsedTotalMs
        });

        await pgClient.query('COMMIT');
        logger.info(`Unified AI processing pipeline completed successfully in ${elapsedTotalMs}ms for Job ID: ${jobId}`);

      } catch (err: any) {
        await pgClient.query('ROLLBACK');
        throw err;
      } finally {
        pgClient.release();
      }

    } catch (err: any) {
      logger.error(`Critical core crash inside unified AI Processing Pipeline [Job #${jobId}]`, err);
      
      // Update DB to mark job status as permanently failed with traces
      await db.query(
        `UPDATE queue_jobs 
         SET status = 'failed', error_message = $1, updated_at = NOW() 
         WHERE id = $2`,
        [err.message, jobId]
      ).catch(e => logger.error('Failed logging job failures to PostgreSQL', e));
    }
  }

  /**
   * Helper to write state-machine updates to core relational tables
   */
  private static async updateJobStatusInDb(jobId: string, status: EngineStatus): Promise<void> {
    try {
      await db.query(`UPDATE queue_jobs SET status = $1, updated_at = NOW() WHERE id = $2`, [status, jobId]);
      logger.info(`Job [ID: ${jobId}] state updated successfully to: ${status}`);
    } catch (err) {
      logger.error(`Failed executing JDBC updates for Job state: ${status}`, err as Error);
    }
  }
}
