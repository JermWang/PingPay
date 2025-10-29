import { NextRequest, NextResponse } from "next/server"
import { isUsingRealDatabase } from "@/lib/supabase-client"
import * as SupabaseClient from "@/lib/supabase-client"
import * as MockDatabase from "@/lib/supabase-mock"

// Use real database if configured, otherwise use mock
const db = isUsingRealDatabase ? SupabaseClient : MockDatabase

// GET: Fetch statistics for a service
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get("serviceId")

    if (!serviceId) {
      return NextResponse.json({ error: "Service ID is required" }, { status: 400 })
    }

    const stats = await db.getServiceStats(serviceId)

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("[Service Stats] GET Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch service stats" },
      { status: 500 }
    )
  }
}

