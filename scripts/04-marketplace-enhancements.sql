-- Marketplace Enhancement Schema: Reviews, Ratings, and Service Stats

-- Reviews table for user feedback
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  user_wallet TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  verified_purchase BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service statistics for performance tracking
CREATE TABLE IF NOT EXISTS service_stats (
  service_id UUID PRIMARY KEY REFERENCES services(id) ON DELETE CASCADE,
  total_reviews INTEGER DEFAULT 0,
  avg_rating DECIMAL(3,2) DEFAULT 0,
  total_calls INTEGER DEFAULT 0,
  successful_calls INTEGER DEFAULT 0,
  failed_calls INTEGER DEFAULT 0,
  avg_response_time DECIMAL(10,3) DEFAULT 0,
  uptime_percentage DECIMAL(5,2) DEFAULT 100,
  last_24h_calls INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- User favorites for bookmarking APIs
CREATE TABLE IF NOT EXISTS api_favorites (
  user_wallet TEXT NOT NULL,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_wallet, service_id)
);

-- Free tier usage tracking
CREATE TABLE IF NOT EXISTS free_tier_usage (
  user_wallet TEXT NOT NULL,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  calls_used INTEGER DEFAULT 0,
  period_start TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_wallet, service_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_reviews_service_id ON reviews(service_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_wallet ON reviews(user_wallet);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_service_stats_avg_rating ON service_stats(avg_rating);
CREATE INDEX IF NOT EXISTS idx_api_favorites_user_wallet ON api_favorites(user_wallet);
CREATE INDEX IF NOT EXISTS idx_free_tier_usage_period ON free_tier_usage(period_start);

-- Add columns to services table for enhanced features
ALTER TABLE services ADD COLUMN IF NOT EXISTS free_tier_limit INTEGER DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS free_tier_period TEXT DEFAULT 'daily';
ALTER TABLE services ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;
ALTER TABLE services ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE;
ALTER TABLE services ADD COLUMN IF NOT EXISTS total_users INTEGER DEFAULT 0;

