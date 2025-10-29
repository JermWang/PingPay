import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/constants"
import { completeWithdrawal } from "@/lib/balance-manager"

const supabase = SUPABASE_URL && SUPABASE_ANON_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null

// Get all pending withdrawals (admin only)
export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 500 }
      )
    }

    const { data, error } = await supabase
      .from("user_withdrawal_requests")
      .select("*")
      .in("status", ["pending", "processing"])
      .order("requested_at", { ascending: true })

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: data || [],
    })
  } catch (error) {
    console.error("[Admin Withdrawals] Error:", error)
    return NextResponse.json(
      {
        error: "Failed to get withdrawal requests",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

// Complete a withdrawal (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { withdrawal_id, transaction_signature, processed_by } = body

    if (!withdrawal_id || !transaction_signature || !processed_by) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    await completeWithdrawal(withdrawal_id, transaction_signature, processed_by)

    return NextResponse.json({
      success: true,
      message: "Withdrawal marked as completed",
    })
  } catch (error) {
    console.error("[Admin Complete Withdrawal] Error:", error)
    return NextResponse.json(
      {
        error: "Failed to complete withdrawal",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

