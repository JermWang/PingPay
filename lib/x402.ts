import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { PAYMENT_RECEIVER_ADDRESS, QUOTE_EXPIRY_SECONDS, SOLANA_RPC_URL, USDC_MINT_ADDRESS } from "./constants"
import type { Quote, X402Response } from "./types"

// USDC decimals on Solana
const USDC_DECIMALS = 6

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

    // Connect to Solana RPC
    const connection = new Connection(SOLANA_RPC_URL, "confirmed")
    
    console.log("[x402] Verifying transaction:", {
      signature: transactionSignature,
      expectedAmountUsd,
      expectedRecipient,
      rpcUrl: SOLANA_RPC_URL,
    })

    // Fetch transaction details
    const transaction = await connection.getTransaction(transactionSignature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    })

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
    
    if (!transferFound) {
      console.error("[x402] No USDC transfer found to recipient")
      return false
    }
    
    // Verify amount (allow 1% tolerance for rounding)
    const tolerance = Math.max(1, Math.floor(expectedLamports * 0.01))
    const amountDiff = Math.abs(transferAmount - expectedLamports)
    
    if (amountDiff > tolerance) {
      console.error("[x402] Transfer amount mismatch:", {
        expected: expectedLamports,
        actual: transferAmount,
        diff: amountDiff,
        tolerance,
      })
      return false
    }
    
    console.log("[x402] Transaction verified successfully:", {
      signature: transactionSignature,
      amount: transferAmount,
      expectedAmount: expectedLamports,
    })
    
    return true
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
