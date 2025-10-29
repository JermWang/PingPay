import { type NextRequest, NextResponse } from "next/server"
import { withX402Protection } from "@/lib/x402-middleware"
import { getSolanaBalance } from "@/lib/solana-client"

export async function GET(request: NextRequest) {
  return withX402Protection(
    request,
    async (req) => {
      const { searchParams } = new URL(req.url)
      const address = searchParams.get("address")

      if (!address) {
        return NextResponse.json({ error: "Address parameter required" }, { status: 400 })
      }

      try {
        const balance = await getSolanaBalance(address)

        return NextResponse.json({
          success: true,
          data: {
            address,
            balance,
            unit: "SOL",
            timestamp: new Date().toISOString(),
          },
        })
      } catch (error) {
        return NextResponse.json(
          {
            error: "Failed to fetch balance",
            message: error instanceof Error ? error.message : "Unknown error",
          },
          { status: 500 },
        )
      }
    },
    "/api/solana/balance",
  )
}
