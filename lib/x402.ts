import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { PAYMENT_RECEIVER_ADDRESS, QUOTE_EXPIRY_SECONDS, SOLANA_RPC_URL, USDC_MINT_ADDRESS } from "./constants"
import type { Quote, X402Response } from "./types"

// USDC decimals on Solana
const USDC_DECIMALS = 6

async function fetchSolUsdPrice(): Promise<number> {
  const res = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd",
    { next: { revalidate: 15 } }
  )
  if (!res.ok) throw new Error("Failed to fetch SOL price")
  const data = await res.json()
  const price = data?.solana?.usd
  if (!price) throw new Error("Invalid SOL price data")
  return Number(price)
}

/**
 * Generate a payment quote for an API request
 */
export async function generateQuote(serviceId: string, amountUsd: number): Promise<Quote> {
  const expiresAt = new Date(Date.now() + QUOTE_EXPIRY_SECONDS * 1000)

  // In production, this would insert into Supabase
  const quote: Quote = {
    id: crypto.randomUUID(),
    service_id: serviceId,
    amount_usd: amountUsd,
    solana_address: PAYMENT_RECEIVER_ADDRESS,
    expires_at: expiresAt.toISOString(),
    created_at: new Date().toISOString(),
  }

  return quote
}

/**
 * Create a 402 Payment Required response
 */
export function create402Response(quote: Quote): Response {
  const body: X402Response = {
    error: "Payment required",
    quote_id: quote.id,
    amount_usd: quote.amount_usd,
    solana_address: quote.solana_address,
    expires_at: quote.expires_at,
  }

  return new Response(JSON.stringify(body, null, 2), {
    status: 402,
    headers: {
      "Content-Type": "application/json",
      "X-Payment-Required": "true",
      "X-Quote-Id": quote.id,
      "X-Amount-USD": quote.amount_usd.toString(),
      "X-Solana-Address": quote.solana_address,
      "X-Expires-At": quote.expires_at,
    },
  })
}

/**
 * Verify a Solana transaction signature
 * This is a REAL implementation that checks on-chain data
 */
