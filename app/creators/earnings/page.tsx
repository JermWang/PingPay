"use client"

import * as React from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { GlowButton } from "@/components/shared/GlowButton"
import { GlassPanel } from "@/components/shared/GlassPanel"
import { 
  DollarSign, 
  TrendingUp, 
  Download,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Wallet
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { CreatorEarnings, WithdrawalRequest } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"

export default function CreatorEarningsPage() {
  const { publicKey } = useWallet()
  const [earnings, setEarnings] = React.useState<CreatorEarnings | null>(null)
  const [withdrawals, setWithdrawals] = React.useState<WithdrawalRequest[]>([])
  const [minimumWithdrawal, setMinimumWithdrawal] = React.useState(10)
  const [loading, setLoading] = React.useState(true)
  const [withdrawOpen, setWithdrawOpen] = React.useState(false)
  const [withdrawAmount, setWithdrawAmount] = React.useState("")
  const [requesting, setRequesting] = React.useState(false)
  const { toast } = useToast()

  const walletAddress = publicKey?.toBase58()

  const fetchEarningsData = React.useCallback(async () => {
    if (!walletAddress) return

    try {
      setLoading(true)
      
      // Fetch earnings
      const earningsRes = await fetch(`/api/creators/earnings?wallet=${walletAddress}`)
      const earningsData = await earningsRes.json()
      
      if (earningsRes.status === 404) {
        // Not a creator yet
        setEarnings(null)
        return
      }
      
      if (earningsData.success) {
        setEarnings(earningsData.data)
      }

      // Fetch withdrawal history
      const withdrawRes = await fetch(`/api/creators/earnings/withdraw?wallet=${walletAddress}`)
      const withdrawData = await withdrawRes.json()
      if (withdrawData.success) {
        setWithdrawals(withdrawData.data.withdrawals)
        setMinimumWithdrawal(withdrawData.data.minimum_withdrawal)
      }
    } catch (error) {
      console.error("Failed to fetch earnings data:", error)
    } finally {
      setLoading(false)
    }
  }, [walletAddress])

  React.useEffect(() => {
    fetchEarningsData()
  }, [fetchEarningsData])

  const handleRequestWithdrawal = async () => {
    if (!walletAddress) return

    const amount = parseFloat(withdrawAmount)
    if (isNaN(amount) || amount < minimumWithdrawal) {
      toast({
        title: "Invalid amount",
        description: `Minimum withdrawal is $${minimumWithdrawal}`,
        variant: "destructive",
      })
      return
    }

    if (earnings && amount > earnings.available_balance) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough available balance",
        variant: "destructive",
      })
      return
    }

    try {
      setRequesting(true)
      const res = await fetch("/api/creators/earnings/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet: walletAddress,
          amount: amount,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      toast({
        title: "Withdrawal Requested",
        description: data.message,
      })

      setWithdrawAmount("")
      setWithdrawOpen(false)
      fetchEarningsData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setRequesting(false)
    }
  }

  if (!publicKey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <GlassPanel className="max-w-md w-full text-center space-y-6 p-8">
          <DollarSign className="w-16 h-16 text-cyan-400 mx-auto" />
          <div>
            <h1 className="text-2xl font-bold mb-2">Creator Earnings</h1>
            <p className="text-muted-foreground">
              Connect your wallet to view your earnings
            </p>
          </div>
          <WalletMultiButton className="!bg-cyan-500 hover:!bg-cyan-600 !rounded-lg" />
        </GlassPanel>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    )
  }

  if (!earnings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <GlassPanel className="max-w-md w-full text-center space-y-6 p-8">
          <DollarSign className="w-16 h-16 text-cyan-400 mx-auto opacity-50" />
          <div>
            <h1 className="text-2xl font-bold mb-2">Not a Creator Yet</h1>
            <p className="text-muted-foreground">
              Create your first API service to start earning
            </p>
          </div>
          <GlowButton
            label="Create Service"
            onClick={() => window.location.href = '/creators/' + walletAddress}
          />
        </GlassPanel>
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-400" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />
      case 'processing':
        return <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
      default:
        return <Clock className="w-4 h-4 text-amber-400" />
    }
  }

  const canWithdraw = earnings.available_balance >= minimumWithdrawal

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Creator Earnings</h1>
          <p className="text-muted-foreground">
            Track your revenue and manage withdrawals
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassPanel className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-muted-foreground text-sm">Available Balance</p>
                <p className="text-3xl font-bold text-green-400">
                  ${earnings.available_balance.toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-green-400/50" />
            </div>
            <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
              <DialogTrigger asChild>
                <GlowButton
                  label="Withdraw"
                  icon={Download}
                  disabled={!canWithdraw}
                  className="w-full"
                />
              </DialogTrigger>
              <DialogContent className="backdrop-blur-xl bg-white/5 border border-white/10">
                <DialogHeader>
                  <DialogTitle>Request Withdrawal</DialogTitle>
                  <DialogDescription>
                    Withdrawals are processed within 1-2 business days
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Available:</span>
                      <span className="font-semibold">${earnings.available_balance.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Minimum:</span>
                      <span className="font-semibold">${minimumWithdrawal.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (USD)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min={minimumWithdrawal}
                      max={earnings.available_balance}
                      placeholder={`${minimumWithdrawal}.00`}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="bg-white/5 border-white/10"
                    />
                  </div>

                  <GlowButton
                    label={requesting ? "Requesting..." : "Request Withdrawal"}
                    onClick={handleRequestWithdrawal}
                    disabled={requesting}
                    className="w-full"
                  />
                </div>
              </DialogContent>
            </Dialog>
            {!canWithdraw && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Minimum ${minimumWithdrawal} required
              </p>
            )}
          </GlassPanel>

          <GlassPanel className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Earned</p>
                <p className="text-3xl font-bold text-cyan-400">
                  ${earnings.total_earned.toFixed(2)}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-cyan-400/50" />
            </div>
          </GlassPanel>

          <GlassPanel className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Withdrawn</p>
                <p className="text-3xl font-bold">
                  ${earnings.total_withdrawn.toFixed(2)}
                </p>
              </div>
              <Wallet className="w-10 h-10 text-purple-400/50" />
            </div>
          </GlassPanel>
        </div>

        {/* Withdrawal History */}
        <GlassPanel className="p-6">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-cyan-400" />
            Withdrawal History
          </h2>
          
          {withdrawals.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Download className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No withdrawals yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {withdrawals.map((withdrawal) => (
                <div
                  key={withdrawal.id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(withdrawal.status)}
                    <div>
                      <p className="text-sm font-medium capitalize">{withdrawal.status}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(withdrawal.created_at).toLocaleDateString()}
                      </p>
                      {withdrawal.error_message && (
                        <p className="text-xs text-red-400 mt-1">
                          {withdrawal.error_message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      ${withdrawal.amount_usd.toFixed(2)}
                    </p>
                    {withdrawal.transaction_signature && (
                      <a
                        href={`https://solscan.io/tx/${withdrawal.transaction_signature}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-cyan-400 hover:underline"
                      >
                        View TX
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassPanel>
      </div>
    </div>
  )
}

