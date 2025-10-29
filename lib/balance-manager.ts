import { createClient } from "@supabase/supabase-js"
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./constants"
import type { UserAccount, AccountTransaction } from "./types"

const supabase = SUPABASE_URL && SUPABASE_ANON_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null

if (!supabase) {
  console.warn("[BalanceManager] Supabase not configured")
}

/**
 * Get or create user account
 */
export async function getUserAccount(walletAddress: string): Promise<UserAccount> {
  if (!supabase) throw new Error("Supabase not configured")

  // Try to get existing account
  const { data: existing, error: fetchError } = await supabase
    .from("user_accounts")
    .select("*")
    .eq("wallet_address", walletAddress)
    .single()

  if (existing) return existing

  // Create new account if doesn't exist
  if (fetchError && fetchError.code === "PGRST116") {
    const { data: newAccount, error: createError } = await supabase
      .from("user_accounts")
      .insert({
        wallet_address: walletAddress,
        balance_usd: 0,
        total_deposited: 0,
        total_spent: 0,
      })
      .select()
      .single()

    if (createError) throw new Error(`Failed to create user account: ${createError.message}`)
    return newAccount
  }

  throw new Error(`Failed to get user account: ${fetchError?.message}`)
}

/**
 * Deposit funds to user balance
 */
export async function depositFunds(
  walletAddress: string,
  amountUsd: number,
  transactionSignature: string,
  description?: string
): Promise<UserAccount> {
  if (!supabase) throw new Error("Supabase not configured")
  if (amountUsd <= 0) throw new Error("Deposit amount must be positive")

  // Check if transaction was already processed
  const { data: existingTx } = await supabase
    .from("processed_transactions")
    .select("*")
    .eq("transaction_signature", transactionSignature)
    .single()

  if (existingTx) {
    throw new Error("Transaction already processed - duplicate deposit attempt")
  }

  // Get current account
  const account = await getUserAccount(walletAddress)

  // Update balance
  const newBalance = Number(account.balance_usd) + amountUsd
  const newTotalDeposited = Number(account.total_deposited) + amountUsd

  const { data: updatedAccount, error: updateError } = await supabase
    .from("user_accounts")
    .update({
      balance_usd: newBalance,
      total_deposited: newTotalDeposited,
      updated_at: new Date().toISOString(),
    })
    .eq("wallet_address", walletAddress)
    .select()
    .single()

  if (updateError) throw new Error(`Failed to deposit funds: ${updateError.message}`)

  // Mark transaction as processed to prevent duplicates
  await supabase
    .from("processed_transactions")
    .insert({
      transaction_signature: transactionSignature,
      wallet_address: walletAddress,
      amount_usd: amountUsd,
      transaction_type: "deposit",
    })

  // Log transaction
  await logTransaction({
    user_wallet: walletAddress,
    type: "deposit",
    amount_usd: amountUsd,
    description: description || "Account deposit",
    transaction_signature: transactionSignature,
  })

  return updatedAccount
}

/**
 * Deduct balance with validation
 */
export async function deductBalance(
  walletAddress: string,
  amountUsd: number,
  serviceId: string,
  apiKeyId?: string,
  description?: string
): Promise<UserAccount> {
  if (!supabase) throw new Error("Supabase not configured")
  if (amountUsd <= 0) throw new Error("Deduction amount must be positive")

  // Get current account
  const account = await getUserAccount(walletAddress)

  // Check sufficient balance
  if (Number(account.balance_usd) < amountUsd) {
    throw new Error("Insufficient balance")
  }

  // Update balance
  const newBalance = Number(account.balance_usd) - amountUsd
  const newTotalSpent = Number(account.total_spent) + amountUsd

  const { data: updatedAccount, error: updateError } = await supabase
    .from("user_accounts")
    .update({
      balance_usd: newBalance,
      total_spent: newTotalSpent,
      updated_at: new Date().toISOString(),
    })
    .eq("wallet_address", walletAddress)
    .select()
    .single()

  if (updateError) throw new Error(`Failed to deduct balance: ${updateError.message}`)

  // Log transaction
  await logTransaction({
    user_wallet: walletAddress,
    type: "spend",
    amount_usd: amountUsd,
    service_id: serviceId,
    api_key_id: apiKeyId,
    description: description || "API call",
  })

  return updatedAccount
}

/**
 * Refund balance (in case of errors)
 */
export async function refundBalance(
  walletAddress: string,
  amountUsd: number,
  serviceId?: string,
  description?: string
): Promise<UserAccount> {
  if (!supabase) throw new Error("Supabase not configured")
  if (amountUsd <= 0) throw new Error("Refund amount must be positive")

  // Get current account
  const account = await getUserAccount(walletAddress)

  // Update balance
  const newBalance = Number(account.balance_usd) + amountUsd
  const newTotalSpent = Math.max(0, Number(account.total_spent) - amountUsd)

  const { data: updatedAccount, error: updateError } = await supabase
    .from("user_accounts")
    .update({
      balance_usd: newBalance,
      total_spent: newTotalSpent,
      updated_at: new Date().toISOString(),
    })
    .eq("wallet_address", walletAddress)
    .select()
    .single()

  if (updateError) throw new Error(`Failed to refund balance: ${updateError.message}`)

  // Log transaction
  await logTransaction({
    user_wallet: walletAddress,
    type: "refund",
    amount_usd: amountUsd,
    service_id: serviceId,
    description: description || "Refund",
  })

  return updatedAccount
}

