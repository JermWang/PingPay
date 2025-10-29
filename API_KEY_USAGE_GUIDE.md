# PingPay API Key Usage Guide

## 📚 How API Keys Work

API keys allow you to use PingPay's protected APIs **without** having to manually pay for each request. Instead, payment is automatically deducted from your prepaid balance.

---

## 🚀 Quick Start Guide

### Step 1: Create an Account & Add Funds

1. **Connect your Solana wallet** (Phantom, Solflare, etc.)
2. **Go to the Dashboard** (`/dashboard`)
3. **Deposit USDC** to your account (minimum $0.01)
   - Click "Deposit Funds"
   - Send USDC to the provided address
   - Confirm the transaction

### Step 2: Generate an API Key

1. In the Dashboard, click **"Create API Key"**
2. Give it a name (optional, e.g., "Production App", "Testing")
3. **Save the key immediately** - it's only shown once!
   - Format: `pp_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Step 3: Use Your API Key

Replace `YOUR_API_KEY` in the examples below with your actual API key.

---

## 💡 How to Use Your API Key

### Basic Example - Get Solana Balance

```bash
curl -H "Authorization: Bearer pp_live_2j6p1a5g285k374u1b3u174u2w454c5z" \
  "https://pingpay.app/api/solana/balance?address=DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK"
```

**What happens:**
1. ✅ Your API key is validated
2. ✅ System checks if you have enough balance (e.g., $0.01)
3. ✅ API request is processed
4. ✅ $0.01 is deducted from your balance
5. ✅ You get the response with SOL balance

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK",
    "balance": 1.234,
    "unit": "SOL",
    "timestamp": "2025-10-29T12:00:00.000Z"
  }
}
```

---

## 🔌 Available API Endpoints

### 1. **Get SOL Balance**
```bash
GET /api/solana/balance?address=YOUR_SOLANA_ADDRESS
```

### 2. **Get Token Accounts**
```bash
GET /api/solana/tokens?address=YOUR_SOLANA_ADDRESS
```

### 3. **Get Transaction History**
```bash
GET /api/solana/transactions?address=YOUR_SOLANA_ADDRESS&limit=10
```

### 4. **Get NFT Metadata**
```bash
GET /api/solana/nft?address=NFT_MINT_ADDRESS
```

### 5. **Get Validator Info**
```bash
GET /api/solana/validator?vote_account=VOTE_ACCOUNT_ADDRESS
```

---

## 🧑‍💻 Integration Examples

### JavaScript/TypeScript (Node.js)

```javascript
const API_KEY = 'pp_live_2j6p1a5g285k374u1b3u174u2w454c5z';
const API_BASE = 'https://pingpay.app';

async function getSolanaBalance(address) {
  const response = await fetch(
    `${API_BASE}/api/solana/balance?address=${address}`,
    {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      }
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }
  
  return await response.json();
}

// Usage
getSolanaBalance('DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK')
  .then(data => console.log('Balance:', data.data.balance))
  .catch(err => console.error('Error:', err.message));
```

### Python

```python
import requests

API_KEY = 'pp_live_2j6p1a5g285k374u1b3u174u2w454c5z'
API_BASE = 'https://pingpay.app'

def get_solana_balance(address):
    headers = {
        'Authorization': f'Bearer {API_KEY}'
    }
    
    response = requests.get(
        f'{API_BASE}/api/solana/balance',
        params={'address': address},
        headers=headers
    )
    
    response.raise_for_status()
    return response.json()

# Usage
try:
    data = get_solana_balance('DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK')
    print(f"Balance: {data['data']['balance']} SOL")
except requests.exceptions.RequestException as e:
    print(f"Error: {e}")
```

### React (Frontend)

```typescript
import { useState, useEffect } from 'react';

const API_KEY = process.env.NEXT_PUBLIC_PINGPAY_API_KEY;

function useSolanaBalance(address: string) {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBalance() {
      try {
        setLoading(true);
        const response = await fetch(
          `https://pingpay.app/api/solana/balance?address=${address}`,
          {
            headers: {
              'Authorization': `Bearer ${API_KEY}`,
            }
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch balance');
        }
        
        const data = await response.json();
        setBalance(data.data.balance);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    if (address) {
      fetchBalance();
    }
  }, [address]);

  return { balance, loading, error };
}

