import { OpenAI } from 'openai';
import { logger } from '../config/logger.js';
import { cache } from '../config/redis.js';
import { AppError } from '../middleware/errorHandler.js';
import { PromptService } from './promptService.js';
import { Response } from 'express';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Lazy initialization of the OpenAI client
let openaiInstance: OpenAI | null = null;
export function getOpenAI(): OpenAI {
  if (!openaiInstance) {
    if (!OPENAI_API_KEY) {
      throw new AppError(
        500,
        'The host environment variable "OPENAI_API_KEY" is not declared inside application configurations.',
        'OPENAI_API_KEY_ABSENT'
      );
    }
    openaiInstance = new OpenAI({ apiKey: OPENAI_API_KEY });
  }
  return openaiInstance;
}

export interface StreamingTextParams {
  promptKey: string;
  style: string;
  text: string;
  userId: string;
}

export class OpenAiService {
  /**
   * Approximate tokens calculation utility
   */
  static countTokens(content: string): number {
    if (!content) return 0;
    const words = content.trim().split(/\s+/).length;
    return Math.ceil(words * 1.35); // Reliable high-confidence token multiplier for English text
  }

  /**
   * Standardized Linear Retry Policy with Backoff
   */
  static async retryWithBackoff<T>(
    operation: () => Promise<T>,
    retriesRemaining = 3,
    delayMs = 1500
  ): Promise<T> {
    try {
      return await operation();
    } catch (err: any) {
      if (retriesRemaining <= 0) {
        throw err;
      }

      // Diagnose retry eligibility (Rate Limit 429 or Server Errors 5xx are eligible, 401 Unauth is terminal)
      const statusCode = err.status || err.statusCode || 500;
      const isRetryable = statusCode === 429 || statusCode >= 500;

      if (!isRetryable) {
        throw err;
      }

      logger.warn(`OpenAI API warning: Retrying failed query in ${delayMs}ms due to: ${err.message}`, {
        retriesRemaining,
        statusCode
      });

      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return this.retryWithBackoff(operation, retriesRemaining - 1, delayMs * 2);
    }
  }

  /**
   * Checks real-time Redis-level rate limits specifically for AI operations
   */
  static async verifyRateLimit(userId: string, limitsPerMinute = 15): Promise<void> {
    const key = `ratelimit:openai:${userId}`;
    try {
      const requestsCount = await cache.incr(key);
      if (requestsCount === 1) {
        await cache.expire(key, 60); // Reset limiter window after 1 minute
      }

      if (requestsCount !== null && requestsCount > limitsPerMinute) {
        logger.warn(`OpenAI API usage threshold triggered for user: ${userId}`);
        throw new AppError(
          429,
          `OpenAI request limit reached. Current tier allows up to ${limitsPerMinute} premium generation requests per minute.`,
          'OPENAI_RATE_LIMIT_EXCEEDED'
        );
      }
    } catch (err) {
      if (err instanceof AppError) throw err;
      logger.error('Redis Rate limit query failed, bypassing to allow uninterrupted processing.', err as Error);
    }
  }

