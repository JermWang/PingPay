import { NextRequest, NextResponse } from "next/server"
import * as SupabaseClient from "@/lib/supabase-client"
import { createServiceSchema, updateServiceSchema, deleteServiceSchema, validateSchema, uuidSchema } from "@/lib/validations"
import { rateLimit } from "@/lib/rate-limit"

// GET: Fetch creator's services
export async function GET(request: NextRequest) {
  try {
    // Rate limit check
    const rateLimitResult = await rateLimit(request, "read")
    if (!rateLimitResult.success) {
      return rateLimitResult.response
    }

    const { searchParams } = new URL(request.url)
    const creatorId = searchParams.get("creatorId")

    // Validate creator ID
    const validation = validateSchema(uuidSchema, creatorId)
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid creator ID", details: validation.errors }, { status: 400 })
    }

    const services = await SupabaseClient.getServicesByCreator(validation.data)

    return NextResponse.json({ services })
  } catch (error) {
    console.error("[Creator Services] GET Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    )
  }
}

// POST: Create new service
export async function POST(request: NextRequest) {
  try {
    // Rate limit check
    const rateLimitResult = await rateLimit(request, "create")
    if (!rateLimitResult.success) {
      return rateLimitResult.response
    }

    const body = await request.json()
    
    // Validate input
    const validation = validateSchema(createServiceSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: "Validation failed", details: validation.errors }, { status: 400 })
    }

    const { name, description, external_endpoint, price_usd, category, creator_id, free_tier_limit, free_tier_period } = validation.data

    // Generate internal endpoint path
    const endpoint = `/api/creator/${creator_id}/${name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")}`

    const service = await SupabaseClient.createService({
      name,
      description,
      endpoint,
      external_endpoint,
      price_usd,
      category,
      creator_id,
      is_active: true,
      free_tier_limit,
      free_tier_period,
    })

    return NextResponse.json({ service }, { status: 201 })
  } catch (error) {
    console.error("[Creator Services] POST Error:", error)
    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 }
    )
  }
}

// PATCH: Update service
export async function PATCH(request: NextRequest) {
  try {
    // Rate limit check
    const rateLimitResult = await rateLimit(request, "create")
    if (!rateLimitResult.success) {
      return rateLimitResult.response
    }

    const body = await request.json()
    
    // Validate input
    const validation = validateSchema(updateServiceSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: "Validation failed", details: validation.errors }, { status: 400 })
    }

    const { serviceId, ...updates } = validation.data
    const service = await SupabaseClient.updateService(serviceId, updates)

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    return NextResponse.json({ service })
  } catch (error) {
    console.error("[Creator Services] PATCH Error:", error)
    return NextResponse.json(
      { error: "Failed to update service" },
      { status: 500 }
    )
  }
}

// DELETE: Delete service
export async function DELETE(request: NextRequest) {
  try {
    // Rate limit check
    const rateLimitResult = await rateLimit(request, "create")
    if (!rateLimitResult.success) {
      return rateLimitResult.response
    }

    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get("serviceId")

    // Validate service ID
    const validation = validateSchema(uuidSchema, serviceId)
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid service ID", details: validation.errors }, { status: 400 })
    }

    await SupabaseClient.deleteService(validation.data)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Creator Services] DELETE Error:", error)
    return NextResponse.json(
      { error: "Failed to delete service" },
      { status: 500 }
    )
  }
}

