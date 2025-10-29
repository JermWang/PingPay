import { createClient } from "@supabase/supabase-js"
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./constants"
import type { CreatorEarnings, WithdrawalRequest } from "./types"

const supabase = SUPABASE_URL && SUPABASE_ANON_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null

if (!supabase) {
  console.warn("[CreatorPayouts] Supabase not configured")
}

const MINIMUM_WITHDRAWAL = 10 // $10 USD minimum

/**
 * Get or create creator earnings record
 */
export async function getCreatorEarnings(creatorId: string): Promise<CreatorEarnings> {
  if (!supabase) throw new Error("Supabase not configured")

  // Try to get existing record
  const { data: existing, error: fetchError } = await supabase
    .from("creator_earnings")
    .select("*")
    .eq("creator_id", creatorId)
    .single()

  if (existing) return existing

  // Create new record if doesn't exist
  if (fetchError && fetchError.code === "PGRST116") {
    const { data: newRecord, error: createError } = await supabase
      .from("creator_earnings")
      .insert({
        creator_id: creatorId,
        available_balance: 0,
        total_earned: 0,
        total_withdrawn: 0,
      })
      .select()
      .single()

    if (createError) throw new Error(`Failed to create creator earnings: ${createError.message}`)
    return newRecord
  }

  throw new Error(`Failed to get creator earnings: ${fetchError?.message}`)
}

/**
 * Track earning from a paid API request
 */
export async function trackCreatorEarning(
  creatorId: string,
  amountUsd: number
): Promise<CreatorEarnings> {
  if (!supabase) throw new Error("Supabase not configured")
  if (amountUsd <= 0) throw new Error("Earning amount must be positive")

  // Get current earnings
  const earnings = await getCreatorEarnings(creatorId)

  // Update earnings
  const newAvailableBalance = Number(earnings.available_balance) + amountUsd
  const newTotalEarned = Number(earnings.total_earned) + amountUsd

  const { data: updatedEarnings, error: updateError } = await supabase
    .from("creator_earnings")
    .update({
      available_balance: newAvailableBalance,
      total_earned: newTotalEarned,
      updated_at: new Date().toISOString(),
    })
    .eq("creator_id", creatorId)
    .select()
    .single()

  if (updateError) throw new Error(`Failed to track earning: ${updateError.message}`)

  return updatedEarnings
}

/**
 * Request withdrawal
 */
export async function requestWithdrawal(
  creatorId: string,
  walletAddress: string,
  amountUsd: number
): Promise<WithdrawalRequest> {
  if (!supabase) throw new Error("Supabase not configured")

  // Validate amount
  if (amountUsd < MINIMUM_WITHDRAWAL) {
    throw new Error(`Minimum withdrawal is $${MINIMUM_WITHDRAWAL}`)
  }

  // Get current earnings
  const earnings = await getCreatorEarnings(creatorId)

  // Check available balance
  if (Number(earnings.available_balance) < amountUsd) {
    throw new Error("Insufficient balance")
  }

  // Create withdrawal request
  const { data: request, error: createError } = await supabase
    .from("withdrawal_requests")
    .insert({
      creator_id: creatorId,
      amount_usd: amountUsd,
      wallet_address: walletAddress,
      status: "pending",
    })
    .select()
    .single()

  if (createError) throw new Error(`Failed to create withdrawal request: ${createError.message}`)

  // Deduct from available balance (but keep in total_earned)
  const { error: updateError } = await supabase
    .from("creator_earnings")
    .update({
      available_balance: Number(earnings.available_balance) - amountUsd,
      updated_at: new Date().toISOString(),
    })
    .eq("creator_id", creatorId)

  if (updateError) {
    // Rollback withdrawal request
    await supabase.from("withdrawal_requests").delete().eq("id", request.id)
    throw new Error(`Failed to update balance: ${updateError.message}`)
  }

  return request
}

/**
 * Get withdrawal requests for a creator
 */
export async function getWithdrawalRequests(
  creatorId: string,
  limit: number = 50
): Promise<WithdrawalRequest[]> {
  if (!supabase) throw new Error("Supabase not configured")

  const { data, error } = await supabase
    .from("withdrawal_requests")
    .select("*")
    .eq("creator_id", creatorId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) throw new Error(`Failed to get withdrawal requests: ${error.message}`)
  return data || []
}

/**
 * Get pending withdrawal requests (for admin processing)
 */
export async function getPendingWithdrawals(): Promise<WithdrawalRequest[]> {
  if (!supabase) throw new Error("Supabase not configured")

  const { data, error } = await supabase
    .from("withdrawal_requests")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true })

  if (error) throw new Error(`Failed to get pending withdrawals: ${error.message}`)
  return data || []
}

/**
 * Complete a withdrawal (called after sending payment)
 */
export async function completeWithdrawal(
  requestId: string,
  transactionSignature: string
): Promise<WithdrawalRequest> {
  if (!supabase) throw new Error("Supabase not configured")

  // Get the request
  const { data: request, error: fetchError } = await supabase
    .from("withdrawal_requests")
    .select("*")
    .eq("id", requestId)
    .single()

  if (fetchError || !request) throw new Error("Withdrawal request not found")

  // Update request status
  const { data: updatedRequest, error: updateError } = await supabase
    .from("withdrawal_requests")
    .update({
      status: "completed",
      transaction_signature: transactionSignature,
      processed_at: new Date().toISOString(),
    })
    .eq("id", requestId)
    .select()
    .single()

  if (updateError) throw new Error(`Failed to complete withdrawal: ${updateError.message}`)

  // Update creator's total withdrawn
  const { error: earningsError } = await supabase
    .from("creator_earnings")
    .update({
      total_withdrawn: Number(request.amount_usd),
      last_withdrawal_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("creator_id", request.creator_id)

  if (earningsError) {
    console.error("[CreatorPayouts] Failed to update total withdrawn:", earningsError)
  }

  return updatedRequest
}

/**
 * Fail a withdrawal (in case of error)
 */
export async function failWithdrawal(
  requestId: string,
  errorMessage: string
): Promise<WithdrawalRequest> {
  if (!supabase) throw new Error("Supabase not configured")

  // Get the request
  const { data: request, error: fetchError } = await supabase
    .from("withdrawal_requests")
    .select("*")
    .eq("id", requestId)
    .single()

  if (fetchError || !request) throw new Error("Withdrawal request not found")

  // Update request status
  const { data: updatedRequest, error: updateError } = await supabase
    .from("withdrawal_requests")
    .update({
      status: "failed",
      error_message: errorMessage,
      processed_at: new Date().toISOString(),
    })
    .eq("id", requestId)
    .select()
    .single()

  if (updateError) throw new Error(`Failed to update withdrawal: ${updateError.message}`)

  // Return the amount to available balance
  const { error: refundError } = await supabase
    .from("creator_earnings")
    .update({
      available_balance: request.amount_usd,
      updated_at: new Date().toISOString(),
    })
    .eq("creator_id", request.creator_id)

  if (refundError) {
    console.error("[CreatorPayouts] Failed to refund balance:", refundError)
  }

  return updatedRequest
}

/**
 * Get minimum withdrawal amount
 */
export function getMinimumWithdrawal(): number {
  return MINIMUM_WITHDRAWAL
}

