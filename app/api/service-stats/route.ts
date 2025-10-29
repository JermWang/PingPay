import { NextRequest, NextResponse } from "next/server"
import * as SupabaseClient from "@/lib/supabase-client"
import { uuidSchema } from "@/lib/validations"

// GET: Fetch statistics for a service
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get("serviceId")

    if (!serviceId) {
      return NextResponse.json({ error: "Service ID is required" }, { status: 400 })
    }

    // Require a valid UUID in production
    const isUuid = uuidSchema.safeParse(serviceId).success
    if (!isUuid) {
      return NextResponse.json({ error: "Invalid service ID format (UUID required)" }, { status: 400 })
    }

    const stats = await SupabaseClient.getServiceStats(serviceId)

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("[Service Stats] GET Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch service stats" },
      { status: 500 }
    )
  }
}

