import { Response, NextFunction } from 'express';
import { OpenAiService } from '../services/openaiService.js';
import { logger } from '../config/logger.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export class OpenAiController {
  
  /**
   * Generates structured text analysis outputs with custom schemas.
   */
  static async generateStructured(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const { text, style, promptKey = 'default', modelName = 'gpt-4o', responseSchema } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Missing parameter', message: 'You must provide a non-empty text input.' });
    }

    // Standardized fallback schema matching default ScribeStone responses
    const defaultSchema = {
      grammarScore: { type: 'number' },
      clarityScore: { type: 'number' },
      detectedTone: { type: 'string' },
      improvementsList: { type: 'array', items: { type: 'string' } },
      improvedText: { type: 'string' }
    };

    try {
      const result = await OpenAiService.generateStructuredJson({
        modelName,
        promptKey,
        style: style || 'Professional',
        text,
        userId,
        responseFormatSchema: responseSchema || defaultSchema
      });

      res.status(200).json({
        success: true,
        data: result.structuredOutput,
        telemetry: {
          promptTokens: result.promptTokens,
          completionTokens: result.completionTokens,
          totalTokens: result.totalTokens
        }
      });

    } catch (err) {
      logger.error('Structured AI analysis controller error occurred', err as Error);
      next(err);
    }
  }

  /**
   * Action handler exposing dynamic chat streaming completions directly to client connections.
   */
  static async streamCompletions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const { text, style, promptKey = 'default' } = req.query;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Missing parameter', message: 'The request query parameter "text" matches no valid string contents.' });
    }

    try {
      await OpenAiService.streamTextCompletion({
        promptKey: (promptKey as string) || 'default',
        style: (style as string) || 'Professional',
        text: text as string,
        userId
      }, res);

    } catch (err) {
      logger.error('Completions streaming connection collapsed', err as Error);
      next(err);
    }
  }
}
