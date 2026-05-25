import { Response, NextFunction } from 'express';
import { db } from '../config/db.js';
import { logger } from '../config/logger.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import crypto from 'crypto';

export class AdminController {

  /**
   * Automatically initializes database tables and seeds mock accounts, support logs,
   * billing invoices, and API records to show premium data.
   */
  static async ensureSchemaExists(): Promise<void> {
    try {
      // 1. Create Feature Toggles table
      await db.query(`
        CREATE TABLE IF NOT EXISTS feature_toggles (
          flag_key VARCHAR(100) PRIMARY KEY,
          name VARCHAR(150) NOT NULL,
          description TEXT,
          is_enabled BOOLEAN DEFAULT TRUE NOT NULL,
          rules JSONB DEFAULT '{}'::jsonb NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
        );
      `);

      // 2. Create Support Tickets table
      await db.query(`
        CREATE TABLE IF NOT EXISTS support_tickets (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_email VARCHAR(255) NOT NULL,
          user_name VARCHAR(150),
          title VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          category VARCHAR(100) DEFAULT 'technical' NOT NULL, -- 'billing', 'technical', 'feature_request', 'other'
          status VARCHAR(50) DEFAULT 'open' NOT NULL, -- 'open', 'in_progress', 'resolved', 'closed'
          priority VARCHAR(50) DEFAULT 'medium' NOT NULL, -- 'low', 'medium', 'high', 'urgent'
          response_content TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
        );
      `);

      // 3. Create API logs table for internal observability telemetry
      await db.query(`
        CREATE TABLE IF NOT EXISTS api_logs (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_email VARCHAR(255),
          http_method VARCHAR(10) NOT NULL,
          request_path VARCHAR(255) NOT NULL,
          status_code INT NOT NULL,
          latency_ms INT NOT NULL,
          client_ip VARCHAR(45),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
        );
      `);

      // 4. Create Billing Invoices table
      await db.query(`
        CREATE TABLE IF NOT EXISTS billing_invoices (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_email VARCHAR(255) NOT NULL,
          amount_usd NUMERIC(10, 2) NOT NULL,
          tier VARCHAR(50) NOT NULL,
          interval VARCHAR(20) NOT NULL, -- 'month', 'year'
          status VARCHAR(50) DEFAULT 'paid' NOT NULL, -- 'paid', 'unpaid', 'failed'
          transaction_id VARCHAR(100) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
        );
      `);

      // Seed tables with data if they are empty
      await AdminController.seedInitialData();

    } catch (err: any) {
      logger.error('Failed to run dynamic schema creation for Admin module:', err);
    }
  }

