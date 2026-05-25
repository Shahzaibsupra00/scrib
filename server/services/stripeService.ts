import Stripe from 'stripe';
import { logger } from '../config/logger.js';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_dummy_signing_key_for_testing';
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

let stripeClient: Stripe | null = null;

/**
 * Returns the lazily-initialized Stripe API client.
 * Fails fast on usage with a clear error, securing system stability during initial environment setup.
 */
export function getStripe(): Stripe {
  if (!stripeClient) {
    if (!STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY environment variable is undefined on the host wrapper. Place real Stripe secrets in system configuration settings.');
    }
    stripeClient = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-11' as any, // Modern Stripe spec
      appInfo: {
        name: 'ScribeStone AI SaaS Platform',
        version: '1.0.0',
      },
    });
  }
  return stripeClient;
}

export interface PricingPlanConfig {
  id: string;
  name: string;
  tierName: 'pro' | 'enterprise';
  priceIdMonthly: string;
  priceIdAnnual: string;
  wordsLimit: number;
}

// Preset production-grade catalog configurations mapping to Stripe Price keys
export const PLAN_CATALOG: Record<string, PricingPlanConfig> = {
  pro: {
    id: 'plan_pro',
    name: 'ScribeStone Professional',
    tierName: 'pro',
    priceIdMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_pro_mo_default_123',
    priceIdAnnual: process.env.STRIPE_PRICE_PRO_ANNUAL || 'price_pro_yr_default_123',
    wordsLimit: 50000,
  },
  enterprise: {
    id: 'plan_enterprise',
    name: 'ScribeStone Corporate Enterprise',
    tierName: 'enterprise',
    priceIdMonthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || 'price_ent_mo_default_456',
    priceIdAnnual: process.env.STRIPE_PRICE_ENTERPRISE_ANNUAL || 'price_ent_yr_default_456',
    wordsLimit: 1000000,
  },
};

export class StripeService {
  /**
   * Kicks off the payment cycle by generating a Stripe checkout session.
   * Leverages trial period offsets and interval modes for monthly/annual configurations.
   */
  static async createCheckoutSession(params: {
    userId: string;
    userEmail: string;
    stripeCustomerId?: string;
    tier: 'pro' | 'enterprise';
    billingInterval: 'monthly' | 'annual';
    trialPeriodDays?: number;
  }): Promise<string> {
    const stripe = getStripe();
    const config = PLAN_CATALOG[params.tier];
    if (!config) {
      throw new Error(`The requested plan tier '${params.tier}' does not exist in the billing catalog pricing metadata.`);
    }

    const priceId = params.billingInterval === 'annual' ? config.priceIdAnnual : config.priceIdMonthly;
    logger.info(`Starting stripe checkout session request`, { userId: params.userId, tier: params.tier, priceId });

    // Build standard Stripe session variables
    const sessionOptions: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${APP_URL}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/pricing?checkout=cancel`,
      customer_email: params.stripeCustomerId ? undefined : params.userEmail,
      customer: params.stripeCustomerId || undefined,
      client_reference_id: params.userId,
      subscription_data: {
        trial_period_days: params.trialPeriodDays && params.trialPeriodDays > 0 ? params.trialPeriodDays : undefined,
        metadata: {
          userId: params.userId,
          tier: params.tier,
          billingInterval: params.billingInterval,
          wordsLimit: config.wordsLimit.toString(),
        },
      },
      metadata: {
        userId: params.userId,
        tier: params.tier,
        billingInterval: params.billingInterval,
      },
    };

    const session = await stripe.checkout.sessions.create(sessionOptions);
    if (!session.url) {
      throw new Error('Stripe failed to return an interactive redirected checkout URL.');
    }

    return session.url;
  }

  /**
   * Generates a billing portal link permitting direct card updates, subscription switches, or cancellations.
   */
  static async createBillingPortalSession(stripeCustomerId: string, returnUrlOverride?: string): Promise<string> {
    const stripe = getStripe();
    logger.info(`Generating Stripe Billing Portal session for customer: ${stripeCustomerId}`);

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrlOverride || `${APP_URL}/dashboard`,
    });

    return portalSession.url;
  }

  /**
   * Submits platform metrics to Stripe's metered billing system.
   * Useful when charging client accounts dynamically on an incremental word/character use basis.
   */
  static async reportMeteredUsage(params: {
    subscriptionItemId: string;
    quantity: number;
    action?: 'set' | 'increment';
  }): Promise<void> {
    const stripe = getStripe();
    const action = params.action || 'increment';
    logger.info(`Reporting metered platform usage metric to Stripe`, { itemId: params.subscriptionItemId, quantity: params.quantity, action });

    try {
      await (stripe.subscriptionItems as any).createUsageRecord(params.subscriptionItemId, {
        quantity: params.quantity,
        timestamp: Math.floor(Date.now() / 1000),
        action,
      });
      logger.info('Stripe Usage Record committed successfully.');
    } catch (err: any) {
      logger.error('Failed submitting metered usage statistics to Stripe API gateways', err);
      throw err;
    }
  }

  /**
   * Secure construction of standard Server-to-Server Webhook event envelopes.
   */
  static constructWebhookEvent(rawBody: string | Buffer, signature: string): Stripe.Event {
    const stripe = getStripe();
    return stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET);
  }
}
