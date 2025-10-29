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
    <GlassPanel className="p-6 glass-hover reflective-overlay transition-transform duration-300 hover:-translate-y-0.5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {service.category}
          </Badge>
          {service.verified && (
            <div className="flex items-center gap-1 bg-[#14F195]/20 text-[#14F195] px-2 py-1 rounded-full text-xs">
              <Shield className="w-3 h-3" />
              <span>Verified</span>
            </div>
          )}
          {service.featured && (
            <div className="flex items-center gap-1 bg-[#9945FF]/20 text-[#9945FF] px-2 py-1 rounded-full text-xs">
              <Zap className="w-3 h-3" />
              <span>Featured</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 text-primary font-bold">
          <span className="text-lg">${service.price_usd.toFixed(2)}</span>
          <span className="text-xs text-muted-foreground">/req</span>
        </div>
      </div>

      <h3 className="font-bold text-lg mb-2">{service.name}</h3>
      <p className="text-sm text-muted-foreground mb-3">{service.description}</p>

      {/* Rating Display */}
      {stats && stats.total_reviews > 0 && (
        <div className="mb-3">
          <RatingDisplay rating={stats.avg_rating} totalReviews={stats.total_reviews} size="sm" />
        </div>
      )}

      {/* Usage Stats */}
      {stats && stats.total_calls > 0 && (
        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
          <span>{stats.total_calls.toLocaleString()} calls</span>
          {service.total_users && service.total_users > 0 && (
            <span>• {service.total_users} users</span>
          )}
        </div>
      )}

      {/* Creator Attribution */}
      {showCreator && creator && (
        <Link
          href={`/creators/${creator.wallet_address}`}
          className="flex items-center gap-2 text-xs text-gray-400 hover:text-[#14F195] transition-colors mb-3"
        >
          <User className="w-3 h-3" />
          <span>by {creator.display_name || `${creator.wallet_address.slice(0, 8)}...`}</span>
        </Link>
      )}

      {/* Free Tier Badge */}
      {service.free_tier_limit && service.free_tier_limit > 0 && (
        <div className="mb-3">
          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
            {service.free_tier_limit} free {service.free_tier_period} calls
          </span>
        </div>
      )}

      <div className="bg-white/5 rounded-lg p-3 mb-4 flex items-center justify-between border border-white/10">
        <code className="text-xs font-mono text-foreground">{service.endpoint}</code>
        <Button variant="ghost" size="sm" onClick={handleCopy} className="h-6 w-6 p-0">
          {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
        </Button>
      </div>

      <TryServiceModal service={service} />
    </GlassPanel>
  )
}
