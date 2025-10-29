"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { GlowButton } from "@/components/shared/GlowButton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowDownToLine, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface WithdrawalModalProps {
  walletAddress: string
  currentBalance: number
  onSuccess: () => void
}

export function WithdrawalModal({ walletAddress, currentBalance, onSuccess }: WithdrawalModalProps) {
  const [open, setOpen] = React.useState(false)
  const [amount, setAmount] = React.useState("")
  const [recipientAddress, setRecipientAddress] = React.useState(walletAddress)
  const [loading, setLoading] = React.useState(false)
  const { toast } = useToast()

  const handleWithdraw = async () => {
    if (!amount || !recipientAddress) {
      toast({
        title: "Missing Information",
        description: "Please enter amount and recipient address",
        variant: "destructive",
      })
      return
    }

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    if (amountNum < 10) {
      toast({
        title: "Minimum Amount",
        description: "Minimum withdrawal is $10",
        variant: "destructive",
      })
      return
    }

    if (amountNum > currentBalance) {
      toast({
        title: "Insufficient Balance",
        description: "Amount exceeds your available balance",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      const res = await fetch("/api/account/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet: walletAddress,
          amount: amountNum,
          recipient_address: recipientAddress,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || data.message)

      toast({
        title: "Withdrawal Requested",
        description: "Your withdrawal will be processed within 24-48 hours",
      })

      setAmount("")
      setRecipientAddress(walletAddress)
      setOpen(false)
      onSuccess()
    } catch (error: any) {
      toast({
        title: "Withdrawal Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <GlowButton label="Withdraw Funds" className="w-full">
          <ArrowDownToLine className="w-4 h-4 mr-2" />
          Withdraw Funds
        </GlowButton>
      </DialogTrigger>
      <DialogContent className="backdrop-blur-xl bg-black/90 border border-white/20 shadow-xl">
        <DialogHeader>
          <DialogTitle>Withdraw Funds</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-amber-500/20 backdrop-blur-md border border-amber-400/40 rounded-lg p-3 text-sm">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-white space-y-1">
                <p><strong>Processing Time:</strong> 24-48 hours</p>
                <p><strong>Minimum:</strong> $10 USD</p>
                <p><strong>Fee:</strong> Free</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-white/80">Amount (USD)</Label>
            <Input
              id="amount"
              type="number"
              min="10"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="bg-black/50 backdrop-blur-md border-white/20 text-white"
            />
            <p className="text-xs text-white/60">
              Available: ${currentBalance.toFixed(2)}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipient" className="text-white/80">Recipient Solana Address</Label>
            <Input
              id="recipient"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              placeholder="Your Solana wallet address"
              className="bg-black/50 backdrop-blur-md border-white/20 text-white font-mono text-xs"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <GlowButton
              label="Cancel"
              onClick={() => setOpen(false)}
              className="flex-1 bg-white/5"
            >
              Cancel
            </GlowButton>
            <GlowButton
              label={loading ? "Processing..." : "Request Withdrawal"}
              onClick={handleWithdraw}
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Processing..." : "Request Withdrawal"}
            </GlowButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

