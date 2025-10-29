import Link from "next/link"
import { ArrowLeft, Code, Key, Zap, Shield } from "lucide-react"
import { ParticleBackground } from "@/components/shared/particle-background"

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-black text-white relative">
      <ParticleBackground />
      <div className="container mx-auto px-4 py-12 relative z-10">
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
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
          {/* Mini TOC */}
          <aside className="hidden lg:block sticky top-24 self-start bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 h-max">
            <div className="text-sm text-gray-400 font-semibold mb-2">On this page</div>
            <nav className="text-sm space-y-2">
              <a href="#overview" className="block text-gray-300 hover:text-white">Overview</a>
              <a href="#quick-start" className="block text-gray-300 hover:text-white">Quick Start</a>
              <a href="#auth" className="block text-gray-300 hover:text-white">Auth Methods</a>
              <a href="#try-now" className="block text-gray-300 hover:text-white">Try Now</a>
              <a href="#marketplace" className="block text-gray-300 hover:text-white">Marketplace</a>
              <a href="#creators" className="block text-gray-300 hover:text-white">Creators</a>
              <a href="#payouts" className="block text-gray-300 hover:text-white">Payouts & Withdrawals</a>
              <a href="#security" className="block text-gray-300 hover:text-white">Security & Limits</a>
              <a href="#troubleshooting" className="block text-gray-300 hover:text-white">Troubleshooting</a>
              <a href="#faq" className="block text-gray-300 hover:text-white">FAQ</a>
            </nav>
          </aside>

          <div className="space-y-12">
            <section id="overview" className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4 text-[#9945FF]">Overview</h2>
              <p className="text-gray-300">
                Ping Pay lets you monetize APIs with Solana. Users can pay per request (x402), or use API keys with prepaid balance.
                Our marketplace features creator-made APIs so creators earn revenue directly to their wallet.
              </p>
            </section>
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

          {/* API Endpoints with Examples */}
          <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-4 text-[#14F195]">API Endpoints (with Examples)</h2>
            <p className="text-gray-300 mb-6">
              Replace <code className="bg-white/10 px-1 rounded">YOUR_WALLET_ADDRESS</code> (or <code className="bg-white/10 px-1 rounded">YOUR_VOTE_ACCOUNT</code>) with your own values. For paid endpoints, use an API key or x402 headers after payment.
            </p>

            <div className="space-y-8">
              <div className="bg-black/40 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-2">GET /api/solana/balance?address=...</h3>
                <p className="text-gray-400 mb-3 text-sm">Returns the SOL balance for a wallet.</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-black/50 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                    <div className="text-white/70 mb-2">Beginner (direct URL)</div>
                    <pre className="text-gray-300">{`https://pingpay.app/api/solana/balance?address=YOUR_WALLET_ADDRESS`}</pre>
                  </div>
                  <div className="bg-black/50 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                    <div className="text-white/70 mb-2">Expert (curl with API key)</div>
                    <pre className="text-gray-300">{`curl -H "Authorization: Bearer YOUR_API_KEY" "https://pingpay.app/api/solana/balance?address=YOUR_WALLET_ADDRESS"`}</pre>
                  </div>
                </div>
              </div>

              <div className="bg-black/40 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-2">GET /api/solana/tokens?address=...</h3>
                <p className="text-gray-400 mb-3 text-sm">Lists SPL tokens held by a wallet.</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-black/50 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                    <div className="text-white/70 mb-2">Beginner (direct URL)</div>
                    <pre className="text-gray-300">{`https://pingpay.app/api/solana/tokens?address=YOUR_WALLET_ADDRESS`}</pre>
                  </div>
                  <div className="bg-black/50 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                    <div className="text-white/70 mb-2">Expert (curl with API key)</div>
                    <pre className="text-gray-300">{`curl -H "Authorization: Bearer YOUR_API_KEY" "https://pingpay.app/api/solana/tokens?address=YOUR_WALLET_ADDRESS"`}</pre>
                  </div>
                </div>
              </div>

              <div className="bg-black/40 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-2">GET /api/solana/transactions?address=...</h3>
                <p className="text-gray-400 mb-3 text-sm">Recent transactions for a wallet.</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-black/50 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                    <div className="text-white/70 mb-2">Beginner (direct URL)</div>
                    <pre className="text-gray-300">{`https://pingpay.app/api/solana/transactions?address=YOUR_WALLET_ADDRESS`}</pre>
                  </div>
                  <div className="bg-black/50 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                    <div className="text-white/70 mb-2">Expert (curl with API key)</div>
                    <pre className="text-gray-300">{`curl -H "Authorization: Bearer YOUR_API_KEY" "https://pingpay.app/api/solana/transactions?address=YOUR_WALLET_ADDRESS"`}</pre>
                  </div>
                </div>
              </div>

              <div className="bg-black/40 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-2">GET /api/solana/nft?address=...</h3>
                <p className="text-gray-400 mb-3 text-sm">Fetch NFTs owned by a wallet.</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-black/50 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                    <div className="text-white/70 mb-2">Beginner (direct URL)</div>
                    <pre className="text-gray-300">{`https://pingpay.app/api/solana/nft?address=YOUR_WALLET_ADDRESS`}</pre>
                  </div>
                  <div className="bg-black/50 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                    <div className="text-white/70 mb-2">Expert (curl with API key)</div>
                    <pre className="text-gray-300">{`curl -H "Authorization: Bearer YOUR_API_KEY" "https://pingpay.app/api/solana/nft?address=YOUR_WALLET_ADDRESS"`}</pre>
                  </div>
                </div>
              </div>

              <div className="bg-black/40 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-2">GET /api/solana/validator?vote_account=...</h3>
                <p className="text-gray-400 mb-3 text-sm">Validator info for a vote account.</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-black/50 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                    <div className="text-white/70 mb-2">Beginner (direct URL)</div>
                    <pre className="text-gray-300">{`https://pingpay.app/api/solana/validator?vote_account=YOUR_VOTE_ACCOUNT`}</pre>
                  </div>
                  <div className="bg-black/50 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                    <div className="text-white/70 mb-2">Expert (curl with API key)</div>
                    <pre className="text-gray-300">{`curl -H "Authorization: Bearer YOUR_API_KEY" "https://pingpay.app/api/solana/validator?vote_account=YOUR_VOTE_ACCOUNT"`}</pre>
                  </div>
                </div>
              </div>

              <div className="bg-black/40 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-2">One‑Time Payment (x402) Headers</h3>
                <p className="text-gray-400 mb-3 text-sm">After paying with SOL or USDC, include these headers to access without an API key.</p>
                <div className="bg-black/50 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                  <pre className="text-gray-300">{`curl -H "X-Quote-Id: YOUR_QUOTE_ID" -H "X-Transaction-Signature: YOUR_SOLANA_TX_SIGNATURE" "https://pingpay.app/api/solana/tokens?address=YOUR_WALLET_ADDRESS"`}</pre>
                </div>
                <p className="text-xs text-yellow-300 mt-2">Important: Replace the example address and placeholders with your own values.</p>
              </div>
            </div>
          </section>

          {/* x402 Headers (Standard + Extensions) */}
          <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-4 text-[#9945FF]">x402 Headers</h2>
            <div className="space-y-6 text-gray-300">
              <div>
                <h3 className="text-lg font-semibold mb-2">Standard (spec)</h3>
                <ul className="list-disc ml-5 space-y-1 text-sm">
                  <li><code className="bg-white/10 px-1 rounded">X-Payment-Required</code>: always <code className="bg-white/10 px-1 rounded">true</code> on 402</li>
                  <li><code className="bg-white/10 px-1 rounded">X-Quote-Id</code>: unique quote identifier</li>
                  <li><code className="bg-white/10 px-1 rounded">X-Amount-USD</code>: price for this request</li>
                  <li><code className="bg-white/10 px-1 rounded">X-Solana-Address</code>: receiver address to send payment</li>
                  <li><code className="bg-white/10 px-1 rounded">X-Expires-At</code>: ISO timestamp when quote expires</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Client Retry (after paying)</h3>
                <ul className="list-disc ml-5 space-y-1 text-sm">
                  <li><code className="bg-white/10 px-1 rounded">X-Transaction-Signature</code>: Solana transaction signature</li>
                  <li><code className="bg-white/10 px-1 rounded">X-Quote-Id</code>: the same quote id you received</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">PingPay Extensions</h3>
                <ul className="list-disc ml-5 space-y-1 text-sm">
                  <li><code className="bg-white/10 px-1 rounded">X-402-Version</code>: current protocol version (server)</li>
                  <li><code className="bg-white/10 px-1 rounded">X-402-Supported</code>: supported auth modes (e.g., signature,wallet,apikey)</li>
                  <li><code className="bg-white/10 px-1 rounded">X-Wallet-Address</code>: provided by client if a wallet is connected</li>
                </ul>
              </div>

              <p className="text-xs text-yellow-300">Tip: See <a className="underline" href="https://www.x402.org/" target="_blank" rel="noreferrer">x402.org</a> for the baseline spec.</p>
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
          <section id="creators" className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
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

          {/* Payouts & Withdrawals */}
          <section id="payouts" className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-4 text-[#14F195]">Payouts & Withdrawals</h2>
            <div className="prose prose-invert max-w-none">
              <ol className="space-y-2 text-gray-300">
                <li>1. Go to Creators → set your <strong>Payout Wallet</strong>. We’ll use this for withdrawals.</li>
                <li>2. Earn revenue as users pay for your API calls (view earnings in your dashboard).</li>
                <li>3. Request a withdrawal once you hit the minimum; we’ll send USDC to your payout wallet.</li>
              </ol>
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
                href="https://github.com/JermWang/PingPay"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2 bg-white/5 border border-white/10 rounded-lg hover:border-[#14F195]/50 transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://x.com/PingPaySol"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2 bg-white/5 border border-white/10 rounded-lg hover:border-[#14F195]/50 transition-colors"
              >
                Twitter
              </a>
            </div>
          </section>
        </div>
        </div>
      </div>
    </div>
  )
}

