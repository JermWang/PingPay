import { type NextRequest, NextResponse } from "next/server"
import { getAccountTransactions } from "@/lib/balance-manager"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get("wallet")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address required" },
        { status: 400 }
      )
    }

    const transactions = await getAccountTransactions(walletAddress, limit, offset)

    return NextResponse.json({
      success: true,
      data: transactions,
      pagination: {
        limit,
        offset,
        count: transactions.length,
      },
    })
  } catch (error) {
    console.error("[Account Transactions] Error:", error)
    return NextResponse.json(
      {
        error: "Failed to get transactions",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

