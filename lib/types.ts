export interface Creator {
  id: string
  wallet_address: string
  display_name?: string
  bio?: string
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  name: string
  description: string
  endpoint: string
  price_usd: number
  category: string
  creator_id?: string
  external_endpoint?: string
  is_active?: boolean
  free_tier_limit?: number
  free_tier_period?: string
  featured?: boolean
  verified?: boolean
  total_users?: number
  created_at: string
  updated_at: string
}

export interface Quote {
  id: string
  service_id: string
  amount_usd: number
  solana_address: string
  expires_at: string
  created_at: string
}

export interface Payment {
  id: string
  quote_id: string
  transaction_signature: string
  verified: boolean
  verified_at?: string
  created_at: string
}

export interface UsageLog {
  id: string
  service_id: string
  payment_id?: string
  request_path: string
  response_status: number
  created_at: string
}

export interface X402Response {
  error: string
  quote_id: string
  amount_usd: number
  solana_address: string
  expires_at: string
}

export interface Review {
  id: string
  service_id: string
  user_wallet: string
  rating: number
  title?: string | null
  content?: string
  verified_purchase: boolean
  helpful_count: number
  created_at: string
  updated_at: string
}

export interface ServiceStats {
  service_id: string
  total_reviews: number
  avg_rating: number
  total_calls: number
  successful_calls: number
  failed_calls: number
  avg_response_time: number
  uptime_percentage: number
  last_24h_calls: number
  last_updated: string
}

export interface ApiFavorite {
  user_wallet: string
  service_id: string
  created_at: string
}

// Solana RPC Response Types
export interface SolanaRpcResponse<T> {
  jsonrpc: string
  id: number
  result: T
  error?: {
    code: number
    message: string
  }
}

export interface TokenAmount {
  amount: string
  decimals: number
  uiAmount: number
  uiAmountString: string
}

export interface ParsedTokenInfo {
  mint: string
  owner: string
  tokenAmount: TokenAmount
}

export interface TokenAccountInfo {
  account: {
    data: {
      parsed: {
        info: ParsedTokenInfo
      }
      program: string
      space: number
    }
    executable: boolean
    lamports: number
    owner: string
    rentEpoch: number
  }
  pubkey: string
}

export interface TransactionSignature {
  signature: string
  slot: number
  blockTime: number | null
  err: any | null
  memo: string | null
  confirmationStatus?: string
}

export interface ValidatorInfo {
  votePubkey: string
  nodePubkey: string
  activatedStake: number
  commission: number
  lastVote: number
  rootSlot: number
  epochCredits?: Array<[number, number, number]>
  epochVoteAccount?: boolean
}

// Prepaid Balance System Types

export interface UserAccount {
  wallet_address: string
  balance_usd: number
  total_deposited: number
  total_spent: number
  created_at: string
  updated_at: string
}

export interface ApiKey {
  id: string
  user_wallet: string
  key_hash: string
  key_prefix: string
  name?: string
  is_active: boolean
  last_used_at?: string
  created_at: string
}

export interface AccountTransaction {
  id: string
  user_wallet: string
  type: 'deposit' | 'spend' | 'refund'
  amount_usd: number
  service_id?: string
  api_key_id?: string
  description?: string
  transaction_signature?: string
  created_at: string
}

export interface CreatorEarnings {
  creator_id: string
  available_balance: number
  total_earned: number
  total_withdrawn: number
  last_withdrawal_at?: string
  updated_at: string
}

export interface WithdrawalRequest {
  id: string
  creator_id: string
  amount_usd: number
  wallet_address: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  transaction_signature?: string
  error_message?: string
  created_at: string
  processed_at?: string
}
