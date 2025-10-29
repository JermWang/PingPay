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

// Production: always use the real database
const db = SupabaseClient

/**
 * x402 middleware to protect API endpoints
 * Usage: Wrap your API handler with this middleware
 */
export async function withX402Protection(
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

    // Check for transaction signature in headers
    const transactionSignature = getTransactionSignature(request)
    const quoteId = getQuoteId(request)

    // If no payment provided, return 402 with quote
    if (!transactionSignature || !quoteId) {
      const quote = await generateQuote(service.id, service.price_usd)
      await db.createQuote(quote)
      return await create402Response(quote)
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

    // Log successful usage
    await db.logUsage(service.id, payment.id, endpoint, response.status)

    return response
  } catch (error) {
    console.error("[x402] Middleware error:", error)
    return NextResponse.json(
      { 
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
