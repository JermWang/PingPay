import { type NextRequest, NextResponse } from "next/server"
import { getCreatorEarnings } from "@/lib/creator-payouts"
import { getCreator } from "@/lib/supabase-client"

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

    // Get earnings
    const earnings = await getCreatorEarnings(creator.id)

    return NextResponse.json({
      success: true,
      data: earnings,
    })
  } catch (error) {
    console.error("[Creator Earnings] Error:", error)
    return NextResponse.json(
      {
        error: "Failed to get earnings",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

