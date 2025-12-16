"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Check, User, Star, Zap, Shield } from "lucide-react"
import type { Service, Creator, ServiceStats } from "@/lib/types"
import { GlassPanel } from "@/components/shared/GlassPanel"
import { TryServiceModal } from "@/components/marketplace/try-service-modal"
import { RatingDisplay } from "./rating-display"

interface ServiceCardProps {
  service: Service
  showCreator?: boolean
}

export function ServiceCard({ service, showCreator = true }: ServiceCardProps) {
  const [copied, setCopied] = useState(false)
  const [creator, setCreator] = useState<Creator | null>(null)
  const [stats, setStats] = useState<ServiceStats | null>(null)

  useEffect(() => {
    if (showCreator && service.creator_id) {
      loadCreator()
    }
    loadStats()
  }, [service.creator_id, service.id, showCreator])

  const loadCreator = async () => {
    if (!service.creator_id) return
    
    try {
      const response = await fetch(`/api/creators/profile?creatorId=${service.creator_id}`)
      if (response.ok) {
        const data = await response.json()
        setCreator(data.creator)
      }
    } catch (error) {
      console.error("Failed to load creator:", error)
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetch(`/api/service-stats?serviceId=${service.id}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Failed to load stats:", error)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(service.endpoint)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="group relative">
      {/* Glow effect on hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#9945FF] to-[#14F195] rounded-2xl opacity-0 group-hover:opacity-20 blur transition duration-500" />
      
      <GlassPanel className="relative p-6 glass-hover reflective-overlay transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#9945FF]/15 h-full flex flex-col">
        {/* Header with badges and price */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="text-xs font-medium bg-white/10 border-white/20">
              {service.category}
            </Badge>
            {service.verified && (
              <div className="flex items-center gap-1 bg-[#14F195]/20 text-[#14F195] px-2.5 py-1 rounded-full text-xs font-medium border border-[#14F195]/30">
                <Shield className="w-3 h-3" />
                <span>Verified</span>
              </div>
            )}
            {service.featured && (
              <div className="flex items-center gap-1 bg-[#9945FF]/15 text-[#9945FF] px-2.5 py-1 rounded-full text-xs font-medium border border-[#9945FF]/25">
                <Zap className="w-3 h-3" />
                <span>Featured</span>
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold bg-gradient-to-r from-[#14F195] to-[#00FFA3] bg-clip-text text-transparent">
                ${service.price_usd.toFixed(3)}
              </span>
            </div>
            <span className="text-xs text-gray-500">per request</span>
            {service.free_tier_limit && service.free_tier_limit > 0 && (
              <span className="text-[11px] text-emerald-300">
                {service.free_tier_limit} free {service.free_tier_period} calls
              </span>
            )}
          </div>
        </div>

        {/* Title and description */}
        <h3 className="font-bold text-xl mb-2 text-white group-hover:text-[#14F195] transition-colors">
          {service.name}
        </h3>
        <p className="text-sm text-gray-400 mb-4 line-clamp-2 flex-grow">
          {service.description}
        </p>

        {/* Rating and stats row */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
          {stats && stats.total_reviews > 0 ? (
            <RatingDisplay rating={stats.avg_rating} totalReviews={stats.total_reviews} size="sm" />
          ) : (
            <span className="text-xs text-gray-500">No reviews yet</span>
          )}
          
          {stats && stats.total_calls > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="font-medium">{stats.total_calls.toLocaleString()}</span>
              <span>calls</span>
            </div>
          )}
        </div>

        {/* Creator attribution */}
        {showCreator && creator && (
          <Link
            href={`/creators/${creator.wallet_address}`}
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-[#14F195] transition-colors mb-4 group/creator"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center group-hover/creator:scale-110 transition-transform">
              <User className="w-3 h-3 text-white" />
            </div>
            <span className="font-medium">
              {creator.display_name || `${creator.wallet_address.slice(0, 8)}...`}
            </span>
          </Link>
        )}

        {/* Endpoint display */}
        <div className="bg-black/30 rounded-lg p-3 mb-4 flex items-center justify-between border border-white/5">
          <code className="text-xs font-mono text-gray-300 truncate flex-1 mr-2">
            {service.endpoint}
          </code>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="h-7 w-7 p-0 text-gray-400 hover:text-[#14F195] hover:bg-white/5 flex-shrink-0"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </Button>
        </div>

        {/* CTA Button */}
        <TryServiceModal service={service} />
      </GlassPanel>
    </div>
  )
}