  /**
   * Main wrapper executing Structured JSON responses using GPT Models
   */
  static async generateStructuredJson<T = any>(
    params: {
      modelName?: string;
      promptKey: string;
      style: string;
      text: string;
      userId: string;
      responseFormatSchema: Record<string, any>;
    }
  ): Promise<{
    structuredOutput: T;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  }> {
    const { modelName = 'gpt-4o', promptKey, style, text, userId, responseFormatSchema } = params;

    // 1. Core Rate limiting validation
    await this.verifyRateLimit(userId);

    // 2. Load prompt dynamic templates
    const promptConfig = await PromptService.getActivePrompt(promptKey);
    const contextPrompt = PromptService.renderTemplate(promptConfig.template_format, {
      text,
      style
    });

    const openai = getOpenAI();

    try {
      logger.info(`Sending structured JSON request to OpenAI model: ${modelName}`, { userId, promptKey });

      // 3. Dispatch execution inside robust linear retry mechanics
      const result = await this.retryWithBackoff(async () => {
        return await openai.chat.completions.create({
          model: modelName,
          messages: [
            { role: 'system', content: promptConfig.system_instruction },
            { role: 'user', content: contextPrompt }
          ],
          response_format: { type: 'json_object' } // Enforces rigorous JSON layout
        });
      });

      const messageContent = result.choices[0]?.message?.content;
      if (!messageContent) {
        throw new AppError(500, 'OpenAI model failed to return text inside completion candidate bodies.', 'OPENAI_EMPTY_RESPONSE');
      }

      // Parse output content
      let jsonPayload: T;
      try {
        jsonPayload = JSON.parse(messageContent.trim()) as T;
      } catch (parseErr) {
        logger.error('Failed to parse OpenAI response format payload as JSON', parseErr as Error, { messageContent });
        throw new AppError(500, 'Formatting failed: Returned AI output did not contain valid JSON syntax structures.', 'OPENAI_MALFORMED_JSON');
      }

      // Tracking token metrics accurately
      const promptTokens = result.usage?.prompt_tokens || this.countTokens(contextPrompt);
      const completionTokens = result.usage?.completion_tokens || this.countTokens(messageContent);
      const totalTokens = promptTokens + completionTokens;

      logger.info('OpenAI call completed successfully', {
        userId,
        promptTokens,
        completionTokens,
        totalTokens
      });

      return {
        structuredOutput: jsonPayload,
        promptTokens,
        completionTokens,
        totalTokens
      };

    } catch (err: any) {
      if (err instanceof AppError) throw err;
      
      // Error Translation Layer: Map typical OpenAPI Errors into friendly AppErrors
      const statusCode = err.status || 500;
      let userFriendlyMessage = 'An exception occurred inside the OpenAI engine pipeline processes.';
      let code = 'OPENAI_INTEGRATION_ERROR';

      if (err.status === 401) {
        userFriendlyMessage = 'AI credentials expired or unauthorized internally.';
        code = 'OPENAI_UNAUTHORIZED';
      } else if (err.status === 429) {
        userFriendlyMessage = 'OpenAI API capacity limits exceeded. Retry later.';
        code = 'OPENAI_PROVIDER_RATE_LIMIT';
      }

      logger.error(`Unified OpenAI API exception mapped [HTTP ${statusCode}]: ${err.message}`, err);
      throw new AppError(statusCode, userFriendlyMessage, code);
    }
  }

  /**
   * Implements high-craft Server-Sent Events (SSE) streaming
   */
  static async streamTextCompletion(
    params: StreamingTextParams,
    res: Response
  ): Promise<void> {
    const { promptKey, style, text, userId } = params;

    // 1. Rate limiter check
    await this.verifyRateLimit(userId);

    // 2. Fetch Prompt configurations
    const promptConfig = await PromptService.getActivePrompt(promptKey);
    const contextPrompt = PromptService.renderTemplate(promptConfig.template_format, {
      text,
      style
    });

    const openai = getOpenAI();

    try {
      logger.info(`Starting ChatGPT event stream session for user: ${userId}`);

      // 3. Open robust HTTP Server-Sent Event headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders(); // Flushes headers immediately to open persistent pipe

      // 4. Request streaming chat completions chunk responses
      const stream = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: promptConfig.system_instruction },
          { role: 'user', content: contextPrompt }
        ],
        stream: true
      });

      let responseBuffer = '';

      for await (const chunk of stream) {
        const textValue = chunk.choices[0]?.delta?.content || '';
        responseBuffer += textValue;

        if (textValue) {
          // Emit standard Server Sent Event layout format: "data: <string>\n\n"
          res.write(`data: ${JSON.stringify({ text: textValue })}\n\n`);
        }
      }

      // Signal completion of event stream
      const finalPromptTokens = this.countTokens(contextPrompt);
      const finalCompletionTokens = this.countTokens(responseBuffer);

      res.write(`data: ${JSON.stringify({ 
        done: true, 
        tokensUsage: {
          promptTokens: finalPromptTokens,
          completionTokens: finalCompletionTokens,
          totalTokens: finalPromptTokens + finalCompletionTokens
        }
      })}\n\n`);

      logger.info(`OpenAI Event Stream ended cleanly for user: ${userId}`, {
        totalBufferedWords: responseBuffer.split(/\s+/).length
      });

      res.end();

    } catch (err: any) {
      logger.error('Errors encountered during ChatGPT active Server-Sent Event streaming session.', err);
      // If streaming had already started, emit error via open events channel cleanly
      res.write(`data: ${JSON.stringify({ error: 'Stream interrupted: ' + err.message })}\n\n`);
      res.end();
    }
  }
}
