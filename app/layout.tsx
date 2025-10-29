import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SolanaWalletProvider } from "@/components/providers/wallet-provider"
import { MainNav } from "@/components/navigation/main-nav"
import { ParticleBackground } from "@/components/shared/particle-background"
import "./globals.css"

const geistSans = Geist({ 
  subsets: ["latin"],
  variable: "--font-geist-sans"
})

const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: "--font-geist-mono"
})

export const metadata: Metadata = {
  title: "Ping Pay - Solana Micro-API Marketplace",
  description:
    "Pay-per-request APIs using the x402 payment standard on Solana. Pay tiny amounts of USDC for instant API access.",
  generator: "v0.app",
  icons: {
    icon: "/logo-transparent-bg.png",
    shortcut: "/logo-transparent-bg.png",
    apple: "/logo-transparent-bg.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <SolanaWalletProvider>
          <ParticleBackground />
          <MainNav />
          <div className="pt-16 relative z-10">{children}</div>
          <Analytics />
        </SolanaWalletProvider>
      </body>
    </html>
  )
}
