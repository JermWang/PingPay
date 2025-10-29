import { type NextRequest, NextResponse } from "next/server"
import { PAYMENT_RECEIVER_ADDRESS } from "@/lib/constants"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { wallet, amount } = body

    if (!wallet) {
      return NextResponse.json(
        { error: "Wallet address required" },
        { status: 400 }
      )
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Valid amount required" },
        { status: 400 }
      )
    }

    // Generate deposit details
    const depositId = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes

    return NextResponse.json({
      success: true,
      data: {
        deposit_id: depositId,
        amount_usd: amount,
        recipient_address: PAYMENT_RECEIVER_ADDRESS,
        expires_at: expiresAt.toISOString(),
        instructions: [
          "Open your Solana wallet (Phantom, Solflare, etc.)",
          "Send the exact amount in USDC to the recipient address",
          "Copy the transaction signature",
          "Submit the signature for verification",
        ],
      },
    })
  } catch (error) {
    console.error("[Deposit] Error:", error)
    return NextResponse.json(
      {
        error: "Failed to initiate deposit",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

