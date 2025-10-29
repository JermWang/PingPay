import { createClient } from "@supabase/supabase-js"
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./constants"
import type { Quote, Payment, Service, Creator, Review, ServiceStats, ApiFavorite } from "./types"

/**
 * Supabase client for production database
 * Falls back to mock mode if Supabase credentials not configured
 */

// Check if Supabase is configured
const isSupabaseConfigured = SUPABASE_URL && SUPABASE_ANON_KEY

// Create Supabase client (only if configured)
const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!)
  : null

// Export flag to check if using real database
export const isUsingRealDatabase = isSupabaseConfigured

if (!isSupabaseConfigured) {
  console.warn(
    "[Supabase] Not configured - using mock database. " +
    "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to use real database."
  )
}

/**
 * Quote operations
 */
export async function createQuote(quote: Quote): Promise<Quote> {
  if (!supabase) throw new Error("Supabase not configured")
  
  const { data, error } = await supabase
    .from("quotes")
    .insert(quote)
    .select()
    .single()

  if (error) throw new Error(`Failed to create quote: ${error.message}`)
  return data
}

export async function getQuote(id: string): Promise<Quote | null> {
  if (!supabase) throw new Error("Supabase not configured")
  
  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", id)
    .single()

  if (error && error.code !== "PGRST116") {
    throw new Error(`Failed to get quote: ${error.message}`)
  }
  return data
}

/**
 * Payment operations
 */
export async function createPayment(payment: Omit<Payment, "id" | "created_at">): Promise<Payment> {
  if (!supabase) throw new Error("Supabase not configured")
  
  const { data, error } = await supabase
    .from("payments")
    .insert(payment)
    .select()
    .single()

  if (error) throw new Error(`Failed to create payment: ${error.message}`)
  return data
}

export async function getPaymentBySignature(signature: string): Promise<Payment | null> {
  if (!supabase) throw new Error("Supabase not configured")
  
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("transaction_signature", signature)
    .single()

  if (error && error.code !== "PGRST116") {
    throw new Error(`Failed to get payment: ${error.message}`)
  }
  return data
}

export async function updatePaymentVerification(paymentId: string, verified: boolean): Promise<void> {
  if (!supabase) throw new Error("Supabase not configured")
  
  const { error } = await supabase
    .from("payments")
    .update({ 
      verified, 
      verified_at: verified ? new Date().toISOString() : null 
    })
    .eq("id", paymentId)

  if (error) throw new Error(`Failed to update payment: ${error.message}`)
}

/**
 * Service operations
 */
export async function getService(endpoint: string): Promise<Service | null> {
  if (!supabase) throw new Error("Supabase not configured")
  
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("endpoint", endpoint)
    .single()

  if (error && error.code !== "PGRST116") {
    throw new Error(`Failed to get service: ${error.message}`)
  }
  return data
}

export async function getAllServices(): Promise<Service[]> {
  if (!supabase) throw new Error("Supabase not configured")
  
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw new Error(`Failed to get services: ${error.message}`)
  return data || []
}

export async function getServicesByCreator(creatorId: string): Promise<Service[]> {
  if (!supabase) throw new Error("Supabase not configured")
  
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("creator_id", creatorId)
    .order("created_at", { ascending: false })

  if (error) throw new Error(`Failed to get services: ${error.message}`)
  return data || []
}

export async function createService(service: Omit<Service, "id" | "created_at" | "updated_at">): Promise<Service> {
  if (!supabase) throw new Error("Supabase not configured")
  
  const { data, error } = await supabase
    .from("services")
    .insert(service)
    .select()
    .single()

  if (error) throw new Error(`Failed to create service: ${error.message}`)
  return data
}

export async function updateService(id: string, updates: Partial<Service>): Promise<Service> {
  if (!supabase) throw new Error("Supabase not configured")
  
  const { data, error } = await supabase
    .from("services")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) throw new Error(`Failed to update service: ${error.message}`)
  return data
}

export async function deleteService(id: string): Promise<void> {
  if (!supabase) throw new Error("Supabase not configured")
  
  const { error } = await supabase
    .from("services")
    .delete()
    .eq("id", id)

  if (error) throw new Error(`Failed to delete service: ${error.message}`)
}

/**
 * Creator operations
 */
export async function getCreator(walletAddress: string): Promise<Creator | null> {
  if (!supabase) throw new Error("Supabase not configured")
  
  const { data, error } = await supabase
    .from("creators")
    .select("*")
    .eq("wallet_address", walletAddress)
    .single()

  if (error && error.code !== "PGRST116") {
    throw new Error(`Failed to get creator: ${error.message}`)
  }
  return data
}

