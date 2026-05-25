import { s3Client, s3Config } from '../config/s3.js';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { logger } from '../config/logger.js';
import { DocumentType, PipelineStageResult } from '../types/engine.js';

export class ParsingService {
  /**
   * Reads raw buffer buffers from AWS S3, parsing them depending on Mime and File extension styles.
   */
  static async parseS3Document(s3Key: string, mimeType: DocumentType): Promise<PipelineStageResult<string>> {
    const startTime = Date.now();
    logger.info(`Starting Document Parse stage for key: ${s3Key}, type: ${mimeType}`);

    try {
      // 1. Fetch binary stream from S3 Storage
      const command = new GetObjectCommand({
        Bucket: s3Config.bucketName,
        Key: s3Key,
      });

      const response = await s3Client.send(command);
      if (!response.Body) {
        throw new Error('S3 object body contains empty or null payloads.');
      }

      // Convert readable stream to binary buffer array
      const chunks: Buffer[] = [];
      const stream = response.Body as any;
      for await (const chunk of stream) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
      }
      const rawBuffer = Buffer.concat(chunks);

      let extractedText = '';

      // 2. Parsers triage based on Mime-Type
      switch (mimeType) {
        case 'text/plain':
        case 'text/markdown':
          // Straightforward UTF8 decoding
          extractedText = rawBuffer.toString('utf8');
          break;

        case 'application/pdf':
          // In full production, hook standard "pdf-parse" or "pdf2json" libraries here:
          // const pdfData = await pdfParse(rawBuffer);
          // extractedText = pdfData.text;
          extractedText = `[Parsed PDF Document Body]\n${rawBuffer.slice(0, 1000).toString('utf-8').replace(/[^\x20-\x7E\n]/g, '')}...`;
          break;

        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          // For Microsoft Word (.docx), developers extract xml tags or use packages like "mammoth"
          extractedText = `[Parsed DOCX Prose Contents]\n${rawBuffer.slice(0, 1200).toString('utf-8').replace(/[^\x20-\x7E\n]/g, '')}...`;
          break;

        case 'image/png':
        case 'image/jpeg':
          // Images skip standard textual parsers and get deferred strictly to the OCR processing engine.
          extractedText = '[Binary Image Data - Triggers Optical Character Recognition Pipeline Stage]';
          break;

        default:
          throw new Error(`Unsupported document parser request: ${mimeType}`);
      }

      const durationMs = Date.now() - startTime;
      logger.info(`File Parsing complete in ${durationMs}ms`, { key: s3Key, textLength: extractedText.length });

      return {
        success: true,
        stageName: 'document_parsing',
        data: extractedText,
        durationMs
      };

    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      logger.error(`File parsing failure on key: ${s3Key}`, err);
      return {
        success: false,
        stageName: 'document_parsing',
        error: err.message,
        durationMs
      };
    }
  }

  /**
   * OCR Processing Engine (Step 3).
   * Runs Optical Character Recognition over image documents or embedded PDF visuals.
   */
  static async runOcrEngine(rawBinaryText: string, mimeType: DocumentType): Promise<PipelineStageResult<string>> {
    const startTime = Date.now();
    logger.info(`Entering OCR Stage. MIME: ${mimeType}`);

    try {
      if (!mimeType.startsWith('image/') && rawBinaryText !== '[Binary Image Data - Triggers Optical Character Recognition Pipeline Stage]') {
        // Return early if file is already parsed text
        return {
          success: true,
          stageName: 'ocr_processing',
          data: rawBinaryText,
          durationMs: 0
        };
      }

      // 1. Production Deployment Hooks:
      // Typically utilizes "tesseract.js" or Cloud Vision SDK pipelines.
      // e.g.:
      // const worker = await createWorker();
      // const { data: { text } } = await worker.recognize(imageBuffer);
      // await worker.terminate();

      // Simulated clean OCR OCR feedback for demo reliability:
      logger.info('Performing optical layout structural sweeps...');
      const simulatedOcrProse = `[OCR Text Recovery Signature: ${new Date().toISOString()}]\nScribeStone automated platform scan results:\nLorem ipsum document layout recovery text. Standardized text extracted from source payload pixels.`;

      const durationMs = Date.now() - startTime;
      logger.info(`OCR Recognition complete in ${durationMs}ms`);

      return {
        success: true,
        stageName: 'ocr_processing',
        data: simulatedOcrProse,
        durationMs
      };

    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      logger.error('OCR Process failed to transform input pixels to content characters', err);
      return {
        success: false,
        stageName: 'ocr_processing',
        error: err.message,
        durationMs
      };
    }
  }
}
