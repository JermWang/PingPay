import { type NextRequest, NextResponse } from "next/server"
import { withX402Protection } from "@/lib/x402-middleware"
import { getTokenAccounts } from "@/lib/solana-client"

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
        const tokenAccounts = await getTokenAccounts(address)

        const tokens = tokenAccounts.map((account) => ({
          mint: account.account.data.parsed.info.mint,
          amount: account.account.data.parsed.info.tokenAmount.uiAmount,
          decimals: account.account.data.parsed.info.tokenAmount.decimals,
        }))

        return NextResponse.json({
          success: true,
          data: {
            address,
            tokens,
            count: tokens.length,
            timestamp: new Date().toISOString(),
          },
        })
      } catch (error) {
        return NextResponse.json(
          {
            error: "Failed to fetch token accounts",
            message: error instanceof Error ? error.message : "Unknown error",
          },
          { status: 500 },
        )
      }
    },
    "/api/solana/tokens",
  )
}
