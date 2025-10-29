# Ping Pay – Production

Solana‑powered, pay‑per‑request API marketplace using the x402 standard. Every protected request returns a 402 quote, you pay in USDC on Solana, then replay with the signature to unlock data.

## Production Setup

### Requirements
- Node.js 18+
- Supabase project (PostgreSQL)
- Solana RPC + payment receiver address (USDC)

### 1) Install
```bash
pnpm install
```

### 2) Configure env
Create `.env.local` with these required variables:
```env
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PAYMENT_RECEIVER_ADDRESS=YOUR_SOL_ADDRESS
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

### 3) Database
Run the SQL in `/scripts` (01, 02, 03, 04) on Supabase to create tables, seed services, and enable stats.

### 4) Run
```bash
pnpm dev                      # local
pnpm build && pnpm start      # production
```

## Authentication Methods

### 1. API Keys (Recommended for Production)
Prepaid balance system with API keys for seamless integration:

```bash
# 1. Create account and deposit funds via UI
# 2. Generate API key in dashboard
# 3. Use it in your requests
curl -H "Authorization: Bearer pp_live_xxx" \
  https://yourapp.com/api/solana/balance?address=xxx
```

**Benefits:**
- No manual payment per request
- Track usage in dashboard
- Perfect for apps and automation
- Automatic balance deduction

### 2. HTTP 402 (x402) - One-Time Payments
For anonymous or one-off API calls:

1) Call protected endpoint → 402 with quote headers (amount, address, quote_id, expires)
2) Pay USDC on Solana
3) Replay request with `X-Quote-Id` and `X-Transaction-Signature`
4) Server verifies on‑chain and returns data

## API Endpoints

### Protected Endpoints (require authentication)
- `/api/solana/balance` - Get SOL balance
- `/api/solana/tokens` - List token accounts
- `/api/solana/transactions` - Get transaction history
- `/api/solana/nft` - NFT metadata
- `/api/solana/validator` - Validator information

### Account Management
- `/api/account/balance` - Get account balance
- `/api/account/deposit` - Initiate deposit
- `/api/account/deposit/verify` - Verify deposit transaction
- `/api/account/transactions` - Transaction history
- `/api/account/keys` - Manage API keys

### Creator Endpoints
- `/api/creators/earnings` - View earnings
- `/api/creators/earnings/withdraw` - Request withdrawal

## Developer Workflow

1. **Connect Wallet** - Use Phantom, Solflare, or any Solana wallet
2. **Deposit Funds** - Add USDC to your account (no minimum)
3. **Generate API Key** - Create keys in your dashboard
4. **Integrate** - Use API keys in your applications
5. **Monitor** - Track usage and spending in real-time

## Creator Workflow

1. **Register** - Connect wallet and create creator profile
2. **Publish APIs** - List your services on the marketplace
3. **Earn** - Get paid automatically when users call your APIs
4. **Withdraw** - Request payouts (minimum $10)

## Notes
- All mock/dev code has been removed. The app uses Supabase exclusively in production.
- Marketplace services load from Supabase via `/api/services`.
- Run SQL scripts in order (01-05) to set up all tables.

## License
MIT
