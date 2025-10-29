"use client"

import Link from "next/link"
import { Github, Twitter } from "lucide-react"
import { useEffect, useRef } from "react"
import gsap from "gsap"

export function Footer() {
  const sweepRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sweep = sweepRef.current
    if (!sweep) return
    const runSweep = () => {
      gsap.set(sweep, { xPercent: -120, opacity: 0 })
      gsap
        .timeline()
        .to(sweep, { duration: 1.2, xPercent: 120, opacity: 0.28, ease: "power2.inOut" })
        .to(sweep, { duration: 0.6, opacity: 0, ease: "power2.out" }, "<0.6")
    }
    runSweep()
    const id = setInterval(runSweep, 15000)
    return () => clearInterval(id)
  }, [])

  return (
    <footer className="relative -mt-8 pb-12">
      <div className="container mx-auto px-4">
        <div className="glass-panel glass-outline reflective-overlay rounded-2xl p-6 md:p-8 relative overflow-hidden">
          <div
            ref={sweepRef}
            aria-hidden
            className="pointer-events-none absolute left-0 top-1/2 h-[200%] w-24 -translate-y-1/2"
            style={{
              background:
                "linear-gradient(90deg, rgba(0,249,255,0.0) 0%, rgba(0,249,255,0.28) 50%, rgba(0,249,255,0.0) 100%)",
              filter: "blur(12px)",
            }}
          />
        <div className="grid md:grid-cols-4 gap-8 text-center md:text-left">
          <div>
            <div className="font-bold text-xl mb-4">Ping Pay</div>
            <p className="text-sm text-muted-foreground">
              Pay-per-request APIs powered by Solana and the x402 standard.
            </p>
          </div>

          <div>
            <div className="font-semibold mb-4">Product</div>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/marketplace" className="text-muted-foreground hover:text-foreground">
                  API Marketplace
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="text-muted-foreground hover:text-foreground">
                  How It Works
                </Link>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  Documentation
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div className="font-semibold mb-4">Resources</div>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  API Reference
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  x402 Spec
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  Solana Docs
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div className="font-semibold mb-4">Connect</div>
            <div className="flex gap-4 justify-center md:justify-start">
              <a href="https://github.com/JermWang/PingPay" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-6 text-center text-sm text-muted-foreground">
          © 2025 Ping Pay. Built with Solana and the x402 payment standard.
        </div>
        </div>
      </div>
    </footer>
  )
}
