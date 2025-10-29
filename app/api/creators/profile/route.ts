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

