import type { Quote, Payment, Service, Creator, Review, ServiceStats } from "./types"

/**
 * Mock Supabase functions for development
 * Replace these with actual Supabase client calls when integration is added
 */

const mockQuotes = new Map<string, Quote>()
const mockPayments = new Map<string, Payment>()
const mockCreators = new Map<string, Creator>()
const mockServices = new Map<string, Service>()
const mockReviews = new Map<string, Review>()
const mockServiceStats = new Map<string, ServiceStats>()

export async function createQuote(quote: Quote): Promise<Quote> {
  mockQuotes.set(quote.id, quote)
  console.log("[v0] Created quote:", quote.id)
  return quote
}

export async function getQuote(quoteId: string): Promise<Quote | null> {
  return mockQuotes.get(quoteId) || null
}

export async function createPayment(payment: Omit<Payment, "id" | "created_at">): Promise<Payment> {
  const newPayment: Payment = {
    id: crypto.randomUUID(),
    ...payment,
    created_at: new Date().toISOString(),
  }
  mockPayments.set(newPayment.id, newPayment)
  console.log("[v0] Created payment:", newPayment.id)
  return newPayment
}

export async function getPaymentBySignature(signature: string): Promise<Payment | null> {
  for (const payment of mockPayments.values()) {
    if (payment.transaction_signature === signature) {
      return payment
    }
  }
  return null
}

export async function updatePaymentVerification(paymentId: string, verified: boolean): Promise<void> {
  const payment = mockPayments.get(paymentId)
  if (payment) {
    payment.verified = verified
    payment.verified_at = new Date().toISOString()
    console.log("[v0] Updated payment verification:", paymentId, verified)
  }
}

