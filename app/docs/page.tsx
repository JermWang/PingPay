import Link from "next/link"
import { ArrowLeft, Code, Key, Zap, Shield } from "lucide-react"

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#9945FF] via-[#14F195] to-[#00FFA3] bg-clip-text text-transparent">
            Documentation
          </h1>
          <p className="text-gray-400 text-lg">
            Learn how to integrate Ping Pay's micropayment APIs into your applications
          </p>
        </div>

        {/* Quick Start */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-[#9945FF]/50 transition-colors">
            <Code className="w-8 h-8 text-[#9945FF] mb-4" />
            <h3 className="text-lg font-semibold mb-2">Quick Start</h3>
            <p className="text-sm text-gray-400">
              Get started with Ping Pay in under 5 minutes
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-[#14F195]/50 transition-colors">
            <Key className="w-8 h-8 text-[#14F195] mb-4" />
            <h3 className="text-lg font-semibold mb-2">Authentication</h3>
            <p className="text-sm text-gray-400">
              Learn about x402 payment headers
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-[#00FFA3]/50 transition-colors">
            <Zap className="w-8 h-8 text-[#00FFA3] mb-4" />
            <h3 className="text-lg font-semibold mb-2">API Reference</h3>
            <p className="text-sm text-gray-400">
              Complete API documentation
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-[#9945FF]/50 transition-colors">
            <Shield className="w-8 h-8 text-[#9945FF] mb-4" />
            <h3 className="text-lg font-semibold mb-2">Best Practices</h3>
            <p className="text-sm text-gray-400">
              Security and optimization tips
            </p>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-12">
          {/* How it Works */}
          <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-4 text-[#9945FF]">How It Works</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 mb-4">
                Ping Pay uses the x402 payment protocol to enable micropayments for API requests. 
                Here's how a typical request flow works:
              </p>
              <ol className="space-y-2 text-gray-300">
                <li>1. Client makes an API request without payment</li>
                <li>2. Server responds with <code className="text-[#14F195] bg-white/10 px-2 py-1 rounded">402 Payment Required</code> and quote details</li>
                <li>3. Client initiates Solana USDC payment</li>
                <li>4. Client includes transaction signature in <code className="text-[#14F195] bg-white/10 px-2 py-1 rounded">x-transaction-signature</code> header</li>
                <li>5. Server verifies payment and returns API response</li>
              </ol>
            </div>
          </section>

          {/* Example Request */}
          <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-4 text-[#14F195]">Example Request</h2>
            <div className="bg-black/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-gray-300">
{`// Step 1: Initial request
const response = await fetch('https://pingpay.app/api/solana/balance', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ address: 'YOUR_WALLET_ADDRESS' })
});

// Step 2: Handle 402 response
if (response.status === 402) {
  const quote = await response.json();
  
  // Step 3: Make payment on Solana
  const signature = await makePayment(quote);
  
  // Step 4: Retry with signature
  const paidResponse = await fetch('https://pingpay.app/api/solana/balance', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-transaction-signature': signature,
      'x-quote-id': quote.quote_id
    },
    body: JSON.stringify({ address: 'YOUR_WALLET_ADDRESS' })
  });
  
  const data = await paidResponse.json();
  console.log(data);
}`}
              </pre>
            </div>
          </section>

          {/* Creator API */}
          <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-4 text-[#00FFA3]">For API Creators</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 mb-4">
                Want to monetize your own APIs? Connect your wallet and create an API in minutes:
              </p>
              <ul className="space-y-2 text-gray-300">
                <li>• Host your API anywhere (AWS, Vercel, your own server)</li>
                <li>• Set your price per request</li>
                <li>• Ping Pay handles payments and verification automatically</li>
                <li>• Earn revenue in USDC directly to your wallet</li>
              </ul>
              <div className="mt-6">
                <Link
                  href="/creators"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-[#9945FF] to-[#14F195] rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  Get Started as a Creator
                </Link>
              </div>
            </div>
          </section>

          {/* Support */}
          <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-4 text-[#9945FF]">Need Help?</h2>
            <p className="text-gray-300 mb-4">
              Join our community or reach out for support:
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#"
                className="px-6 py-2 bg-white/5 border border-white/10 rounded-lg hover:border-[#14F195]/50 transition-colors"
              >
                Discord
              </a>
              <a
                href="https://github.com/JermWang/PingPay"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2 bg-white/5 border border-white/10 rounded-lg hover:border-[#14F195]/50 transition-colors"
              >
                GitHub
              </a>
              <a
                href="#"
                className="px-6 py-2 bg-white/5 border border-white/10 rounded-lg hover:border-[#14F195]/50 transition-colors"
              >
                Twitter
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

