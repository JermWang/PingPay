"use client"

import * as React from "react"
import { Wallet, Plus, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DepositModal } from "@/components/account/deposit-modal"

interface BalanceIndicatorProps {
  walletAddress: string
}

export function BalanceIndicator({ walletAddress }: BalanceIndicatorProps) {
  const [balance, setBalance] = React.useState<number | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [depositOpen, setDepositOpen] = React.useState(false)
  const { toast } = useToast()

  const fetchBalance = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/account/balance?wallet=${walletAddress}`)
      const data = await res.json()
      
      if (res.ok && data.success) {
        setBalance(data.data.balance_usd)
      }
    } catch (error) {
      console.error("Failed to fetch balance:", error)
    } finally {
      setLoading(false)
    }
  }, [walletAddress])

  React.useEffect(() => {
    fetchBalance()
    // Poll every 30 seconds
    const interval = setInterval(fetchBalance, 30000)
    return () => clearInterval(interval)
  }, [fetchBalance])

  const handleDepositSuccess = () => {
    fetchBalance()
    toast({
      title: "Balance updated",
      description: "Your deposit has been processed",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
        <Wallet className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    )
  }

  const isLowBalance = balance !== null && balance < 1
  const showWarning = balance !== null && balance < 0.1

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setDepositOpen(true)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
            showWarning
              ? "bg-amber-500/10 border-amber-400/30 hover:bg-amber-500/20"
              : "bg-white/5 border-white/10 hover:bg-white/10"
          }`}
        >
          {showWarning && <AlertTriangle className="w-4 h-4 text-amber-400" />}
          <Wallet className="w-4 h-4 text-cyan-400" />
          <span className={`text-sm font-semibold ${isLowBalance ? "text-amber-400" : "text-foreground"}`}>
            ${balance?.toFixed(2) || "0.00"}
          </span>
        </button>

        <button
          onClick={() => setDepositOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 rounded-lg transition-colors"
          title="Add funds"
        >
          <Plus className="w-4 h-4 text-cyan-400" />
          <span className="text-sm text-cyan-400 font-medium">Add Funds</span>
        </button>
      </div>

      <DepositModal
        open={depositOpen}
        onOpenChange={setDepositOpen}
        walletAddress={walletAddress}
        onSuccess={handleDepositSuccess}
      />
    </>
  )
}

