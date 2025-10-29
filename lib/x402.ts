import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token"
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

async function verifyWithHelius(
  signature: string,
  expectedAmountUsd: number,
  expectedRecipient: string
): Promise<boolean> {
  const apiKey = process.env.HELIUS_API_KEY || process.env.NEXT_PUBLIC_HELIUS_API_KEY
  if (!apiKey) return false
  try {
    const url = `https://api.helius.xyz/v0/transactions/?api-key=${apiKey}`
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactions: [signature] })
    })
    if (!res.ok) return false
    const data = await res.json()
    const tx = Array.isArray(data) ? data[0] : null
    if (!tx) return false

    // Check USDC token transfers first
    const usdcMint = USDC_MINT_ADDRESS
    const tokenTransfers: any[] = tx?.tokenTransfers || []
    for (const t of tokenTransfers) {
      const isUsdc = (t.mint || t.mintAddress) === usdcMint
      const toUser = t.toUserAccount || t.to || t.toTokenAccountOwner
      const rawAmount = Number(t.tokenAmount || t.amount || 0)
      if (isUsdc && toUser === expectedRecipient && rawAmount > 0) {
        // tokenAmount is usually in units (not decimals), but some schemas use raw amount.
        // Treat it as 6-decimal units when value is small
        const expected = Math.floor(expectedAmountUsd * 1_000_000)
        const diff = Math.abs(rawAmount - expected)
        const tol = Math.max(1, Math.floor(expected * 0.02))
        if (diff <= tol) return true
      }
    }

    // Fallback: check native SOL transfers
    const nativeTransfers: any[] = tx?.nativeTransfers || []
    if (nativeTransfers?.length) {
      const toRecipient = nativeTransfers.find((n: any) => (n.toUserAccount === expectedRecipient) && Number(n.amount || 0) > 0)
      if (toRecipient) {
        const solUsd = await fetchSolUsdPrice()
        const expectedLamports = Math.floor((expectedAmountUsd / solUsd) * LAMPORTS_PER_SOL)
        const diff = Math.abs(Number(toRecipient.amount) - expectedLamports)
        const tol = Math.max(5000, Math.floor(expectedLamports * 0.02))
        if (diff <= tol) return true
      }
    }

    return false
  } catch (e) {
    console.error("[x402] Helius verification failed:", e)
    return false
  }
}

/**
 * Generate a payment quote for an API request
 * Now properly derives USDC ATA for USDC payments
 */
