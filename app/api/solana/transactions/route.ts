import { type NextRequest, NextResponse } from "next/server"
import { withX402Protection } from "@/lib/x402-middleware"
import { getTransactionHistory } from "@/lib/solana-client"

export async function GET(request: NextRequest) {
  return withX402Protection(
    request,
    async (req) => {
      const { searchParams } = new URL(req.url)
      const address = searchParams.get("address")
      const limit = Number.parseInt(searchParams.get("limit") || "10")

      if (!address) {
        return NextResponse.json({ error: "Address parameter required" }, { status: 400 })
      }

      try {
        const transactions = await getTransactionHistory(address, limit)

        return NextResponse.json({
          success: true,
          data: {
            address,
            transactions: transactions.map((tx) => ({
              signature: tx.signature,
              slot: tx.slot,
              blockTime: tx.blockTime,
              err: tx.err,
            })),
            count: transactions.length,
            timestamp: new Date().toISOString(),
          },
        })
      } catch (error) {
        return NextResponse.json(
          {
            error: "Failed to fetch transactions",
            message: error instanceof Error ? error.message : "Unknown error",
          },
          { status: 500 },
        )
      }
    },
    "/api/solana/transactions",
  )
}
