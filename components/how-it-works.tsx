"use client"

import { ArrowRight, Send, CheckCircle2, Database } from "lucide-react"
import { Card } from "@/components/ui/card"

export function HowItWorks() {
  const steps = [
    {
      icon: Send,
      title: "Request API",
      description: "Make a request to any protected endpoint",
      code: "GET /api/solana/balance?address=...",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: ArrowRight,
      title: "Receive Quote",
      description: "Server responds with payment details",
      code: '402 Payment Required\n{ amount: $0.01, address: "..." }',
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      icon: CheckCircle2,
      title: "Pay with USDC",
      description: "Send micropayment on Solana",
      code: "Transfer 0.01 USDC\nTx: 5Kj8x...",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      icon: Database,
      title: "Get Resource",
      description: "Replay request with transaction signature",
      code: "200 OK\n{ data: { balance: 1.234 } }",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ]

  return (
    <section id="how-it-works" className="-mt-16 pb-2">
      <div className="container mx-auto px-4">
        <div className="text-center mb-4">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Four simple steps from request to resource</p>
        </div>

        <div className="grid grid-cols-1 gap-4 max-w-3xl mx-auto">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="glass-panel glass-outline reflective-overlay p-4 relative rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-10 h-10 rounded-full ${step.bgColor} backdrop-blur-sm flex items-center justify-center mb-3 border border-white/10`}>
                <step.icon className={`w-5 h-5 ${step.color}`} />
              </div>

              <h3 className="text-xl font-semibold mb-1">{step.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{step.description}</p>

              <div className="bg-background/50 rounded-lg p-3 font-mono text-xs">
                <pre className="whitespace-pre-wrap leading-snug">{step.code}</pre>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 border border-primary/20">
            <span className="text-sm font-medium">All payments verified on-chain in under 1 second</span>
          </div>
        </div>
      </div>
    </section>
  )
}