export async function generateQuote(serviceId: string, amountUsd: number, paymentToken: 'USDC' | 'SOL' = 'USDC'): Promise<Quote> {
  const expiresAt = new Date(Date.now() + QUOTE_EXPIRY_SECONDS * 1000)
  
  // Derive the correct payment address based on token type
  let paymentAddress = PAYMENT_RECEIVER_ADDRESS
  
  if (paymentToken === 'USDC') {
    // For USDC, derive the ATA from the receiver's wallet address synchronously
    try {
      const receiverPubkey = new PublicKey(PAYMENT_RECEIVER_ADDRESS)
      const usdcMintPubkey = new PublicKey(USDC_MINT_ADDRESS)
      // getAssociatedTokenAddress is sync when no fetching needed
      const usdcAta = getAssociatedTokenAddress(
        usdcMintPubkey,
        receiverPubkey,
        false, // allowOwnerOffCurve
        TOKEN_PROGRAM_ID
      )
      paymentAddress = (await usdcAta).toBase58()
      console.log('[x402] Generated USDC ATA for receiver wallet', PAYMENT_RECEIVER_ADDRESS, ':', paymentAddress)
    } catch (err) {
      console.error('[x402] Failed to derive USDC ATA, using wallet address:', err)
    }
  } else {
    console.log('[x402] Using wallet address for SOL payment:', paymentAddress)
  }

  const quote: Quote = {
    id: crypto.randomUUID(),
    service_id: serviceId,
    amount_usd: amountUsd,
    solana_address: paymentAddress,
    payment_token: paymentToken,
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
      // x402 metadata headers
      "X-402-Version": "1",
      "X-402-Supported": "signature,wallet,apikey",
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
  console.log("[x402] ======== VERIFICATION START ========")
  console.log("[x402] Signature:", transactionSignature)
  console.log("[x402] Expected Amount USD:", expectedAmountUsd)
  console.log("[x402] Expected Recipient:", expectedRecipient)
  
  try {
    // Validate signature format
    if (!transactionSignature || transactionSignature.length < 32) {
      console.error("[x402] ❌ Invalid transaction signature format")
      return false
    }

    // Try multiple RPCs for reliability (env first)
    const rpcCandidates = Array.from(new Set([
      SOLANA_RPC_URL,
      "https://api.mainnet-beta.solana.com",
      "https://rpc.ankr.com/solana",
      "https://solana-api.projectserum.com",
    ])).filter(Boolean)

    console.log("[x402] Trying RPC endpoints:", rpcCandidates.length)

    let connection: Connection | null = null
    let usedRpc = ""
    for (const rpcUrl of rpcCandidates) {
      try {
        const conn = new Connection(rpcUrl, "confirmed")
        await conn.getLatestBlockhash("confirmed")
        connection = conn
        usedRpc = rpcUrl
        console.log("[x402] ✅ Connected to RPC:", usedRpc)
        break
      } catch (err) {
        console.log("[x402] ❌ RPC failed:", rpcUrl, err)
        continue
      }
    }
    if (!connection) {
      console.error("[x402] ❌ No working RPC endpoint found")
      return false
    }

    // Fetch transaction details
    console.log("[x402] Fetching transaction from chain...")
    let transaction = await connection.getTransaction(transactionSignature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    })
    if (!transaction) {
      console.log("[x402] Not found at 'confirmed', trying 'finalized'...")
      // Try again at higher commitment
      transaction = await connection.getTransaction(transactionSignature, {
        commitment: "finalized",
        maxSupportedTransactionVersion: 0,
      })
    }

    if (!transaction) {
      console.error("[x402] ❌ Transaction not found on-chain")
      return false
    }

    console.log("[x402] ✅ Transaction found on-chain")

    // Check if transaction was successful
    if (transaction.meta?.err) {
      console.error("[x402] ❌ Transaction failed on-chain:", transaction.meta.err)
      return false
    }

    console.log("[x402] ✅ Transaction succeeded on-chain")

    // Parse transaction to find USDC transfer
    console.log("[x402] Checking for USDC transfer...")
    console.log("[x402] Expected recipient (could be wallet or ATA):", expectedRecipient)
    
    const recipientPubkey = new PublicKey(expectedRecipient)
    const usdcMintPubkey = new PublicKey(USDC_MINT_ADDRESS)
    
    // Convert USD amount to USDC lamports (USDC has 6 decimals)
    const expectedLamports = Math.floor(expectedAmountUsd * Math.pow(10, USDC_DECIMALS))
    console.log("[x402] Expected USDC lamports:", expectedLamports)
    
    // Check pre and post token balances to verify USDC transfer
    const preBalances = transaction.meta?.preTokenBalances || []
    const postBalances = transaction.meta?.postTokenBalances || []
    console.log("[x402] Token balances - pre:", preBalances.length, "post:", postBalances.length)

    // Build account key list to resolve token account addresses for balances
    const txAny: any = transaction.transaction
    const legacyKeys: any[] = txAny?.message?.accountKeys || []
    const v0Keys: any[] = txAny?.message?.staticAccountKeys || []
    let accountKeysResolved: string[] = []
    if (legacyKeys.length) {
      accountKeysResolved = legacyKeys.map((k: any) => (k?.toBase58?.() || k?.pubkey?.toBase58?.() || String(k)))
    } else if (v0Keys.length) {
      accountKeysResolved = v0Keys.map((k: any) => (k?.toBase58?.() || k?.pubkey?.toBase58?.() || String(k)))
    } else if (typeof txAny?.message?.getAccountKeys === "function") {
      try {
        const ak = txAny.message.getAccountKeys({ allowLookup: true })
        const statics: any[] = ak?.staticAccountKeys || []
        accountKeysResolved = statics.map((k: any) => (k?.toBase58?.() || String(k)))
      } catch {}
    }
    console.log("[x402] Account keys resolved:", accountKeysResolved.length)
    console.log("[x402] Account keys:", accountKeysResolved)
    
    // Find USDC transfers to the recipient
    let transferFound = false
    let transferAmount = 0
    
    for (const postBalance of postBalances) {
      const preBalance = preBalances.find(
        (pb) => pb.accountIndex === postBalance.accountIndex
      )
      
      const tokenAccountAddress = accountKeysResolved[postBalance.accountIndex]
      
      console.log("[x402] Checking token balance:", {
        mint: postBalance.mint,
        owner: postBalance.owner,
        accountIndex: postBalance.accountIndex,
        tokenAccount: tokenAccountAddress
      })
      
      // Check if this is a USDC token account
      const isUsdcMint = postBalance.mint === usdcMintPubkey.toBase58()
      
      if (isUsdcMint) {
        // Match if:
        // 1. The token account address itself matches expected recipient (ATA case)
        // 2. OR the owner of the token account matches expected recipient (wallet case)
        const matchesRecipient = 
          tokenAccountAddress === expectedRecipient ||
          postBalance.owner === expectedRecipient
        
        console.log("[x402] USDC token found - matches recipient?", matchesRecipient, {
          tokenAccount: tokenAccountAddress,
          owner: postBalance.owner,
          expectedRecipient
        })
        
        if (matchesRecipient) {
          const preAmount = Number(preBalance?.uiTokenAmount.amount || 0)
          const postAmount = Number(postBalance.uiTokenAmount.amount || 0)
          const amountTransferred = postAmount - preAmount
          
          console.log("[x402] USDC transfer candidate found:", {
            preAmount,
            postAmount,
            amountTransferred
          })
          
          if (amountTransferred > 0) {
            transferFound = true
            transferAmount = amountTransferred
            break
          }
        }
      }
    }
    
    if (transferFound) {
      // Verify amount (allow 1% tolerance for rounding)
      const tolerance = Math.max(1, Math.floor(expectedLamports * 0.01))
      const amountDiff = Math.abs(transferAmount - expectedLamports)
      
      if (amountDiff > tolerance) {
        console.error("[x402] ❌ USDC amount mismatch:", {
          expected: expectedLamports,
          actual: transferAmount,
          diff: amountDiff,
          tolerance,
        })
      } else {
        console.log("[x402] ✅✅✅ USDC transaction verified successfully!")
        console.log("[x402] Amount:", transferAmount, "Expected:", expectedLamports)
        console.log("[x402] ======== VERIFICATION END (SUCCESS) ========")
        return true
      }
    } else {
      console.log("[x402] No USDC transfer found, checking SOL fallback...")
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

      console.log("[x402] SOL verification - account keys:", accountKeys.length)
      const recipientIndex = accountKeys.findIndex((k) => k === recipientPubkey.toBase58())
      if (recipientIndex === -1) {
        console.error("[x402] ❌ Recipient account not found in transaction account keys (SOL path)")
        console.log("[x402] Looking for:", recipientPubkey.toBase58())
        console.log("[x402] ======== VERIFICATION END (FAILED) ========")
        return false
      }

      console.log("[x402] SOL recipient found at index:", recipientIndex)
      const preLamports = transaction.meta?.preBalances?.[recipientIndex] ?? 0
      const postLamports = transaction.meta?.postBalances?.[recipientIndex] ?? 0
      const lamportsReceived = postLamports - preLamports

      console.log("[x402] SOL balance change:", {
        pre: preLamports,
        post: postLamports,
        received: lamportsReceived
      })

      if (lamportsReceived <= 0) {
        console.error("[x402] ❌ No SOL received by recipient in this transaction")
        console.log("[x402] ======== VERIFICATION END (FAILED) ========")
        return false
      }

      console.log("[x402] Fetching live SOL price...")
      const solUsd = await fetchSolUsdPrice()
      console.log("[x402] Live SOL price: $", solUsd)
      
      const expectedSolLamports = Math.floor((expectedAmountUsd / solUsd) * LAMPORTS_PER_SOL)
      // Allow 2% tolerance or minimum 5k lamports (~0.000005 SOL)
      const solTolerance = Math.max(5000, Math.floor(expectedSolLamports * 0.02))
      const solDiff = Math.abs(lamportsReceived - expectedSolLamports)

      console.log("[x402] SOL amount check:", {
        expected: expectedSolLamports,
        actual: lamportsReceived,
        diff: solDiff,
        tolerance: solTolerance
      })

      if (solDiff > solTolerance) {
        console.error("[x402] ❌ SOL amount mismatch - outside tolerance")
        console.log("[x402] ======== VERIFICATION END (FAILED) ========")
        return false
      }

      console.log("[x402] ✅✅✅ SOL transaction verified successfully!")
      console.log("[x402] ======== VERIFICATION END (SUCCESS) ========")
      return true
    } catch (e) {
      console.error("[x402] ❌ SOL verification path failed:", e)
      console.log("[x402] ======== VERIFICATION END (FAILED) ========")
      // Continue to Helius fallback
    }

    // FINAL FALLBACK: verify via Helius Enhanced Transactions API
    console.log("[x402] Attempting Helius verification fallback...")
    const heliusOk = await verifyWithHelius(transactionSignature, expectedAmountUsd, expectedRecipient)
    if (heliusOk) {
      console.log("[x402] ✅✅✅ Helius verification succeeded")
      console.log("[x402] ======== VERIFICATION END (SUCCESS) ========")
      return true
    }

    console.log("[x402] ❌ All verification paths failed")
    return false
  } catch (error) {
    console.error("[x402] ❌ Transaction verification failed:", error)
    console.log("[x402] ======== VERIFICATION END (FAILED) ========")
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
