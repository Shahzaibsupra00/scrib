/**
 * Production-ready Structured Logger
 * Emits JSON-formatted logs optimized for container-stdout (e.g., Cloud Watch, Grafana Loki, Google Cloud Logging).
 */

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

class Logger {
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private formatMessage(level: LogLevel, message: string, context?: Record<string, any>): string {
    const payload = {
      timestamp: this.getTimestamp(),
      level,
      message,
      ...(context && { context }),
      environment: process.env.NODE_ENV || 'development',
    };
    return JSON.stringify(payload);
  }

  debug(message: string, context?: Record<string, any>) {
    if (process.env.LOG_LEVEL === 'DEBUG' || process.env.NODE_ENV !== 'production') {
      console.log(this.formatMessage('DEBUG', message, context));
    }
  }

  info(message: string, context?: Record<string, any>) {
    console.log(this.formatMessage('INFO', message, context));
  }

  warn(message: string, context?: Record<string, any>) {
    console.warn(this.formatMessage('WARN', message, context));
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    const errorDetails = error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : undefined;

    console.error(this.formatMessage('ERROR', message, {
      ...context,
      error: errorDetails
    }));
  }
}

export const logger = new Logger();
