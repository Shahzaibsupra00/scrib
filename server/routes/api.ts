import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { AiController } from '../controllers/aiController.js';
import { UploadController } from '../controllers/uploadController.js';
import { BillingController } from '../controllers/billingController.js';
import { EngineController } from '../controllers/engineController.js';
import { OpenAiController } from '../controllers/openaiController.js';
import { AdminController } from '../controllers/adminController.js';
import { authenticateToken, requireCreditLimits, requireAdmin } from '../middleware/auth.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import { apiLogger } from '../middleware/apiLogger.js';

const apiRouter = Router();

// Mount API latency telemetry logger
apiRouter.use(apiLogger);

// 1. PUBLIC IDENTITY / AUTH ROUTES
const authRouter = Router();
authRouter.post('/register', rateLimiter({ windowSeconds: 60, maxRequests: 5 }), AuthController.register);
authRouter.post('/login', rateLimiter({ windowSeconds: 60, maxRequests: 10 }), AuthController.login);
authRouter.get('/me', authenticateToken, AuthController.getMe);


// 2. DYNAMIC WORKSPACE / AI PIPELINES (Requires Active JWTs + Quota checks)
const aiRouter = Router();
aiRouter.post(
  '/analyze', 
  authenticateToken, 
  requireCreditLimits, // Block requests if words budget is fully consumed
  rateLimiter({ windowSeconds: 60, maxRequests: 15 }), // Strict API limits
  AiController.processAnalyze
);
aiRouter.get('/jobs/:jobId', authenticateToken, AiController.getJobStatus);


// 3. SECURE DIRECT FILE STORAGE / S3 SERVICE ROUTES
const uploadRouter = Router();
uploadRouter.post(
  '/presign', 
  authenticateToken, 
  rateLimiter({ windowSeconds: 60, maxRequests: 10 }), 
  UploadController.getPresignedUploadUrl
);
uploadRouter.post(
  '/verify',
  authenticateToken,
  rateLimiter({ windowSeconds: 60, maxRequests: 15 }),
  UploadController.verifyUpload
);
uploadRouter.get('/list', authenticateToken, UploadController.getDocumentsList);


// 4. STRIPE WEBHOOK LISTENER & BILLING INTEGRATION (Monthly, Annual, Portal, Trials)
const billingRouter = Router();
billingRouter.post('/webhooks', BillingController.handleStripeWebhook);
billingRouter.post('/checkout', authenticateToken, rateLimiter({ windowSeconds: 60, maxRequests: 10 }), BillingController.createCheckoutSession);
billingRouter.post('/portal', authenticateToken, rateLimiter({ windowSeconds: 60, maxRequests: 10 }), BillingController.createPortalSession);


// 5. INDUSTRIAL AI PROCESSING PIPELINE ENDPOINTS (8 STAGES OF FLOW)
const engineRouter = Router();
engineRouter.post(
  '/process',
  authenticateToken,
  requireCreditLimits,
  rateLimiter({ windowSeconds: 60, maxRequests: 10 }),
  EngineController.startPipeline
);
engineRouter.get(
  '/diagnostics/:jobId',
  authenticateToken,
  EngineController.getPipelineDiagnostics
);


// 6. REUSABLE OPENAI AI SERVICE SYSTEM ROUTES
const openaiRouter = Router();
openaiRouter.post(
  '/structured',
  authenticateToken,
  requireCreditLimits,
  rateLimiter({ windowSeconds: 60, maxRequests: 15 }),
  OpenAiController.generateStructured
);
openaiRouter.get(
  '/stream',
  authenticateToken,
  OpenAiController.streamCompletions
);


// 7. MULTI-MODULE SaaS ADMIN MANAGEMENT STATION
const adminRouter = Router();

// Sandbox Promotion Route (No requireAdmin guard)
adminRouter.post('/promote-self', authenticateToken, AdminController.promoteSelf);

// General aggregates & analytics
adminRouter.get('/overview-stats', authenticateToken, requireAdmin, AdminController.getOverviewStats);

// SaaS User directory overrides
adminRouter.get('/users', authenticateToken, requireAdmin, AdminController.getUsers);
adminRouter.put('/users/:userId', authenticateToken, requireAdmin, AdminController.updateUserProfile);

// Financial indicators and ledgers
adminRouter.get('/revenue', authenticateToken, requireAdmin, AdminController.getRevenueMetrics);

// AI usage audits & latencies
adminRouter.get('/usage', authenticateToken, requireAdmin, AdminController.getUsageMetrics);

// HTTP route traffic inspection
adminRouter.get('/api-logs', authenticateToken, requireAdmin, AdminController.getApiLogs);

// Custom customer ticketing overrides
adminRouter.get('/tickets', authenticateToken, requireAdmin, AdminController.getTickets);
adminRouter.post('/tickets', authenticateToken, AdminController.submitTicket); // Accessible by any auth'd user (to simulate inquiries)
adminRouter.put('/tickets/:ticketId', authenticateToken, requireAdmin, AdminController.updateTicket);

// Feature Toggles system configuration
adminRouter.get('/features', authenticateToken, requireAdmin, AdminController.getFeatures);
adminRouter.put('/features/:flagKey', authenticateToken, requireAdmin, AdminController.updateFeatureToggle);


// Mount sub-routers under namespaced branches
apiRouter.use('/auth', authRouter);
apiRouter.use('/ai', aiRouter);
apiRouter.use('/uploads', uploadRouter);
apiRouter.use('/billing', billingRouter);
apiRouter.use('/engine', engineRouter);
apiRouter.use('/openai', openaiRouter);
apiRouter.use('/admin', adminRouter);

export { apiRouter };

