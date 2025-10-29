"use client"

import { Lock, Unlock } from "lucide-react"
import { Card } from "@/components/ui/card"

export function Why402() {
  return (
    <section className="-mt-32 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="text-4xl md:text-5xl font-bold mb-2">
            Why <span className="font-mono text-primary">402</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            HTTP 402 Payment Required is a status code reserved for future digital payment systems. The future is now.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 max-w-3xl mx-auto">
          <Card className="p-5 md:p-6 border-2 border-destructive/20 bg-destructive/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <div className="font-mono text-xs text-muted-foreground">HTTP 402</div>
                <div className="font-bold text-base">Payment Required</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              When you request a protected resource without payment, the server responds with a 402 status code and
              payment instructions.
            </p>
            <div className="bg-background/50 rounded-lg p-3 font-mono text-xs">
              <div className="text-destructive">HTTP/1.1 402 Payment Required</div>
              <div className="text-muted-foreground mt-2">
                {`{`}
                <br />
                &nbsp;&nbsp;"error": "Payment required",
                <br />
                &nbsp;&nbsp;"amount_usd": 0.01,
                <br />
                &nbsp;&nbsp;"solana_address": "..."
                <br />
                {`}`}
              </div>
            </div>
          </Card>

          <Card className="p-5 md:p-6 border-2 border-accent/20 bg-accent/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <Unlock className="w-5 h-5 text-accent" />
              </div>
              <div>
                <div className="font-mono text-xs text-muted-foreground">HTTP 200</div>
                <div className="font-bold text-base">Success</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              After sending USDC payment on Solana, replay your request with the transaction signature to unlock the
              resource.
            </p>
            <div className="bg-background/50 rounded-lg p-3 font-mono text-xs">
              <div className="text-accent">HTTP/1.1 200 OK</div>
              <div className="text-muted-foreground mt-2">
                {`{`}
                <br />
                &nbsp;&nbsp;"data": {`{`}
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;"balance": 1.234,
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;"address": "..."
                <br />
                &nbsp;&nbsp;{`}`}
                <br />
                {`}`}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
