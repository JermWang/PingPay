import { type NextRequest, NextResponse } from "next/server"
import { getUserAccount } from "@/lib/balance-manager"

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

    const account = await getUserAccount(walletAddress)

    return NextResponse.json({
      success: true,
      data: account,
    })
  } catch (error) {
    console.error("[Account Balance] Error:", error)
    return NextResponse.json(
      {
        error: "Failed to get account balance",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

