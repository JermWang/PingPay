import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export function MarketplaceHeader() {
  return (
    <header className="sticky top-0 z-50 bg-transparent/40 backdrop-blur-2xl glass-outline relative">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">API Marketplace</h1>
              <p className="text-sm text-muted-foreground">Browse pay-per-request Solana APIs</p>
            </div>
          </div>
        </div>
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent blur-[1.5px]" />
    </header>
  )
}
