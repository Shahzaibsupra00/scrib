import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.js';
import { AdminController } from '../controllers/adminController.js';

/**
 * High-performance middleware telemetry logger recording API metrics in Postgres.
 */
export function apiLogger(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const start = Date.now();
  
  // Skip logging static assets, Vite socket calls, or HMR polling lines
  if (
    req.path.includes('/vite') || 
    req.path.includes('/__vite') ||
    req.path.includes('/@vite') ||
    req.path.startsWith('/dist') ||
    req.path.startsWith('/node_modules')
  ) {
    return next();
  }

  // Intercept response finish event to calculate exact latency metrics
  res.on('finish', () => {
    // Only capture /api routes to prevent flooding with general SPA files
    if (!req.path.startsWith('/api')) {
      return;
    }

    const duration = Date.now() - start;
    const ip = req.clientIp || (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const userEmail = req.user?.email || 'anonymous';

    // Fire-and-forget saving of the telemetry log in the background
    AdminController.recordApiLog(
      userEmail,
      req.method,
      req.path,
      res.statusCode,
      duration,
      ip
    ).catch((err) => {
      console.warn('Logging API metrics stalled contextually: ', err.message);
    });
  });

  next();
}
