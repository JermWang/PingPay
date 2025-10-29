"use client"

import { useState } from "react"
import { MarketplaceHeader } from "@/components/marketplace/marketplace-header"
import { ServiceGrid } from "@/components/marketplace/service-grid"
import { MarketplaceFilters, FilterState } from "@/components/marketplace/marketplace-filters"

export default function MarketplacePage() {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "All Categories",
    minPrice: 0,
    maxPrice: 1,
    minRating: 0,
    sortBy: "popular",
  })

  return (
    <div className="relative min-h-screen">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,249,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,249,255,0.08) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          filter: "blur(2px)",
        }}
      />
      <MarketplaceHeader />
      <div className="container mx-auto px-4 py-8">
        <MarketplaceFilters onFilterChange={setFilters} />
        <ServiceGrid filters={filters} />
      </div>
    </div>
  )
}
