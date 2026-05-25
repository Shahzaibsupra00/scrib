import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger.js';

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly message: string,
    public readonly errorCode?: string,
    public readonly isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Universal Express error dispatch middleware
 */
export function globalErrorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const isProd = process.env.NODE_ENV === 'production';
  let statusCode = 500;
  let message = 'An unexpected server exception occurred.';
  let errorCode = 'INTERNAL_ERR_SECURE';

  // Parse structured errors
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorCode = err.errorCode || 'OPERATIONAL_FAILURE';
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
    errorCode = 'SCHEMA_VALIDATION_ERR';
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Invalid auth credentials supplied.';
    errorCode = 'JWT_MALFORMED';
  }

  // Log error with complete metadata trace stack
  logger.error(`Error encountered in [${req.method}] ${req.originalUrl}: ${message}`, err, {
    clientIp: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
      ...(isProd ? {} : { stack: err.stack }), // Only expose crash stack to debugger, never client users
    }
  });
}
