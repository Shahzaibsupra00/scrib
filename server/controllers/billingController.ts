import { Request, Response, NextFunction } from 'express';
import { db } from '../config/db.js';
import { logger } from '../config/logger.js';
import { cache } from '../config/redis.js';
import { StripeService, PLAN_CATALOG, getStripe } from '../services/stripeService.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export class BillingController {

  /**
   * Generates a Stripe Checkout Session for Monthly or Annual subscriptions, with optional Free Trial configurations.
   */
  static async createCheckoutSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const { tier, billingInterval, trialPeriodDays } = req.body;
    const userId = req.user?.id;
    const userEmail = req.user?.email;

    if (!userId || !userEmail) {
      return res.status(401).json({ 
        error: 'Unauthenticated', 
        message: 'A valid active JWT is required to initiate Stripe checkouts.' 
      });
    }

    if (!tier || !billingInterval) {
      return res.status(400).json({ 
        error: 'Missing parameters', 
        message: 'Properties "tier" (\'pro\' | \'enterprise\') and "billingInterval" (\'monthly\' | \'annual\') are required.' 
      });
    }

    if (tier !== 'pro' && tier !== 'enterprise') {
      return res.status(400).json({ 
        error: 'Invalid tier', 
        message: 'Only \'pro\' or \'enterprise\' tiers are eligible for customer upgrades.' 
      });
    }

    try {
      // Retrieve existing stripe_customer_id from pg databases if current user previously interacted with Stripe
      const userRes = await db.query(
        'SELECT stripe_customer_id FROM users WHERE id = $1',
        [userId]
      );
      
      const stripeCustomerId = userRes.rows[0]?.stripe_customer_id || undefined;

      const checkoutUrl = await StripeService.createCheckoutSession({
        userId,
        userEmail,
        stripeCustomerId,
        tier,
        billingInterval,
        trialPeriodDays: trialPeriodDays ? parseInt(trialPeriodDays, 10) : undefined
      });

      res.status(200).json({
        success: true,
        url: checkoutUrl,
        message: 'Stripe Checkout Session initialized successfully. Redirect client to the specified URL.'
      });

    } catch (err: any) {
      logger.error('Stripe Checkout Session creation collapse', err);
      res.status(500).json({ 
        error: 'Stripe Portal Error', 
        message: err.message || 'Unable to instantiate Stripe checkout flows.' 
      });
    }
  }

  /**
   * Generates a Stripe Customer Portal link, allowing users to update cards, view invoices, or safely cancel/modify subscriptions.
   */
  static async createPortalSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const userId = req.user?.id;
    const { returnUrl } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }

    try {
      const userRes = await db.query(
        'SELECT stripe_customer_id FROM users WHERE id = $1',
        [userId]
      );

      const customerId = userRes.rows[0]?.stripe_customer_id;
      if (!customerId) {
        return res.status(400).json({ 
          error: 'No payment record', 
          message: 'You possess no active Stripe Customer credentials. Purchase or register for a subscription first.' 
        });
      }

      const portalUrl = await StripeService.createBillingPortalSession(customerId, returnUrl);

      res.status(200).json({
        success: true,
        url: portalUrl,
        message: 'Billing Customer Portal initialized successfully.'
      });

    } catch (err: any) {
      logger.error('Stripe Billing Portal Session creation failed', err);
      res.status(500).json({ 
        error: 'Billing Portal Error', 
        message: err.message || 'Unable to initiate Stripe customer portal sessions.' 
      });
    }
  }

  /**
   * Listens for direct S2S Webhook events emitted by Stripe API systems.
   * Gracefully falls back to mock payload structures in non-production environments to guarantee seamless developer previews.
   */
  static async handleStripeWebhook(req: Request, res: Response, next: NextFunction) {
    const signature = req.headers['stripe-signature'];
    let event: any;

    try {
      if (signature) {
        // Authenticate standard webhook signature securely
        const rawBody = (req as any).rawBody || JSON.stringify(req.body);
        event = StripeService.constructWebhookEvent(rawBody, signature as string);
      } else {
        // Safe developer inspection and simulation layer for local sandbox trials
        if (process.env.NODE_ENV !== 'production') {
          logger.warn('Stripe signature header is absent. Operating in development simulation fallback mode.');
          event = req.body;
        } else {
          logger.error('Refused Stripe Webhook: Signature requested but missing in production mode.');
          return res.status(401).json({ error: 'Missing security signature' });
        }
      }
    } catch (err: any) {
      logger.error('Failed validating Stripe Webhook security HMAC signature', err);
      return res.status(400).json({ error: 'Verification failed', message: err.message });
    }

    logger.info(`Stripe event validated successfully`, { type: event.type, id: event.id });

    const pgClient = await db.getClient();
    try {
      await pgClient.query('BEGIN');

      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          const userUuid = session.client_reference_id;
          const customerId = session.customer as string;
          const subscriptionId = session.subscription as string;
          const userEmail = session.customer_details?.email;

          // Resolve upgrade tier details
          let tier: 'pro' | 'enterprise' = 'pro';
          if (session.metadata?.tier === 'enterprise' || session.subscription_data?.metadata?.tier === 'enterprise') {
            tier = 'enterprise';
          }

          const plan = PLAN_CATALOG[tier];
          const wordsLimit = plan.wordsLimit;

          logger.info(`Processing checkout.session.completed`, { userUuid, customerId, subscriptionId, tier, wordsLimit });

          if (userUuid) {
            // Update by exact registered ID
            await pgClient.query(
              `UPDATE users 
               SET tier = $1, 
                   words_limit = $2, 
                   stripe_customer_id = $3, 
                   stripe_subscription_id = $4, 
                   subscription_status = 'active',
                   updated_at = NOW()
               WHERE id = $5`,
              [tier, wordsLimit, customerId, subscriptionId, userUuid]
            );
            await cache.del(`user:usage:words:${userUuid}`);
          } else if (userEmail) {
            // Fallback lookup using checked-out email metadata
            await pgClient.query(
              `UPDATE users 
               SET tier = $1, 
                   words_limit = $2, 
                   stripe_customer_id = $3, 
                   stripe_subscription_id = $4, 
                   subscription_status = 'active',
                   updated_at = NOW()
               WHERE email = $5`,
              [tier, wordsLimit, customerId, subscriptionId, userEmail.toLowerCase().trim()]
            );

            const lookup = await pgClient.query('SELECT id FROM users WHERE email = $1', [userEmail.toLowerCase().trim()]);
            if (lookup.rows.length > 0) {
              await cache.del(`user:usage:words:${lookup.rows[0].id}`);
            }
          }
          break;
        }

        case 'invoice.payment_succeeded': {
          const invoice = event.data.object;
          const stripeSubscriptionId = invoice.subscription as string;
          const stripeCustomerId = invoice.customer as string;

          if (stripeSubscriptionId) {
            logger.info(`Processing invoice.payment_succeeded for subscription: ${stripeSubscriptionId}`);
            
            // 1. Reset metrics counters for a brand new quota period
            await pgClient.query(
              `UPDATE users 
               SET subscription_status = 'active', 
                   words_used = 0, 
                   updated_at = NOW()
               WHERE stripe_subscription_id = $1`,
              [stripeSubscriptionId]
            );

            // 2. Fetch User ID to clear Redis caching
            const lookup = await pgClient.query(
              'SELECT id FROM users WHERE stripe_subscription_id = $1',
              [stripeSubscriptionId]
            );
            if (lookup.rows.length > 0) {
              await cache.del(`user:usage:words:${lookup.rows[0].id}`);
            }

            // 3. Log a detailed bill audit record for analytics tracking
            if (invoice.amount_paid) {
              await pgClient.query(
                `INSERT INTO billing (tenant_id, amount_cents, status, currency, invoice_id, paid_at)
                 VALUES (
                   (SELECT id FROM tenants LIMIT 1), -- fallback to primary tenant in simple setups
                   $1, $2, $3, $4, NOW()
                 ) ON CONFLICT (invoice_id) DO NOTHING`,
                [invoice.amount_paid, 'paid', invoice.currency || 'USD', invoice.id]
              ).catch(e => logger.warn('Optional multi-tenant billing logging omitted', e.message));
            }
          }
          break;
        }

        case 'invoice.payment_failed': {
          const invoice = event.data.object;
          const stripeSubscriptionId = invoice.subscription as string;

          if (stripeSubscriptionId) {
            logger.error(`PROSECUTION WARN: Invoice payment aborted or failed on Stripe subscription: ${stripeSubscriptionId}`);
            
            // Reconcile failed invoices by restricting quota status to "past_due" or "unpaid"
            await pgClient.query(
              `UPDATE users 
               SET subscription_status = 'past_due', 
                   updated_at = NOW()
               WHERE stripe_subscription_id = $1`,
              [stripeSubscriptionId]
            );

            const lookup = await pgClient.query('SELECT id FROM users WHERE stripe_subscription_id = $1', [stripeSubscriptionId]);
            if (lookup.rows.length > 0) {
              await cache.del(`user:usage:words:${lookup.rows[0].id}`);
            }
          }
          break;
        }

        case 'customer.subscription.updated': {
          const subscription = event.data.object;
          const stripeSubId = subscription.id;
          const subStatus = subscription.status; // e.g. 'trialing', 'active', 'past_due', 'paused', 'canceled'

          logger.info(`Processing customer.subscription.updated`, { id: stripeSubId, status: subStatus });

          await pgClient.query(
            `UPDATE users 
             SET subscription_status = $1, 
                 updated_at = NOW()
             WHERE stripe_subscription_id = $2`,
            [subStatus, stripeSubId]
          );

          const lookup = await pgClient.query('SELECT id FROM users WHERE stripe_subscription_id = $1', [stripeSubId]);
          if (lookup.rows.length > 0) {
            await cache.del(`user:usage:words:${lookup.rows[0].id}`);
          }
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object;
          const stripeSubId = subscription.id;

          logger.info(`Processing customer.subscription.deleted to downgrade user accounts`, { id: stripeSubId });

          // Clean revert to base Free tiers, ensuring payment failure limits are instantly enforced in real-time
          await pgClient.query(
            `UPDATE users 
             SET tier = 'free', 
                 words_limit = 5000, 
                 subscription_status = 'canceled', 
                 stripe_subscription_id = NULL, 
                 updated_at = NOW()
             WHERE stripe_subscription_id = $1`,
            [stripeSubId]
          );

          const lookup = await pgClient.query('SELECT id FROM users WHERE stripe_subscription_id = $1', [stripeSubId]);
          if (lookup.rows.length > 0) {
            await cache.del(`user:usage:words:${lookup.rows[0].id}`);
          }
          break;
        }

        default:
          logger.debug(`Ignored unhandled Stripe event categories: ${event.type}`);
          break;
      }

      await pgClient.query('COMMIT');
      res.status(200).json({ received: true, type: event.type, eventId: event.id });

    } catch (err) {
      await pgClient.query('ROLLBACK');
      logger.error('CRITICAL: Stripe database webhook transaction rolled back', err);
      next(err);
    } finally {
      pgClient.release();
    }
  }
}
