import { NextRequest, NextResponse } from "next/server"
import * as SupabaseClient from "@/lib/supabase-client"
import { createReviewSchema, validateSchema, uuidSchema, sanitizeInput } from "@/lib/validations"
import { rateLimit } from "@/lib/rate-limit"

// GET: Fetch reviews for a service
export async function GET(request: NextRequest) {
  try {
    // Rate limit check
    const rateLimitResult = await rateLimit(request, "read")
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

    const reviews = await SupabaseClient.getReviewsByService(validation.data)

    return NextResponse.json({ reviews })
  } catch (error) {
    console.error("[Reviews] GET Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    )
  }
}

// POST: Create a new review
export async function POST(request: NextRequest) {
  try {
    // Rate limit check
    const rateLimitResult = await rateLimit(request, "write")
    if (!rateLimitResult.success) {
      return rateLimitResult.response
    }

    const body = await request.json()
    
    // Validate input
    const validation = validateSchema(createReviewSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: "Validation failed", details: validation.errors }, { status: 400 })
    }

    const { service_id, user_wallet, rating, title, content } = validation.data

    // Sanitize text inputs
    const sanitizedTitle = title ? sanitizeInput(title) : null
    const sanitizedContent = sanitizeInput(content)

    const review = await SupabaseClient.createReview({
      service_id,
      user_wallet,
      rating,
      title: sanitizedTitle,
      content: sanitizedContent,
      verified_purchase: false, // Would check actual purchase history
    })

    return NextResponse.json({ review }, { status: 201 })
  } catch (error) {
    console.error("[Reviews] POST Error:", error)
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    )
  }
}

