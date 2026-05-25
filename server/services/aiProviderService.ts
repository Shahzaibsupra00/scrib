import { GoogleGenAI } from '@google/genai';
import { OpenAI } from 'openai';
import { logger } from '../config/logger.js';
import { PromptService } from './promptService.js';
import { SupportedModelProviders, PipelineStageResult } from '../types/engine.js';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Lazy client initializations to prevent app crashes on boot
let geminiInstance: GoogleGenAI | null = null;
let openaiInstance: OpenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!geminiInstance) {
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }
    geminiInstance = new GoogleGenAI({ 
      apiKey: GEMINI_API_KEY,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });
  }
  return geminiInstance;
}

function getOpenaiClient(): OpenAI {
  if (!openaiInstance) {
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is missing.');
    }
    openaiInstance = new OpenAI({ apiKey: OPENAI_API_KEY });
  }
  return openaiInstance;
}

export class AiProviderService {
  /**
   * Approximate token counter (Words * 1.33 for english prose is a highly recommended production estimate
   * if offline full-weight TikToken libraries aren't desired on core Express threads)
   */
  static estimateTokenUsage(text: string): number {
    if (!text) return 0;
    const wordCount = text.trim().split(/\s+/).length;
    return Math.ceil(wordCount * 1.35);
  }

  /**
   * Resilient executor wrapping API calls in active retry sweeps with linear backoffs.
   */
  static async executeWithRetry<T>(
    operationRef: () => Promise<T>,
    maxRetries = 3,
    initialDelayMs = 1500
  ): Promise<T> {
    let attempts = 0;
    while (attempts < maxRetries) {
      try {
        return await operationRef();
      } catch (err: any) {
        attempts++;
        // Check if rate limits or transient server exceptions occurred
        const isTransient = err.status === 429 || err.status >= 500 || err.message?.includes('fetch failed');
        
        if (!isTransient || attempts >= maxRetries) {
          throw err; // Fail-fast on terminal issues like bad keys or malformed JSON scopes
        }

        const delay = initialDelayMs * Math.pow(2, attempts);
        logger.warn(`AI provider transient error. Retrying attempt #${attempts} in ${delay}ms...`, { error: err.message });
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error('Retries exhausted without success');
  }

  /**
   * Structured response grammar schema (JSON Output Contract)
   */
  private static responseJsonSchema = {
    type: 'OBJECT' as any,
    properties: {
      grammarScore: { type: 'INTEGER' as any, description: 'Score representing grammatical accuracy from 0 to 100' },
      clarityScore: { type: 'INTEGER' as any, description: 'Score representing clarity of structure from 0 to 100' },
      detectedTone: { type: 'STRING' as any, description: 'Tone of the provided text' },
      improvementsList: { 
        type: 'ARRAY' as any, 
        items: { type: 'STRING' as any }, 
        description: 'Specific improvements applied' 
      },
      improvedText: { type: 'STRING' as any, description: 'The finalized enhanced markdown markup' }
    },
    required: ['grammarScore', 'clarityScore', 'detectedTone', 'improvementsList', 'improvedText']
  };

  /**
   * Interface dispatch connecting either to Google Gemini or OpenAI frameworks dynamically.
   */
  static async callAiVendor(
    provider: SupportedModelProviders,
    modelName: string,
    promptKey: string,
    style: string,
    text: string
  ): Promise<PipelineStageResult<{
    prompt: string;
    rawTextResponse: string;
    structuredOutput: Record<string, any>;
    promptTokens: number;
    completionTokens: number;
  }>> {
    const startTime = Date.now();
    logger.info(`Dispatching AI task to provider: ${provider}, model: ${modelName}`);

    try {
      // 1. Prompt Builder (Step 4)
      const promptModule = await PromptService.getActivePrompt(promptKey);
      const fullyRenderedPrompt = PromptService.renderTemplate(promptModule.template_format, {
        text,
        style
      });

      let rawResponseText = '';
      let promptTokensCount = this.estimateTokenUsage(fullyRenderedPrompt);
      let completionTokensCount = 0;

      // 2. OpenAI / Google multi-model execution (Step 5 & 6)
      if (provider === 'google') {
        const client = getGeminiClient();

        await this.executeWithRetry(async () => {
          const response = await client.models.generateContent({
            model: modelName || 'gemini-3.5-flash',
            contents: fullyRenderedPrompt,
            config: {
              systemInstruction: promptModule.system_instruction,
              responseMimeType: 'application/json',
              responseSchema: this.responseJsonSchema
            }
          });

          rawResponseText = response.text || '';
          
          // Capture metadata returned from API
          const usage = response.usageMetadata;
          if (usage) {
            promptTokensCount = usage.promptTokenCount || promptTokensCount;
            completionTokensCount = usage.candidatesTokenCount || 0;
          }
        });

      } else if (provider === 'openai') {
        const client = getOpenaiClient();

        await this.executeWithRetry(async () => {
          const chatCompletion = await client.chat.completions.create({
            model: modelName || 'gpt-4o',
            messages: [
              { role: 'system', content: promptModule.system_instruction },
              { role: 'user', content: fullyRenderedPrompt }
            ],
            response_format: { type: 'json_object' } // Ensure structured json formatting
          });

          rawResponseText = chatCompletion.choices[0]?.message?.content || '';
          
          const usage = chatCompletion.usage;
          if (usage) {
            promptTokensCount = usage.prompt_tokens || promptTokensCount;
            completionTokensCount = usage.completion_tokens || 0;
          }
        });
      } else {
        throw new Error(`Unsupported model provider parameters declared: ${provider}`);
      }

      // 3. Response validation and formatting (Step 7)
      if (!rawResponseText) {
        throw new Error('AI Provider returned an empty textual frame.');
      }

      const parsedJSON = JSON.parse(rawResponseText.trim());
      const durationMs = Date.now() - startTime;

      if (completionTokensCount === 0) {
        completionTokensCount = this.estimateTokenUsage(rawResponseText);
      }

      return {
        success: true,
        stageName: 'ai_execution',
        data: {
          prompt: fullyRenderedPrompt,
          rawTextResponse: rawResponseText,
          structuredOutput: parsedJSON,
          promptTokens: promptTokensCount,
          completionTokens: completionTokensCount
        },
        durationMs
      };

    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      logger.error(`AI Model Call crashed on: ${provider}/${modelName}`, err);
      return {
        success: false,
        stageName: 'ai_execution',
        error: err.message,
        durationMs
      };
    }
  }
}
