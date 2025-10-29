import { type NextRequest, NextResponse } from "next/server"
import { withX402ProtectionV2 } from "@/lib/x402-middleware-v2"
import { getValidatorInfo } from "@/lib/solana-client"

export async function GET(request: NextRequest) {
  return withX402ProtectionV2(
    request,
    async (req) => {
      const { searchParams } = new URL(req.url)
      const voteAccount = searchParams.get("vote_account")

      if (!voteAccount) {
        return NextResponse.json({ error: "Vote account parameter required" }, { status: 400 })
      }

      try {
        const validator = await getValidatorInfo(voteAccount)

        if (!validator) {
          return NextResponse.json({ error: "Validator not found" }, { status: 404 })
        }

        return NextResponse.json({
          success: true,
          data: {
            votePubkey: validator.votePubkey,
            nodePubkey: validator.nodePubkey,
            activatedStake: validator.activatedStake,
            commission: validator.commission,
            lastVote: validator.lastVote,
            rootSlot: validator.rootSlot,
            timestamp: new Date().toISOString(),
          },
        })
      } catch (error) {
        return NextResponse.json(
          {
            error: "Failed to fetch validator info",
            message: error instanceof Error ? error.message : "Unknown error",
          },
          { status: 500 },
        )
      }
    },
    "/api/solana/validator",
  )
}
