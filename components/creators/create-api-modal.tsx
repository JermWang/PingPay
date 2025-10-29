"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { GlowButton } from "@/components/shared/GlowButton"
import type { Service } from "@/lib/types"
import { toast } from "sonner"

interface CreateApiModalProps {
  isOpen: boolean
  onClose: () => void
  creatorId: string
  onSuccess: (service: Service) => void
}

const categories = [
  "Blockchain Data",
  "NFT Data",
  "Network Data",
  "DeFi",
  "Analytics",
  "Other",
]

export function CreateApiModal({ isOpen, onClose, creatorId, onSuccess }: CreateApiModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    external_endpoint: "",
    price_usd: "0.01",
    category: "Blockchain Data",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name.trim()) {
      toast.error("Please enter an API name")
      return
    }
    if (!formData.description.trim()) {
      toast.error("Please enter a description")
      return
    }
    if (!formData.external_endpoint.trim()) {
      toast.error("Please enter an endpoint URL")
      return
    }
    
    // Validate URL
    try {
      new URL(formData.external_endpoint)
    } catch {
      toast.error("Please enter a valid URL")
      return
    }

    const price = parseFloat(formData.price_usd)
    if (isNaN(price) || price <= 0) {
      toast.error("Price must be greater than 0")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/creators/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price_usd: price,
          creator_id: creatorId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create API")
      }

      const data = await response.json()
      toast.success("API created successfully!")
      onSuccess(data.service)
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        external_endpoint: "",
        price_usd: "0.01",
        category: "Blockchain Data",
      })
    } catch (error) {
      console.error("Failed to create API:", error)
      toast.error("Failed to create API. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-black border border-white/20 rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-transparent">
            Create New API
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              API Name *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Solana Balance Check"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#14F195] transition-colors"
              disabled={isSubmitting}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what your API does..."
              rows={4}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#14F195] transition-colors resize-none"
              disabled={isSubmitting}
            />
          </div>

          {/* External Endpoint */}
          <div>
            <label htmlFor="endpoint" className="block text-sm font-medium text-gray-300 mb-2">
              External Endpoint URL *
            </label>
            <input
              id="endpoint"
              type="url"
              value={formData.external_endpoint}
              onChange={(e) => setFormData({ ...formData, external_endpoint: e.target.value })}
              placeholder="https://api.example.com/your-endpoint"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#14F195] transition-colors"
              disabled={isSubmitting}
            />
            <p className="mt-2 text-xs text-gray-500">
              The URL where your API is hosted. Requests will be proxied to this endpoint.
            </p>
          </div>

          {/* Price and Category Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-2">
                Price per Request (USD) *
              </label>
              <input
                id="price"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.price_usd}
                onChange={(e) => setFormData({ ...formData, price_usd: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#14F195] transition-colors"
                disabled={isSubmitting}
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                Category *
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#14F195] transition-colors"
                disabled={isSubmitting}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-black">
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <GlowButton
              label="Create API"
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3"
            >
              {isSubmitting ? "Creating..." : "Create API"}
            </GlowButton>
          </div>
        </form>
      </div>
    </div>
  )
}

