import { createClient } from "@supabase/supabase-js"
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./constants"
import type { ApiKey } from "./types"

const supabase = SUPABASE_URL && SUPABASE_ANON_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null

if (!supabase) {
  console.warn("[ApiKeyManager] Supabase not configured")
}

// We'll use Web Crypto API for hashing (available in Node.js 16+)
async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(key)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Generate a new API key
 * Format: pp_live_[32 random chars]
 */
export async function generateApiKey(
  walletAddress: string,
  name?: string,
  isTest: boolean = false
): Promise<{ apiKey: ApiKey; plainKey: string }> {
  if (!supabase) throw new Error("Supabase not configured")

  // Generate random key
  const randomBytes = new Uint8Array(24)
  crypto.getRandomValues(randomBytes)
  const randomString = Array.from(randomBytes)
    .map(b => b.toString(36))
    .join('')
    .slice(0, 32)

  const prefix = isTest ? "pp_test" : "pp_live"
  const plainKey = `${prefix}_${randomString}`

  // Hash the key for storage
  const keyHash = await hashApiKey(plainKey)

  // Store last 8 chars as prefix for display
  const keyPrefix = `${prefix}_${"*".repeat(24)}${plainKey.slice(-8)}`

  // Insert into database
  const { data, error } = await supabase
    .from("api_keys")
    .insert({
      user_wallet: walletAddress,
      key_hash: keyHash,
      key_prefix: keyPrefix,
      name: name || null,
      is_active: true,
    })
    .select()
    .single()

  if (error) throw new Error(`Failed to create API key: ${error.message}`)

  return { apiKey: data, plainKey }
}

/**
 * Validate API key and return user wallet
 */
export async function validateApiKey(plainKey: string): Promise<string | null> {
  if (!supabase) throw new Error("Supabase not configured")

  try {
    // Hash the provided key
    const keyHash = await hashApiKey(plainKey)

    // Look up in database
    const { data, error } = await supabase
      .from("api_keys")
      .select("*")
      .eq("key_hash", keyHash)
      .eq("is_active", true)
      .single()

    if (error || !data) return null

    // Update last used timestamp
    await supabase
      .from("api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", data.id)

    return data.user_wallet
  } catch (error) {
    console.error("[ApiKeyManager] Validation error:", error)
    return null
  }
}

/**
 * List all active API keys for a user
 */
export async function listUserApiKeys(walletAddress: string): Promise<ApiKey[]> {
  if (!supabase) throw new Error("Supabase not configured")

  const { data, error } = await supabase
    .from("api_keys")
    .select("*")
    .eq("user_wallet", walletAddress)
    .eq("is_active", true) // Only show active keys
    .order("created_at", { ascending: false })

  if (error) throw new Error(`Failed to list API keys: ${error.message}`)
  return data || []
}

/**
 * Get a specific API key
 */
export async function getApiKey(keyId: string): Promise<ApiKey | null> {
  if (!supabase) throw new Error("Supabase not configured")

  const { data, error } = await supabase
    .from("api_keys")
    .select("*")
    .eq("id", keyId)
    .single()

  if (error && error.code !== "PGRST116") {
    throw new Error(`Failed to get API key: ${error.message}`)
  }

  return data
}

/**
 * Revoke (permanently delete) an API key
 */
export async function revokeApiKey(keyId: string, walletAddress: string): Promise<void> {
  if (!supabase) throw new Error("Supabase not configured")

  // Verify ownership
  const key = await getApiKey(keyId)
  if (!key) throw new Error("API key not found")
  if (key.user_wallet !== walletAddress) throw new Error("Unauthorized")

  // Permanently delete the API key from database
  const { error } = await supabase
    .from("api_keys")
    .delete()
    .eq("id", keyId)
    .eq("user_wallet", walletAddress) // Extra safety check

  if (error) throw new Error(`Failed to delete API key: ${error.message}`)
}

/**
 * Update API key name
 */
export async function updateApiKeyName(
  keyId: string,
  walletAddress: string,
  name: string
): Promise<ApiKey> {
  if (!supabase) throw new Error("Supabase not configured")

  // Verify ownership
  const key = await getApiKey(keyId)
  if (!key) throw new Error("API key not found")
  if (key.user_wallet !== walletAddress) throw new Error("Unauthorized")

  const { data, error } = await supabase
    .from("api_keys")
    .update({ name })
    .eq("id", keyId)
    .select()
    .single()

  if (error) throw new Error(`Failed to update API key: ${error.message}`)
  return data
}

