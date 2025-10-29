import * as React from "react"
import { cn } from "@/lib/utils"

export interface NeonTextProps extends React.HTMLAttributes<HTMLSpanElement> {}

export function NeonText({ className, children, ...props }: NeonTextProps) {
  return (
    <span className={cn("relative inline-block", className)} {...props}>
      <span
        className="bg-clip-text text-transparent"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(0,249,255,1) 0%, rgba(154,255,239,0.9) 40%, rgba(255,255,255,0.9) 70%, rgba(0,0,0,0.4) 100%)",
        }}
      >
        {children}
      </span>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(0,249,255,0.15) 0%, rgba(255,255,255,0.06) 60%, rgba(0,0,0,0.1) 100%)",
          mixBlendMode: "screen",
          opacity: 0.35,
          borderRadius: "inherit",
        }}
      />
    </span>
  )
}
