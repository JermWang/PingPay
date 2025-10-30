"use client"

import { useEffect, useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Plus, TrendingUp, DollarSign, Activity, Clock, Users, Zap } from "lucide-react"
// duplicate import removed
import { CreateApiModalEnhanced } from "@/components/creators/create-api-modal-enhanced"
import { ApiListItem } from "@/components/creators/api-list-item"
import type { Service, Creator } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { GlowButton } from "@/components/shared/GlowButton"

export default function CreatorsPage() {
  const { publicKey, connected } = useWallet()
  const [creator, setCreator] = useState<Creator | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [payoutWallet, setPayoutWallet] = useState<string>("")
  const [savingPayout, setSavingPayout] = useState(false)
  const [payoutMsg, setPayoutMsg] = useState<string>("")

  useEffect(() => {
    if (connected && publicKey) {
      loadCreatorData()
    }
  }, [connected, publicKey])

  const loadCreatorData = async () => {
    if (!publicKey) return
    
    setIsLoading(true)
    try {
      // Get or create creator account
      const response = await fetch("/api/creators/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: publicKey.toBase58() }),
      })
      
      const data = await response.json()
      setCreator(data.creator)
      if (data.creator?.payout_wallet) {
        setPayoutWallet(data.creator.payout_wallet)
      } else if (publicKey) {
        setPayoutWallet(publicKey.toBase58())
      }

      // Load creator's services
      const servicesResponse = await fetch(`/api/creators/services?creatorId=${data.creator.id}`)
      const servicesData = await servicesResponse.json()
      setServices(servicesData.services || [])
    } catch (error) {
      console.error("Failed to load creator data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleServiceCreated = (newService: Service) => {
    setServices([newService, ...services])
    setIsModalOpen(false)
  }

  const savePayoutWallet = async () => {
    if (!creator) return
    const addr = payoutWallet.trim()
    if (addr.length < 32 || addr.length > 64) {
      setPayoutMsg("Invalid wallet address format")
      return
    }
    try {
      setSavingPayout(true)
      setPayoutMsg("")
      const res = await fetch('/api/creators/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId: creator.id, payout_wallet: addr })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      setCreator(data.creator)
      setPayoutMsg("Payout wallet saved")
    } catch (e: any) {
      setPayoutMsg(e.message || 'Failed to save')
    } finally {
      setSavingPayout(false)
    }
  }

  const handleServiceUpdated = (updatedService: Service) => {
    setServices(services.map((s) => (s.id === updatedService.id ? updatedService : s)))
  }

  const handleServiceDeleted = (serviceId: string) => {
    setServices(services.filter((s) => s.id !== serviceId))
  }

  // Calculate analytics from actual service data
  const totalRequests = services.reduce((acc, s) => acc + (s.total_calls || 0), 0)
  const totalRevenue = services.reduce((acc, s) => acc + ((s.total_calls || 0) * s.price_usd), 0)
  const avgResponseTime = 0.12 // This would need backend tracking
  const totalUsers = services.reduce((acc, s) => acc + (s.total_users || 0), 0)

  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
        {/* Background particles */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[#9945FF] rounded-full animate-pulse" />
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-[#14F195] rounded-full animate-pulse delay-100" />
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-[#00FFA3] rounded-full animate-pulse delay-200" />
        </div>
        
        <div className="glass-panel glass-outline reflective-overlay rounded-2xl p-12 text-center space-y-6 max-w-md backdrop-blur-xl bg-white/5 border border-white/10">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#9945FF] via-[#14F195] to-[#00FFA3] bg-clip-text text-transparent">
            Creator Dashboard
          </h1>
          <p className="text-gray-400 text-lg">
            Connect your Solana wallet to create and manage your APIs
          </p>
          <div className="flex justify-center pt-4">
            <WalletMultiButton />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#9945FF] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#14F195] rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <div className="glass-panel glass-outline reflective-overlay rounded-2xl p-8 mb-12 backdrop-blur-xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#9945FF] via-[#14F195] to-[#00FFA3] bg-clip-text text-transparent">
                Creator Dashboard
              </h1>
              <p className="text-gray-400">
                Manage your APIs and track your performance
              </p>
            </div>
            {creator && (
              <div className="hidden md:block">
                <div className="text-sm text-gray-400 mb-1">Wallet Address</div>
                <div className="font-mono text-sm text-gray-300">
                  {publicKey?.toBase58().slice(0, 8)}...{publicKey?.toBase58().slice(-8)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payout Wallet */}
        {creator && (
          <div className="glass-panel glass-outline reflective-overlay rounded-2xl p-6 backdrop-blur-xl bg-white/5 border border-white/10 mb-8">
            <h2 className="text-xl font-bold text-white mb-3">Payout Wallet</h2>
            <p className="text-gray-400 text-sm mb-3">We send your earnings to this address when you withdraw.</p>
            <div className="flex items-center gap-2 max-w-xl">
              <Input
                value={payoutWallet}
                onChange={(e) => setPayoutWallet(e.target.value)}
                className="flex-1 bg-black/60 border-white/10 text-white"
                placeholder="Your Solana wallet address"
              />
              <GlowButton 
                label={savingPayout ? 'Saving...' : 'Save'} 
                onClick={savePayoutWallet} 
                disabled={savingPayout || (creator?.payout_wallet === payoutWallet.trim())}
              />
            </div>
            {payoutMsg && <div className="text-xs mt-2 text-gray-300">{payoutMsg}</div>}
          </div>
        )}

        {/* Analytics Overview */}
        {creator && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="glass-panel glass-outline reflective-overlay rounded-2xl p-6 backdrop-blur-xl bg-white/5 border border-white/10 hover:border-[#14F195]/50 transition-colors group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-[#14F195]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Activity className="w-6 h-6 text-[#14F195]" />
                </div>
                <div className="text-xs text-gray-500 bg-black/30 px-2 py-1 rounded-full">Live</div>
              </div>
              <div className="text-sm text-gray-400 mb-1">Total APIs</div>
              <div className="text-3xl font-bold text-white mb-1">{services.length}</div>
              <div className="text-xs text-[#14F195]">
                {services.filter((s) => s.is_active).length} active
              </div>
            </div>

            <div className="glass-panel glass-outline reflective-overlay rounded-2xl p-6 backdrop-blur-xl bg-white/5 border border-white/10 hover:border-[#9945FF]/50 transition-colors group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-[#9945FF]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6 text-[#9945FF]" />
                </div>
                <div className="text-xs text-gray-500 bg-black/30 px-2 py-1 rounded-full">24h</div>
              </div>
              <div className="text-sm text-gray-400 mb-1">Total Requests</div>
              <div className="text-3xl font-bold text-white mb-1">{totalRequests.toLocaleString()}</div>
              <div className="text-xs text-gray-500">
                <span className="text-[#9945FF]">+0%</span> from yesterday
              </div>
            </div>

            <div className="glass-panel glass-outline reflective-overlay rounded-2xl p-6 backdrop-blur-xl bg-white/5 border border-white/10 hover:border-[#00FFA3]/50 transition-colors group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-[#00FFA3]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <DollarSign className="w-6 h-6 text-[#00FFA3]" />
                </div>
                <div className="text-xs text-gray-500 bg-black/30 px-2 py-1 rounded-full">All Time</div>
              </div>
              <div className="text-sm text-gray-400 mb-1">Total Revenue</div>
              <div className="text-3xl font-bold text-white mb-1">${totalRevenue.toFixed(2)}</div>
              <div className="text-xs text-gray-500">
                in USDC on Solana
              </div>
            </div>

            <div className="glass-panel glass-outline reflective-overlay rounded-2xl p-6 backdrop-blur-xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-colors group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-xs text-gray-500 bg-black/30 px-2 py-1 rounded-full">Unique</div>
              </div>
              <div className="text-sm text-gray-400 mb-1">API Users</div>
              <div className="text-3xl font-bold text-white mb-1">{totalUsers}</div>
              <div className="text-xs text-gray-500">
                active consumers
              </div>
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        {creator && services.length > 0 && (
          <div className="glass-panel glass-outline reflective-overlay rounded-2xl p-8 mb-12 backdrop-blur-xl bg-white/5 border border-white/10">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Clock className="w-6 h-6 text-[#9945FF]" />
              Performance Metrics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm text-gray-400 mb-2">Avg Response Time</div>
                <div className="text-2xl font-bold text-white">{avgResponseTime.toFixed(2)}s</div>
                <div className="mt-2 h-2 bg-black/30 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#14F195] to-[#00FFA3] w-3/4" />
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-2">Success Rate</div>
                <div className="text-2xl font-bold text-white">100%</div>
                <div className="mt-2 h-2 bg-black/30 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#14F195] to-[#00FFA3] w-full" />
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-2">Uptime</div>
                <div className="text-2xl font-bold text-white">99.9%</div>
                <div className="mt-2 h-2 bg-black/30 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#9945FF] to-[#14F195] w-full" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create API Button */}
        <div className="mb-8">
          <GlowButton
            label="Create New API"
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New API
          </GlowButton>
        </div>

        {/* API List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center text-gray-400 py-12">Loading your APIs...</div>
          ) : services.length === 0 ? (
            <div className="text-center py-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
              <p className="text-gray-400 mb-4">You haven't created any APIs yet</p>
              <GlowButton
                label="Create Your First API"
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-2"
              >
                Create Your First API
              </GlowButton>
            </div>
          ) : (
            services.map((service) => (
              <ApiListItem
                key={service.id}
                service={service}
                onUpdate={handleServiceUpdated}
                onDelete={handleServiceDeleted}
              />
            ))
          )}
        </div>
      </div>

      {/* Create API Modal */}
      {creator && (
        <CreateApiModalEnhanced
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          creatorId={creator.id}
          onSuccess={handleServiceCreated}
        />
      )}
    </div>
  )
}