export async function getService(endpoint: string): Promise<Service | null> {
  // Mock service lookup
  const mockServices: Record<string, Service> = {
    "/api/solana/balance": {
      id: "1",
      name: "Solana Balance Check",
      description: "Get the SOL balance for any Solana wallet address",
      endpoint: "/api/solana/balance",
      price_usd: 0.01,
      category: "Blockchain Data",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    "/api/solana/tokens": {
      id: "2",
      name: "Token Holdings",
      description: "Retrieve all SPL token holdings for a wallet",
      endpoint: "/api/solana/tokens",
      price_usd: 0.02,
      category: "Blockchain Data",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    "/api/solana/transactions": {
      id: "3",
      name: "Transaction History",
      description: "Fetch recent transaction history for any address",
      endpoint: "/api/solana/transactions",
      price_usd: 0.03,
      category: "Blockchain Data",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    "/api/solana/nft": {
      id: "4",
      name: "NFT Metadata",
      description: "Get detailed metadata for Solana NFTs",
      endpoint: "/api/solana/nft",
      price_usd: 0.05,
      category: "NFT Data",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    "/api/solana/validator": {
      id: "5",
      name: "Validator Info",
      description: "Real-time validator performance metrics",
      endpoint: "/api/solana/validator",
      price_usd: 0.02,
      category: "Network Data",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  }

  return mockServices[endpoint] || null
}

export async function logUsage(
  serviceId: string,
  paymentId: string | null,
  requestPath: string,
  responseStatus: number,
): Promise<void> {
  console.log("[v0] Logged usage:", { serviceId, paymentId, requestPath, responseStatus })
}

// Creator management functions
export async function getCreator(walletAddress: string): Promise<Creator | null> {
  for (const creator of mockCreators.values()) {
    if (creator.wallet_address === walletAddress) {
      return creator
    }
  }
  return null
}

// Alias for backward compatibility
export const getCreatorByWallet = getCreator

export async function createCreator(creator: Omit<Creator, "id" | "created_at" | "updated_at">): Promise<Creator> {
  const newCreator: Creator = {
    id: crypto.randomUUID(),
    ...creator,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  mockCreators.set(newCreator.id, newCreator)
  console.log("[v0] Created creator:", newCreator.id)
  return newCreator
}

export async function getCreatorById(creatorId: string): Promise<Creator | null> {
  return mockCreators.get(creatorId) || null
}

export async function updateCreator(creatorId: string, updates: Partial<Creator>): Promise<Creator | null> {
  const creator = mockCreators.get(creatorId)
  if (!creator) return null

  const updated = {
    ...creator,
    ...updates,
    updated_at: new Date().toISOString(),
  }
  mockCreators.set(creatorId, updated)
  console.log("[v0] Updated creator:", creatorId)
  return updated
}

// Service management functions for creators
export async function createService(service: Omit<Service, "id" | "created_at" | "updated_at">): Promise<Service> {
  const newService: Service = {
    id: crypto.randomUUID(),
    ...service,
    is_active: service.is_active ?? true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  mockServices.set(newService.id, newService)
  console.log("[v0] Created service:", newService.id)
  return newService
}

export async function getServicesByCreator(creatorId: string): Promise<Service[]> {
  const services: Service[] = []
  for (const service of mockServices.values()) {
    if (service.creator_id === creatorId) {
      services.push(service)
    }
  }
  return services
}

export async function updateService(serviceId: string, updates: Partial<Service>): Promise<Service | null> {
  const service = mockServices.get(serviceId)
  if (!service) return null

  const updated = {
    ...service,
    ...updates,
    updated_at: new Date().toISOString(),
  }
  mockServices.set(serviceId, updated)
  console.log("[v0] Updated service:", serviceId)
  return updated
}

export async function deleteService(serviceId: string): Promise<boolean> {
  const deleted = mockServices.delete(serviceId)
  if (deleted) {
    console.log("[v0] Deleted service:", serviceId)
  }
  return deleted
}

export async function getAllServices(): Promise<Service[]> {
  return Array.from(mockServices.values()).filter((s) => s.is_active)
}

// Review management functions
export async function createReview(review: Omit<Review, "id" | "helpful_count" | "created_at" | "updated_at">): Promise<Review> {
  const newReview: Review = {
    id: crypto.randomUUID(),
    ...review,
    helpful_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  mockReviews.set(newReview.id, newReview)
  
  // Update service stats
  await updateServiceStatsAfterReview(review.service_id)
  
  console.log("[v0] Created review:", newReview.id)
  return newReview
}

export async function getReviewsByService(serviceId: string): Promise<Review[]> {
  const reviews: Review[] = []
  for (const review of mockReviews.values()) {
    if (review.service_id === serviceId) {
      reviews.push(review)
    }
  }
  return reviews.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export async function getReviewsByUser(userWallet: string): Promise<Review[]> {
  const reviews: Review[] = []
  for (const review of mockReviews.values()) {
    if (review.user_wallet === userWallet) {
      reviews.push(review)
    }
  }
  return reviews.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

// Service stats management
async function updateServiceStatsAfterReview(serviceId: string): Promise<void> {
  const reviews = await getReviewsByService(serviceId)
  const totalReviews = reviews.length
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
  
  let stats = mockServiceStats.get(serviceId)
  if (!stats) {
    stats = {
      service_id: serviceId,
      total_reviews: 0,
      avg_rating: 0,
      total_calls: 0,
      successful_calls: 0,
      failed_calls: 0,
      avg_response_time: 0,
      uptime_percentage: 100,
      last_24h_calls: 0,
      last_updated: new Date().toISOString(),
    }
  }
  
  stats.total_reviews = totalReviews
  stats.avg_rating = Number(avgRating.toFixed(2))
  stats.last_updated = new Date().toISOString()
  
  mockServiceStats.set(serviceId, stats)
}

export async function getServiceStats(serviceId: string): Promise<ServiceStats | null> {
  let stats = mockServiceStats.get(serviceId)
  
  // If no stats exist, create default
  if (!stats) {
    const reviews = await getReviewsByService(serviceId)
    const totalReviews = reviews.length
    const avgRating = totalReviews > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
      : 0
    
    stats = {
      service_id: serviceId,
      total_reviews: totalReviews,
      avg_rating: Number(avgRating.toFixed(2)),
      total_calls: 0,
      successful_calls: 0,
      failed_calls: 0,
      avg_response_time: 0.12,
      uptime_percentage: 100,
      last_24h_calls: 0,
      last_updated: new Date().toISOString(),
    }
    mockServiceStats.set(serviceId, stats)
  }
  
  return stats
}

export async function updateServiceStats(serviceId: string, updates: Partial<ServiceStats>): Promise<ServiceStats | null> {
  const stats = await getServiceStats(serviceId)
  if (!stats) return null
  
  const updated = {
    ...stats,
    ...updates,
    last_updated: new Date().toISOString(),
  }
  mockServiceStats.set(serviceId, updated)
  console.log("[v0] Updated service stats:", serviceId)
  return updated
}
