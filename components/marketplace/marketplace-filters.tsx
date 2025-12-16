"use client"

import { useState } from "react"
import { Search, SlidersHorizontal, X } from "lucide-react"

interface MarketplaceFiltersProps {
  onFilterChange: (filters: FilterState) => void
}

export interface FilterState {
  search: string
  category: string
  minPrice: number
  maxPrice: number
  minRating: number
  sortBy: string
}

const categories = [
  "All Categories",
  "Blockchain Data",
  "NFT Data",
  "Network Data",
  "DeFi",
  "Analytics",
  "Other",
]

const sortOptions = [
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
]

export function MarketplaceFilters({ onFilterChange }: MarketplaceFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "All Categories",
    minPrice: 0,
    maxPrice: 1,
    minRating: 0,
    sortBy: "popular",
  })

  const [showFilters, setShowFilters] = useState(false)

  const updateFilters = (updates: Partial<FilterState>) => {
    const newFilters = { ...filters, ...updates }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const defaultFilters: FilterState = {
      search: "",
      category: "All Categories",
      minPrice: 0,
      maxPrice: 1,
      minRating: 0,
      sortBy: "popular",
    }
    setFilters(defaultFilters)
    onFilterChange(defaultFilters)
  }

  const hasActiveFilters =
    filters.search !== "" ||
    filters.category !== "All Categories" ||
    filters.minRating > 0 ||
    filters.minPrice > 0 ||
    filters.maxPrice < 1

  return (
    <div className="mb-8 space-y-3">
      {/* Slim control bar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            placeholder="Search APIs..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#03A9F4] transition-colors"
          />
        </div>

        <div className="flex items-center justify-between gap-3 md:justify-end">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white px-3 py-2 rounded-md hover:bg-white/5 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>{showFilters ? "Hide filters" : "More filters"}</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-[#00F9FF] rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 border-t border-white/10">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => updateFilters({ category: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00F9FF] transition-colors"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-black">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Min Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Minimum Rating
            </label>
            <select
              value={filters.minRating}
              onChange={(e) => updateFilters({ minRating: Number(e.target.value) })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00F9FF] transition-colors"
            >
              <option value="0" className="bg-black">All Ratings</option>
              <option value="4" className="bg-black">4+ Stars</option>
              <option value="3" className="bg-black">3+ Stars</option>
              <option value="2" className="bg-black">2+ Stars</option>
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Max Price
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">$0</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={filters.maxPrice}
                onChange={(e) => updateFilters({ maxPrice: Number(e.target.value) })}
                className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm text-white font-medium w-12">
                ${filters.maxPrice.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilters({ sortBy: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00F9FF] transition-colors"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-black">
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
            Clear all filters
          </button>
        </div>
      )}
    </div>
  )
}

