import { Connection, PublicKey } from "@solana/web3.js"
import { createClient } from "@supabase/supabase-js"
import { SUPABASE_URL, SUPABASE_ANON_KEY, SOLANA_RPC_URL, PAYMENT_RECEIVER_ADDRESS, USDC_MINT_ADDRESS } from "./constants"

const supabase = SUPABASE_URL && SUPABASE_ANON_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null

const USDC_DECIMALS = 6

export interface ReconciliationResult {
  totalDatabaseBalance: number
  totalOnChainBalance: number
  difference: number
  status: "matched" | "discrepancy" | "error"
  discrepancies: Array<{
    wallet: string
    databaseBalance: number
    issue: string
  }>
  accountCount: number
  timestamp: string
}

/**
 * Get total balance from database (sum of all user balances)
 */
async function getTotalDatabaseBalance(): Promise<{ total: number; accounts: any[] }> {
  if (!supabase) throw new Error("Supabase not configured")

  const { data: accounts, error } = await supabase
    .from("user_accounts")
    .select("wallet_address, balance_usd")

  if (error) throw new Error(`Failed to get accounts: ${error.message}`)

  const total = accounts?.reduce((sum, acc) => sum + Number(acc.balance_usd), 0) || 0
  return { total, accounts: accounts || [] }
}

/**
 * Get USDC balance from Solana treasury wallet
 */
async function getTreasuryBalance(): Promise<number> {
  try {
    const connection = new Connection(SOLANA_RPC_URL, "confirmed")
    const treasuryPubkey = new PublicKey(PAYMENT_RECEIVER_ADDRESS)
    const usdcMintPubkey = new PublicKey(USDC_MINT_ADDRESS)

    // Get all token accounts for the treasury
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      treasuryPubkey,
      { mint: usdcMintPubkey }
    )

    if (tokenAccounts.value.length === 0) {
      console.warn("[Reconciliation] No USDC token account found for treasury")
      return 0
    }

    // Sum up all USDC balances (should typically be just one account)
    let totalBalance = 0
    for (const account of tokenAccounts.value) {
      const balance = account.account.data.parsed.info.tokenAmount.uiAmount
      totalBalance += balance || 0
    }

    return totalBalance
  } catch (error) {
    console.error("[Reconciliation] Failed to get treasury balance:", error)
    throw new Error("Failed to fetch on-chain balance")
  }
}

/**
 * Get total pending withdrawals
 */
async function getPendingWithdrawals(): Promise<number> {
  if (!supabase) throw new Error("Supabase not configured")

  const { data, error } = await supabase
    .from("user_withdrawal_requests")
    .select("amount_usd")
    .eq("status", "pending")

  if (error) throw new Error(`Failed to get pending withdrawals: ${error.message}`)

  return data?.reduce((sum, req) => sum + Number(req.amount_usd), 0) || 0
}

/**
 * Run full reconciliation
 */
export async function runReconciliation(runBy?: string): Promise<ReconciliationResult> {
  if (!supabase) throw new Error("Supabase not configured")

  try {
    // Get database balances
    const { total: dbTotal, accounts } = await getTotalDatabaseBalance()
    
    // Get on-chain balance
    const onChainBalance = await getTreasuryBalance()
    
    // Get pending withdrawals (these are deducted from DB but still on-chain)
    const pendingWithdrawals = await getPendingWithdrawals()
    
    // Expected on-chain = database total + pending withdrawals
    // (because withdrawals deduct from DB immediately but funds stay on-chain until processed)
    const expectedOnChainBalance = dbTotal + pendingWithdrawals
    
    const difference = onChainBalance - expectedOnChainBalance
    const tolerance = 0.01 // $0.01 tolerance for rounding
    
    const status = Math.abs(difference) <= tolerance ? "matched" : "discrepancy"
    
    const discrepancies: Array<{ wallet: string; databaseBalance: number; issue: string }> = []
    
    // Check for negative balances (shouldn't happen but good to catch)
    for (const account of accounts) {
      if (Number(account.balance_usd) < 0) {
        discrepancies.push({
          wallet: account.wallet_address,
          databaseBalance: Number(account.balance_usd),
          issue: "Negative balance detected",
        })
      }
    }
    
    const result: ReconciliationResult = {
      totalDatabaseBalance: dbTotal,
      totalOnChainBalance: onChainBalance,
      difference,
      status,
      discrepancies,
      accountCount: accounts.length,
      timestamp: new Date().toISOString(),
    }
    
    // Log to database
    await supabase.from("reconciliation_records").insert({
      total_database_balance: dbTotal,
      total_onchain_balance: onChainBalance,
      difference,
      status,
      discrepancies: discrepancies.length > 0 ? discrepancies : null,
      notes: `Pending withdrawals: $${pendingWithdrawals.toFixed(2)}. Expected on-chain: $${expectedOnChainBalance.toFixed(2)}`,
      run_by: runBy,
    })
    
    return result
  } catch (error) {
    console.error("[Reconciliation] Error:", error)
    
    const errorResult: ReconciliationResult = {
      totalDatabaseBalance: 0,
      totalOnChainBalance: 0,
      difference: 0,
      status: "error",
      discrepancies: [{ wallet: "system", databaseBalance: 0, issue: error instanceof Error ? error.message : "Unknown error" }],
      accountCount: 0,
      timestamp: new Date().toISOString(),
    }
    
    if (supabase) {
      await supabase.from("reconciliation_records").insert({
        total_database_balance: 0,
        total_onchain_balance: 0,
        difference: 0,
        status: "error",
        notes: error instanceof Error ? error.message : "Unknown error",
        run_by: runBy,
      })
    }
    
    return errorResult
  }
}

/**
 * Get reconciliation history
 */
export async function getReconciliationHistory(limit: number = 50): Promise<any[]> {
  if (!supabase) throw new Error("Supabase not configured")

  const { data, error } = await supabase
    .from("reconciliation_records")
    .select("*")
    .order("run_at", { ascending: false })
    .limit(limit)

  if (error) throw new Error(`Failed to get reconciliation history: ${error.message}`)
  return data || []
}

