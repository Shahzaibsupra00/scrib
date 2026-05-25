import { Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';
import { logger } from '../config/logger.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const JWT_SECRET = process.env.JWT_SECRET || 'scribestone_epic_master_jwt_secret_9918';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export class AuthController {

  /**
   * Registers a brand new user. Uses bcrypt hashing and creates a base subscription tier limit.
   */
  static async register(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const { email, password, fullName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing credentials', message: 'Email and password inputs are required.' });
    }

    try {
      // Check if user already exists
      const checkRes = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
      if (checkRes.rows.length > 0) {
        return res.status(409).json({ 
          error: 'Email already registered', 
          message: 'An account with that email already exists in ScribeStone.' 
        });
      }

      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create record
      const insertQuery = `
        INSERT INTO users (email, password_hash, full_name, role, tier, words_limit)
        VALUES ($1, $2, $3, 'user', 'free', 5000)
        RETURNING id, email, full_name, tier, words_limit, created_at
      `;
      const insertRes = await db.query(insertQuery, [
        email.toLowerCase().trim(),
        passwordHash,
        fullName || null
      ]);

      const newUser = insertRes.rows[0];
      logger.info(`User successfully registered on SaaS platform`, { userId: newUser.id, email: newUser.email });

      res.status(201).json({
        success: true,
        message: 'Registration successful! Active sandbox limits initialised at &lt;5,000 words.',
        user: newUser
      });

    } catch (err) {
      logger.error('Registration processing collapsed', err as Error);
      next(err);
    }
  }

  /**
   * Authenticates user, returning a signed JWT token
   */
  static async login(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing details', message: 'Please input both email and password.' });
    }

    try {
      // Find user
      const userRes = await db.query(
        'SELECT id, email, password_hash, role, tier, words_used, words_limit FROM users WHERE email = $1',
        [email.toLowerCase().trim()]
      );

      if (userRes.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid logins', message: 'Credentials do not match our system files.' });
      }

      const user = userRes.rows[0];

      // Match passwordhash
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid logins', message: 'Credentials do not match our system files.' });
      }

      // Generate JWT Session Token
      const tokenPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
        tier: user.tier
      };

      const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });

      logger.info(`Session started: User successfully logged in`, { userId: user.id });

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          tier: user.tier,
          wordsUsed: user.words_used,
          wordsLimit: user.words_limit
        }
      });

    } catch (err) {
      logger.error('Login action crashed', err as Error);
      next(err);
    }
  }

  /**
   * Fetch current authenticated user's profile metadata and live metrics
   */
  static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    if (!req.user) return res.status(401).json({ error: 'Unauthenticated' });

    try {
      const liveRes = await db.query(
        'SELECT id, email, full_name as "fullName", role, tier, words_used as "wordsUsed", words_limit as "wordsLimit", subscription_status as "subscriptionStatus" FROM users WHERE id = $1',
        [req.user.id]
      );

      if (liveRes.rows.length === 0) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      res.json({
        success: true,
        user: liveRes.rows[0]
      });
    } catch (err) {
      next(err);
    }
  }
}
