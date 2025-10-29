import { type NextRequest, NextResponse } from "next/server"
import {
  generateQuote,
  create402Response,
  verifyTransaction,
  getTransactionSignature,
  getQuoteId,
  isQuoteValid,
} from "./x402"
import * as SupabaseClient from "./supabase-client"
import { PAYMENT_RECEIVER_ADDRESS } from "./constants"
import { validateApiKey } from "./api-key-manager"
import { getUserAccount, deductBalance, hasBalance } from "./balance-manager"
import { trackCreatorEarning } from "./creator-payouts"

const db = SupabaseClient

/**
 * Enhanced x402 middleware with dual authentication:
 * 1. API Key (for prepaid users)
 * 2. x402 (for one-off payments)
 */
export async function withX402ProtectionV2(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<Response>,
  endpoint: string,
) {
  try {
    // Get service details
    const service = await db.getService(endpoint)
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    // Check for API key in Authorization header
    const authHeader = request.headers.get("Authorization")
    if (authHeader?.startsWith("Bearer ")) {
      return await handleApiKeyAuth(request, handler, service, authHeader, endpoint)
    }

    // Fall back to x402 flow
    return await handleX402Auth(request, handler, service, endpoint)
  } catch (error) {
    console.error("[x402-v2] Middleware error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

/**
 * Handle API key authentication flow
 */
async function handleApiKeyAuth(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<Response>,
  service: any,
  authHeader: string,
  endpoint: string
) {
  const apiKey = authHeader.replace("Bearer ", "").trim()

  // Validate API key
  const userWallet = await validateApiKey(apiKey)
  if (!userWallet) {
    return NextResponse.json(
      { error: "Invalid or inactive API key" },
      { status: 401 }
    )
  }

  // Get user account
  const userAccount = await getUserAccount(userWallet)

  // Check for free tier
  if (service.free_tier_limit && service.free_tier_limit > 0) {
    const hasFreeTier = await checkFreeTier(userWallet, service.id, service.free_tier_limit, service.free_tier_period)
    if (hasFreeTier) {
      // Use free tier
      const response = await handler(request)
      await db.logUsage(service.id, null, endpoint, response.status)
      await incrementFreeTierUsage(userWallet, service.id)
      return response
    }
  }

  // Check balance
  if (!await hasBalance(userWallet, service.price_usd)) {
    return NextResponse.json(
      {
        error: "Insufficient balance",
        balance: userAccount.balance_usd,
        required: service.price_usd
      },
      { status: 402 }
    )
  }

  // Execute request
  const response = await handler(request)

  // Only deduct if successful
  if (response.status >= 200 && response.status < 300) {
    try {
      // Deduct balance
      await deductBalance(
        userWallet,
        service.price_usd,
        service.id,
        undefined, // API key ID can be added if needed
        `API call: ${endpoint}`
      )

      // Track creator earning if service has a creator
      if (service.creator_id) {
        await trackCreatorEarning(service.creator_id, service.price_usd)
      }

      // Log usage
      await db.logUsage(service.id, null, endpoint, response.status)
    } catch (error) {
      console.error("[x402-v2] Failed to process payment:", error)
      // Still return the response, but log the error
    }
  }

  return response
}

/**
 * Handle x402 payment flow (original implementation)
 */
async function handleX402Auth(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<Response>,
  service: any,
  endpoint: string
) {
  // Check for transaction signature in headers
  const transactionSignature = getTransactionSignature(request)
  const quoteId = getQuoteId(request)

  // If no payment provided, return 402 with quote
  if (!transactionSignature || !quoteId) {
    const quote = await generateQuote(service.id, service.price_usd)
    await db.createQuote(quote)
    return create402Response(quote)
  }

  // Verify the quote exists and is valid
  const quote = await db.getQuote(quoteId)
  if (!quote) {
    return NextResponse.json({ error: "Invalid quote ID" }, { status: 400 })
  }

  if (!isQuoteValid(quote)) {
    return NextResponse.json({ error: "Quote expired" }, { status: 400 })
  }

  // Check if payment already exists
  let payment = await db.getPaymentBySignature(transactionSignature)

  if (!payment) {
    // Create new payment record
    payment = await db.createPayment({
      quote_id: quoteId,
      transaction_signature: transactionSignature,
      verified: false,
    })

    // Verify the transaction on Solana
    const isValid = await verifyTransaction(transactionSignature, quote.amount_usd, PAYMENT_RECEIVER_ADDRESS)

    if (!isValid) {
      await db.logUsage(service.id, payment.id, endpoint, 403)
      return NextResponse.json({ error: "Payment verification failed" }, { status: 403 })
    }

    // Mark payment as verified
    await db.updatePaymentVerification(payment.id, true)
  } else if (!payment.verified) {
    // Payment exists but not verified
    await db.logUsage(service.id, payment.id, endpoint, 403)
    return NextResponse.json({ error: "Payment not verified" }, { status: 403 })
  }

  // Payment verified, proceed with request
  const response = await handler(request)

  // Track creator earning if service has a creator
  if (service.creator_id && response.status >= 200 && response.status < 300) {
    try {
      await trackCreatorEarning(service.creator_id, quote.amount_usd)
    } catch (error) {
      console.error("[x402-v2] Failed to track creator earning:", error)
    }
  }

  // Log successful usage
  await db.logUsage(service.id, payment.id, endpoint, response.status)

  return response
}

/**
 * Check if user has free tier available
 */
async function checkFreeTier(
  userWallet: string,
  serviceId: string,
  limit: number,
  period: string = "daily"
): Promise<boolean> {
  const supabase = await import("@supabase/supabase-js").then(m => m.createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ))

  // Get or create free tier usage record
  const { data: usage } = await supabase
    .from("free_tier_usage")
    .select("*")
    .eq("user_wallet", userWallet)
    .eq("service_id", serviceId)
    .single()

  if (!usage) {
    // First time user, create record
    await supabase.from("free_tier_usage").insert({
      user_wallet: userWallet,
      service_id: serviceId,
      calls_used: 0,
      period_start: new Date().toISOString(),
    })
    return true
  }

  // Check if period has expired
  const periodStart = new Date(usage.period_start)
  const now = new Date()
  let periodExpired = false

  if (period === "daily") {
    periodExpired = now.getTime() - periodStart.getTime() > 24 * 60 * 60 * 1000
  } else if (period === "weekly") {
    periodExpired = now.getTime() - periodStart.getTime() > 7 * 24 * 60 * 60 * 1000
  } else if (period === "monthly") {
    periodExpired = now.getTime() - periodStart.getTime() > 30 * 24 * 60 * 60 * 1000
  }

  if (periodExpired) {
    // Reset the period
    await supabase
      .from("free_tier_usage")
      .update({
        calls_used: 0,
        period_start: now.toISOString(),
      })
      .eq("user_wallet", userWallet)
      .eq("service_id", serviceId)
    return true
  }

  // Check if under limit
  return usage.calls_used < limit
}

/**
 * Increment free tier usage
 */
async function incrementFreeTierUsage(userWallet: string, serviceId: string): Promise<void> {
  const supabase = await import("@supabase/supabase-js").then(m => m.createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ))

  const { data: usage } = await supabase
    .from("free_tier_usage")
    .select("*")
    .eq("user_wallet", userWallet)
    .eq("service_id", serviceId)
    .single()

  if (usage) {
    await supabase
      .from("free_tier_usage")
      .update({ calls_used: usage.calls_used + 1 })
      .eq("user_wallet", userWallet)
      .eq("service_id", serviceId)
  }
}

