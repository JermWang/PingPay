import { type NextRequest, NextResponse } from "next/server"
import { depositFunds } from "@/lib/balance-manager"
import { verifyTransaction } from "@/lib/x402"
import { PAYMENT_RECEIVER_ADDRESS } from "@/lib/constants"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { wallet, amount, transaction_signature } = body

    if (!wallet || !amount || !transaction_signature) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Verify the transaction on Solana
    const isValid = await verifyTransaction(
      transaction_signature,
      amount,
      PAYMENT_RECEIVER_ADDRESS
    )

    if (!isValid) {
      return NextResponse.json(
        { error: "Transaction verification failed" },
        { status: 400 }
      )
    }

    // Add funds to user account
    const account = await depositFunds(
      wallet,
      amount,
      transaction_signature,
      `Deposit of $${amount} USDC`
    )

    return NextResponse.json({
      success: true,
      message: "Deposit verified and added to your account",
      data: account,
    })
  } catch (error) {
    console.error("[Deposit Verify] Error:", error)
    return NextResponse.json(
      {
        error: "Failed to verify deposit",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

