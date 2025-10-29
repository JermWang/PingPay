import { type NextRequest, NextResponse } from "next/server"
import { cancelWithdrawal } from "@/lib/balance-manager"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    await cancelWithdrawal(id)

    return NextResponse.json({
      success: true,
      message: "Withdrawal cancelled and funds refunded to your balance",
    })
  } catch (error) {
    console.error("[Withdraw Cancel] Error:", error)
    return NextResponse.json(
      {
        error: "Failed to cancel withdrawal",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

