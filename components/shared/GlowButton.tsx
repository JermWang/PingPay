"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"
import gsap from "gsap"

export interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string
  pulseOnHover?: boolean
  asChild?: boolean
}

export function GlowButton({ label, className, pulseOnHover = true, asChild = false, onMouseEnter, onMouseLeave, children, ...props }: GlowButtonProps) {
  const Comp: any = asChild ? Slot : "button"
  const ref = React.useRef<HTMLElement>(null)
  const glowRef = React.useRef<HTMLSpanElement>(null)

  const handleEnter = (e: any) => {
    onMouseEnter?.(e)
    if (!pulseOnHover || !glowRef.current) return
    gsap.killTweensOf(glowRef.current)
    gsap.set(glowRef.current, { scale: 0.6, opacity: 0.0, xPercent: -50, yPercent: -50 })
    gsap.to(glowRef.current, {
      duration: 0.8,
      scale: 1.6,
      opacity: 0.25,
      ease: "power2.out",
    })
  }

  const handleLeave = (e: any) => {
    onMouseLeave?.(e)
    if (!glowRef.current) return
    gsap.to(glowRef.current, { duration: 0.4, opacity: 0, ease: "power2.out" })
  }

  const content = children ?? label

  return (
    <Comp
      ref={ref}
      className={cn(
        "relative inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-medium",
        "glass-panel glass-outline glass-hover overflow-hidden",
        "text-[var(--pp-text)]",
        className,
      )}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      {...props}
    >
      <span className="relative z-[1]">{content}</span>
      <span
        ref={glowRef}
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[180%] w-[180%] rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(0,249,255,0.35), rgba(0,249,255,0.18), rgba(0,249,255,0.0))",
          filter: "blur(12px)",
          opacity: 0,
          transform: "translate(-50%, -50%)",
        }}
      />
    </Comp>
  )
}
