import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { NextRequest, NextResponse } from "next/server"

/**
 * Rate limiting configuration using Upstash Redis
 * Falls back to in-memory limiting if Upstash not configured
 */

// Check if Upstash is configured
const isUpstashConfigured =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN

// Create Redis client if configured
const redis = isUpstashConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null

// Create rate limiters
export const rateLimiters = {
  // Strict rate limit for auth/account creation (5 requests per 15 minutes)
  auth: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "15 m"),
        analytics: true,
        prefix: "@ratelimit/auth",
      })
    : null,

  // Moderate rate limit for API creation/updates (10 per hour)
  create: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, "1 h"),
        analytics: true,
        prefix: "@ratelimit/create",
      })
    : null,

  // Generous rate limit for read operations (60 per minute)
  read: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(60, "1 m"),
        analytics: true,
        prefix: "@ratelimit/read",
      })
    : null,

  // Very strict for payment-related operations (20 per hour)
  payment: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(20, "1 h"),
        analytics: true,
        prefix: "@ratelimit/payment",
      })
    : null,

  // Moderate for write operations like reviews (5 per hour)
  write: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "1 h"),
        analytics: true,
        prefix: "@ratelimit/write",
      })
    : null,
}

// In-memory rate limiting fallback (simple implementation)
const inMemoryLimits = new Map<string, { count: number; resetAt: number }>()

function inMemoryRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): { success: boolean; limit: number; remaining: number; reset: Date } {
  const now = Date.now()
  const key = identifier
  const existing = inMemoryLimits.get(key)

  if (existing && now < existing.resetAt) {
    // Within window
    if (existing.count >= maxRequests) {
      return {
        success: false,
        limit: maxRequests,
        remaining: 0,
        reset: new Date(existing.resetAt),
      }
    }
    existing.count++
    inMemoryLimits.set(key, existing)
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - existing.count,
      reset: new Date(existing.resetAt),
    }
  } else {
    // New window
    const resetAt = now + windowMs
    inMemoryLimits.set(key, { count: 1, resetAt })
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      reset: new Date(resetAt),
    }
  }
}

// Get identifier from request (IP or user wallet)
function getIdentifier(request: NextRequest): string {
  // Try to get wallet address from headers (for authenticated requests)
  const walletHeader = request.headers.get("x-wallet-address")
  if (walletHeader) {
    return `wallet:${walletHeader}`
  }

  // Fallback to IP address
  const forwarded = request.headers.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip") || "unknown"
  return `ip:${ip}`
}

/**
 * Rate limit middleware
 * Usage: await rateLimit(request, 'auth')
 */
export async function rateLimit(
  request: NextRequest,
  type: keyof typeof rateLimiters = "read"
): Promise<{ success: true } | { success: false; response: NextResponse }> {
  const identifier = getIdentifier(request)
  const limiter = rateLimiters[type]

  if (!limiter) {
    // Upstash not configured, use in-memory fallback
    console.warn("[Rate Limit] Upstash not configured, using in-memory fallback")
    
    const limits = {
      auth: { max: 5, window: 15 * 60 * 1000 },
      create: { max: 10, window: 60 * 60 * 1000 },
      read: { max: 60, window: 60 * 1000 },
      payment: { max: 20, window: 60 * 60 * 1000 },
      write: { max: 5, window: 60 * 60 * 1000 },
    }

    const config = limits[type]
    const result = inMemoryRateLimit(identifier, config.max, config.window)

    if (!result.success) {
      return {
        success: false,
        response: NextResponse.json(
          {
            error: "Rate limit exceeded",
            limit: result.limit,
            remaining: result.remaining,
            reset: result.reset.toISOString(),
          },
          {
            status: 429,
            headers: {
              "X-RateLimit-Limit": result.limit.toString(),
              "X-RateLimit-Remaining": result.remaining.toString(),
              "X-RateLimit-Reset": result.reset.toISOString(),
              "Retry-After": Math.ceil((result.reset.getTime() - Date.now()) / 1000).toString(),
            },
          }
        ),
      }
    }

    return { success: true }
  }

  // Use Upstash rate limiter
  try {
    const { success, limit, remaining, reset, pending } = await limiter.limit(identifier)

    // Wait for analytics to complete
    await pending

    if (!success) {
      return {
        success: false,
        response: NextResponse.json(
          {
            error: "Rate limit exceeded",
            limit,
            remaining,
            reset: new Date(reset).toISOString(),
          },
          {
            status: 429,
            headers: {
              "X-RateLimit-Limit": limit.toString(),
              "X-RateLimit-Remaining": remaining.toString(),
              "X-RateLimit-Reset": new Date(reset).toISOString(),
              "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
            },
          }
        ),
      }
    }

    return { success: true }
  } catch (error) {
    console.error("[Rate Limit] Error:", error)
    // On error, allow the request (fail open)
    return { success: true }
  }
}

// Helper to add rate limit headers to successful responses
export function addRateLimitHeaders(
  response: NextResponse,
  limit: number,
  remaining: number,
  reset: Date
): NextResponse {
  response.headers.set("X-RateLimit-Limit", limit.toString())
  response.headers.set("X-RateLimit-Remaining", remaining.toString())
  response.headers.set("X-RateLimit-Reset", reset.toISOString())
  return response
}

