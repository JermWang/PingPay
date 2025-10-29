-- Withdrawal and Reconciliation System

-- Add unique constraint to prevent duplicate transaction signatures
ALTER TABLE account_transactions
ADD CONSTRAINT unique_transaction_signature 
UNIQUE (transaction_signature);

-- Create index for faster transaction signature lookups
CREATE INDEX IF NOT EXISTS idx_transaction_signature 
ON account_transactions(transaction_signature);

-- User withdrawal requests
CREATE TABLE IF NOT EXISTS user_withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_wallet TEXT NOT NULL REFERENCES user_accounts(wallet_address) ON DELETE CASCADE,
  amount_usd DECIMAL(10, 6) NOT NULL CHECK (amount_usd > 0),
  recipient_address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  transaction_signature TEXT, -- Filled when completed
  notes TEXT,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  processed_by TEXT,
  CONSTRAINT check_completed_has_signature 
    CHECK (status != 'completed' OR transaction_signature IS NOT NULL)
);

-- Reconciliation records
CREATE TABLE IF NOT EXISTS reconciliation_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_at TIMESTAMPTZ DEFAULT NOW(),
  total_database_balance DECIMAL(10, 6) NOT NULL,
  total_onchain_balance DECIMAL(10, 6) NOT NULL,
  difference DECIMAL(10, 6) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('matched', 'discrepancy', 'error')),
  discrepancies JSONB, -- Array of wallet addresses with issues
  notes TEXT,
  run_by TEXT
);

-- Track processed transaction signatures to prevent duplicates
CREATE TABLE IF NOT EXISTS processed_transactions (
  transaction_signature TEXT PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  amount_usd DECIMAL(10, 6) NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'payment')),
  processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_withdrawal_user_wallet ON user_withdrawal_requests(user_wallet);
CREATE INDEX IF NOT EXISTS idx_withdrawal_status ON user_withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_reconciliation_run_at ON reconciliation_records(run_at DESC);
CREATE INDEX IF NOT EXISTS idx_processed_transactions_wallet ON processed_transactions(wallet_address);

-- Function to check if transaction was already processed
CREATE OR REPLACE FUNCTION is_transaction_processed(sig TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM processed_transactions WHERE transaction_signature = sig
  );
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE user_withdrawal_requests IS 'User requests to withdraw funds back to their Solana wallet';
COMMENT ON TABLE reconciliation_records IS 'Audit records comparing database balances to on-chain treasury balance';
COMMENT ON TABLE processed_transactions IS 'Deduplication table to prevent processing same transaction multiple times';

