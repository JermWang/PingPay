"use client"

import * as React from "react"
import { GlassPanel } from "@/components/shared/GlassPanel"
import { GlowButton } from "@/components/shared/GlowButton"
import { useToast } from "@/hooks/use-toast"
import { 
  ArrowDownToLine, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  AlertTriangle,
  TrendingUp,
  Database
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AdminPage() {
  const [withdrawals, setWithdrawals] = React.useState<any[]>([])
  const [reconciliation, setReconciliation] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(false)
  const [processingId, setProcessingId] = React.useState<string | null>(null)
  const [txSignature, setTxSignature] = React.useState("")
  const { toast } = useToast()

  const fetchWithdrawals = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/withdrawals")
      const data = await res.json()
      if (data.success) setWithdrawals(data.data)
    } catch (error) {
      console.error("Failed to fetch withdrawals:", error)
    } finally {
      setLoading(false)
    }
  }

  const runReconciliation = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/reconciliation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ run_by: "admin" }),
      })
      const data = await res.json()
      if (data.success) {
        setReconciliation(data.data)
        toast({
          title: "Reconciliation Complete",
          description: data.data.status === "matched" 
            ? "All balances match!" 
            : "Discrepancies found",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const completeWithdrawal = async (withdrawalId: string) => {
    if (!txSignature) {
      toast({
        title: "Missing Signature",
        description: "Please enter the transaction signature",
        variant: "destructive",
      })
      return
    }

    try {
      const res = await fetch("/api/admin/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          withdrawal_id: withdrawalId,
          transaction_signature: txSignature,
          processed_by: "admin",
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || data.message)

      toast({
        title: "Withdrawal Completed",
        description: "The withdrawal has been marked as completed",
      })

      setTxSignature("")
      setProcessingId(null)
      fetchWithdrawals()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  React.useEffect(() => {
    fetchWithdrawals()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage withdrawals and run reconciliation checks
          </p>
        </div>

        {/* Reconciliation Section */}
        <GlassPanel className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Database className="w-5 h-5 text-cyan-400" />
                Balance Reconciliation
              </h2>
              <p className="text-sm text-muted-foreground">
                Compare database balances with on-chain treasury
              </p>
            </div>
            <GlowButton
              label={loading ? "Running..." : "Run Check"}
              onClick={runReconciliation}
              disabled={loading}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Run Check
            </GlowButton>
          </div>

          {reconciliation && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-lg p-4">
                  <p className="text-sm text-white/80">Database Total</p>
                  <p className="text-2xl font-bold text-cyan-400">
                    ${reconciliation.totalDatabaseBalance.toFixed(2)}
                  </p>
                </div>
                <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-lg p-4">
                  <p className="text-sm text-white/80">On-Chain Total</p>
                  <p className="text-2xl font-bold text-green-400">
                    ${reconciliation.totalOnChainBalance.toFixed(2)}
                  </p>
                </div>
                <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-lg p-4">
                  <p className="text-sm text-white/80">Difference</p>
                  <p className={`text-2xl font-bold ${
                    Math.abs(reconciliation.difference) < 0.01 
                      ? "text-green-400" 
                      : "text-red-400"
                  }`}>
                    ${Math.abs(reconciliation.difference).toFixed(2)}
                  </p>
                </div>
              </div>

              {reconciliation.status === "matched" ? (
                <div className="bg-green-500/20 backdrop-blur-md border border-green-400/40 rounded-lg p-4 text-white">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span className="font-semibold">All balances match!</span>
                  </div>
                  <p className="text-sm mt-1 text-white/80">
                    {reconciliation.accountCount} accounts verified
                  </p>
                </div>
              ) : (
                <div className="bg-red-500/20 backdrop-blur-md border border-red-400/40 rounded-lg p-4 text-white">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <span className="font-semibold">Discrepancy detected</span>
                  </div>
                  <p className="text-sm mt-1 text-white/80">
                    Please review the difference and investigate
                  </p>
                </div>
              )}
            </div>
          )}
        </GlassPanel>

        {/* Pending Withdrawals Section */}
        <GlassPanel className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ArrowDownToLine className="w-5 h-5 text-cyan-400" />
                Pending Withdrawals
              </h2>
              <p className="text-sm text-muted-foreground">
                Process user withdrawal requests
              </p>
            </div>
            <button
              onClick={fetchWithdrawals}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {withdrawals.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ArrowDownToLine className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No pending withdrawals</p>
            </div>
          ) : (
            <div className="space-y-3">
              {withdrawals.map((withdrawal) => (
                <div
                  key={withdrawal.id}
                  className="bg-black/40 backdrop-blur-md border border-white/20 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-mono text-xs text-white/60 mb-1">
                        {withdrawal.user_wallet.slice(0, 8)}...{withdrawal.user_wallet.slice(-8)}
                      </p>
                      <p className="text-2xl font-bold text-cyan-400">
                        ${withdrawal.amount_usd.toFixed(2)}
                      </p>
                      <p className="text-xs text-white/60 mt-1">
                        Recipient: {withdrawal.recipient_address.slice(0, 8)}...{withdrawal.recipient_address.slice(-8)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        withdrawal.status === "pending" 
                          ? "bg-yellow-500/20 text-yellow-400" 
                          : "bg-blue-500/20 text-blue-400"
                      }`}>
                        {withdrawal.status}
                      </span>
                      <p className="text-xs text-white/60 mt-2">
                        {new Date(withdrawal.requested_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {processingId === withdrawal.id ? (
                    <div className="space-y-3 pt-3 border-t border-white/10">
                      <div className="space-y-2">
                        <Label htmlFor={`tx-${withdrawal.id}`} className="text-white/80 text-xs">
                          Transaction Signature (after sending funds)
                        </Label>
                        <Input
                          id={`tx-${withdrawal.id}`}
                          value={txSignature}
                          onChange={(e) => setTxSignature(e.target.value)}
                          placeholder="Enter Solana transaction signature..."
                          className="bg-black/50 backdrop-blur-md border-white/20 text-white font-mono text-xs"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setProcessingId(null)
                            setTxSignature("")
                          }}
                          className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors text-sm"
                        >
                          Cancel
                        </button>
                        <GlowButton
                          label="Mark Complete"
                          onClick={() => completeWithdrawal(withdrawal.id)}
                          className="flex-1"
                          disabled={!txSignature}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Mark Complete
                        </GlowButton>
                      </div>
                    </div>
                  ) : (
                    <GlowButton
                      label="Process Withdrawal"
                      onClick={() => setProcessingId(withdrawal.id)}
                      className="w-full"
                    >
                      Process Withdrawal
                    </GlowButton>
                  )}
                </div>
              ))}
            </div>
          )}
        </GlassPanel>
      </div>
    </div>
  )
}

