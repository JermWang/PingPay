"use client"

import * as React from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { getAssociatedTokenAddress, createTransferInstruction, createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID } from "@solana/spl-token"
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
  asset?: 'USDC' | 'SOL'
  tokenAccount?: string
} | null

const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v') // USDC on mainnet

// Get RPC endpoints - prioritize custom RPC from env, then fallbacks
const getRpcEndpoints = () => {
  const endpoints = []
  if (process.env.NEXT_PUBLIC_SOLANA_RPC_URL) {
    endpoints.push(process.env.NEXT_PUBLIC_SOLANA_RPC_URL)
  }
  // Fallback public RPCs
  endpoints.push(
    'https://solana-mainnet.g.alchemy.com/v2/demo',
    'https://solana-api.projectserum.com',
    'https://rpc.ankr.com/solana',
    'https://solana-mainnet.rpc.extrnode.com'
  )
  return endpoints
}

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

  // Fetch SOL price on mount and refresh every 30 seconds
  React.useEffect(() => {
    async function fetchSolPrice() {
      try {
        const res = await fetch('/api/solana/price', {
          cache: 'no-store'
        })
        if (!res.ok) throw new Error('Failed to fetch SOL price')
        const data = await res.json()
        if (!data.price) throw new Error('Invalid price data')
        setSolPrice(data.price)
        console.log('✅ Live SOL Price Updated: $' + data.price.toFixed(2))
      } catch (err) {
        console.error('❌ Failed to fetch live SOL price:', err)
        // Silently fail - don't show toast on every refresh failure
        // User can still use USDC payment
      }
    }
    fetchSolPrice()
    const interval = setInterval(fetchSolPrice, 30000) // Refresh every 30s
    return () => clearInterval(interval)
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
        const asset = (res.headers.get('X-Asset') || data.asset || 'USDC') as 'USDC' | 'SOL'
        const tokenAccount = res.headers.get('X-Token-Account') || data.receiver_token_account
        setQuote({ quoteId: qid, amountUsd: Number(amt), address: String(addr), expiresAt: String(exp), asset, tokenAccount })
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

  // Helper to get a working RPC connection
  const getConnection = async (): Promise<Connection> => {
    const endpoints = getRpcEndpoints()
    // Try each RPC endpoint until one works
    for (const rpcUrl of endpoints) {
      try {
        const conn = new Connection(rpcUrl, 'confirmed')
        // Test the connection
        await conn.getLatestBlockhash('finalized')
        console.log('✅ Connected to RPC:', rpcUrl.includes('helius') ? 'Helius (Premium)' : rpcUrl.split('/')[2])
        return conn
      } catch (err) {
        console.warn('❌ RPC failed:', rpcUrl.split('/')[2], err)
        continue
      }
    }
    throw new Error('All RPC endpoints failed. Please try again.')
  }

  const handleWalletPayment = async () => {
    if (!publicKey || !quote || !sendTransaction) return
    
    try {
      setLoading(true)
      setError(null)

      // Get a working connection
      const connection = await getConnection()
      const recipientPubkey = new PublicKey(quote.address)

      let txSignature: string

      if ((quote.asset || 'USDC') === 'USDC' && paymentMethod === 'usdc') {
        // USDC Transfer
        const senderTokenAccount = await getAssociatedTokenAddress(USDC_MINT, publicKey)
        const recipientTokenAccount = quote.tokenAccount
          ? new PublicKey(quote.tokenAccount)
          : await getAssociatedTokenAddress(USDC_MINT, recipientPubkey)

        const senderInfo = await connection.getAccountInfo(senderTokenAccount)
        const recipientInfo = await connection.getAccountInfo(recipientTokenAccount)

        const amountInDecimals = Math.floor(quote.amountUsd * 1_000_000) // USDC has 6 decimals

        const transaction = new Transaction()
        // Ensure ATAs exist (payer will fund creation if missing)
        if (!senderInfo) {
          transaction.add(
            createAssociatedTokenAccountInstruction(
              publicKey,
              senderTokenAccount,
              publicKey,
              USDC_MINT
            )
          )
        }
        // Do not create receiver ATA; assume server provided valid token account

        transaction.add(
          createTransferInstruction(
            senderTokenAccount,
            recipientTokenAccount,
            publicKey,
            amountInDecimals,
            [],
            TOKEN_PROGRAM_ID
          )
        )

        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized')
        transaction.recentBlockhash = blockhash
        transaction.feePayer = publicKey

        txSignature = await sendTransaction(transaction, connection, {
          skipPreflight: false,
          preflightCommitment: 'confirmed'
        })
        
        toast({
          title: "Transaction Sent",
          description: "Waiting for confirmation...",
        })

        const conf = await connection.confirmTransaction({
          signature: txSignature,
          blockhash,
          lastValidBlockHeight
        }, 'confirmed')
        if (conf?.value?.err) {
          throw new Error(`On-chain error: ${JSON.stringify(conf.value.err)}`)
        }

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

        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized')
        transaction.recentBlockhash = blockhash
        transaction.feePayer = publicKey

        txSignature = await sendTransaction(transaction, connection, {
          skipPreflight: false,
          preflightCommitment: 'confirmed'
        })
        
        toast({
          title: "Transaction Sent",
          description: "Waiting for confirmation...",
        })

        const confirmation = await connection.confirmTransaction({
          signature: txSignature,
          blockhash,
          lastValidBlockHeight
        }, 'confirmed')
        
        console.log('✅ Transaction Confirmed:', txSignature)
        console.log('Confirmation:', confirmation)
        if (confirmation?.value?.err) {
          throw new Error(`On-chain error: ${JSON.stringify(confirmation.value.err)}`)
        }
      }

      toast({
        title: "Transaction Confirmed!",
        description: "Verifying payment with API...",
      })

      // Optional small delay to allow RPC indexers to catch up
      await new Promise((r) => setTimeout(r, 2000))

      // Now verify with the API
      console.log('🔍 Verifying with API. Quote ID:', quote.quoteId, 'Signature:', txSignature)
      setSignature(txSignature)
      await verifyWithSignature(txSignature, quote.quoteId)

    } catch (e: any) {
      console.error('❌ Payment error:', e)
      console.error('Error stack:', e.stack)
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
    
    if (!useQuote || !useSignature) {
      console.error('❌ Missing quote or signature:', { useQuote, useSignature })
      return
    }
    
    try {
      setLoading(true)
      setError(null)

      const url = buildUrl()
      console.log('📡 Verifying payment:', { url, quoteId: useQuote, signature: useSignature })

      const res = await fetch(url, {
        method: "GET",
        headers: {
          "X-Quote-Id": useQuote,
          "X-Transaction-Signature": useSignature,
        },
      })
      
      console.log('📥 API Response Status:', res.status)
      
      if (res.ok) {
        const data = await res.json()
        console.log('✅ Payment Verified! Data received:', data)
        setResult(data)
        setQuote(null)
        
        // Open result in new window
        const resultWindow = window.open('', '_blank', 'width=800,height=600')
        if (resultWindow) {
          resultWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>API Response - ${service.name}</title>
              <style>
                body {
                  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
                  color: #00f9ff;
                  padding: 30px;
                  margin: 0;
                }
                .container {
                  max-width: 900px;
                  margin: 0 auto;
                  background: rgba(0, 0, 0, 0.6);
                  border: 1px solid rgba(0, 249, 255, 0.3);
                  border-radius: 12px;
                  padding: 25px;
                  box-shadow: 0 0 30px rgba(0, 249, 255, 0.2);
                }
                h1 {
                  color: #00f9ff;
                  margin-top: 0;
                  font-size: 24px;
                  text-shadow: 0 0 10px rgba(0, 249, 255, 0.5);
                }
                .success-badge {
                  display: inline-block;
                  background: rgba(0, 249, 255, 0.2);
                  color: #00f9ff;
                  padding: 6px 16px;
                  border-radius: 20px;
                  font-size: 14px;
                  font-weight: bold;
                  margin-bottom: 20px;
                  border: 1px solid rgba(0, 249, 255, 0.5);
                }
                pre {
                  background: rgba(0, 0, 0, 0.5);
                  border: 1px solid rgba(0, 249, 255, 0.2);
                  border-radius: 8px;
                  padding: 20px;
                  overflow-x: auto;
                  white-space: pre-wrap;
                  word-wrap: break-word;
                  font-size: 14px;
                  line-height: 1.6;
                  color: #e0e0e0;
                }
                .timestamp {
                  color: rgba(255, 255, 255, 0.6);
                  font-size: 12px;
                  margin-top: 20px;
                }
                .copy-btn {
                  background: linear-gradient(135deg, #00f9ff 0%, #00b8d4 100%);
                  color: #0a0a0a;
                  border: none;
                  padding: 10px 20px;
                  border-radius: 6px;
                  cursor: pointer;
                  font-weight: bold;
                  margin-top: 15px;
                  font-size: 14px;
                  transition: transform 0.2s;
                }
                .copy-btn:hover {
                  transform: scale(1.05);
                }
                .copy-btn:active {
                  transform: scale(0.95);
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>✅ API Call Successful</h1>
                <div class="success-badge">Payment Verified & Data Received</div>
                <h3 style="color: #00f9ff; margin-bottom: 10px;">Response Data:</h3>
                <pre id="json-data">${JSON.stringify(data, null, 2)}</pre>
                <button class="copy-btn" onclick="copyToClipboard()">📋 Copy to Clipboard</button>
                <div class="timestamp">Retrieved: ${new Date().toLocaleString()}</div>
              </div>
              <script>
                function copyToClipboard() {
                  const text = document.getElementById('json-data').textContent;
                  navigator.clipboard.writeText(text).then(() => {
                    const btn = document.querySelector('.copy-btn');
                    btn.textContent = '✓ Copied!';
                    setTimeout(() => btn.textContent = '📋 Copy to Clipboard', 2000);
                  });
                }
              </script>
            </body>
            </html>
          `)
          resultWindow.document.close()
        }
        
        toast({
          title: "Success!",
          description: "Payment verified and data received. Check the new tab!",
        })
      } else {
        const data = await res.json().catch(() => ({}))
        const errorMsg = data.error || `Verification failed (${res.status})`
        console.error('❌ Verification failed:', errorMsg, data)
        setError(errorMsg)
        toast({
          title: "Verification Failed",
          description: errorMsg,
          variant: "destructive"
        })
      }
    } catch (e: any) {
      console.error('❌ Verification error:', e)
      setError(e?.message || "Verification failed")
      toast({
        title: "Verification Error",
        description: e?.message || "Verification failed",
        variant: "destructive"
      })
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
      <DialogContent className="backdrop-blur-xl bg-white/5 border border-white/10 p-4 sm:p-6 max-h-[90vh] overflow-y-auto max-w-[95vw] sm:max-w-3xl shadow-[0_0_25px_rgba(0,249,255,0.15)]">
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
                      onClick={() => solPrice > 0 && setPaymentMethod('sol')}
                      disabled={solPrice <= 0}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        paymentMethod === 'sol'
                          ? 'bg-cyan-500/20 border-2 border-cyan-400 text-white'
                          : solPrice <= 0
                          ? 'bg-black/40 border border-white/20 text-white/30 cursor-not-allowed'
                          : 'bg-black/40 border border-white/20 text-white/60 hover:text-white'
                      }`}
                    >
                      ◎ SOL
                      <div className="text-xs mt-1 font-bold text-cyan-400">
                        {solPrice > 0 ? `${(quote.amountUsd / solPrice).toFixed(6)} SOL` : 'Loading price...'}
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
                    disabled={loading || (paymentMethod === 'sol' && solPrice <= 0)}
                    className="w-full"
                  />

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/20"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 bg-black text-white/60">OR Manual Payment</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-500/20 backdrop-blur-md border border-amber-400/40 rounded-lg p-3 text-xs text-white shadow-lg">
                  <strong>💡 Connect Your Wallet:</strong> Connect your Solana wallet at the top right to enable instant payment with one click!
                </div>
              )}

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

              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-3 text-xs text-white shadow-lg">
                <strong>🔎 API Call Examples</strong>
                <p className="mt-1 text-white/80 text-[10px] sm:text-xs">Replace the example address with your own wallet:</p>
                <div className="mt-2 space-y-2">
                  <div className="bg-black/40 border border-white/10 rounded p-2 font-mono overflow-x-auto max-w-full">
                    <div className="text-white/60 mb-1 text-[10px]">Beginner (direct URL)</div>
                    <pre className="text-white/90 text-[9px] sm:text-[10px] break-all whitespace-pre-wrap">{buildUrl().replace(EXAMPLE_SOLANA_ADDRESS, 'YOUR_WALLET_ADDRESS')}</pre>
                  </div>
                  <div className="bg-black/40 border border-white/10 rounded p-2 font-mono overflow-x-auto max-w-full">
                    <div className="text-white/60 mb-1 text-[10px]">Expert (curl with API key)</div>
                    <pre className="text-white/90 text-[9px] sm:text-[10px] break-all whitespace-pre-wrap">{`curl -H "Authorization: Bearer YOUR_API_KEY" "${buildUrl().replace(EXAMPLE_SOLANA_ADDRESS, 'YOUR_WALLET_ADDRESS')}"`}</pre>
                  </div>
                  <div className="bg-black/40 border border-white/10 rounded p-2 font-mono overflow-x-auto max-w-full">
                    <div className="text-white/60 mb-1 text-[10px]">One‑Time Payment (x402) after paying</div>
                    <pre className="text-white/90 text-[9px] sm:text-[10px] break-all whitespace-pre-wrap">{`curl -H "X-Quote-Id: ${quote.quoteId}" -H "X-Transaction-Signature: YOUR_TX_SIG" "${buildUrl().replace(EXAMPLE_SOLANA_ADDRESS, 'YOUR_WALLET')}"`}</pre>
                  </div>
                </div>
                <p className="mt-2 text-[10px] text-yellow-300">⚠️ Replace example addresses with your own values.</p>
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
