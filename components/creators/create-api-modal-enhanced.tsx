"use client"

import { useState } from "react"
import { X, Check, ArrowRight, ArrowLeft, Zap, DollarSign, Tag, FileText, Link as LinkIcon, AlertCircle } from "lucide-react"
import { GlowButton } from "@/components/shared/GlowButton"
import type { Service } from "@/lib/types"
import { toast } from "sonner"

interface CreateApiModalEnhancedProps {
  isOpen: boolean
  onClose: () => void
  creatorId: string
  onSuccess: (service: Service) => void
}

const categories = [
  { value: "Blockchain Data", icon: "⛓️", description: "On-chain data and blockchain queries" },
  { value: "NFT Data", icon: "🎨", description: "NFT metadata and collections" },
  { value: "Network Data", icon: "🌐", description: "Network stats and validator info" },
  { value: "DeFi", icon: "💰", description: "DeFi protocols and liquidity data" },
  { value: "Analytics", icon: "📊", description: "Analytics and insights" },
  { value: "Other", icon: "🔧", description: "Other API services" },
]

const steps = [
  { id: 1, title: "Basic Info", description: "Name and description" },
  { id: 2, title: "Configuration", description: "Endpoint and category" },
  { id: 3, title: "Pricing", description: "Set your price" },
  { id: 4, title: "Review", description: "Confirm and publish" },
]

