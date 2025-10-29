import * as React from "react"
import { cn } from "@/lib/utils"

export interface NeonTextProps extends React.HTMLAttributes<HTMLSpanElement> {}

export function NeonText({ className, children, ...props }: NeonTextProps) {
  return (
    <span
      className={cn("bg-clip-text text-transparent", className)}
      style={{
        backgroundImage:
          "linear-gradient(135deg, rgba(0,249,255,1) 0%, rgba(154,255,239,0.9) 40%, rgba(255,255,255,0.9) 70%, rgba(0,0,0,0.4) 100%)",
      }}
      {...props}
    >
      {children}
    </span>
  )
}
