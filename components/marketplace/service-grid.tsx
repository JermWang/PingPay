"use client"

import { useMemo, useEffect, useState } from "react"
import { ServiceCard } from "@/components/marketplace/service-card"
import type { Service, ServiceStats } from "@/lib/types"
import type { FilterState } from "./marketplace-filters"

interface ServiceGridProps {
  filters: FilterState
}

export function ServiceGrid({ filters }: ServiceGridProps) {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch('/api/services')
        if (!res.ok) throw new Error('Failed to load services')
        const data = await res.json()
        setServices(data.services || [])
      } catch (e: any) {
        setError(e?.message || 'Failed to load services')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Filter and sort services
  const filteredServices = useMemo(() => {
    let result = [...services]

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
  }, [filters, services])

  return (
    <section>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Available APIs</h2>
        <p className="text-muted-foreground">
          {filteredServices.length} {filteredServices.length === 1 ? "service" : "services"} found • Pay only for what you use
        </p>
      </div>

      {error && (
        <div className="glass-panel glass-outline reflective-overlay rounded-2xl p-4 text-destructive bg-destructive/10 border border-destructive/20 mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-gray-400">Loading services…</div>
      ) : filteredServices.length > 0 ? (
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
