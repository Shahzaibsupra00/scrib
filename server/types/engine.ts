/**
 * Strong TypeScript declarations defining the complete multi-stage AI processing pipeline.
 */

export type DocumentType = 'text/plain' | 'text/markdown' | 'application/pdf' | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' | 'image/png' | 'image/jpeg';

export type EngineStatus = 'pending' | 'parsed' | 'ocr_processed' | 'analyzing' | 'completed' | 'failed';

export type SupportedModelProviders = 'google' | 'openai';

export interface ProcessingOptions {
  modelProvider: SupportedModelProviders;
  modelName: string; // e.g. 'gemini-3.5-flash', 'gpt-4o'
  styleTone: string; // e.g. 'Professional', 'Witty', 'Technical'
  promptKey: string;
  enableOcr?: boolean;
}

export interface ProcessingJob {
  id: string;
  userId: string;
  s3Key: string;
  fileMimeType: DocumentType;
  fileSizeBytes: number;
  options: ProcessingOptions;
  status: EngineStatus;
  rawTextContent?: string;
  promptSent?: string;
  modelResponseRaw?: string;
  structuredOutput?: Record<string, any>;
  tokensConsumed?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  errorMessage?: string;
  attemptsMade: number;
  createdAt: string;
  updatedAt: string;
}

export interface PipelineStageResult<T = any> {
  success: boolean;
  stageName: string;
  data?: T;
  error?: string;
  durationMs: number;
}
