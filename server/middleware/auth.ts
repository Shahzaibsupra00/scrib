import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../config/logger.js';
import { db } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'scribestone_epic_master_jwt_secret_9918';

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
  tier: string;
}

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
  clientIp?: string;
}

/**
 * Authenticates requests using JWT bearer tokens
 */
export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer <token>"

  if (!token) {
    logger.warn('Authentication failed: Authorization header missing token', { url: req.originalUrl });
    return res.status(401).json({ 
      error: 'Unauthorized access', 
      message: 'Secure JWT authentication token is missing from client headers.' 
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    
    // Fetch live tier stats from DB to ensure tier downgrades, billing terminations take immediate effect
    const userRes = await db.query(
      'SELECT role, tier, words_used, words_limit, subscription_status FROM users WHERE id = $1',
      [decoded.id]
    );

    if (userRes.rows.length === 0) {
      logger.warn(`Authentication failed: Subscribed user id #${decoded.id} no longer exists in database`);
      return res.status(403).json({ error: 'Access forbidden', message: 'User profile no longer active.' });
    }

    const liveUser = userRes.rows[0];
    
    // Attach user profile with up-to-date values to the active request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: liveUser.role,
      tier: liveUser.tier,
    };
    
    // IP tracking for rate limiting purposes
    req.clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown-ip';

    next();
  } catch (err: any) {
    logger.error('Authentication token validation failed', err);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired', 
        message: 'Your active session JWT has expired. Kindly request credentials regeneration.' 
      });
    }

    return res.status(403).json({ 
      error: 'Invalid token', 
      message: 'Supplied authorization signature was invalid or compromised.' 
    });
  }
}

/**
 * Guard middleware restricting actions solely to Admins
 */
export function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user || req.user.role !== 'admin') {
    logger.warn(`Unauthorized admin attempt by user: ${req.user?.email || 'Anonymous'}`);
    return res.status(403).json({ 
      error: 'Admins only', 
      message: 'You lack elevated permissions to complete this database action.' 
    });
  }
  next();
}

/**
 * Guard middleware verifying user has remaining words/credits budget before contacting AI
 */
export async function requireCreditLimits(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthenticated' });
  }

  try {
    const checkRes = await db.query(
      'SELECT words_used, words_limit FROM users WHERE id = $1',
      [req.user.id]
    );

    if (checkRes.rows.length === 0) {
      return res.status(404).json({ error: 'User metric not found' });
    }

    const { words_used, words_limit } = checkRes.rows[0];
    if (words_used >= words_limit) {
      logger.warn(`Usage cap triggered: User ${req.user.email} exceeded word metrics limit`);
      return res.status(402).json({ 
        error: 'Usage limit reached', 
        message: 'You have consumed your ScribeStone word guidelines. Please change/upgrade your plan.' 
      });
    }

    next();
  } catch (err) {
    logger.error('Error validation client credit metrics', err as Error);
    next(err);
  }
}