export async function verifyTransaction(
  transactionSignature: string,
  expectedAmountUsd: number,
  expectedRecipient: string,
): Promise<boolean> {
  try {
    // Validate signature format
    if (!transactionSignature || transactionSignature.length < 32) {
      console.error("[x402] Invalid transaction signature format")
      return false
    }

    // Try multiple RPCs for reliability (env first)
    const rpcCandidates = Array.from(new Set([
      SOLANA_RPC_URL,
      "https://api.mainnet-beta.solana.com",
      "https://rpc.ankr.com/solana",
      "https://solana-api.projectserum.com",
    ])).filter(Boolean)

    let connection: Connection | null = null
    let usedRpc = ""
    for (const rpcUrl of rpcCandidates) {
      try {
        const conn = new Connection(rpcUrl, "confirmed")
        await conn.getLatestBlockhash("confirmed")
        connection = conn
        usedRpc = rpcUrl
        break
      } catch {
        continue
      }
    }
    if (!connection) {
      console.error("[x402] No working RPC endpoint found")
      return false
    }
    
    console.log("[x402] Verifying transaction:", {
      signature: transactionSignature,
      expectedAmountUsd,
      expectedRecipient,
      rpcUrl: usedRpc,
    })

    // Fetch transaction details
    let transaction = await connection.getTransaction(transactionSignature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    })
    if (!transaction) {
      // Try again at higher commitment
      transaction = await connection.getTransaction(transactionSignature, {
        commitment: "finalized",
        maxSupportedTransactionVersion: 0,
      })
    }

    if (!transaction) {
      console.error("[x402] Transaction not found on-chain")
      return false
    }

    // Check if transaction was successful
    if (transaction.meta?.err) {
      console.error("[x402] Transaction failed on-chain:", transaction.meta.err)
      return false
    }

    // Parse transaction to find USDC transfer
    const recipientPubkey = new PublicKey(expectedRecipient)
    const usdcMintPubkey = new PublicKey(USDC_MINT_ADDRESS)
    
    // Convert USD amount to USDC lamports (USDC has 6 decimals)
    const expectedLamports = Math.floor(expectedAmountUsd * Math.pow(10, USDC_DECIMALS))
    
    // Check pre and post token balances to verify USDC transfer
    const preBalances = transaction.meta?.preTokenBalances || []
    const postBalances = transaction.meta?.postTokenBalances || []
    
    // Find USDC transfers to the recipient
    let transferFound = false
    let transferAmount = 0
    
    for (const postBalance of postBalances) {
      const preBalance = preBalances.find(
        (pb) => pb.accountIndex === postBalance.accountIndex
      )
      
      if (
        postBalance.mint === usdcMintPubkey.toBase58() &&
        postBalance.owner === recipientPubkey.toBase58()
      ) {
        const preAmount = Number(preBalance?.uiTokenAmount.amount || 0)
        const postAmount = Number(postBalance.uiTokenAmount.amount || 0)
        const amountTransferred = postAmount - preAmount
        
        if (amountTransferred > 0) {
          transferFound = true
          transferAmount = amountTransferred
          break
        }
      }
    }
    
    if (transferFound) {
      // Verify amount (allow 1% tolerance for rounding)
      const tolerance = Math.max(1, Math.floor(expectedLamports * 0.01))
      const amountDiff = Math.abs(transferAmount - expectedLamports)
      
      if (amountDiff > tolerance) {
        console.error("[x402] USDC amount mismatch:", {
          expected: expectedLamports,
          actual: transferAmount,
          diff: amountDiff,
          tolerance,
        })
      } else {
        console.log("[x402] USDC transaction verified successfully:", {
          signature: transactionSignature,
          amount: transferAmount,
          expectedAmount: expectedLamports,
        })
        return true
      }
    }

    // Fallback: verify native SOL transfer to recipient
    try {
      // Robust extraction of account keys across legacy and v0
      const txAny: any = transaction.transaction
      const legacyKeys: any[] = txAny?.message?.accountKeys || []
      const v0Keys: any[] = txAny?.message?.staticAccountKeys || []
      let accountKeys: string[] = []
      if (legacyKeys.length) {
        accountKeys = legacyKeys.map((k: any) => (k?.toBase58?.() || k?.pubkey?.toBase58?.() || String(k)))
      } else if (v0Keys.length) {
        accountKeys = v0Keys.map((k: any) => (k?.toBase58?.() || k?.pubkey?.toBase58?.() || String(k)))
      } else if (typeof txAny?.message?.getAccountKeys === "function") {
        try {
          const ak = txAny.message.getAccountKeys({ allowLookup: true })
          const statics: any[] = ak?.staticAccountKeys || []
          accountKeys = statics.map((k: any) => (k?.toBase58?.() || String(k)))
        } catch {}
      }

      const recipientIndex = accountKeys.findIndex((k) => k === recipientPubkey.toBase58())
      if (recipientIndex === -1) {
        console.error("[x402] Recipient account not found in transaction account keys (SOL path)")
        return false
      }

      const preLamports = transaction.meta?.preBalances?.[recipientIndex] ?? 0
      const postLamports = transaction.meta?.postBalances?.[recipientIndex] ?? 0
      const lamportsReceived = postLamports - preLamports

      if (lamportsReceived <= 0) {
        console.error("[x402] No SOL received by recipient in this transaction")
        return false
      }

      const solUsd = await fetchSolUsdPrice()
      const expectedSolLamports = Math.floor((expectedAmountUsd / solUsd) * LAMPORTS_PER_SOL)
      // Allow 2% tolerance or minimum 5k lamports (~0.000005 SOL)
      const solTolerance = Math.max(5000, Math.floor(expectedSolLamports * 0.02))
      const solDiff = Math.abs(lamportsReceived - expectedSolLamports)

      if (solDiff > solTolerance) {
        console.error("[x402] SOL amount mismatch:", {
          expected: expectedSolLamports,
          actual: lamportsReceived,
          diff: solDiff,
          tolerance: solTolerance,
          solUsd,
        })
        return false
      }

      console.log("[x402] SOL transaction verified successfully:", {
        signature: transactionSignature,
        amountLamports: lamportsReceived,
        expectedLamports: expectedSolLamports,
        solUsd,
      })
      return true
    } catch (e) {
      console.error("[x402] SOL verification path failed:", e)
      return false
    }
  } catch (error) {
    console.error("[x402] Transaction verification failed:", error)
    return false
  }
}

/**
 * Check if a quote is still valid
 */
export function isQuoteValid(quote: Quote): boolean {
  const now = new Date()
  const expiresAt = new Date(quote.expires_at)
  return now < expiresAt
}

/**
 * Extract transaction signature from request headers
 */
export function getTransactionSignature(request: Request): string | null {
  return request.headers.get("X-Transaction-Signature") || request.headers.get("X-Solana-Signature") || null
}

/**
 * Extract quote ID from request headers
 */
export function getQuoteId(request: Request): string | null {
  return request.headers.get("X-Quote-Id") || null
}
