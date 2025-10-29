import { type NextRequest, NextResponse } from "next/server"
import { withX402ProtectionV2 } from "@/lib/x402-middleware-v2"
import { getAccountInfo } from "@/lib/solana-client"

export async function GET(request: NextRequest) {
  return withX402ProtectionV2(
    request,
    async (req) => {
      const { searchParams } = new URL(req.url)
      const mint = searchParams.get("mint")

      if (!mint) {
        return NextResponse.json({ error: "Mint address parameter required" }, { status: 400 })
      }

      try {
        const accountInfo = await getAccountInfo(mint)

        // In production, fetch metadata from Metaplex
        // This is a simplified response
        return NextResponse.json({
          success: true,
          data: {
            mint,
            owner: accountInfo?.owner || null,
            metadata: {
              name: "NFT Metadata",
              symbol: "NFT",
              description: "Detailed NFT metadata would be fetched from Metaplex",
            },
            timestamp: new Date().toISOString(),
          },
        })
      } catch (error) {
        return NextResponse.json(
          {
            error: "Failed to fetch NFT metadata",
            message: error instanceof Error ? error.message : "Unknown error",
          },
          { status: 500 },
        )
      }
    },
    "/api/solana/nft",
  )
}
