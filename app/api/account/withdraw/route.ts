import { type NextRequest, NextResponse } from "next/server"
import { requestWithdrawal, getWithdrawalRequests } from "@/lib/balance-manager"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { wallet, amount, recipient_address } = body

    if (!wallet || !amount || !recipient_address) {
      return NextResponse.json(
        { error: "Missing required fields: wallet, amount, recipient_address" },
        { status: 400 }
      )
    }

    if (amount < 10) {
      return NextResponse.json(
        { error: "Minimum withdrawal amount is $10" },
        { status: 400 }
      )
    }

    const withdrawalRequest = await requestWithdrawal(wallet, amount, recipient_address)

    return NextResponse.json({
      success: true,
      message: "Withdrawal request created. Funds will be sent within 24-48 hours.",
      data: withdrawalRequest,
    })
  } catch (error) {
    console.error("[Withdraw] Error:", error)
    return NextResponse.json(
      {
        error: "Failed to create withdrawal request",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const wallet = searchParams.get("wallet")

    if (!wallet) {
      return NextResponse.json(
        { error: "Wallet address required" },
        { status: 400 }
      )
    }

    const requests = await getWithdrawalRequests(wallet)

    return NextResponse.json({
      success: true,
      data: requests,
    })
  } catch (error) {
    console.error("[Withdraw] Error:", error)
    return NextResponse.json(
      {
        error: "Failed to get withdrawal requests",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

