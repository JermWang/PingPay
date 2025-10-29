# Environment Variables Setup

Since `.env.example` couldn't be created automatically, here's what you need to set up:

## Create a `.env.local` file in your project root with:

```env
# Solana Configuration
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

# Payment Configuration
# IMPORTANT: Replace with your actual Solana wallet address to receive payments
NEXT_PUBLIC_PAYMENT_RECEIVER_ADDRESS=YourSolanaAddressHere

# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

## Optional Variables (already defined in constants.ts):
```env
NEXT_PUBLIC_EXAMPLE_SOLANA_ADDRESS=DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK
NEXT_PUBLIC_EXAMPLE_VOTE_ACCOUNT=CertusDeBmqN8ZawdkxK5kFGMwBXdudvWHYwtNgNhvLu
```

## Important Notes:

1. **Payment Receiver Address**: You MUST replace `YourSolanaAddressHere` with an actual Solana wallet address before deploying to production.

2. **RPC URL**: For production, consider using a premium RPC provider like:
   - QuickNode
   - Helius
   - Alchemy
   - Triton

3. **Network**: Change to `mainnet-beta` for production deployments.

4. **API Base URL**: Update this to your production domain when deploying.

