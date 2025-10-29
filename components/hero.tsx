"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowRight, Zap, Copy, Check } from "lucide-react"
import Link from "next/link"
import { GlowButton } from "@/components/shared/GlowButton"
import { NeonText } from "@/components/shared/NeonText"
import dynamic from "next/dynamic"
import { ParticleBackground } from "@/components/shared/particle-background"

// Temporarily using simple version to debug WebGL context issue
const Hero3DScene = dynamic(
  () => import("@/components/hero-3d-simple").then((m) => m.Hero3DScene), 
  { 
    ssr: false,
    loading: () => <div style={{ width: "100%", height: "100%", background: "#000" }} />
  }
)

export function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [copied, setCopied] = useState(false)
  
  const TOKEN_ADDRESS = "COMING SOON" // Replace with actual token address when ready
  
  const handleCopyToken = () => {
    navigator.clipboard.writeText(TOKEN_ADDRESS)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  const handleScrollToHowItWorks = () => {
    const target = document.getElementById("how-it-works")
    if (!target) return
    const navOffset = 72 // fixed navbar height compensation
    const y = target.getBoundingClientRect().top + window.scrollY - navOffset
    window.scrollTo({ top: y, behavior: "smooth" })
  }

  // Calculate scroll progress for 3D animation
  useEffect(() => {
    const handleScroll = () => {
      // Calculate scroll progress (0 to 1) over the entire page
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = Math.min(Math.max(scrollTop / docHeight, 0), 1)
      setScrollProgress(progress)
    }

    handleScroll() // Initial call
    window.addEventListener("scroll", handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const updateSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    updateSize()
    window.addEventListener("resize", updateSize)

    // Particle system for background
    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      color: string
    }> = []

    // Solana gradient palette
    const palette = ["#9945FF", "#14F195", "#00FFA3"]

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 0.9 + 0.4,
        color: palette[Math.floor(Math.random() * palette.length)],
      })
    }

    let animationId: number

    const animate = () => {
      // Subtle motion trail on a pure black background
      ctx.fillStyle = "rgba(0, 0, 0, 0.08)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle) => {
        particle.x += particle.vx
        particle.y += particle.vy

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

        // Small, soft particles in Solana gradient colors
        ctx.fillStyle = particle.color + "33" /* ~0.2 alpha */
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", updateSize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <section className="relative overflow-hidden isolate">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Hero3DScene scrollProgress={scrollProgress} />
      </div>
      {/* Local particle layer to ensure visibility above 3D on landing page */}
      <ParticleBackground />

      <div className="container mx-auto min-h-screen grid grid-cols-1 md:grid-cols-12 items-center gap-6 md:gap-8 px-4 relative z-10">
        <div className="md:col-span-5 text-center md:text-left">
          <button
            onClick={handleCopyToken}
            className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg shadow-primary/10 mb-3 md:mb-8 hover:bg-white/15 hover:border-primary/50 transition-all cursor-pointer group"
          >
            {copied ? (
              <Check className="w-3 h-3 md:w-4 md:h-4 text-green-400" />
            ) : (
              <Copy className="w-3 h-3 md:w-4 md:h-4 text-primary group-hover:text-primary/80" />
            )}
            <span className="text-xs md:text-sm font-medium text-white group-hover:text-primary/90">
              {copied ? "Copied!" : TOKEN_ADDRESS}
            </span>
          </button>

          <h1 className="text-3xl sm:text-4xl md:text-7xl font-bold mb-3 md:mb-6 text-balance leading-tight">
            <span>Pay-Per-Request APIs</span>
            <br />
            <NeonText>Powered by Solana</NeonText>
          </h1>

          <p className="text-base sm:text-lg md:text-2xl text-muted-foreground mb-6 md:mb-12 max-w-3xl mx-auto md:mx-0 text-pretty">
            Access premium APIs for pennies. Pay only for what you use with instant USDC micropayments on Solana.
          </p>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 justify-center md:justify-start items-center">
            <Link href="/marketplace" className="w-full sm:w-auto">
              <GlowButton label="Browse APIs" className="text-sm sm:text-base md:text-lg px-5 py-2.5 md:px-8 md:py-4 w-full">
                Browse APIs
              </GlowButton>
            </Link>
            <Link href="/creators" className="w-full sm:w-auto">
              <GlowButton label="Creators Marketplace" className="text-sm sm:text-base md:text-lg px-5 py-2.5 md:px-8 md:py-4 w-full">
                Creators Marketplace
              </GlowButton>
            </Link>
            <GlowButton onClick={handleScrollToHowItWorks} label="How It Works" className="text-sm sm:text-base md:text-lg px-5 py-2.5 md:px-8 md:py-4 w-full sm:w-auto">
              How It Works
            </GlowButton>
          </div>

          <div className="mt-8 md:mt-16 grid grid-cols-3 gap-4 md:gap-8 md:max-w-none max-w-4xl mx-auto md:mx-0">
            <div className="text-center p-4 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-xl">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-1 md:mb-2">$0.01</div>
              <div className="text-xs md:text-sm text-white/80">Starting price</div>
            </div>
            <div className="text-center p-4 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-xl">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-1 md:mb-2">&lt;1s</div>
              <div className="text-xs md:text-sm text-white/80">Verification</div>
            </div>
            <div className="text-center p-4 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-xl">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-1 md:mb-2">5+</div>
              <div className="text-xs md:text-sm text-white/80">APIs</div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden md:block">
        <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
        </div>
      </div>
    </section>
  )
}
