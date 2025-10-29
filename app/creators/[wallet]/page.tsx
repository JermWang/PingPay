"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ExternalLink } from "lucide-react"
import type { Creator, Service } from "@/lib/types"
import { ServiceCard } from "@/components/marketplace/service-card"

export default function CreatorProfilePage() {
  const params = useParams()
  const wallet = params.wallet as string
  const [creator, setCreator] = useState<Creator | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadCreatorProfile()
  }, [wallet])

  const loadCreatorProfile = async () => {
    setIsLoading(true)
    try {
      // Get creator by wallet
      const creatorResponse = await fetch("/api/creators/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: wallet }),
      })

      if (!creatorResponse.ok) {
        throw new Error("Creator not found")
      }

      const creatorData = await creatorResponse.json()
      setCreator(creatorData.creator)

      // Load creator's public services
      const servicesResponse = await fetch(`/api/creators/services?creatorId=${creatorData.creator.id}`)
      const servicesData = await servicesResponse.json()
      
      // Only show active services on public profile
      setServices(servicesData.services?.filter((s: Service) => s.is_active) || [])
    } catch (error) {
      console.error("Failed to load creator profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-gray-400">Loading creator profile...</div>
      </div>
    )
  }

  if (!creator) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-4xl">🤔</div>
          <h1 className="text-2xl font-bold">Creator Not Found</h1>
          <p className="text-gray-400">This creator doesn't exist or hasn't created any APIs yet.</p>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 text-[#14F195] hover:text-[#00FFA3] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Marketplace
        </Link>

        {/* Creator Header */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-[#9945FF] via-[#14F195] to-[#00FFA3] bg-clip-text text-transparent">
                {creator.display_name || "Anonymous Creator"}
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                <span className="font-mono">{wallet.slice(0, 8)}...{wallet.slice(-8)}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(wallet)
                  }}
                  className="hover:text-white transition-colors"
                  title="Copy wallet address"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
              {creator.bio && <p className="text-gray-300">{creator.bio}</p>}
            </div>

            <div className="text-right">
              <div className="text-3xl font-bold text-[#14F195]">{services.length}</div>
              <div className="text-sm text-gray-400">Active APIs</div>
            </div>
          </div>
        </div>

        {/* Creator's APIs */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">APIs by this Creator</h2>

          {services.length === 0 ? (
            <div className="text-center py-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
              <p className="text-gray-400">This creator hasn't published any APIs yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

