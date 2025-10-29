"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Play, Loader2 } from "lucide-react"

export function LiveDemo() {
  const [address, setAddress] = useState("DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK")
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<string>("")

  const handleDemo = async () => {
    setLoading(true)
    setResponse("")

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setResponse(`HTTP/1.1 402 Payment Required

{
  "error": "Payment required",
  "quote_id": "550e8400-e29b-41d4-a716-446655440000",
  "amount_usd": 0.01,
  "solana_address": "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin",
  "expires_at": "${new Date(Date.now() + 300000).toISOString()}"
}`)

    setLoading(false)
  }

  return (
    <section className="-mt-8 pb-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Try It Live</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">See the x402 payment flow in action</p>
        </div>

        <Card className="max-w-3xl mx-auto p-8">
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Solana Wallet Address</label>
            <div className="flex gap-2">
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter Solana address..."
                className="font-mono text-sm"
              />
              <Button onClick={handleDemo} disabled={loading || !address}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {response && (
            <div className="bg-background rounded-lg p-4 border-2 border-primary/20">
              <div className="text-xs text-muted-foreground mb-2">Response:</div>
              <pre className="font-mono text-sm whitespace-pre-wrap text-primary">{response}</pre>
            </div>
          )}

          {!response && (
            <div className="text-center py-12 text-muted-foreground">
              Enter a Solana address and click play to see the 402 response
            </div>
          )}
        </Card>
      </div>
    </section>
  )
}
