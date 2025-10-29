-- Add payout_wallet column to creators and backfill from wallet_address
ALTER TABLE creators
ADD COLUMN IF NOT EXISTS payout_wallet text;

UPDATE creators
SET payout_wallet = wallet_address
WHERE payout_wallet IS NULL;

-- Ensure index for quick lookups if needed
CREATE INDEX IF NOT EXISTS creators_payout_wallet_idx ON creators (payout_wallet);


