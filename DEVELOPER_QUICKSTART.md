# Developer Quick Start Guide

## Setup (One-Time)

### 1. Database Setup
Run these SQL scripts in your Supabase SQL Editor:

```sql
-- Run in order:
scripts/01-create-tables.sql
scripts/02-seed-services.sql
scripts/03-creator-tables.sql
scripts/04-marketplace-enhancements.sql
scripts/05-user-accounts.sql  -- NEW!
```

### 2. Environment Variables
Ensure your `.env.local` has:

```env
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PAYMENT_RECEIVER_ADDRESS=YOUR_SOLANA_ADDRESS
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_KEY
```

### 3. Install & Run

```bash
pnpm install
pnpm dev
```

## Using the Prepaid System (Developer)

### Step 1: Connect Wallet
1. Open http://localhost:3000
2. Click "Connect Wallet" in the top-right
3. Approve connection in your wallet (Phantom, Solflare, etc.)

### Step 2: Visit Dashboard
1. Click "Dashboard" in the navigation
2. You'll see your account with $0.00 balance

### Step 3: Deposit Funds
1. Click "Add Funds" button
2. Enter amount (e.g., $5.00) - no minimum!
3. Click "Continue"
4. Copy the recipient address shown
5. Open your Solana wallet
6. Send that amount in USDC (SPL token on Solana)
7. Copy the transaction signature from your wallet
8. Paste it into the input field
9. Click "Verify & Complete"
10. Your balance updates!

### Step 4: Generate API Key
1. Still in Dashboard, scroll to "API Keys" section
2. Click "Create Key"
3. (Optional) Give it a name like "My App"
4. Click "Generate Key"
5. **IMPORTANT:** Copy the key immediately (starts with `pp_live_`)
6. Store it securely - it won't be shown again!

### Step 5: Use Your API Key

```bash
# Example: Get Solana balance
curl -H "Authorization: Bearer pp_live_your_key_here" \
  "http://localhost:3000/api/solana/balance?address=SOLANA_ADDRESS_HERE"
```

```javascript
// JavaScript example
const response = await fetch(
  'http://localhost:3000/api/solana/balance?address=YOUR_ADDRESS',
  {
    headers: {
      'Authorization': 'Bearer pp_live_your_key_here'
    }
  }
);
const data = await response.json();
console.log(data);
```

```python
# Python example
import requests

headers = {
    'Authorization': 'Bearer pp_live_your_key_here'
}

response = requests.get(
    'http://localhost:3000/api/solana/balance',
    params={'address': 'YOUR_ADDRESS'},
    headers=headers
)
print(response.json())
```

### Step 6: Monitor Usage
1. Return to Dashboard
2. Check "Recent Transactions" to see each API call
3. Watch your balance decrease with each request
4. Add more funds when needed

## Creating APIs (Creator)

### Step 1: Register as Creator
1. Connect wallet
2. Visit "Creator Dashboard" in navigation
3. Create your creator profile

### Step 2: Create a Service
1. Click "Create API"
2. Fill in:
   - Name (e.g., "Premium Token Data")
   - Description
   - Endpoint (e.g., `/api/my-service`)
   - Price (e.g., $0.01 per call)
   - Category
3. Click "Create"

### Step 3: Implement Your API
Create a route file like `app/api/my-service/route.ts`:

```typescript
import { type NextRequest, NextResponse } from "next/server"
import { withX402ProtectionV2 } from "@/lib/x402-middleware-v2"

export async function GET(request: NextRequest) {
  return withX402ProtectionV2(
    request,
    async (req) => {
      // Your API logic here
      return NextResponse.json({
        success: true,
        data: {
          message: "Hello from my API!",
          timestamp: new Date().toISOString(),
        },
      })
    },
    "/api/my-service",
  )
}
```

### Step 4: Earn & Withdraw
1. Users call your API → you earn automatically
2. Visit "Creator Dashboard" → "Earnings"
3. See your available balance
4. Click "Withdraw" when you have $10+
5. Request goes to admin for processing
6. Receive USDC within 1-2 business days

## Testing Your API

### With API Key (Recommended)
```bash
curl -H "Authorization: Bearer pp_live_xxx" \
  "http://localhost:3000/api/my-service"
```

### With x402 (One-Time Payment)
```bash
# 1. Initial call (gets 402 response)
curl http://localhost:3000/api/my-service

# Response includes payment details
# 2. Pay with wallet, get transaction signature
# 3. Replay with signature
curl -H "X-Quote-Id: quote_123" \
     -H "X-Transaction-Signature: txn_456" \
     http://localhost:3000/api/my-service
```

## Troubleshooting

### "Supabase not configured"
- Check your `.env.local` has correct Supabase credentials
- Restart dev server after changing env vars

### "Transaction verification failed"
- Make sure you're sending USDC (not SOL)
- Use correct network (devnet vs mainnet)
- Send exact amount shown
- Wait a few seconds for transaction to confirm

### "Insufficient balance"
- Check balance in dashboard
- Add more funds via "Add Funds" button
- Minimum per call varies by service price

### "Invalid or inactive API key"
- Check key starts with `pp_live_` (not `pp_test_`)
- Ensure key hasn't been revoked
- Verify no extra spaces when copying

### Balance not updating
- Balance refreshes every 30 seconds
- Click the refresh icon in dashboard
- Check "Recent Transactions" to see activity

## Pro Tips

1. **Test with Small Amounts** - Start with $1-2 deposits
2. **Multiple Keys** - Create different keys for different apps
3. **Name Your Keys** - Makes it easier to track usage
4. **Monitor Regularly** - Check dashboard daily
5. **Low Balance Alerts** - Yellow warning at $1, amber at $0.10
6. **Revoke Unused Keys** - Security best practice
7. **Transaction History** - Export for accounting
8. **Free Tiers** - Some APIs offer free calls per day

## API Key Best Practices

**DO:**
- Store keys in environment variables
- Use different keys for dev/prod
- Revoke keys you're not using
- Name keys descriptively
- Monitor usage regularly

**DON'T:**
- Commit keys to git
- Share keys publicly
- Use same key across all apps
- Ignore low balance warnings
- Leave inactive keys active

## Next Steps

1. Set up database
2. Deposit funds
3. Generate API key
4. Make your first API call
5. Read API documentation at `/docs`
6. Build your application
7. Monitor usage in dashboard
8. Create your own APIs to earn

## Support

- Documentation: http://localhost:3000/docs
- Dashboard: http://localhost:3000/dashboard
- Creator Portal: http://localhost:3000/creators
- Marketplace: http://localhost:3000/marketplace

---

**Happy Building!**

