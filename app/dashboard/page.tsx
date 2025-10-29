"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { useWallet } from "@solana/wallet-adapter-react"
import { GlowButton } from "@/components/shared/GlowButton"
import { GlassPanel } from "@/components/shared/GlassPanel"
import { ApiKeyCard } from "@/components/account/api-key-card"
import { DepositModal } from "@/components/account/deposit-modal"
import { WithdrawalModal } from "@/components/account/withdrawal-modal"
import { 
  Wallet, 
  Key, 
  Activity, 
  Plus, 
  TrendingUp, 
  Clock,
  DollarSign,
  RefreshCw,
  ArrowDownToLine
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { ApiKey, AccountTransaction, UserAccount } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

const WalletMultiButton = dynamic(
  () => import("@solana/wallet-adapter-react-ui").then((mod) => mod.WalletMultiButton),
  { ssr: false }
)

export default function DashboardPage() {
  const { publicKey } = useWallet()
  const [account, setAccount] = React.useState<UserAccount | null>(null)
  const [apiKeys, setApiKeys] = React.useState<ApiKey[]>([])
  const [transactions, setTransactions] = React.useState<AccountTransaction[]>([])
  const [loading, setLoading] = React.useState(true)
  const [depositOpen, setDepositOpen] = React.useState(false)
  const [createKeyOpen, setCreateKeyOpen] = React.useState(false)
  const [newKeyName, setNewKeyName] = React.useState("")
  const [createdKey, setCreatedKey] = React.useState<{ apiKey: ApiKey; plainKey: string } | null>(null)
  const { toast } = useToast()

  const walletAddress = publicKey?.toBase58()

  const fetchDashboardData = React.useCallback(async () => {
    if (!walletAddress) return

    try {
      setLoading(true)
      
      // Fetch account balance
      const accountRes = await fetch(`/api/account/balance?wallet=${walletAddress}`)
      const accountData = await accountRes.json()
      if (accountData.success) setAccount(accountData.data)

      // Fetch API keys
      const keysRes = await fetch(`/api/account/keys?wallet=${walletAddress}`)
      const keysData = await keysRes.json()
      if (keysData.success) setApiKeys(keysData.data)

      // Fetch transactions
      const txRes = await fetch(`/api/account/transactions?wallet=${walletAddress}&limit=10`)
      const txData = await txRes.json()
      if (txData.success) setTransactions(txData.data)
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }, [walletAddress])

  React.useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const handleCreateKey = async () => {
    if (!walletAddress) return

    try {
      const res = await fetch("/api/account/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet: walletAddress,
          name: newKeyName || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      // Extract plain_key and create the expected format
      const { plain_key, ...apiKey } = data.data
      setCreatedKey({
        apiKey,
        plainKey: plain_key
      })
      setNewKeyName("")
      setCreateKeyOpen(false)
      fetchDashboardData()

      toast({
        title: "API Key Created",
        description: "Your new API key has been generated. Save it now!",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleRevokeKey = async (keyId: string) => {
    if (!walletAddress) return

    try {
      const res = await fetch(`/api/account/keys/${keyId}?wallet=${walletAddress}`, {
        method: "DELETE",
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      toast({
        title: "API Key Revoked",
        description: "The API key has been deactivated",
      })

      fetchDashboardData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  if (!publicKey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <GlassPanel className="max-w-md w-full text-center space-y-6 p-8">
          <Wallet className="w-16 h-16 text-cyan-400 mx-auto" />
          <div>
            <h1 className="text-2xl font-bold mb-2">Developer Dashboard</h1>
            <p className="text-muted-foreground">
              Connect your wallet to access your dashboard
            </p>
          </div>
          <WalletMultiButton className="!bg-cyan-500 hover:!bg-cyan-600 !rounded-lg" />
        </GlassPanel>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">Developer Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your account, API keys, and usage
            </p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassPanel className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Account Balance</p>
                <p className="text-3xl font-bold text-cyan-400">
                  ${account?.balance_usd.toFixed(2) || "0.00"}
                </p>
              </div>
              <Wallet className="w-10 h-10 text-cyan-400/50" />
            </div>
            <div className="flex gap-2 mt-4">
              <GlowButton
                label="Add Funds"
                onClick={() => setDepositOpen(true)}
                className="flex-1"
              />
              {account && account.balance_usd >= 10 && (
                <WithdrawalModal
                  walletAddress={walletAddress!}
                  currentBalance={account.balance_usd}
                  onSuccess={fetchDashboardData}
                />
              )}
            </div>
          </GlassPanel>

          <GlassPanel className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Spent</p>
                <p className="text-3xl font-bold">
                  ${account?.total_spent.toFixed(2) || "0.00"}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-purple-400/50" />
            </div>
          </GlassPanel>

          <GlassPanel className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Active Keys</p>
                <p className="text-3xl font-bold">
                  {apiKeys.filter(k => k.is_active).length}
                </p>
              </div>
              <Key className="w-10 h-10 text-green-400/50" />
            </div>
          </GlassPanel>
        </div>

        {/* API Keys Section */}
        <GlassPanel className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Key className="w-5 h-5 text-cyan-400" />
                API Keys
              </h2>
              <p className="text-sm text-muted-foreground">
                Use API keys to authenticate your requests
              </p>
            </div>
            <Dialog open={createKeyOpen} onOpenChange={setCreateKeyOpen}>
              <DialogTrigger asChild>
                <GlowButton label="Create Key" />
              </DialogTrigger>
              <DialogContent className="backdrop-blur-xl bg-white/5 border border-white/10">
                <DialogHeader>
                  <DialogTitle>Create API Key</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="keyName">Key Name (Optional)</Label>
                    <Input
                      id="keyName"
                      placeholder="My App"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <GlowButton
                    label="Generate Key"
                    onClick={handleCreateKey}
                    className="w-full"
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {createdKey && (
            <div className="mb-4">
              <ApiKeyCard
                apiKey={createdKey.apiKey}
                plainKey={createdKey.plainKey}
                onRevoke={() => handleRevokeKey(createdKey.apiKey.id)}
              />
            </div>
          )}

          <div className="space-y-3">
            {apiKeys.length === 0 && !createdKey && (
              <div className="text-center py-12 text-muted-foreground">
                <Key className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No API keys yet</p>
                <p className="text-sm">Create your first key to get started</p>
              </div>
            )}
            {apiKeys.map((key) => (
              <ApiKeyCard
                key={key.id}
                apiKey={key}
                onRevoke={() => handleRevokeKey(key.id)}
              />
            ))}
          </div>
        </GlassPanel>

        {/* Recent Transactions */}
        <GlassPanel className="p-6">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-cyan-400" />
            Recent Transactions
          </h2>
          
          {transactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      tx.type === 'deposit' ? 'bg-green-400' :
                      tx.type === 'spend' ? 'bg-cyan-400' :
                      'bg-amber-400'
                    }`} />
                    <div>
                      <p className="text-sm font-medium capitalize">{tx.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {tx.description || 'Transaction'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${
                      tx.type === 'deposit' ? 'text-green-400' : 'text-foreground'
                    }`}>
                      {tx.type === 'deposit' ? '+' : '-'}${tx.amount_usd.toFixed(4)}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(tx.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassPanel>
      </div>

      {walletAddress && (
        <DepositModal
          open={depositOpen}
          onOpenChange={setDepositOpen}
          walletAddress={walletAddress}
          onSuccess={fetchDashboardData}
        />
      )}
    </div>
  )
}

