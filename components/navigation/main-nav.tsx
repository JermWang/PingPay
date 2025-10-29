"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Home" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/creators", label: "Creator Dashboard" },
  { href: "/docs", label: "Docs" },
]

export function MainNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
			<Image 
				src="/logo-transparent-bg.png" 
				alt="Ping Pay Logo" 
				width={210} 
				height={60}
				className="h-12 w-auto"
				priority
			/>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-[#00F9FF]",
                  pathname === item.href
                    ? "text-[#00F9FF]"
                    : "text-gray-300"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Wallet Connect Button */}
          <div className="wallet-adapter-button-trigger">
            <WalletMultiButton />
          </div>
        </div>
      </div>
    </nav>
  )
}

