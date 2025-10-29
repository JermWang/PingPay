import * as React from "react"
import { cn } from "@/lib/utils"

export interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  intensity?: "light" | "medium" | "strong"
}

export function GlassPanel({ className, intensity = "medium", ...props }: GlassPanelProps) {
  const intensityClass =
    intensity === "light"
      ? "backdrop-blur-xl"
      : intensity === "strong"
        ? "backdrop-blur-[32px] shadow-[0_0_35px_rgba(0,249,255,0.20)]"
        : "backdrop-blur-2xl"

  return <div className={cn("glass-panel reflective-overlay", intensityClass, className)} {...props} />
}
