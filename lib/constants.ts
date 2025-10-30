// Validate required environment variables
function validateEnvVar(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}\n` +
      `Please create a .env.local file with this variable set.\n` +
      `See .env.example for reference.`
    )
  }
  return value
}

// Solana configuration
export const SOLANA_NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet"
export const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com"

// Payment configuration - REQUIRED
export const PAYMENT_RECEIVER_ADDRESS = validateEnvVar(
  "NEXT_PUBLIC_PAYMENT_RECEIVER_ADDRESS",
  process.env.NEXT_PUBLIC_PAYMENT_RECEIVER_ADDRESS
)

// Supabase configuration - REQUIRED for production
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate Supabase config in production
if (process.env.NODE_ENV === "production") {
  validateEnvVar("NEXT_PUBLIC_SUPABASE_URL", SUPABASE_URL)
  validateEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY", SUPABASE_ANON_KEY)
}
export const QUOTE_EXPIRY_SECONDS = 300 // 5 minutes
export const USDC_MINT_ADDRESS = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" // USDC on mainnet

// API configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ""

export const EXAMPLE_SOLANA_ADDRESS = "DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK"
export const EXAMPLE_VOTE_ACCOUNT = "CertusDeBmqN8ZawdkxK5kFGMwBXdudvWHYwtNgNhvLu"

// Platform stats configuration
// Allows setting a starting baseline for total requests shown on the site
const parseOffset = (v: string | undefined, fallback: number) => {
  const n = parseInt((v || "").trim(), 10)
  return Number.isFinite(n) && n >= 0 ? n : fallback
}
export const INITIAL_REQUESTS_OFFSET = parseOffset(
  process.env.NEXT_PUBLIC_INITIAL_REQUESTS_OFFSET,
  79
)
