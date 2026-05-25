import { db } from '../config/db.js';
import { cache } from '../config/redis.js';
import { logger } from '../config/logger.js';

interface PromptModuleData {
  prompt_key: string;
  version: number;
  system_instruction: string;
  template_format: string;
}

export class PromptService {
  private static CACHE_TTL = 3600; // Cache prompt layouts for 1 hour in Redis

  /**
   * Evaluates templates by replacing variables matching the {{variableName}} formula
   */
  static renderTemplate(template: string, variables: Record<string, string>): string {
    let rendered = template;
    for (const [key, value] of Object.entries(variables)) {
      rendered = rendered.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return rendered;
  }

  /**
   * Fetches the latest active system instruction and template layout.
   * Leverages Redis cache layer with graceful relational database fallback.
   */
  static async getActivePrompt(promptKey: string): Promise<PromptModuleData> {
    const cacheKey = `prompt:active:${promptKey}`;

    // 1. Try Cache
    try {
      const cached = await cache.get(cacheKey);
      if (cached) {
        logger.debug(`Prompt template retrieved from Redis Cache: ${promptKey}`);
        return JSON.parse(cached);
      }
    } catch (err) {
      logger.error('Redis failing to read active prompt caches', err as Error);
    }

    // 2. Fall back to Db
    try {
      const dbQuery = `
        SELECT prompt_key, version, system_instruction, template_format 
        FROM prompt_modules 
        WHERE prompt_key = $1 AND is_active = TRUE 
        ORDER BY version DESC 
        LIMIT 1
      `;
      const res = await db.query<PromptModuleData>(dbQuery, [promptKey]);

      if (res.rows.length > 0) {
        const promptData = res.rows[0];
        // Populate redis for future hits
        await cache.set(cacheKey, JSON.stringify(promptData), this.CACHE_TTL);
        return promptData;
      }
    } catch (err) {
      logger.error('Database failed to retrieve prompt modules', err as Error);
    }

    // 3. Fallback inline hardcoded default layout
    logger.warn(`Employing critical software defaults for requested promptKey: ${promptKey}`);
    return this.getDefaultPromptLegacy(promptKey);
  }

  /**
   * Fallback prompt templates
   */
  private static getDefaultPromptLegacy(promptKey: string): PromptModuleData {
    return {
      prompt_key: promptKey,
      version: 1,
      system_instruction: 'You are the primary engine for ScribeStone, a high-craft document styling, proofreading and editorial revision agent.',
      template_format: 'Analyze and improve the following text. The requested rewrite tone/style constraint is: "{{style}}".\n\nText: "{{text}}"'
    };
  }

  /**
   * Add a new versioned prompt to the module registry
   */
  static async registerPrompt(
    promptKey: string, 
    systemInstruction: string, 
    templateFormat: string, 
    userId?: string
  ): Promise<PromptModuleData> {
    const dbClient = await db.getClient();
    try {
      await dbClient.query('BEGIN');
      
      // Select the current max version number for this key
      const verQuery = 'SELECT MAX(version) as current_ver FROM prompt_modules WHERE prompt_key = $1';
      const verRes = await dbClient.query(verQuery, [promptKey]);
      const nextVersion = (verRes.rows[0]?.current_ver || 0) + 1;

      // Mark other older versions as inactive
      await dbClient.query('UPDATE prompt_modules SET is_active = FALSE WHERE prompt_key = $1', [promptKey]);

      // Insert new version
      const insertQuery = `
        INSERT INTO prompt_modules (prompt_key, version, system_instruction, template_format, is_active, created_by)
        VALUES ($1, $2, $3, $4, TRUE, $5)
        RETURNING prompt_key, version, system_instruction, template_format
      `;
      const insertRes = await dbClient.query<PromptModuleData>(insertQuery, [
        promptKey,
        nextVersion,
        systemInstruction,
        templateFormat,
        userId || null
      ]);

      await dbClient.query('COMMIT');

      // Flush Redis Cache
      await cache.del(`prompt:active:${promptKey}`);

      logger.info(`Successfully registered and cached prompt registry: ${promptKey} - Version v${nextVersion}`);
      return insertRes.rows[0];
    } catch (err) {
      await dbClient.query('ROLLBACK');
      logger.error(`Failed to register prompt registry: ${promptKey}`, err as Error);
      throw err;
    } finally {
      dbClient.release();
    }
  }
}
