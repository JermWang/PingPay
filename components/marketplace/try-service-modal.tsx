"use client"

import * as React from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { getAssociatedTokenAddress, createTransferInstruction, TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { GlowButton } from "@/components/shared/GlowButton"
import type { Service } from "@/lib/types"
import { EXAMPLE_SOLANA_ADDRESS, EXAMPLE_VOTE_ACCOUNT } from "@/lib/constants"
import { CheckCircle2, Circle, Wallet, Send, Sparkles, Key, CreditCard } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

interface TryServiceModalProps {
  service: Service
}

type QuoteState = {
  quoteId: string
  amountUsd: number
  address: string
  expiresAt: string
} | null

const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v') // USDC on mainnet
const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'

export function TryServiceModal({ service }: TryServiceModalProps) {
  const { publicKey, sendTransaction } = useWallet()
  const { toast } = useToast()
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [quote, setQuote] = React.useState<QuoteState>(null)
  const [signature, setSignature] = React.useState("")
  const [result, setResult] = React.useState<any>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = React.useState<'usdc' | 'sol'>('usdc')
  const [solPrice, setSolPrice] = React.useState<number>(0)

  // Fetch SOL price on mount
  React.useEffect(() => {
    async function fetchSolPrice() {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd')
        const data = await res.json()
        setSolPrice(data.solana?.usd || 100)
      } catch (err) {
        setSolPrice(100) // Fallback price
      }
    }
    fetchSolPrice()
  }, [])

  const buildUrl = React.useCallback(() => {
    const url = service.endpoint
    if (url.includes("/balance") || url.includes("/tokens") || url.includes("/transactions")) {
      return `${url}?address=${EXAMPLE_SOLANA_ADDRESS}`
    }
    if (url.includes("/validator")) {
      return `${url}?vote_account=${EXAMPLE_VOTE_ACCOUNT}`
    }
    return url
  }, [service.endpoint])

  const initialRequest = async () => {
    try {
      setLoading(true)
      setError(null)
      setQuote(null)
      setResult(null)

      const res = await fetch(buildUrl(), { method: "GET" })
      if (res.status === 402) {
        const data = await res.json()
        const qid = res.headers.get("X-Quote-Id") || data.quote_id
        const amt = res.headers.get("X-Amount-USD") || data.amount_usd
        const addr = res.headers.get("X-Solana-Address") || data.solana_address
        const exp = res.headers.get("X-Expires-At") || data.expires_at
        setQuote({ quoteId: qid, amountUsd: Number(amt), address: String(addr), expiresAt: String(exp) })
      } else if (res.ok) {
        const data = await res.json()
        setResult(data)
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error || `Request failed (${res.status})`)
      }
    } catch (e: any) {
      setError(e?.message || "Request failed")
    } finally {
      setLoading(false)
    }
  }

  const handleWalletPayment = async () => {
    if (!publicKey || !quote || !sendTransaction) return
    
    try {
      setLoading(true)
      setError(null)

      const connection = new Connection(RPC_URL, 'confirmed')
      const recipientPubkey = new PublicKey(quote.address)

      let txSignature: string

      if (paymentMethod === 'usdc') {
        // USDC Transfer
        const senderTokenAccount = await getAssociatedTokenAddress(USDC_MINT, publicKey)
        const recipientTokenAccount = await getAssociatedTokenAddress(USDC_MINT, recipientPubkey)
        
        const amountInDecimals = Math.floor(quote.amountUsd * 1_000_000) // USDC has 6 decimals

        const transaction = new Transaction().add(
          createTransferInstruction(
            senderTokenAccount,
            recipientTokenAccount,
            publicKey,
            amountInDecimals,
            [],
            TOKEN_PROGRAM_ID
          )
        )

        const { blockhash } = await connection.getLatestBlockhash()
        transaction.recentBlockhash = blockhash
        transaction.feePayer = publicKey

        txSignature = await sendTransaction(transaction, connection)
        
        toast({
          title: "Transaction Sent",
          description: "Waiting for confirmation...",
        })

        await connection.confirmTransaction(txSignature, 'confirmed')

      } else {
        // SOL Transfer
        const amountInLamports = Math.floor((quote.amountUsd / solPrice) * LAMPORTS_PER_SOL)

        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: recipientPubkey,
            lamports: amountInLamports,
          })
        )

        const { blockhash } = await connection.getLatestBlockhash()
        transaction.recentBlockhash = blockhash
        transaction.feePayer = publicKey

        txSignature = await sendTransaction(transaction, connection)
        
        toast({
          title: "Transaction Sent",
          description: "Waiting for confirmation...",
        })

        await connection.confirmTransaction(txSignature, 'confirmed')
      }

      // Now verify with the API
      setSignature(txSignature)
      await verifyWithSignature(txSignature, quote.quoteId)

    } catch (e: any) {
      console.error('Payment error:', e)
      setError(e?.message || "Payment failed")
      toast({
        title: "Payment Failed",
        description: e?.message || "Transaction failed",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const verifyWithSignature = async (txSig?: string, quoteIdOverride?: string) => {
    const useSignature = txSig || signature
    const useQuote = quoteIdOverride || quote?.quoteId
    
    if (!useQuote || !useSignature) return
    
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(buildUrl(), {
        method: "GET",
        headers: {
          "X-Quote-Id": useQuote,
          "X-Transaction-Signature": useSignature,
        },
      })
      if (res.ok) {
        const data = await res.json()
        setResult(data)
        setQuote(null)
        toast({
          title: "Success!",
          description: "Payment verified and data received",
        })
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error || `Verification failed (${res.status})`)
      }
    } catch (e: any) {
      setError(e?.message || "Verification failed")
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setQuote(null)
    setSignature("")
    setResult(null)
    setError(null)
  }

  const currentStep = result ? 3 : quote ? 2 : 1

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset() }}>
      <DialogTrigger asChild>
        <GlowButton label="Try Now" className="w-full" />
      </DialogTrigger>
      <DialogContent className="backdrop-blur-xl bg-white/5 border border-white/10 p-4 sm:p-6 max-h-[85vh] overflow-y-auto sm:max-w-2xl shadow-[0_0_25px_rgba(0,249,255,0.15)]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            {service.name}
          </DialogTitle>
          <DialogDescription>{service.description}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="x402" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-black/40 backdrop-blur-xl border border-white/20">
            <TabsTrigger value="x402" className="flex items-center gap-2 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-white text-white/60">
              <CreditCard className="w-4 h-4" />
              One-Time Payment
            </TabsTrigger>
            <TabsTrigger value="api-key" className="flex items-center gap-2 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-white text-white/60">
              <Key className="w-4 h-4" />
              With API Key
            </TabsTrigger>
          </TabsList>

          <TabsContent value="x402" className="space-y-6">
          {/* Step Indicators */}
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-5 h-[2px] bg-white/10 -z-10" />
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-cyan-500/20 border-2 border-cyan-400' : 'bg-white/5 border border-white/20'}`}>
                {currentStep > 1 ? <CheckCircle2 className="w-5 h-5 text-cyan-400" /> : <Circle className="w-5 h-5 text-muted-foreground" />}
              </div>
              <span className="text-xs text-center">Request</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-cyan-500/20 border-2 border-cyan-400' : 'bg-white/5 border border-white/20'}`}>
                {currentStep > 2 ? <CheckCircle2 className="w-5 h-5 text-cyan-400" /> : <Wallet className="w-5 h-5 text-muted-foreground" />}
              </div>
              <span className="text-xs text-center">Pay</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-cyan-500/20 border-2 border-cyan-400' : 'bg-white/5 border border-white/20'}`}>
                {currentStep >= 3 ? <CheckCircle2 className="w-5 h-5 text-cyan-400" /> : <Send className="w-5 h-5 text-muted-foreground" />}
              </div>
              <span className="text-xs text-center">Results</span>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-cyan-500/20 backdrop-blur-md border border-cyan-400/40 rounded-lg p-3 text-sm shadow-lg">
            <p className="text-white">
              💡 <strong>How it works:</strong> This API uses HTTP 402 (Payment Required). Make a request, get a payment quote, pay with Solana, then get your data!
            </p>
          </div>

          {/* Endpoint */}
          <div className="text-xs">
            <div className="text-white/80 mb-1">API Endpoint:</div>
            <code className="text-white bg-black/60 backdrop-blur-md border border-white/10 px-2 py-1 rounded block overflow-x-auto">{buildUrl()}</code>
          </div>

          {/* Step 1: Initial Request */}
          {!quote && !result && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-sm flex items-center gap-2 text-white">
                  <Circle className="w-4 h-4 text-cyan-400" />
                  Step 1: Make Your Request
                </h3>
                <p className="text-sm text-white/80">
                  Click below to send a request to the API. You'll receive a payment quote with the price and payment details.
                </p>
              </div>
              <GlowButton 
                label={loading ? "Requesting..." : "Request Demo"} 
                onClick={initialRequest} 
                disabled={loading}
                className="w-full"
              />
              {error && (
                <div className="bg-red-500/20 backdrop-blur-md border border-red-400/40 rounded-lg p-3 text-sm text-white shadow-lg">
                  ⚠️ {error}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Payment Required */}
          {quote && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-sm flex items-center gap-2 text-white">
                  <Wallet className="w-4 h-4 text-cyan-400" />
                  Step 2: Make Payment
                </h3>
                <p className="text-sm text-white/80">
                  The API returned a payment quote. Send the exact amount to the address below using your Solana wallet.
                </p>
              </div>

              <div className="bg-black/50 backdrop-blur-md border border-white/20 rounded-lg p-4 space-y-3 shadow-xl">
                <div className="space-y-2">
                  <span className="text-white/80 text-sm">Payment Method</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPaymentMethod('usdc')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        paymentMethod === 'usdc'
                          ? 'bg-cyan-500/20 border-2 border-cyan-400 text-white'
                          : 'bg-black/40 border border-white/20 text-white/60 hover:text-white'
                      }`}
                    >
                      💵 USDC
                      <div className="text-xs mt-1 font-bold text-cyan-400">
                        {quote.amountUsd.toFixed(4)} USDC
                      </div>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('sol')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        paymentMethod === 'sol'
                          ? 'bg-cyan-500/20 border-2 border-cyan-400 text-white'
                          : 'bg-black/40 border border-white/20 text-white/60 hover:text-white'
                      }`}
                    >
                      ◎ SOL
                      <div className="text-xs mt-1 font-bold text-cyan-400">
                        {solPrice > 0 ? (quote.amountUsd / solPrice).toFixed(6) : '...'} SOL
                      </div>
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-white/80 text-xs">Recipient Address</span>
                  <div className="bg-black/60 backdrop-blur-sm border border-white/10 rounded px-2 py-1.5 font-mono text-xs break-all text-white">
                    {quote.address}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/80">Expires at</span>
                  <span className="text-white">{new Date(quote.expiresAt).toLocaleTimeString()}</span>
                </div>
              </div>

              {publicKey ? (
                <div className="space-y-3">
                  <div className="bg-green-500/20 backdrop-blur-md border border-green-400/40 rounded-lg p-3 text-xs text-white shadow-lg">
                    <strong>✅ Wallet Connected:</strong> {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
                  </div>
                  
                  <GlowButton 
                    label={loading ? "Processing Payment..." : `💳 Pay ${paymentMethod === 'usdc' ? quote.amountUsd.toFixed(4) + ' USDC' : (solPrice > 0 ? (quote.amountUsd / solPrice).toFixed(6) : '...') + ' SOL'} with Connected Wallet`}
                    onClick={handleWalletPayment}
                    disabled={loading}
                    className="w-full"
                  />

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/20"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 bg-black text-white/60">OR</span>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="bg-amber-500/20 backdrop-blur-md border border-amber-400/40 rounded-lg p-3 text-xs text-white shadow-lg">
                <strong>📋 Manual Payment Instructions:</strong>
                <ol className="mt-1 ml-4 space-y-1 list-decimal">
                  <li>Copy the recipient address above</li>
                  <li>Open your Solana wallet (Phantom, Solflare, etc.)</li>
                  <li>Send <strong>{paymentMethod === 'usdc' ? `${quote.amountUsd.toFixed(4)} USDC` : `${solPrice > 0 ? (quote.amountUsd / solPrice).toFixed(6) : '...'} SOL`}</strong> to the address</li>
                  <li>Copy the transaction signature</li>
                  <li>Paste it below and submit</li>
                </ol>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-white/80">Transaction Signature</label>
                <input
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  placeholder="Paste your transaction signature here..."
                  className="w-full bg-black/50 backdrop-blur-md border border-white/20 rounded-md px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-cyan-400/50 transition-colors font-mono shadow-lg"
                />
                <GlowButton 
                  label={loading ? "Verifying Payment..." : "Submit & Get Data"} 
                  onClick={() => verifyWithSignature()} 
                  disabled={loading || signature.length < 32}
                  className="w-full"
                />
                {error && (
                  <div className="bg-red-500/20 backdrop-blur-md border border-red-400/40 rounded-lg p-3 text-sm text-white shadow-lg">
                    ⚠️ {error}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Results */}
          {result && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-sm flex items-center gap-2 text-white">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  Step 3: Success! Here's Your Data
                </h3>
                <p className="text-sm text-white/80">
                  Payment verified! Below is the API response with your requested data.
                </p>
              </div>

              <div className="bg-green-500/20 backdrop-blur-md border border-green-400/40 rounded-lg p-3 text-sm text-white shadow-lg">
                ✅ Payment successful! The API has processed your request.
              </div>

              <div className="space-y-2">
                <div className="text-sm font-semibold text-white">API Response:</div>
                <pre className="max-h-64 overflow-auto bg-black/60 backdrop-blur-md border border-white/20 rounded-md p-3 text-xs font-mono text-green-400 shadow-xl">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>

              <div className="flex gap-2">
                <GlowButton label="Try Again" onClick={() => { reset(); initialRequest(); }} className="flex-1" />
                <GlowButton label="Close" onClick={() => setOpen(false)} className="flex-1" />
              </div>
            </div>
          )}
          </TabsContent>

          <TabsContent value="api-key" className="space-y-4">
            <div className="bg-cyan-500/20 backdrop-blur-md border border-cyan-400/40 rounded-lg p-4 text-sm space-y-3 shadow-lg">
              <p className="text-white">
                <strong>⚡ Use API Keys for Production:</strong>
              </p>
              <ul className="text-white space-y-1 ml-4 list-disc">
                <li>No manual payment per request</li>
                <li>Pay from prepaid balance</li>
                <li>Perfect for apps and scripts</li>
                <li>Track usage in your dashboard</li>
              </ul>
            </div>

            <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-lg p-4 space-y-2 shadow-xl">
              <code className="text-xs text-green-400 block">
                # Example with API Key
              </code>
              <code className="text-xs text-white block break-all">
                curl -H "Authorization: Bearer YOUR_API_KEY" \
              </code>
              <code className="text-xs text-white block break-all">
                {buildUrl()}
              </code>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-white/80">
                Get started with API keys:
              </p>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">1.</span>
                  <span className="text-sm text-white">Connect your wallet and create an account</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">2.</span>
                  <span className="text-sm text-white">Deposit funds (no minimum required)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">3.</span>
                  <span className="text-sm text-white">Generate an API key in your dashboard</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">4.</span>
                  <span className="text-sm text-white">Use it in your app - balance deducts automatically</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <GlowButton 
                label="Go to Dashboard" 
                onClick={() => window.location.href = '/dashboard'}
                className="flex-1"
              />
              <GlowButton 
                label="Learn More" 
                onClick={() => window.location.href = '/docs'}
                className="flex-1"
              />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
