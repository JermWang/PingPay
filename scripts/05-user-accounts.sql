-- User Accounts and Prepaid Balance System

-- User accounts for prepaid balance tracking
CREATE TABLE IF NOT EXISTS user_accounts (
  wallet_address TEXT PRIMARY KEY,
  balance_usd DECIMAL(10, 6) DEFAULT 0 CHECK (balance_usd >= 0),
  total_deposited DECIMAL(10, 6) DEFAULT 0,
  total_spent DECIMAL(10, 6) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- API keys for authenticated access
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_wallet TEXT NOT NULL REFERENCES user_accounts(wallet_address) ON DELETE CASCADE,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  name TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Account transactions for complete audit trail
CREATE TABLE IF NOT EXISTS account_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_wallet TEXT NOT NULL REFERENCES user_accounts(wallet_address) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'spend', 'refund')),
  amount_usd DECIMAL(10, 6) NOT NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
  description TEXT,
  transaction_signature TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Creator earnings tracking
CREATE TABLE IF NOT EXISTS creator_earnings (
  creator_id UUID PRIMARY KEY REFERENCES creators(id) ON DELETE CASCADE,
  available_balance DECIMAL(10, 6) DEFAULT 0,
  total_earned DECIMAL(10, 6) DEFAULT 0,
  total_withdrawn DECIMAL(10, 6) DEFAULT 0,
  last_withdrawal_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Withdrawal requests for creator payouts
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  amount_usd DECIMAL(10, 6) NOT NULL,
  wallet_address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  transaction_signature TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_api_keys_user_wallet ON api_keys(user_wallet);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_account_transactions_user_wallet ON account_transactions(user_wallet);
CREATE INDEX IF NOT EXISTS idx_account_transactions_type ON account_transactions(type);
CREATE INDEX IF NOT EXISTS idx_account_transactions_created_at ON account_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_creator_id ON withdrawal_requests(creator_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status);