// Usage in component
function WalletDisplay({ address }: { address: string }) {
  const { balance, loading, error } = useSolanaBalance(address);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return <div>Balance: {balance} SOL</div>;
}
```

---

## 💰 Pricing & Balance Management

### How Pricing Works
- Each API endpoint has a fixed price (e.g., $0.01 per call)
- Your balance is deducted **automatically** after a successful request
- If you don't have enough balance, you'll get a `402 Payment Required` error

### Monitoring Your Balance
- Check your balance anytime in the **Dashboard**
- View transaction history to see all API calls and costs
- Set up low-balance alerts (coming soon)

### Adding More Funds
1. Go to Dashboard
2. Click "Deposit Funds"
3. Send USDC to the provided address
4. Funds are credited within 1-2 minutes

---

## 🔒 Security Best Practices

### ✅ DO:
- Store API keys in **environment variables** (`.env` files)
- Use different keys for development and production
- Rotate keys regularly (revoke old, create new)
- Monitor your usage in the Dashboard
- Use server-side requests (not exposed in frontend code)

### ❌ DON'T:
- Commit API keys to Git/GitHub
- Share keys publicly
- Use production keys in public client-side code
- Hardcode keys in your source code

### Example Environment Variables

```bash
# .env.local (Next.js)
PINGPAY_API_KEY=pp_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# .env (Node.js/Python)
PINGPAY_API_KEY=pp_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PINGPAY_API_BASE=https://pingpay.app
```

---

## 🚨 Error Handling

### Common Errors

| Status Code | Error | Solution |
|-------------|-------|----------|
| `401` | Invalid API key | Check your API key is correct |
| `402` | Insufficient balance | Add more funds to your account |
| `400` | Missing parameter | Check required query parameters |
| `429` | Rate limit exceeded | Wait and retry, or upgrade plan |
| `500` | Server error | Retry request, contact support if persists |

### Example Error Response
```json
{
  "error": "Insufficient balance",
  "balance": 0.005,
  "required": 0.01
}
```

---

## 📊 Dashboard Features

### Track Your Usage
- **Total Balance**: Current USDC balance
- **Total Spent**: Lifetime spending on API calls
- **API Keys**: Manage all your keys in one place
- **Transaction History**: See every API call and deposit
- **Real-time Updates**: Balance updates instantly

### API Key Management
- **Create**: Generate unlimited keys
- **Name**: Label keys for easy identification
- **Revoke**: Disable keys immediately if compromised
- **Monitor**: See last used date for each key

---

## ❓ FAQ

**Q: What's the difference between API keys and x402 payment?**
- **API Keys**: Prepaid balance, automatic deduction, perfect for apps
- **x402**: Pay-per-request, manual transaction, good for one-off calls

**Q: Can I use the same API key for multiple apps?**
- Yes, but we recommend using different keys for different apps for better tracking

**Q: What happens if my balance runs out?**
- Requests will fail with `402 Insufficient Balance` until you add more funds

**Q: Are there rate limits?**
- Currently no strict rate limits, but excessive abuse may be throttled

**Q: Can I get a refund?**
- Unused balance can be withdrawn via the Withdraw feature in Dashboard

---

## 🆘 Support

- **Documentation**: https://pingpay.app/docs
- **Twitter/X**: https://x.com/PingPaySol
- **GitHub**: https://github.com/JermWang/PingPay

---

## 🎯 Quick Reference

**Your API Key Format:**
```
pp_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Basic Request:**
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  "https://pingpay.app/api/solana/balance?address=ADDRESS"
```

**Response Format:**
```json
{
  "success": true,
  "data": { /* endpoint-specific data */ }
}
```

---

Built with ❤️ by PingPay | Powered by Solana & x402