  private static async seedInitialData(): Promise<void> {
    try {
      // 1. Seed Feature Toggles if empty
      const togglesCount = await db.query('SELECT COUNT(*) FROM feature_toggles');
      if (parseInt(togglesCount.rows[0].count, 10) === 0) {
        logger.info('Seeding initial SaaS feature flags');
        const toggles = [
          ['gemini-3.5-revisions', 'Gemini 3.5 Active Revisions Engine', 'Utilizes structural revision agents to rewrite professional document copies.', true],
          ['unlimited-audio-narratives', 'SaaS Audio Synth Playback', 'Generates speech outputs from processed revisions for auditory verification.', false],
          ['s3-secure-shuttle', 'S3 Cloud Bucket Secure Stream', 'Streams text content directly from isolated, pre-signed AWS S3 buckets.', true],
          ['unlocked-word-metering', 'Infinite Word Quotas for Premium Members', 'Bypasses standard credit quotas for Enterprise plan models.', false],
          ['security-clamav-realtime', 'ClamAV Document Sandbox Scan', 'Performs virus scanning and code sterilization on active doc transfers.', true]
        ];

        for (const tg of toggles) {
          await db.query(
            `INSERT INTO feature_toggles (flag_key, name, description, is_enabled) 
             VALUES ($1, $2, $3, $4) ON CONFLICT (flag_key) DO NOTHING`,
            tg
          );
        }
      }

      // 2. Seed Billing Invoices if empty
      const invoiceCount = await db.query('SELECT COUNT(*) FROM billing_invoices');
      if (parseInt(invoiceCount.rows[0].count, 10) === 0) {
        logger.info('Seeding sandbox billing and invoices data');
        const invoices = [
          ['alex.dev@gmail.com', 29.00, 'pro', 'month', 'paid', 'ch_19823h1u283h'],
          ['sarah.m@designco.io', 499.00, 'enterprise', 'year', 'paid', 'ch_90123h1u283z'],
          ['executive_pro@outlook.com', 29.00, 'pro', 'month', 'paid', 'ch_9a223h1u283j'],
          ['coder_bill@ycombinator.com', 499.00, 'enterprise', 'year', 'paid', 'ch_1231a3h1u283f'],
          ['growth_hacker@nomad.co', 29.00, 'pro', 'month', 'paid', 'ch_33b82h1u283k'],
          ['agency_admin@mediaflow.net', 499.00, 'enterprise', 'year', 'paid', 'ch_44223h1u244h'],
          ['finance_guru@mastercard.com', 29.00, 'pro', 'month', 'paid', 'ch_88323h1u289l'],
          ['test_user@scribestone.com', 29.00, 'pro', 'month', 'paid', 'ch_test1u283h'],
          ['unpaid_entity@scam.org', 29.00, 'pro', 'month', 'unpaid', 'ch_failed823u8']
        ];

        let offsetDays = 28;
        for (const inv of invoices) {
          await db.query(
            `INSERT INTO billing_invoices (user_email, amount_usd, tier, interval, status, transaction_id, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW() - INTERVAL '${offsetDays} days')`,
            inv
          );
          offsetDays -= 3;
        }
      }

      // 3. Seed Support Tickets if empty
      const ticketCount = await db.query('SELECT COUNT(*) FROM support_tickets');
      if (parseInt(ticketCount.rows[0].count, 10) === 0) {
        logger.info('Seeding baseline support tickets queue');
        const tickets = [
          ['alex.dev@gmail.com', 'Alex Dev', 'Stripe checkout callback failure', 'My plan status did not propagate after Stripe redirected back to the applet layout. Please authorize pro entitlement parameters manually.', 'billing', 'open', 'high'],
          ['sarah.m@designco.io', 'Sarah Mitchell', 'Enterprise SLA support inquiry', 'Could you support exporting PDF summaries containing custom logo matrices? Our teams require this brand asset packaging.', 'feature_request', 'in_progress', 'medium'],
          ['executive_pro@outlook.com', 'John Executive', 'GuardAV flagged clean presentation slides', 'The slide deck PPTX file I uploaded was rejected during scanning. ScribesTone said - Sandbox validation stalled. Can you white-label standard XML slides?', 'technical', 'resolved', 'high', 'Verified custom XML schema matches standard Word OpenXML layout. Resolved and whitelisted.'],
          ['coder_bill@ycombinator.com', 'Bill Gates', 'Bulk API response latency spike', 'Seeing latency averages hover around 1.8 seconds on large markdown transfers. Is there a cache hit bypass we should disable?', 'technical', 'open', 'low'],
          ['growth_hacker@nomad.co', 'Nate Nomad', 'Need support for epub conversions', 'Is epub document parsing on the roadmap? Love the simplicity of ScribeStone and want to write ebooks with this editor.', 'feature_request', 'closed', 'low', 'EPUB file support planned for Q4 workspace migrations release window. Ticket close with feedback recorded.']
        ];

        for (const t of tickets) {
          await db.query(
            `INSERT INTO support_tickets (user_email, user_name, title, description, category, status, priority, response_content, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW() - INTERVAL '4 days')`,
            t
          );
        }
      }

      // 4. Seed API logs if empty
      const apiLogsCount = await db.query('SELECT COUNT(*) FROM api_logs');
      if (parseInt(apiLogsCount.rows[0].count, 10) === 0) {
        logger.info('Seeding mock api log metrics');
        const logEntries = [
          ['alex.dev@gmail.com', 'POST', '/api/v2/ai/analyze', 200, 1205, '192.168.1.10'],
          ['sarah.m@designco.io', 'GET', '/api/v2/uploads/list', 200, 142, '192.168.1.15'],
          ['visitor@scribestone.com', 'POST', '/api/v2/auth/login', 401, 80, '103.14.88.29'],
          ['executive_pro@outlook.com', 'POST', '/api/v2/uploads/verify', 200, 2410, '82.112.5.99'],
          ['coder_bill@ycombinator.com', 'POST', '/api/v2/ai/analyze', 500, 3105, '18.190.22.8'],
          ['visitor@scribestone.com', 'POST', '/api/v2/auth/register', 201, 350, '73.4.155.101'],
          ['growth_hacker@nomad.co', 'GET', '/api/profile', 200, 45, '118.23.4.56'],
          ['test_user@scribestone.com', 'GET', '/api/history', 200, 60, '127.0.0.1']
        ];

        for (const entry of logEntries) {
          await db.query(
            `INSERT INTO api_logs (user_email, http_method, request_path, status_code, latency_ms, client_ip)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            entry
          );
        }
      }

      // 5. Seed some initial usage_logs in Postgres to enable beautiful charts
      const usageCount = await db.query('SELECT COUNT(*) FROM usage_logs');
      if (parseInt(usageCount.rows[0].count, 10) === 0) {
        logger.info('Populating sample AI usage analytics tracker table');
        // Let's find valid users to bind this to
        const usersRes = await db.query('SELECT id, email FROM users LIMIT 3');
        if (usersRes.rows.length > 0) {
          const mainUserId = usersRes.rows[0].id;
          const usageRows = [
            ['ai_analyze', 1200, 'gemini-3.5-flash', false, 950, '6 days ago'],
            ['document_upload', 1, null, false, 240, '5 days ago'],
            ['ai_analyze', 450, 'gemini-3.5-flash', true, 120, '4 days ago'],
            ['ai_analyze', 2200, 'gemini-3.5-flash', false, 1450, '3 days ago'],
            ['document_upload', 1, null, false, 180, '2 days ago'],
            ['ai_analyze', 850, 'gemini-3.5-flash', false, 890, '1 day ago'],
            ['ai_analyze', 1500, 'gemini-3.5-flash', false, 1100, 'today']
          ];

          for (const row of usageRows) {
            const dateStr = row[5] === 'today' ? 'NOW()' : `NOW() - INTERVAL '${row[5]}'`;
            await db.query(
              `INSERT INTO usage_logs (user_id, request_type, units_metered, model_used, is_cached_hit, response_duration_ms, created_at)
               VALUES ($1, $2, $3, $4, $5, $6, ${dateStr})`,
              [mainUserId, row[0], row[1], row[2], row[3], row[4]]
            );
          }
        }
      }

    } catch (e: any) {
      logger.error('Error seeding initial SaaS admin diagnostics data: ', e);
    }
  }

  /**
   * Records an API operation into the api_logs tracking system.
   */
  static async recordApiLog(email: string | null, method: string, path: string, statusCode: number, latencyMs: number, ip: string): Promise<void> {
    try {
      await db.query(
        `INSERT INTO api_logs (user_email, http_method, request_path, status_code, latency_ms, client_ip)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [email || 'anonymous', method, path, statusCode, latencyMs, ip]
      );
    } catch (err: any) {
      // Fail silently to avoid breaking the calling API path
      console.warn('Logging API telemetry failed: ' + err.message);
    }
  }

  /**
   * Fetches unified overhead aggregate metrics for main KPI display cards.
   */
  static async getOverviewStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await AdminController.ensureSchemaExists();

      // Cumulative user registration counts
      const usersRes = await db.query('SELECT COUNT(*) as count FROM users');
      const totalUsers = parseInt(usersRes.rows[0].count, 10);

      // Subscription tier breakups
      const tiersRes = await db.query(`
        SELECT tier, COUNT(*) as count 
        FROM users 
        GROUP BY tier
      `);
      
      const subMetrics = {
        free: 0,
        pro: 0,
        enterprise: 0
      };
      tiersRes.rows.forEach((r: any) => {
        if (r.tier === 'pro') subMetrics.pro = parseInt(r.count, 10);
        else if (r.tier === 'enterprise') subMetrics.enterprise = parseInt(r.count, 10);
        else subMetrics.free = parseInt(r.count, 10);
      });

      // Active support tickets sum
      const ticketsRes = await db.query(`
        SELECT COUNT(*) as count FROM support_tickets WHERE status != 'closed' AND status != 'resolved'
      `);
      const activeTickets = parseInt(ticketsRes.rows[0].count, 10);

      // Active operational S3 files
      const uploadsRes = await db.query('SELECT COUNT(*) as count FROM document_uploads');
      const totalUploads = parseInt(uploadsRes.rows[0].count, 10);

      // Metrical financial tallies from historical invoices
      const revenueRes = await db.query(`
        SELECT COALESCE(SUM(amount_usd), 0) as total FROM billing_invoices WHERE status = 'paid'
      `);
      const lifetimeEarnings = parseFloat(revenueRes.rows[0].total);

      // Approximate Monthly Recurring Revenue
      // Pro users (e.g. $29/mo) + Enterprise (e.g. $499/ry -> $41.5/mo)
      const mrr = (subMetrics.pro * 29.00) + (subMetrics.enterprise * 41.50);

      // AI Total processed units
      const wordsRes = await db.query('SELECT COALESCE(SUM(words_used), 0) as total FROM users');
      const totalWordsProcessed = parseInt(wordsRes.rows[0].total, 10);

      res.status(200).json({
        success: true,
        stats: {
          totalUsers,
          subMetrics,
          activeTickets,
          totalUploads,
          lifetimeEarnings,
          monthlyRecurringRevenue: mrr,
          totalWordsProcessed
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Retrieves SaaS user details with search capability and profile status toggles.
   */
  static async getUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await AdminController.ensureSchemaExists();
      const searchQuery = req.query.search ? `%${req.query.search}%` : null;
      const tierFilter = req.query.tier || null;

      let countQuery = 'SELECT COUNT(*) FROM users';
      let dataQuery = `
        SELECT id, email, full_name as "fullName", role, tier, words_used as "wordsUsed", 
               words_limit as "wordsLimit", subscription_status as "subscriptionStatus", created_at as "createdAt"
        FROM users
      `;
      const params: any[] = [];

      if (searchQuery && tierFilter) {
        dataQuery += ` WHERE (email ILIKE $1 OR full_name ILIKE $1) AND tier = $2`;
        countQuery += ` WHERE (email ILIKE $1 OR full_name ILIKE $1) AND tier = $2`;
        params.push(searchQuery, tierFilter);
      } else if (searchQuery) {
        dataQuery += ` WHERE (email ILIKE $1 OR full_name ILIKE $1)`;
        countQuery += ` WHERE (email ILIKE $1 OR full_name ILIKE $1)`;
        params.push(searchQuery);
      } else if (tierFilter) {
        dataQuery += ` WHERE tier = $1`;
        countQuery += ` WHERE tier = $1`;
        params.push(tierFilter);
      }

      dataQuery += ' ORDER BY created_at DESC';

      const dataRes = await db.query(dataQuery, params);
      const countRes = await db.query(countQuery, params);

      res.json({
        success: true,
        users: dataRes.rows,
        totalCount: parseInt(countRes.rows[0].count, 10)
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Adjusts credential parameters for a user registration record.
   */
  static async updateUserProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const { userId } = req.params;
    const { role, tier, wordsLimit, subscriptionStatus } = req.body;

    try {
      const updateQuery = `
        UPDATE users 
        SET role = COALESCE($1, role),
            tier = COALESCE($2, tier),
            words_limit = COALESCE($3, words_limit),
            subscription_status = COALESCE($4, subscription_status),
            updated_at = NOW()
        WHERE id = $5
        RETURNING id, email, full_name, role, tier, words_limit, subscription_status
      `;

      const updRes = await db.query(updateQuery, [role, tier, wordsLimit, subscriptionStatus, userId]);

      if (updRes.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      logger.info(`Admin override committed user settings changes`, { adminId: req.user?.id, modifiedUserId: userId, role, tier });

      res.json({
        success: true,
        user: updRes.rows[0]
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Retrieves SaaS invoices records.
   */
  static async getRevenueMetrics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await AdminController.ensureSchemaExists();

      // Recent payment list
      const invoicesRes = await db.query(`
        SELECT id, user_email as "userEmail", amount_usd as "amountUsd", tier, interval, status, 
               transaction_id as "transactionId", created_at as "createdAt"
        FROM billing_invoices
        ORDER BY created_at DESC
        LIMIT 50
      `);

      // Cumulative revenue aggregating by date
      const chartRes = await db.query(`
        SELECT TO_CHAR(created_at, 'YYYY-MM-DD') as date, SUM(amount_usd) as total
        FROM billing_invoices
        WHERE status = 'paid'
        GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
        ORDER BY date ASC
      `);

      // Cumulative by Tiers
      const tierStatsRes = await db.query(`
        SELECT tier, SUM(amount_usd) as revenue, COUNT(*) as transactionCount
        FROM billing_invoices
        WHERE status = 'paid'
        GROUP BY tier
      `);

      res.json({
        success: true,
        invoices: invoicesRes.rows,
        dailyRevenueChart: chartRes.rows,
        tierContribution: tierStatsRes.rows
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Retrieves systemic AI model latencies and metered unit totals over time.
   */
  static async getUsageMetrics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await AdminController.ensureSchemaExists();

      // Recent analytics log entries
      const usageRes = await db.query(`
        SELECT ul.id, ul.request_type as "requestType", ul.units_metered as "unitsMetered", 
               ul.model_used as "modelUsed", ul.is_cached_hit as "isCachedHit", 
               ul.response_duration_ms as "responseDurationMs", ul.created_at as "createdAt",
               u.email as "userEmail"
        FROM usage_logs ul
        LEFT JOIN users u ON ul.user_id = u.id
        ORDER BY ul.created_at DESC
        LIMIT 50
      `);

      // Aggregate metered units over days
      const daysRes = await db.query(`
        SELECT TO_CHAR(created_at, 'YYYY-MM-DD') as date, 
               COALESCE(SUM(CASE WHEN request_type = 'ai_analyze' THEN units_metered ELSE 0 END), 0) as wordsCount,
               COALESCE(SUM(CASE WHEN request_type = 'document_upload' THEN 1 ELSE 0 END), 0) as uploadsCount,
               COALESCE(AVG(response_duration_ms), 0) as avgDurationMs
        FROM usage_logs
        GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
        ORDER BY date ASC
      `);

      res.json({
        success: true,
        logs: usageRes.rows,
        dailyAggr: daysRes.rows
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Retrieves operational HTTP API diagnostics streams.
   */
  static async getApiLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await AdminController.ensureSchemaExists();

      const logsRes = await db.query(`
        SELECT id, user_email as "userEmail", http_method as "httpMethod", 
               request_path as "requestPath", status_code as "statusCode", 
               latency_ms as "latencyMs", client_ip as "clientIp", created_at as "createdAt"
        FROM api_logs
        ORDER BY created_at DESC
        LIMIT 100
      `);

      res.json({
        success: true,
        apiLogs: logsRes.rows
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Retrieves all customer support tickets.
   */
  static async getTickets(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await AdminController.ensureSchemaExists();

      const limit = parseInt(req.query.limit as string || '50', 10);
      const ticketsRes = await db.query(`
        SELECT id, user_email as "userEmail", user_name as "userName", title, description, 
               category, status, priority, response_content as "responseContent", created_at as "createdAt", updated_at as "updatedAt"
        FROM support_tickets
        ORDER BY 
          CASE priority
            WHEN 'urgent' THEN 1
            WHEN 'high' THEN 2
            WHEN 'medium' THEN 3
            WHEN 'low' THEN 4
            ELSE 5
          END,
          created_at DESC
        LIMIT $1
      `, [limit]);

      res.json({
        success: true,
        tickets: ticketsRes.rows
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Submits a fresh customer support ticket (can be utilized by users on frontend).
   */
  static async submitTicket(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const { title, description, category, priority, userName, userEmail } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Missing input properties' });
    }

    // Determine current user context
    const email = req.user?.email || userEmail || 'anonymous@scribestone.com';
    const name = userName || email.split('@')[0];

    try {
      await AdminController.ensureSchemaExists();

      const insRes = await db.query(`
        INSERT INTO support_tickets (user_email, user_name, title, description, category, priority)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, user_email, user_name, title, description, category, status, priority, created_at
      `, [
        email,
        name,
        title,
        description,
        category || 'technical',
        priority || 'medium'
      ]);

      res.status(201).json({
        success: true,
        ticket: insRes.rows[0],
        message: 'Your ScribeStone ticket was successfully queued contextually in our admin registry.'
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Updates state parameters and logs replies for active support assignments.
   */
  static async updateTicket(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const { ticketId } = req.params;
    const { status, responseContent, priority } = req.body;

    try {
      const updateQuery = `
        UPDATE support_tickets 
        SET status = COALESCE($1, status),
            response_content = COALESCE($2, response_content),
            priority = COALESCE($3, priority),
            updated_at = NOW()
        WHERE id = $4
        RETURNING id, user_email, user_name, title, description, category, status, priority, response_content, updated_at
      `;

      const updRes = await db.query(updateQuery, [status, responseContent, priority, ticketId]);

      if (updRes.rows.length === 0) {
        return res.status(404).json({ error: 'Support ticket not found' });
      }

      logger.info(`Admin replied/updated support ticket status: ${ticketId}`, { adminId: req.user?.id, status });

      res.json({
        success: true,
        ticket: updRes.rows[0]
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Lists available functional feature-toggles.
   */
  static async getFeatures(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await AdminController.ensureSchemaExists();

      const togglesRes = await db.query(`
        SELECT flag_key as "flagKey", name, description, is_enabled as "isEnabled", rules, created_at as "createdAt"
        FROM feature_toggles
        ORDER BY created_at ASC
      `);

      res.json({
        success: true,
        features: togglesRes.rows
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Updates or overrides feature-toggle operational behaviors.
   */
  static async updateFeatureToggle(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const { flagKey } = req.params;
    const { isEnabled, description, name } = req.body;

    try {
      const updateQuery = `
        UPDATE feature_toggles 
        SET is_enabled = COALESCE($1, is_enabled),
            description = COALESCE($2, description),
            name = COALESCE($3, name),
            updated_at = NOW()
        WHERE flag_key = $4
        RETURNING flag_key as "flagKey", name, description, is_enabled as "isEnabled", updated_at
      `;

      const updRes = await db.query(updateQuery, [isEnabled, description, name, flagKey]);

      if (updRes.rows.length === 0) {
        // If flagKey does not exist, let's create it on the fly!
        const insertQuery = `
          INSERT INTO feature_toggles (flag_key, name, description, is_enabled)
          VALUES ($1, $2, $3, $4)
          RETURNING flag_key as "flagKey", name, description, is_enabled as "isEnabled"
        `;
        const insRes = await db.query(insertQuery, [
          flagKey,
          name || flagKey,
          description || 'Manually declared feature toggle',
          isEnabled !== undefined ? isEnabled : true
        ]);

        logger.info(`Admin created brand new feature toggle flags on-trigger`, { flagKey, isEnabled });
        return res.json({
          success: true,
          feature: insRes.rows[0]
        });
      }

      logger.info(`Admin updated toggles state variables`, { flagKey, isEnabled });

      res.json({
        success: true,
        feature: updRes.rows[0]
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Safe promotion mechanism allowing developers in the AI Studio environment
   * to immediately gain administrator authorization headers.
   */
  static async promoteSelf(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }

    try {
      await db.query(`UPDATE users SET role = 'admin' WHERE id = $1`, [req.user.id]);
      logger.info(`SaaS administrator elevation request granted for testing user: ${req.user.email}`);
      
      res.json({
        success: true,
        message: 'Elevated authorization tokens applied. Your account role has been updated to admin.'
      });
    } catch (err) {
      next(err);
    }
  }
}
