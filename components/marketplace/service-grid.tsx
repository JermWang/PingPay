"use client"

import { useMemo } from "react"
import { ServiceCard } from "@/components/marketplace/service-card"
import type { Service, ServiceStats } from "@/lib/types"
import type { FilterState } from "./marketplace-filters"

// Mock data - in production this would fetch from Supabase
const mockServices: Service[] = [
  {
    id: "1",
    name: "Solana Balance Check",
    description: "Get the SOL balance for any Solana wallet address",
    endpoint: "/api/solana/balance",
    price_usd: 0.01,
    category: "Blockchain Data",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Token Holdings",
    description: "Retrieve all SPL token holdings for a wallet",
    endpoint: "/api/solana/tokens",
    price_usd: 0.02,
    category: "Blockchain Data",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Transaction History",
    description: "Fetch recent transaction history for any address",
    endpoint: "/api/solana/transactions",
    price_usd: 0.03,
    category: "Blockchain Data",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "4",
    name: "NFT Metadata",
    description: "Get detailed metadata for Solana NFTs",
    endpoint: "/api/solana/nft",
    price_usd: 0.05,
    category: "NFT Data",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "5",
    name: "Validator Info",
    description: "Real-time validator performance metrics",
    endpoint: "/api/solana/validator",
    price_usd: 0.02,
    category: "Network Data",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

interface ServiceGridProps {
  filters: FilterState
}

export function ServiceGrid({ filters }: ServiceGridProps) {
  // Filter and sort services
  const filteredServices = useMemo(() => {
    let result = [...mockServices]

    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase()
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(search) ||
          s.description.toLowerCase().includes(search)
      )
    }

    // Category filter
    if (filters.category !== "All Categories") {
      result = result.filter((s) => s.category === filters.category)
    }

    // Price filter
    result = result.filter(
      (s) => s.price_usd >= filters.minPrice && s.price_usd <= filters.maxPrice
    )

    // Sort
    switch (filters.sortBy) {
      case "price-low":
        result.sort((a, b) => a.price_usd - b.price_usd)
        break
      case "price-high":
        result.sort((a, b) => b.price_usd - a.price_usd)
        break
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        break
      case "popular":
      case "rating":
      default:
        // Would sort by actual stats in production
        break
    }

    return result
  }, [filters])

  return (
    <section>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Available APIs</h2>
        <p className="text-muted-foreground">
          {filteredServices.length} {filteredServices.length === 1 ? "service" : "services"} found • Pay only for what you use
        </p>
      </div>

      {filteredServices.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      ) : (
        <div className="glass-panel glass-outline reflective-overlay rounded-2xl p-12 text-center backdrop-blur-xl bg-white/5 border border-white/10">
          <p className="text-gray-400 text-lg">No APIs found matching your filters</p>
          <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </section>
  )
}
