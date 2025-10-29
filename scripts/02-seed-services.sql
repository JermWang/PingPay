-- Seed example Solana API services
INSERT INTO services (name, description, endpoint, price_usd, category) VALUES
  (
    'Solana Balance Check',
    'Get the SOL balance for any Solana wallet address',
    '/api/solana/balance',
    0.01,
    'Blockchain Data'
  ),
  (
    'Token Holdings',
    'Retrieve all SPL token holdings for a wallet',
    '/api/solana/tokens',
    0.02,
    'Blockchain Data'
  ),
  (
    'Transaction History',
    'Fetch recent transaction history for any address',
    '/api/solana/transactions',
    0.03,
    'Blockchain Data'
  ),
  (
    'NFT Metadata',
    'Get detailed metadata for Solana NFTs',
    '/api/solana/nft',
    0.05,
    'NFT Data'
  ),
  (
    'Validator Info',
    'Real-time validator performance metrics',
    '/api/solana/validator',
    0.02,
    'Network Data'
  )
ON CONFLICT (endpoint) DO NOTHING;