export async function getCreatorById(id: string): Promise<Creator | null> {
  if (!supabase) throw new Error("Supabase not configured")
  
  const { data, error } = await supabase
    .from("creators")
    .select("*")
    .eq("id", id)
    .single()

  if (error && error.code !== "PGRST116") {
    throw new Error(`Failed to get creator: ${error.message}`)
  }
  return data
}

export async function createCreator(creator: Omit<Creator, "id" | "created_at" | "updated_at">): Promise<Creator> {
  if (!supabase) throw new Error("Supabase not configured")
  
  const { data, error } = await supabase
    .from("creators")
    .insert(creator)
    .select()
    .single()

  if (error) throw new Error(`Failed to create creator: ${error.message}`)
  return data
}

export async function updateCreator(id: string, updates: Partial<Creator>): Promise<Creator> {
  if (!supabase) throw new Error("Supabase not configured")
  
  const { data, error } = await supabase
    .from("creators")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) throw new Error(`Failed to update creator: ${error.message}`)
  return data
}

/**
 * Review operations
 */
export async function createReview(review: Omit<Review, "id" | "helpful_count" | "created_at" | "updated_at">): Promise<Review> {
  if (!supabase) throw new Error("Supabase not configured")
  
  const { data, error } = await supabase
    .from("reviews")
    .insert({ ...review, helpful_count: 0 })
    .select()
    .single()

  if (error) throw new Error(`Failed to create review: ${error.message}`)
  
  // Update service stats after review
  await updateServiceStatsAfterReview(review.service_id)
  
  return data
}

export async function getReviewsByService(serviceId: string): Promise<Review[]> {
  if (!supabase) throw new Error("Supabase not configured")
  
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("service_id", serviceId)
    .order("created_at", { ascending: false })

  if (error) throw new Error(`Failed to get reviews: ${error.message}`)
  return data || []
}

export async function getReviewsByUser(userWallet: string): Promise<Review[]> {
  if (!supabase) throw new Error("Supabase not configured")
  
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("user_wallet", userWallet)
    .order("created_at", { ascending: false })

  if (error) throw new Error(`Failed to get reviews: ${error.message}`)
  return data || []
}

/**
 * Service stats operations
 */
async function updateServiceStatsAfterReview(serviceId: string): Promise<void> {
  if (!supabase) throw new Error("Supabase not configured")
  
  const reviews = await getReviewsByService(serviceId)
  const totalReviews = reviews.length
  const avgRating = totalReviews > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0

  const { error } = await supabase
    .from("service_stats")
    .upsert({
      service_id: serviceId,
      total_reviews: totalReviews,
      avg_rating: Number(avgRating.toFixed(2)),
      last_updated: new Date().toISOString(),
    })

  if (error) throw new Error(`Failed to update service stats: ${error.message}`)
}

export async function getServiceStats(serviceId: string): Promise<ServiceStats | null> {
  if (!supabase) throw new Error("Supabase not configured")
  
  const { data, error } = await supabase
    .from("service_stats")
    .select("*")
    .eq("service_id", serviceId)
    .single()

  if (error && error.code !== "PGRST116") {
    throw new Error(`Failed to get service stats: ${error.message}`)
  }
  
  // If no stats exist, create default
  if (!data) {
    const reviews = await getReviewsByService(serviceId)
    const totalReviews = reviews.length
    const avgRating = totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0

    const defaultStats: ServiceStats = {
      service_id: serviceId,
      total_reviews: totalReviews,
      avg_rating: Number(avgRating.toFixed(2)),
      total_calls: 0,
      successful_calls: 0,
      failed_calls: 0,
      avg_response_time: 0,
      uptime_percentage: 100,
      last_24h_calls: 0,
      last_updated: new Date().toISOString(),
    }

    await supabase.from("service_stats").insert(defaultStats)
    return defaultStats
  }

  return data
}

export async function updateServiceStats(serviceId: string, updates: Partial<ServiceStats>): Promise<ServiceStats | null> {
  if (!supabase) throw new Error("Supabase not configured")
  
  const { data, error } = await supabase
    .from("service_stats")
    .update({ ...updates, last_updated: new Date().toISOString() })
    .eq("service_id", serviceId)
    .select()
    .single()

  if (error) throw new Error(`Failed to update service stats: ${error.message}`)
  return data
}

/**
 * Usage logging
 */
export async function logUsage(
  serviceId: string,
  paymentId: string | null,
  requestPath: string,
  responseStatus: number
): Promise<void> {
  if (!supabase) throw new Error("Supabase not configured")
  
  const { error } = await supabase
    .from("usage_logs")
    .insert({
      service_id: serviceId,
      payment_id: paymentId,
      request_path: requestPath,
      response_status: responseStatus,
    })

  if (error) throw new Error(`Failed to log usage: ${error.message}`)
}

