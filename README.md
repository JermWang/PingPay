# Ping Pay (Micro402)

A Solana-based micro-API marketplace using the x402 payment standard. Pay tiny amounts of USDC for instant API access.

## Features

- **x402 Payment Standard**: HTTP 402 Payment Required implementation
- **Solana Micropayments**: Pay $0.01-$0.05 per API request with USDC
- **Real-time Verification**: On-chain payment verification in under 1 second
- **API Marketplace**: Browse and access multiple Solana data APIs
- **Developer-Friendly**: Simple REST API with clear payment flow

## Getting Started

### Prerequisites

- Node.js 18+
- Solana wallet with USDC (for testing)
- Supabase account (optional, for production database)

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see below)
4. Run development server: `npm run dev`

### Environment Variables

\`\`\`env
# Solana Configuration
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PAYMENT_RECEIVER_ADDRESS=YourSolanaAddressHere

# Supabase (optional)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
\`\`\`

## API Usage

### 1. Request Protected Endpoint

\`\`\`bash
curl https://your-domain.com/api/solana/balance?address=DYw8...
\`\`\`

### 2. Receive 402 Payment Required

\`\`\`json
{
  "error": "Payment required",
  "quote_id": "550e8400-e29b-41d4-a716-446655440000",
  "amount_usd": 0.01,
  "solana_address": "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin",
  "expires_at": "2025-01-27T12:35:00Z"
}
\`\`\`

### 3. Send USDC Payment on Solana

Transfer the specified amount to the provided address.

### 4. Replay Request with Transaction Signature

\`\`\`bash
curl https://your-domain.com/api/solana/balance?address=DYw8... \
  -H "X-Quote-Id: 550e8400-e29b-41d4-a716-446655440000" \
  -H "X-Transaction-Signature: 5Kj8x..."
\`\`\`

### 5. Receive Protected Data

\`\`\`json
{
  "success": true,
  "data": {
    "address": "DYw8...",
    "balance": 1.234,
    "unit": "SOL"
  }
}
\`\`\`

## Available APIs

- **Balance Check** ($0.01): Get SOL balance for any address
- **Token Holdings** ($0.02): Retrieve all SPL tokens
- **Transaction History** ($0.03): Fetch recent transactions
- **NFT Metadata** ($0.05): Get NFT details
- **Validator Info** ($0.02): Real-time validator metrics

## Database Setup

Run the SQL scripts in the `/scripts` folder to set up your Supabase database:

1. `01-create-tables.sql` - Creates all necessary tables
2. `02-seed-services.sql` - Seeds example API services

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS v4
- **Backend**: Next.js API Routes, Server Actions
- **Blockchain**: Solana, USDC
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel

## Development

The project uses mock Supabase functions for development. To connect a real database:

1. Add Supabase integration in v0
2. Replace mock functions in `lib/supabase-mock.ts` with real Supabase client calls
3. Run database migration scripts

## License

MIT
