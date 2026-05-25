-- Production Database Schema Migration for Micro-SaaS AI Platform (ScribeStone)
-- Target: PostgreSQL 14+

-- Enable UUID Extension for enterprise-grade secure identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(150),
  role VARCHAR(50) DEFAULT 'user' NOT NULL, -- e.g. 'user', 'admin'
  tier VARCHAR(50) DEFAULT 'free' NOT NULL, -- e.g. 'free', 'pro', 'enterprise'
  words_used INT DEFAULT 0 NOT NULL,
  words_limit INT DEFAULT 5000 NOT NULL,
  stripe_customer_id VARCHAR(120) UNIQUE,
  stripe_subscription_id VARCHAR(120) UNIQUE,
  subscription_status VARCHAR(50) DEFAULT 'active' NOT NULL, -- e.g. 'active', 'incomplete', 'canceled'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Index for speedy email login lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
-- Index for Stripe webhooks events
CREATE INDEX IF NOT EXISTS idx_users_stripe_cust ON users(stripe_customer_id);

-- 2. DOCUMENT UPLOADS TABLE (AWS S3 Tracker)
CREATE TABLE IF NOT EXISTS document_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  s3_key VARCHAR(512) NOT NULL UNIQUE,
  mime_type VARCHAR(100) NOT NULL,
  file_size_bytes INT NOT NULL,
  file_hash VARCHAR(64), -- SHA-256 hash for dedup/integrity matching
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_uploads_user ON document_uploads(user_id);

-- 3. PROMPT MANAGEMENT TABLE (Prompts Versioning Engine)
CREATE TABLE IF NOT EXISTS prompt_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt_key VARCHAR(100) NOT NULL, -- e.g. 'grammar-professional', 'tone-witty'
  version INT DEFAULT 1 NOT NULL,
  system_instruction TEXT NOT NULL,
  template_format TEXT NOT NULL, -- contains placeholder template variables e.g. {{text}}
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  UNIQUE(prompt_key, version)
);

CREATE INDEX IF NOT EXISTS idx_prompts_key ON prompt_modules(prompt_key, is_active);

-- 4. AI CACHE TABLE (Optimizes duplicate text inputs for speed and cost-saving)
CREATE TABLE IF NOT EXISTS ai_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  input_hash VARCHAR(64) UNIQUE NOT NULL, -- SHA-256 of text input + style + model rules
  response_payload JSONB NOT NULL, -- holds grammarScore, clarityScore, improvedText, etc.
  model_name VARCHAR(100) NOT NULL, -- e.g. 'gemini-3.5-flash'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Index hash lookups and automated cleanups
CREATE INDEX IF NOT EXISTS idx_cache_hash ON ai_cache(input_hash);
CREATE INDEX IF NOT EXISTS idx_cache_expires ON ai_cache(expires_at);

-- 5. USAGE TRACKING & METERS (For analytical dashboards and billing verification)
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  request_type VARCHAR(50) NOT NULL, -- e.g., 'ai_analyze', 'document_upload'
  units_metered INT DEFAULT 0 NOT NULL, -- e.g., words, characters or tokens
  model_used VARCHAR(100), -- tracks sub-vendors used for accounting
  is_cached_hit BOOLEAN DEFAULT FALSE NOT NULL,
  response_duration_ms INT, -- monitor latency
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_usage_user_date ON usage_logs(user_id, created_at DESC);

-- 6. AI JOBS QUEUE (Redis-backed status tracker)
CREATE TABLE IF NOT EXISTS queue_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(40) DEFAULT 'pending' NOT NULL, -- 'pending', 'processing', 'completed', 'failed'
  payload JSONB NOT NULL,
  result JSONB,
  backoff_attempts INT DEFAULT 0 NOT NULL,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_jobs_status ON queue_jobs(status, created_at);

-- AUTOMATIC UPDATED_AT TIMESTAMP FUNCTION & TRIGGERS
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers across tracking tables
CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_uploads_modtime BEFORE UPDATE ON document_uploads FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_prompts_modtime BEFORE UPDATE ON prompt_modules FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_jobs_modtime BEFORE UPDATE ON queue_jobs FOR EACH ROW EXECUTE FUNCTION update_modified_column();
