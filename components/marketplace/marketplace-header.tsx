"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, TrendingUp, Zap, Shield, Users, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function MarketplaceHeader() {
  const [stats, setStats] = useState({
    totalAPIs: 0,
    totalCalls: 0,
    activeCreators: 0,
    avgPrice: 0
  })

  useEffect(() => {
    // Load marketplace stats
    const loadStats = async () => {
      try {
        const res = await fetch('/api/services')
        if (res.ok) {
          const data = await res.json()
          const services = data.services || []
          setStats({
            totalAPIs: services.length,
            totalCalls: services.reduce((acc: number, s: any) => acc + (s.total_calls || 0), 0),
            activeCreators: new Set(services.map((s: any) => s.creator_id)).size,
            avgPrice: services.length > 0 
              ? services.reduce((acc: number, s: any) => acc + s.price_usd, 0) / services.length 
              : 0
          })
        }
      } catch (error) {
        console.error("Failed to load marketplace stats:", error)
      }
    }
    loadStats()
  }, [])

  return (
    <header className="relative">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-2xl border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild className="hover:bg-white/10">
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </div>
            <Link href="/creators">
              <Button className="bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90 transition-opacity">
                <Zap className="w-4 h-4 mr-2" />
                Become a Creator
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#9945FF]/10 via-transparent to-transparent border-b border-white/5">
        {/* Animated background grid */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "linear-gradient(rgba(153,69,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(20,241,149,0.1) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
        
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            {/* Badge */}
            <div className="flex justify-center">
              <Badge className="bg-[#9945FF]/20 text-[#9945FF] border-[#9945FF]/30 px-4 py-1.5 text-sm">
                <Shield className="w-3 h-3 mr-1.5" />
                Powered by Solana x402
              </Badge>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-[#14F195] to-[#9945FF] bg-clip-text text-transparent leading-tight">
              API Marketplace
            </h1>
            
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Discover and integrate powerful APIs with instant pay-per-request pricing. 
              No subscriptions, no commitments—just pay for what you use.
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 max-w-3xl mx-auto">
              <div className="glass-panel glass-outline rounded-xl p-4 backdrop-blur-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-10 h-10 rounded-full bg-[#14F195]/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-[#14F195]" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-white">{stats.totalAPIs}</div>
                <div className="text-xs text-gray-400">Live APIs</div>
              </div>

              <div className="glass-panel glass-outline rounded-xl p-4 backdrop-blur-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-10 h-10 rounded-full bg-[#9945FF]/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-[#9945FF]" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-white">{stats.totalCalls.toLocaleString()}</div>
                <div className="text-xs text-gray-400">Total Calls</div>
              </div>

              <div className="glass-panel glass-outline rounded-xl p-4 backdrop-blur-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-10 h-10 rounded-full bg-[#00FFA3]/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#00FFA3]" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-white">{stats.activeCreators}</div>
                <div className="text-xs text-gray-400">Creators</div>
              </div>

              <div className="glass-panel glass-outline rounded-xl p-4 backdrop-blur-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-blue-400" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-white">${stats.avgPrice.toFixed(3)}</div>
                <div className="text-xs text-gray-400">Avg Price</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-black to-transparent" />
      </div>
    </header>
  )
}
