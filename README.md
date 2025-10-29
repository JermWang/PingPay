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

## x402 Flow (HTTP)
1) Call protected endpoint → 402 with quote headers (amount, address, quote_id, expires)
2) Pay USDC on Solana
3) Replay request with `X-Quote-Id` and `X-Transaction-Signature`
4) Server verifies on‑chain and returns data

## Endpoints
- `/api/solana/balance`
- `/api/solana/tokens`
- `/api/solana/transactions`
- `/api/solana/nft`
- `/api/solana/validator`

## Notes
- All mock/dev code has been removed. The app uses Supabase exclusively in production.
- Marketplace services load from Supabase via `/api/services`.

## License
MIT
