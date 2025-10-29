"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { GlowButton } from "@/components/shared/GlowButton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, Copy, Wallet, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DepositModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  walletAddress: string
  onSuccess?: () => void
}

export function DepositModal({ open, onOpenChange, walletAddress, onSuccess }: DepositModalProps) {
  const [amount, setAmount] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [depositDetails, setDepositDetails] = React.useState<any>(null)
  const [signature, setSignature] = React.useState("")
  const [verifying, setVerifying] = React.useState(false)
  const [success, setSuccess] = React.useState(false)
  const { toast } = useToast()

  const initiateDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      const res = await fetch("/api/account/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet: walletAddress,
          amount: parseFloat(amount),
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to initiate deposit")

      setDepositDetails(data.data)
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

  const verifyDeposit = async () => {
    if (!signature || signature.length < 32) {
      toast({
        title: "Invalid signature",
        description: "Please enter a valid transaction signature",
        variant: "destructive",
      })
      return
    }

    try {
      setVerifying(true)
      const res = await fetch("/api/account/deposit/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet: walletAddress,
          amount: depositDetails.amount_usd,
          transaction_signature: signature,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to verify deposit")

      setSuccess(true)
      toast({
        title: "Success!",
        description: `$${depositDetails.amount_usd} added to your account`,
      })

      setTimeout(() => {
        onSuccess?.()
        handleClose()
      }, 2000)
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setVerifying(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Address copied to clipboard",
    })
  }

  const handleClose = () => {
    setAmount("")
    setDepositDetails(null)
    setSignature("")
    setSuccess(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 max-w-md shadow-[0_0_25px_rgba(0,249,255,0.15)]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-cyan-400" />
            Deposit Funds
          </DialogTitle>
          <DialogDescription>
            Add USDC to your PingPay account balance
          </DialogDescription>
        </DialogHeader>

        {!depositDetails && !success && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USD)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="10.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-white/5 border-white/10"
              />
              <p className="text-xs text-muted-foreground">
                No minimum deposit required
              </p>
            </div>

            <GlowButton
              label={loading ? "Preparing..." : "Continue"}
              onClick={initiateDeposit}
              disabled={loading || !amount}
              className="w-full"
            />
          </div>
        )}

        {depositDetails && !success && (
          <div className="space-y-4">
            <div className="bg-cyan-500/10 border border-cyan-400/30 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Amount</span>
                <span className="text-lg font-bold text-cyan-400">
                  ${depositDetails.amount_usd} USDC
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-muted-foreground text-xs">Send USDC to:</span>
                <div className="bg-black/40 rounded px-3 py-2 flex items-center justify-between gap-2">
                  <span className="font-mono text-xs break-all">
                    {depositDetails.recipient_address}
                  </span>
                  <button
                    onClick={() => copyToClipboard(depositDetails.recipient_address)}
                    className="text-cyan-400 hover:text-cyan-300 flex-shrink-0"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                Expires: {new Date(depositDetails.expires_at).toLocaleTimeString()}
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-400/30 rounded-lg p-3 text-xs">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Important:</strong>
                  <ul className="mt-1 ml-4 space-y-1 list-disc text-amber-100">
                    <li>Send USDC on Solana (SPL token)</li>
                    <li>Use the exact amount shown above</li>
                    <li>Copy your transaction signature after sending</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signature">Transaction Signature</Label>
              <Input
                id="signature"
                placeholder="Paste transaction signature here..."
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                className="bg-white/5 border-white/10 font-mono text-xs"
              />
              <GlowButton
                label={verifying ? "Verifying..." : "Verify & Complete"}
                onClick={verifyDeposit}
                disabled={verifying || signature.length < 32}
                className="w-full"
              />
            </div>

            <button
              onClick={() => setDepositDetails(null)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
            >
              ← Back
            </button>
          </div>
        )}

        {success && (
          <div className="space-y-4 py-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-green-400">Deposit Successful!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your balance has been updated
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

