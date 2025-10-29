import { NextRequest, NextResponse } from "next/server"
import * as SupabaseClient from "@/lib/supabase-client"

// GET: List all services (public)
export async function GET(_request: NextRequest) {
  try {
    const services = await SupabaseClient.getAllServices()
    return NextResponse.json({ services })
  } catch (error) {
    console.error("[Services] GET Error:", error)
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 })
  }
}


