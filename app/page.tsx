import { Hero } from "@/components/hero"
import { Why402 } from "@/components/why-402"
import { HowItWorks } from "@/components/how-it-works"
import { LiveDemo } from "@/components/live-demo"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Why402 />
      <HowItWorks />
      <LiveDemo />
      <Footer />
    </main>
  )
}
