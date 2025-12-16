"use client"

import { useState } from "react"
import { Edit, Trash2, Power, ExternalLink } from "lucide-react"
import type { Service } from "@/lib/types"
import { toast } from "sonner"

interface ApiListItemProps {
  service: Service
  onUpdate: (service: Service) => void
  onDelete: (serviceId: string) => void
}

export function ApiListItem({ service, onUpdate, onDelete }: ApiListItemProps) {
  const [isToggling, setIsToggling] = useState(false)

  const handleToggleActive = async () => {
    setIsToggling(true)
    try {
      const response = await fetch(`/api/creators/services`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: service.id,
          is_active: !service.is_active,
        }),
      })

      if (!response.ok) throw new Error("Failed to update API")

      const data = await response.json()
      onUpdate(data.service)
      toast.success(data.service.is_active ? "API activated" : "API deactivated")
    } catch (error) {
      console.error("Failed to toggle API:", error)
      toast.error("Failed to update API status")
    } finally {
      setIsToggling(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this API?")) return

    try {
      const response = await fetch(`/api/creators/services?serviceId=${service.id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete API")

      onDelete(service.id)
      toast.success("API deleted successfully")
    } catch (error) {
      console.error("Failed to delete API:", error)
      toast.error("Failed to delete API")
    }
  }

  return (
    <div className="glass-panel glass-outline reflective-overlay backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300 hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-semibold text-white">{service.name}</h3>
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                service.is_active
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              {service.is_active ? "Active" : "Inactive"}
            </span>
          </div>

          {/* Description */}
          <p className="text-gray-400 mb-4">{service.description}</p>

          {/* Details */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div>
              <span className="text-gray-500">Category:</span>{" "}
              <span className="text-gray-300">{service.category}</span>
            </div>
            <div>
              <span className="text-gray-500">Price:</span>{" "}
              <span className="text-[#14F195] font-semibold">${service.price_usd.toFixed(2)}</span>
            </div>
            {service.external_endpoint && (
              <div className="flex items-center gap-1">
                <span className="text-gray-500">Endpoint:</span>{" "}
                <a
                  href={service.external_endpoint}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00F9FF] hover:text-[#9AFFEF] transition-colors flex items-center gap-1"
                >
                  <span className="truncate max-w-[200px]">{service.external_endpoint}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-black/20 rounded-lg p-3">
              <div className="text-2xl font-bold text-white">0</div>
              <div className="text-xs text-gray-500">Total Requests</div>
            </div>
            <div className="bg-black/20 rounded-lg p-3">
              <div className="text-2xl font-bold text-[#00F9FF]">$0.00</div>
              <div className="text-xs text-gray-500">Revenue</div>
            </div>
            <div className="bg-black/20 rounded-lg p-3">
              <div className="text-2xl font-bold text-[#9AFFEF]">0</div>
              <div className="text-xs text-gray-500">Unique Users</div>
            </div>
            <div className="bg-black/20 rounded-lg p-3">
              <div className="text-2xl font-bold text-[#6DDCFF]">0.0s</div>
              <div className="text-xs text-gray-500">Avg Response</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleToggleActive}
            disabled={isToggling}
            className={`p-2 rounded-lg transition-colors ${
              service.is_active
                ? "bg-green-500/20 hover:bg-green-500/30 text-green-400"
                : "bg-gray-500/20 hover:bg-gray-500/30 text-gray-400"
            } disabled:opacity-50`}
            title={service.is_active ? "Deactivate" : "Activate"}
          >
            <Power className="w-5 h-5" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

