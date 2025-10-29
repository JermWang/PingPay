import { NextRequest, NextResponse } from "next/server"
import * as SupabaseClient from "@/lib/supabase-client"
import { creatorAuthSchema, validateSchema } from "@/lib/validations"
import { rateLimit } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  try {
    // Rate limit check
    const rateLimitResult = await rateLimit(request, "auth")
    if (!rateLimitResult.success) {
      return rateLimitResult.response
    }

    const body = await request.json()
    
    // Validate input
    const validation = validateSchema(creatorAuthSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: "Validation failed", details: validation.errors }, { status: 400 })
    }
    
    const { walletAddress } = validation.data

    // Get existing creator or create new one
    let creator = await SupabaseClient.getCreator(walletAddress)
    
    if (!creator) {
      creator = await SupabaseClient.createCreator({ wallet_address: walletAddress })
    }

    return NextResponse.json({ creator })
  } catch (error) {
    console.error("[Creator Auth] Error:", error)
    return NextResponse.json(
      { error: "Failed to authenticate creator" },
      { status: 500 }
    )
  }
}

