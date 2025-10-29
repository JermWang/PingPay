import { type NextRequest, NextResponse } from "next/server"
import { requestWithdrawal, getWithdrawalRequests, getMinimumWithdrawal } from "@/lib/creator-payouts"
import { getCreator } from "@/lib/supabase-client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { wallet, amount } = body

    if (!wallet || !amount) {
      return NextResponse.json(
        { error: "Wallet address and amount required" },
        { status: 400 }
      )
    }

    // Get creator record
    const creator = await getCreator(wallet)
    if (!creator) {
      return NextResponse.json(
        { error: "Creator not found" },
        { status: 404 }
      )
    }

    // Request withdrawal
    const withdrawal = await requestWithdrawal(creator.id, wallet, amount)

    return NextResponse.json({
      success: true,
      message: `Withdrawal request submitted for $${amount}. It will be processed within 1-2 business days.`,
      data: withdrawal,
    })
  } catch (error) {
    console.error("[Withdrawal Request] Error:", error)
    return NextResponse.json(
      {
        error: "Failed to request withdrawal",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get("wallet")

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address required" },
        { status: 400 }
      )
    }

    // Get creator record
    const creator = await getCreator(walletAddress)
    if (!creator) {
      return NextResponse.json(
        { error: "Creator not found" },
        { status: 404 }
      )
    }

    // Get withdrawal history
    const withdrawals = await getWithdrawalRequests(creator.id)

    return NextResponse.json({
      success: true,
      data: {
        withdrawals,
        minimum_withdrawal: getMinimumWithdrawal(),
      },
    })
  } catch (error) {
    console.error("[Withdrawal History] Error:", error)
    return NextResponse.json(
      {
        error: "Failed to get withdrawal history",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

