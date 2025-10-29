"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { GlowButton } from "@/components/shared/GlowButton"
import type { Service } from "@/lib/types"
import { EXAMPLE_SOLANA_ADDRESS, EXAMPLE_VOTE_ACCOUNT } from "@/lib/constants"

interface TryServiceModalProps {
  service: Service
}

type QuoteState = {
  quoteId: string
  amountUsd: number
  address: string
  expiresAt: string
} | null

export function TryServiceModal({ service }: TryServiceModalProps) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [quote, setQuote] = React.useState<QuoteState>(null)
  const [signature, setSignature] = React.useState("")
  const [result, setResult] = React.useState<any>(null)
  const [error, setError] = React.useState<string | null>(null)

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

  const verifyWithSignature = async () => {
    if (!quote || !signature) return
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(buildUrl(), {
        method: "GET",
        headers: {
          "X-Quote-Id": quote.quoteId,
          "X-Transaction-Signature": signature,
        },
      })
      if (res.ok) {
        const data = await res.json()
        setResult(data)
        setQuote(null)
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

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset() }}>
      <DialogTrigger asChild>
        <GlowButton label="Try Now" className="w-full" />
      </DialogTrigger>
      <DialogContent className="glass-panel glass-outline reflective-overlay p-4 sm:p-6 max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{service.name}</DialogTitle>
          <DialogDescription>{service.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-xs text-muted-foreground">
            <div>Endpoint: <code className="text-foreground">{buildUrl()}</code></div>
          </div>

          {!quote && !result && (
            <div className="space-y-3">
              <GlowButton label={loading ? "Requesting..." : "Request Demo"} onClick={initialRequest} disabled={loading} />
              {error && <div className="text-destructive text-sm">{error}</div>}
            </div>
          )}

          {quote && (
            <div className="space-y-3">
              <div className="text-sm">
                <div className="mb-1">Payment required:</div>
                <ul className="text-muted-foreground">
                  <li>Amount: <span className="text-foreground font-semibold">${quote.amountUsd.toFixed(2)} USD</span></li>
                  <li>Recipient: <span className="text-foreground font-mono">{quote.address}</span></li>
                  <li>Expires: <span className="text-foreground">{new Date(quote.expiresAt).toLocaleTimeString()}</span></li>
                </ul>
              </div>
              <div className="space-y-2">
                <input
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  placeholder="Paste transaction signature"
                  className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm outline-none focus:border-cyan-400/50"
                />
                <GlowButton label={loading ? "Verifying..." : "Submit Signature"} onClick={verifyWithSignature} disabled={loading || signature.length < 32} />
                {error && <div className="text-destructive text-sm">{error}</div>}
              </div>
            </div>
          )}

          {result && (
            <div className="text-left space-y-2">
              <div className="text-sm font-semibold">Response</div>
              <pre className="max-h-64 overflow-auto bg-black/40 border border-white/10 rounded-md p-3 text-xs">
                {JSON.stringify(result, null, 2)}
              </pre>
              <div className="flex gap-2">
                <GlowButton label="Run Again" onClick={initialRequest} />
                <GlowButton label="Close" onClick={() => setOpen(false)} />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
