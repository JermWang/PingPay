import { type NextRequest, NextResponse } from "next/server"
import { runReconciliation, getReconciliationHistory } from "@/lib/reconciliation"

// Run reconciliation check
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { run_by } = body

    const result = await runReconciliation(run_by || "system")

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("[Reconciliation] Error:", error)
    return NextResponse.json(
      {
        error: "Failed to run reconciliation",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

// Get reconciliation history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "50")

    const history = await getReconciliationHistory(limit)

    return NextResponse.json({
      success: true,
      data: history,
    })
  } catch (error) {
    console.error("[Reconciliation History] Error:", error)
    return NextResponse.json(
      {
        error: "Failed to get reconciliation history",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

