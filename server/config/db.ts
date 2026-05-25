import pg from 'pg';
import { logger } from './logger.js';

const { Pool } = pg;

// Load connection parameters from process environment
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '5432', 10);
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';
const DB_NAME = process.env.DB_NAME || 'scribestone_db';

const pool = new Pool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  max: parseInt(process.env.DB_POOL_MAX || '20', 10), // Limit maximum database clients in pool
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 5000, // Error after 5s if unable to establish connection
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
});

// Set up pool event listeners
pool.on('connect', () => {
  logger.debug('New PostgreSQL database connection established from pool');
});

pool.on('error', (err) => {
  logger.error('PostgreSQL database client pool experienced an unexpected error', err);
});

export const db = {
  /**
   * Primary query method for unified statements. Uses pooled clients.
   */
  async query<T = any>(text: string, params?: any[]): Promise<pg.QueryResult<T>> {
    const start = Date.now();
    try {
      const res = await pool.query<T>(text, params);
      const duration = Date.now() - start;
      logger.debug('Database query executed successfully', { text, durationMs: duration, rowCount: res.rowCount });
      return res;
    } catch (err: any) {
      logger.error('Database query execution failure', err, { text, params });
      throw err;
    }
  },

  /**
   * Acquire a dedicated client from the pool for transactions.
   */
  async getClient(): Promise<pg.PoolClient> {
    const client = await pool.connect();
    return client;
  },

  /**
   * Graceful close of pooling operations.
   */
  async close(): Promise<void> {
    logger.info('Shutting down PostgreSQL connection pool...');
    await pool.end();
  }
};