/**
 * Check if user has sufficient balance
 */
export async function hasBalance(
  walletAddress: string,
  requiredAmount: number
): Promise<boolean> {
  if (!supabase) throw new Error("Supabase not configured")

  const account = await getUserAccount(walletAddress)
  return Number(account.balance_usd) >= requiredAmount
}

/**
 * Get account transactions with pagination
 */
export async function getAccountTransactions(
  walletAddress: string,
  limit: number = 50,
  offset: number = 0
): Promise<AccountTransaction[]> {
  if (!supabase) throw new Error("Supabase not configured")

  const { data, error } = await supabase
    .from("account_transactions")
    .select("*")
    .eq("user_wallet", walletAddress)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw new Error(`Failed to get transactions: ${error.message}`)
  return data || []
}

/**
 * Request a withdrawal
 */
export async function requestWithdrawal(
  walletAddress: string,
  amountUsd: number,
  recipientAddress: string
): Promise<any> {
  if (!supabase) throw new Error("Supabase not configured")
  if (amountUsd <= 0) throw new Error("Withdrawal amount must be positive")
  if (amountUsd < 10) throw new Error("Minimum withdrawal amount is $10")

  // Check sufficient balance
  const account = await getUserAccount(walletAddress)
  if (Number(account.balance_usd) < amountUsd) {
    throw new Error("Insufficient balance")
  }

  // Create withdrawal request
  const { data: request, error } = await supabase
    .from("user_withdrawal_requests")
    .insert({
      user_wallet: walletAddress,
      amount_usd: amountUsd,
      recipient_address: recipientAddress,
      status: "pending",
    })
    .select()
    .single()

  if (error) throw new Error(`Failed to create withdrawal request: ${error.message}`)

  // Deduct balance immediately (held in pending withdrawal)
  await deductBalance(
    walletAddress,
    amountUsd,
    "withdrawal",
    undefined,
    `Withdrawal request ${request.id}`
  )

  return request
}

/**
 * Get withdrawal requests for a user
 */
export async function getWithdrawalRequests(
  walletAddress: string,
  limit: number = 50
): Promise<any[]> {
  if (!supabase) throw new Error("Supabase not configured")

  const { data, error } = await supabase
    .from("user_withdrawal_requests")
    .select("*")
    .eq("user_wallet", walletAddress)
    .order("requested_at", { ascending: false })
    .limit(limit)

  if (error) throw new Error(`Failed to get withdrawal requests: ${error.message}`)
  return data || []
}

/**
 * Cancel a pending withdrawal (admin or user)
 */
export async function cancelWithdrawal(withdrawalId: string): Promise<void> {
  if (!supabase) throw new Error("Supabase not configured")

  // Get withdrawal details
  const { data: withdrawal, error: fetchError } = await supabase
    .from("user_withdrawal_requests")
    .select("*")
    .eq("id", withdrawalId)
    .single()

  if (fetchError) throw new Error("Withdrawal request not found")
  if (withdrawal.status !== "pending") throw new Error("Can only cancel pending withdrawals")

  // Update status
  await supabase
    .from("user_withdrawal_requests")
    .update({ status: "cancelled", processed_at: new Date().toISOString() })
    .eq("id", withdrawalId)

  // Refund the amount
  await refundBalance(
    withdrawal.user_wallet,
    withdrawal.amount_usd,
    undefined,
    `Withdrawal ${withdrawalId} cancelled`
  )
}

/**
 * Complete a withdrawal (admin only - after sending funds)
 */
export async function completeWithdrawal(
  withdrawalId: string,
  transactionSignature: string,
  processedBy: string
): Promise<void> {
  if (!supabase) throw new Error("Supabase not configured")

  // Check if transaction was already processed
  const { data: existingTx } = await supabase
    .from("processed_transactions")
    .select("*")
    .eq("transaction_signature", transactionSignature)
    .single()

  if (existingTx) {
    throw new Error("Transaction signature already used")
  }

  // Get withdrawal details
  const { data: withdrawal, error: fetchError } = await supabase
    .from("user_withdrawal_requests")
    .select("*")
    .eq("id", withdrawalId)
    .single()

  if (fetchError) throw new Error("Withdrawal request not found")
  if (withdrawal.status !== "pending") throw new Error("Withdrawal is not pending")

  // Mark as completed
  await supabase
    .from("user_withdrawal_requests")
    .update({
      status: "completed",
      transaction_signature: transactionSignature,
      processed_at: new Date().toISOString(),
      processed_by: processedBy,
    })
    .eq("id", withdrawalId)

  // Record in processed transactions
  await supabase
    .from("processed_transactions")
    .insert({
      transaction_signature: transactionSignature,
      wallet_address: withdrawal.user_wallet,
      amount_usd: withdrawal.amount_usd,
      transaction_type: "withdrawal",
    })
}

/**
 * Log a transaction
 */
async function logTransaction(
  transaction: Omit<AccountTransaction, "id" | "created_at">
): Promise<void> {
  if (!supabase) throw new Error("Supabase not configured")

  const { error } = await supabase
    .from("account_transactions")
    .insert(transaction)

  if (error) throw new Error(`Failed to log transaction: ${error.message}`)
}

