import { NextRequest, NextResponse} from "next/server"
import * as SupabaseClient from "@/lib/supabase-client"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const creatorId = searchParams.get("creatorId")

    if (!creatorId) {
      return NextResponse.json({ error: "Creator ID is required" }, { status: 400 })
    }

    const creator = await SupabaseClient.getCreatorById(creatorId)

    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 })
    }

    return NextResponse.json({ creator })
  } catch (error) {
    console.error("[Creator Profile] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch creator profile" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { creatorId, payout_wallet } = body || {}

    if (!creatorId || !payout_wallet) {
      return NextResponse.json({ error: "creatorId and payout_wallet are required" }, { status: 400 })
    }

    // Basic validation for Solana address length; let backend DB enforce further
    if (typeof payout_wallet !== 'string' || payout_wallet.length < 32 || payout_wallet.length > 64) {
      return NextResponse.json({ error: "Invalid wallet address format" }, { status: 400 })
    }

    // Fetch current creator
    const current = await SupabaseClient.getCreatorById(creatorId)
    if (!current) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 })
    }

    // If unchanged, return informational success (not an error)
    if ((current as any).payout_wallet === payout_wallet) {
      return NextResponse.json({ creator: current, message: "Payout wallet unchanged" })
    }

    const updated = await SupabaseClient.updateCreatorPayoutWallet(creatorId, payout_wallet)
    return NextResponse.json({ creator: updated, message: "Payout wallet saved" })
  } catch (error) {
    console.error("[Creator Profile] PATCH Error:", error)
    return NextResponse.json(
      { error: "Failed to update payout wallet" },
      { status: 500 }
    )
  }
}

