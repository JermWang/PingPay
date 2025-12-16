"use client"

import Link from "next/link"
import { ArrowLeft, TrendingUp, Zap, Users, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePlatformStats } from "@/hooks/use-platform-stats"

export function MarketplaceHeader() {
  // Use universal platform stats hook (refreshes every 30s)
  const { stats } = usePlatformStats(30000)

  return (
    <header className="relative">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Link>
            </div>
            <Link href="/creators">
              <Button className="bg-gradient-to-r from-[#00F9FF] to-[#6DDCFF] hover:opacity-90 transition-opacity">
                <Zap className="w-4 h-4 mr-2" />
                Become a Creator
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#00F9FF]/10 via-transparent to-transparent border-b border-white/5">
        {/* Animated background grid */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "linear-gradient(rgba(0,249,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(109,220,255,0.12) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
        
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">

            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-[#00F9FF] to-[#6DDCFF] bg-clip-text text-transparent leading-tight">
              API Marketplace
            </h1>
            
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Discover and integrate powerful APIs with instant pay-per-request pricing. 
              No subscriptions, no commitments—just pay for what you use.
            </p>

            <div className="pt-6 text-sm md:text-base text-white/70 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
              <span>
                <span className="font-semibold">{stats.totalAPIs}</span> live APIs
              </span>
              <span className="hidden sm:inline text-white/50">•</span>
              <span>
                <span className="font-semibold">{stats.activeCreators}</span> creators
              </span>
              <span className="hidden sm:inline text-white/50">•</span>
              <span>
                Avg price <span className="font-semibold">${stats.avgPrice.toFixed(3)}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-black to-transparent" />
      </div>
    </header>
  )
}
