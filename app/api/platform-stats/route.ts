import { NextRequest, NextResponse } from "next/server"
import * as SupabaseClient from "@/lib/supabase-client"
import { createClient } from "@supabase/supabase-js"
import { SUPABASE_URL, SUPABASE_ANON_KEY, INITIAL_REQUESTS_OFFSET } from "@/lib/constants"
import { getCreatorEarnings } from "@/lib/creator-payouts"

export const dynamic = "force-dynamic"
export const revalidate = 30 // Cache for 30 seconds

/**
 * Universal platform statistics endpoint
 * Single source of truth for all platform-wide metrics
 */
export async function GET(request: NextRequest) {
  try {
    // Fetch all services
    const services = await SupabaseClient.getAllServices()
    
    // Calculate platform-wide statistics
    const totalAPIs = services.length
    const activeAPIs = services.filter(s => s.is_active).length
    const totalCallsFromServices = services.reduce((acc, s) => acc + (s.total_calls || 0), 0)
    const totalUsers = services.reduce((acc, s) => acc + (s.total_users || 0), 0)
    
    // Creator statistics
    const uniqueCreators = new Set(services.map(s => s.creator_id).filter(Boolean))
    const activeCreators = uniqueCreators.size
    
    // Price statistics
    const prices = services.map(s => s.price_usd).filter(p => p > 0)
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0
    const avgPrice = prices.length > 0 
      ? prices.reduce((acc, p) => acc + p, 0) / prices.length 
      : 0
    
    // Global requests from usage logs + baseline offset
    let usageLogCount = 0
    try {
      if (SUPABASE_URL && SUPABASE_ANON_KEY) {
        const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
        const { count, error } = await sb
          .from("usage_logs")
          .select("*", { count: "exact", head: true })
        if (error) throw error
        usageLogCount = typeof count === "number" ? count : 0
      }
    } catch (err) {
      // Non-fatal: fall back to service-derived count
      usageLogCount = Math.max(usageLogCount, totalCallsFromServices)
    }

    const totalRequests = INITIAL_REQUESTS_OFFSET + usageLogCount

    // Revenue statistics (sum of all creator earnings)
    let totalRevenue = 0
    const processedCreators = new Set<string>()
    for (const service of services) {
      if (service.creator_id && !processedCreators.has(service.creator_id)) {
        processedCreators.add(service.creator_id)
        try {
          const earnings = await getCreatorEarnings(service.creator_id)
          if (earnings?.total_earned) {
            totalRevenue += earnings.total_earned
          }
        } catch {
          // Skip if can't fetch earnings
        }
      }
    }
    
    const stats = {
      // API Statistics
      totalAPIs,
      activeAPIs,
      totalCalls: totalRequests, // keep legacy field in sync
      totalRequests,
      
      // User Statistics
      totalUsers,
      activeCreators,
      
      // Price Statistics
      minPrice,
      maxPrice,
      avgPrice,
      
      // Revenue Statistics
      totalRevenue,
      
      // Metadata
      lastUpdated: new Date().toISOString(),
      cacheAge: 30, // seconds
    }
    
    return NextResponse.json({ 
      success: true,
      stats 
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60'
      }
    })
    
  } catch (error) {
    console.error("[Platform Stats] Error:", error)
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch platform statistics",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

