-- ============================================================================
-- Enterprise Multi-Tenant AI SaaS Database Schema
-- Target Engine: PostgreSQL 14+
-- 
-- Architectural Highlights:
-- 1. Multi-Tenant Isolations: Utilizes "tenants" or "organizations" as root
--    partition boundaries. Almost all tables relate back to a tenant_id.
-- 2. Performance Indexes: Balanced B-tree, Gin, and Hash indexing strategies
--    for sub-millisecond query lookups.
-- 3. Unified Financial Ledgers: Resilient tracking for audits and billing event reconciliation.
-- 4. Deep Analytical Metering: Tracks tokens, usage budgets, and latencies.
-- ============================================================================

-- Enable raw UUID generator extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. MULTI-TENANT ENTRIES: TENANTS (or ORGANIZATIONS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(150) NOT NULL,
  domain VARCHAR(255) UNIQUE, -- e.g., 'acme-studios.com'
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Index for domain routing lookups
CREATE INDEX IF NOT EXISTS idx_tenants_domain ON tenants (domain) WHERE is_active = TRUE;


-- ============================================================================
-- 2. IDENTITY ENGINE: USERS
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(150),
  role VARCHAR(50) DEFAULT 'member' NOT NULL, -- e.g., 'owner', 'admin', 'member'
  is_suspended BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  
  -- Enforce email uniqueness exclusively within each tenant namespace
  CONSTRAINT uq_tenant_user_email UNIQUE (tenant_id, email)
);

-- Index user lookups and login queries
CREATE INDEX IF NOT EXISTS idx_users_email_hash ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users (tenant_id);


-- ============================================================================
-- 3. LICENSING ENGINE: SUBSCRIPTIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plan_tier VARCHAR(50) DEFAULT 'free' NOT NULL, -- e.g. 'free', 'pro', 'enterprise'
  status VARCHAR(50) DEFAULT 'active' NOT NULL, -- e.g. 'active', 'past_due', 'canceled', 'unpaid'
  stripe_subscription_id VARCHAR(150) UNIQUE,
  stripe_customer_id VARCHAR(150),
  
  -- Quota Budgets
  words_monthly_limit INT DEFAULT 5000 NOT NULL,
  document_storage_limit_bytes BIGINT DEFAULT 104857600 NOT NULL, -- Defaults to 100MB
  
  -- Timing windows
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Index subscriptions for renewal sweeps and webhook updates
CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant ON subscriptions (tenant_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status_end ON subscriptions (status, current_period_end);


-- ============================================================================
-- 4. AWS S3 TRACKING ENGINE: UPLOADED_FILES
-- ============================================================================
CREATE TABLE IF NOT EXISTS uploaded_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  file_name VARCHAR(255) NOT NULL,
  s3_key VARCHAR(512) NOT NULL UNIQUE,
  mime_type VARCHAR(100) NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  file_hash VARCHAR(64), -- SHA-256 integrity match
  is_processed BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexes for rapid storage metrics checks and list views
CREATE INDEX IF NOT EXISTS idx_uploads_tenant_user ON uploaded_files (tenant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_uploads_hash ON uploaded_files (file_hash);


-- ============================================================================
-- 5. PROCESSING LOGIC ENGINE: AI_REQUESTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  file_id UUID REFERENCES uploaded_files(id) ON DELETE SET NULL,
  
  -- AI Configuration metadata
  model_provider VARCHAR(50) NOT NULL, -- e.g. 'google', 'openai'
  model_name VARCHAR(100) NOT NULL, -- e.g., 'gemini-3.5-flash', 'gpt-4o'
  prompt_key VARCHAR(100) DEFAULT 'default' NOT NULL,
  
  -- Raw prompts payload parameters
  system_instruction TEXT,
  templated_prompt TEXT NOT NULL,
  response_raw TEXT,
  structured_output JSONB, -- Stores audited schema structures
  
  -- Telemetry & Tokens Counters
  prompt_tokens INT DEFAULT 0 NOT NULL,
  completion_tokens INT DEFAULT 0 NOT NULL,
  total_tokens INT DEFAULT 0 NOT NULL,
  
  usage_cost_usd NUMERIC(10, 6) DEFAULT 0.000000 NOT NULL,
  is_cache_hit BOOLEAN DEFAULT FALSE NOT NULL,
  execution_duration_ms INT NOT NULL,
  status VARCHAR(40) DEFAULT 'completed' NOT NULL, -- e.g. 'completed', 'failed'
  error_trace TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexes optimized for analytics dash queries and accounting sweeps
CREATE INDEX IF NOT EXISTS idx_ai_requests_tenant_date ON ai_requests (tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_requests_model ON ai_requests (model_name, total_tokens);
CREATE INDEX IF NOT EXISTS idx_ai_requests_structured ON ai_requests USING gin (structured_output);


-- ============================================================================
-- 6. METERING ENGINE: USAGE_TRACKING
-- ============================================================================
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  resource_type VARCHAR(50) NOT NULL, -- e.g., 'ai_tokens', 'document_wordcount', 's3_storage_bytes'
  units_consumed INT DEFAULT 0 NOT NULL,
  billing_cycle_start TIMESTAMP WITH TIME ZONE NOT NULL,
  billing_cycle_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Index for real-time limit checks
CREATE INDEX IF NOT EXISTS idx_usage_tenant_resource ON usage_tracking (tenant_id, resource_type, billing_cycle_start, billing_cycle_end);


-- ============================================================================
-- 7. AUDIT LEDGER ENGINE: BILLING
-- ============================================================================
CREATE TABLE IF NOT EXISTS billing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  invoice_id VARCHAR(120) UNIQUE, -- Stripe invoice relation
  amount_cents INT NOT NULL, -- Store financial values in cents strictly to bypass decimal bugs
  currency CHAR(3) DEFAULT 'USD' NOT NULL,
  status VARCHAR(50) NOT NULL, -- e.g. 'paid', 'open', 'uncollectible', 'refunded'
  payment_method VARCHAR(50), -- e.g. 'card', 'bank_transfer'
  hosted_invoice_url TEXT,
  pdf_invoice_url TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Index billing records for invoice dashboards
CREATE INDEX IF NOT EXISTS idx_billing_tenant ON billing (tenant_id, status);


-- ============================================================================
-- 8. OBSERVABILITY SYSTEM ENGINE: API_LOGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS api_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- HTTP payload boundaries
  http_method VARCHAR(10) NOT NULL, -- GET, POST, PUT, DELETE
  request_path VARCHAR(2048) NOT NULL,
  status_code INT NOT NULL,
  latency_ms INT NOT NULL,
  
  -- Network telemetry
  client_ip VARCHAR(45) NOT NULL,
  user_agent VARCHAR(512),
  error_message TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexing for logs diagnostics and performance tracking
CREATE INDEX IF NOT EXISTS idx_api_logs_created ON api_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_logs_status ON api_logs (status_code, latency_ms);


-- ============================================================================
-- METADATA UPDATED_AT TRIGGERS
-- ============================================================================
CREATE OR REPLACE FUNCTION set_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger associations
CREATE TRIGGER trg_tenants_updated BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();
CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();
CREATE TRIGGER trg_subscriptions_updated BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();
CREATE TRIGGER trg_uploaded_files_updated BEFORE UPDATE ON uploaded_files FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();
CREATE TRIGGER trg_billing_updated BEFORE UPDATE ON billing FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();