export function CreateApiModalEnhanced({ isOpen, onClose, creatorId, onSuccess }: CreateApiModalEnhancedProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    external_endpoint: "",
    price_usd: "0.01",
    category: "Blockchain Data",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!isOpen) return null

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = "API name is required"
      if (formData.name.length < 3) newErrors.name = "Name must be at least 3 characters"
      if (!formData.description.trim()) newErrors.description = "Description is required"
      if (formData.description.length < 20) newErrors.description = "Description must be at least 20 characters"
    }

    if (step === 2) {
      if (!formData.external_endpoint.trim()) {
        newErrors.external_endpoint = "Endpoint URL is required"
      } else {
        try {
          const url = new URL(formData.external_endpoint)
          if (!url.protocol.startsWith('http')) {
            newErrors.external_endpoint = "URL must start with http:// or https://"
          }
        } catch {
          newErrors.external_endpoint = "Please enter a valid URL"
        }
      }
    }

    if (step === 3) {
      const price = parseFloat(formData.price_usd)
      if (isNaN(price) || price <= 0) newErrors.price_usd = "Price must be greater than 0"
      if (price > 10) newErrors.price_usd = "Price must be $10 or less per request"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    setCurrentStep(currentStep - 1)
    setErrors({})
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) return

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/creators/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price_usd: parseFloat(formData.price_usd),
          creator_id: creatorId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create API")
      }

      const data = await response.json()
      toast.success("🎉 API created successfully!")
      onSuccess(data.service)
      
      // Reset
      setFormData({
        name: "",
        description: "",
        external_endpoint: "",
        price_usd: "0.01",
        category: "Blockchain Data",
      })
      setCurrentStep(1)
    } catch (error) {
      console.error("Failed to create API:", error)
      toast.error("Failed to create API. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="bg-black border border-white/20 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl shadow-[#9945FF]/20">
        {/* Header */}
        <div className="relative border-b border-white/10 bg-gradient-to-r from-[#9945FF]/10 to-[#14F195]/10 p-6">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Create New API</h2>
              <p className="text-sm text-gray-400">List your API on the marketplace</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mt-6">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    currentStep > step.id 
                      ? "bg-[#14F195] border-[#14F195] text-black" 
                      : currentStep === step.id
                      ? "bg-[#9945FF] border-[#9945FF] text-white"
                      : "bg-black border-white/20 text-gray-500"
                  }`}>
                    {currentStep > step.id ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span className="font-bold">{step.id}</span>
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <div className={`text-xs font-medium ${currentStep >= step.id ? "text-white" : "text-gray-500"}`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-600 hidden sm:block">{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-2 ${currentStep > step.id ? "bg-[#14F195]" : "bg-white/10"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-300px)]">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <FileText className="w-4 h-4 text-[#14F195]" />
                  API Name *
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Solana Balance Checker"
                  className={`w-full px-4 py-3 bg-white/5 border ${errors.name ? "border-red-500" : "border-white/10"} rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#14F195] transition-colors`}
                />
                {errors.name && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-red-400">
                    <AlertCircle className="w-3 h-3" />
                    {errors.name}
                  </div>
                )}
                <p className="mt-2 text-xs text-gray-500">Choose a clear, descriptive name for your API</p>
              </div>

              <div>
                <label htmlFor="description" className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <FileText className="w-4 h-4 text-[#14F195]" />
                  Description *
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what your API does, what data it provides, and how developers can use it..."
                  rows={5}
                  className={`w-full px-4 py-3 bg-white/5 border ${errors.description ? "border-red-500" : "border-white/10"} rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#14F195] transition-colors resize-none`}
                />
                {errors.description && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-red-400">
                    <AlertCircle className="w-3 h-3" />
                    {errors.description}
                  </div>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  {formData.description.length}/500 characters (minimum 20)
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Configuration */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <label htmlFor="endpoint" className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <LinkIcon className="w-4 h-4 text-[#14F195]" />
                  External Endpoint URL *
                </label>
                <input
                  id="endpoint"
                  type="url"
                  value={formData.external_endpoint}
                  onChange={(e) => setFormData({ ...formData, external_endpoint: e.target.value })}
                  placeholder="https://api.example.com/your-endpoint"
                  className={`w-full px-4 py-3 bg-white/5 border ${errors.external_endpoint ? "border-red-500" : "border-white/10"} rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#14F195] transition-colors font-mono text-sm`}
                />
                {errors.external_endpoint && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-red-400">
                    <AlertCircle className="w-3 h-3" />
                    {errors.external_endpoint}
                  </div>
                )}
                <div className="mt-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-xs text-blue-300 font-medium mb-1">💡 How it works:</p>
                  <p className="text-xs text-gray-400">
                    Requests to your API will be proxied through our x402 payment system. 
                    Users pay in USDC, then we forward the request to your endpoint.
                  </p>
                </div>
              </div>

              <div>
                <label htmlFor="category" className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                  <Tag className="w-4 h-4 text-[#14F195]" />
                  Category *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat.value })}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        formData.category === cat.value
                          ? "border-[#14F195] bg-[#14F195]/10"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <div className="text-2xl mb-2">{cat.icon}</div>
                      <div className="font-medium text-white text-sm mb-1">{cat.value}</div>
                      <div className="text-xs text-gray-500">{cat.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Pricing */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <label htmlFor="price" className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <DollarSign className="w-4 h-4 text-[#14F195]" />
                  Price per Request (USD) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">$</span>
                  <input
                    id="price"
                    type="number"
                    step="0.001"
                    min="0.001"
                    max="10"
                    value={formData.price_usd}
                    onChange={(e) => setFormData({ ...formData, price_usd: e.target.value })}
                    className={`w-full pl-8 pr-4 py-4 bg-white/5 border ${errors.price_usd ? "border-red-500" : "border-white/10"} rounded-lg text-white text-2xl font-bold focus:outline-none focus:border-[#14F195] transition-colors`}
                  />
                </div>
                {errors.price_usd && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-red-400">
                    <AlertCircle className="w-3 h-3" />
                    {errors.price_usd}
                  </div>
                )}
                
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {["0.001", "0.01", "0.10"].map((price) => (
                    <button
                      key={price}
                      type="button"
                      onClick={() => setFormData({ ...formData, price_usd: price })}
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:border-[#14F195] hover:bg-[#14F195]/10 transition-all"
                    >
                      ${price}
                    </button>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-[#9945FF]/10 border border-[#9945FF]/20 rounded-lg">
                  <p className="text-sm text-white font-medium mb-2">💰 Pricing Tips:</p>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• Start low to attract users, increase as you gain reviews</li>
                    <li>• Consider your API's complexity and data costs</li>
                    <li>• Most successful APIs charge $0.001 - $0.10 per request</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Review Your API</h3>
                <p className="text-sm text-gray-400">Make sure everything looks good before publishing</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">API Name</div>
                  <div className="text-white font-medium">{formData.name}</div>
                </div>

                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Description</div>
                  <div className="text-white text-sm">{formData.description}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Category</div>
                    <div className="text-white font-medium">{formData.category}</div>
                  </div>

                  <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Price</div>
                    <div className="text-[#14F195] font-bold text-lg">${formData.price_usd} / request</div>
                  </div>
                </div>

                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Endpoint</div>
                  <div className="text-white font-mono text-sm break-all">{formData.external_endpoint}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 p-6 bg-black/50">
          <div className="flex gap-4">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}
            
            {currentStep < 4 ? (
              <GlowButton
                label="Next"
                onClick={handleNext}
                className="flex-1 px-6 py-3 flex items-center justify-center gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </GlowButton>
            ) : (
              <GlowButton
                label="Publish API"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3"
              >
                {isSubmitting ? "Publishing..." : "🚀 Publish API"}
              </GlowButton>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

