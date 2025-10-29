-- Create creators table for API marketplace creators
CREATE TABLE IF NOT EXISTS creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add creator columns to services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS creator_id UUID REFERENCES creators(id) ON DELETE SET NULL;
ALTER TABLE services ADD COLUMN IF NOT EXISTS external_endpoint TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_services_creator_id ON services(creator_id);
CREATE INDEX IF NOT EXISTS idx_creators_wallet_address ON creators(wallet_address);

