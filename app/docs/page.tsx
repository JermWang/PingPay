"use client"

import Link from "next/link"
import { ArrowLeft, Copy, Check, Terminal, Code2, Lock, Zap } from "lucide-react"
import { useState } from "react"

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="absolute top-3 right-3 p-2 rounded-md bg-slate-800/80 hover:bg-slate-700/80 transition-colors border border-slate-600/30 group"
      title="Copy to clipboard"
    >
      {copied ? (
        <Check className="w-4 h-4 text-emerald-400" />
      ) : (
        <Copy className="w-4 h-4 text-slate-400 group-hover:text-slate-200" />
      )}
    </button>
  )
}

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 relative overflow-x-hidden">
      {/* Subtle gradient accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30 pointer-events-none" />
      
      <div className="container mx-auto max-w-[1400px] px-6 lg:px-8 py-10 relative z-10">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-8 text-sm font-medium group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
              <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">API Documentation</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-slate-900 tracking-tight">
              Developer Documentation
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              Complete reference for integrating Ping Pay's micropayment infrastructure with the x402 protocol on Solana.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-12">
          {/* Sidebar Navigation */}
          <aside className="hidden lg:block">
            <div className="sticky top-8">
              <nav className="space-y-1">
                <a href="#overview" className="block px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors">
                  Overview
                </a>
                <a href="#quick-start" className="block px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors">
                  Quick Start
                </a>
                <a href="#endpoints" className="block px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors">
                  API Endpoints
                </a>
                <a href="#authentication" className="block px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors">
                  Authentication
                </a>
                <a href="#x402" className="block px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors">
                  x402 Protocol
                </a>
                <a href="#creators" className="block px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors">
                  For Creators
                </a>
                <a href="#support" className="block px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors">
                  Support
                </a>
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div className="space-y-16 pb-20">
            {/* Overview */}
            <section id="overview">
              <h2 className="text-2xl font-bold mb-4 text-slate-900 tracking-tight">Overview</h2>
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-700 leading-relaxed">
                  Ping Pay enables micropayments for API requests using Solana blockchain. Users can authenticate via prepaid API keys 
                  or pay-per-request using the x402 protocol with SOL or USDC. Our marketplace features creator-made APIs where creators 
                  earn revenue directly to their wallet.
                </p>
              </div>
            </section>

            {/* Quick Start */}
            <section id="quick-start">
              <h2 className="text-2xl font-bold mb-6 text-slate-900 tracking-tight">Quick Start</h2>
              
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="border border-slate-200 rounded-lg p-5 hover:border-indigo-300 hover:shadow-sm transition-all">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center mb-3">
                    <Terminal className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">1. Get an API Key</h3>
                  <p className="text-sm text-slate-600">Connect wallet, deposit USDC, generate your API key</p>
                </div>
                <div className="border border-slate-200 rounded-lg p-5 hover:border-purple-300 hover:shadow-sm transition-all">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mb-3">
                    <Code2 className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">2. Make Requests</h3>
                  <p className="text-sm text-slate-600">Include your API key in Authorization header</p>
                </div>
                <div className="border border-slate-200 rounded-lg p-5 hover:border-emerald-300 hover:shadow-sm transition-all">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center mb-3">
                    <Zap className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">3. Go Live</h3>
                  <p className="text-sm text-slate-600">Start building with instant, low-cost API access</p>
                </div>
              </div>

              <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 relative">
                <CopyButton text={`curl -H "Authorization: Bearer YOUR_API_KEY" \\
  "https://pingpay.app/api/solana/balance?address=YOUR_WALLET_ADDRESS"`} />
                <pre className="text-sm text-emerald-400 font-mono overflow-x-auto pr-12">
                  <code>{`curl -H "Authorization: Bearer YOUR_API_KEY" \\
  "https://pingpay.app/api/solana/balance?address=YOUR_WALLET_ADDRESS"`}</code>
                </pre>
              </div>
            </section>

            {/* API Endpoints */}
            <section id="endpoints">
              <h2 className="text-2xl font-bold mb-6 text-slate-900 tracking-tight">API Endpoints</h2>
              <p className="text-slate-600 mb-6">
                All endpoints return JSON. Replace <code className="px-1.5 py-0.5 bg-slate-100 text-slate-800 rounded text-sm font-mono">YOUR_WALLET_ADDRESS</code> with your actual Solana address.
              </p>

              <div className="space-y-6">
                {/* Balance */}
                <div className="border border-slate-200 rounded-lg overflow-hidden hover:border-slate-300 transition-colors">
                  <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded uppercase">GET</span>
                        <code className="text-sm font-mono text-slate-800">/api/solana/balance</code>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mt-2">Returns the SOL balance for a given wallet address</p>
                  </div>
                  <div className="p-5 bg-white">
                    <div className="relative bg-slate-900 rounded-lg p-4">
                      <CopyButton text="curl https://pingpay.app/api/solana/balance?address=YOUR_WALLET_ADDRESS" />
                      <pre className="text-xs text-slate-300 font-mono overflow-x-auto pr-12">
                        <code>curl https://pingpay.app/api/solana/balance?address=YOUR_WALLET_ADDRESS</code>
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Tokens */}
                <div className="border border-slate-200 rounded-lg overflow-hidden hover:border-slate-300 transition-colors">
                  <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded uppercase">GET</span>
                        <code className="text-sm font-mono text-slate-800">/api/solana/tokens</code>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mt-2">Returns all SPL tokens held by a wallet</p>
                  </div>
                  <div className="p-5 bg-white">
                    <div className="relative bg-slate-900 rounded-lg p-4">
                      <CopyButton text="curl https://pingpay.app/api/solana/tokens?address=YOUR_WALLET_ADDRESS" />
                      <pre className="text-xs text-slate-300 font-mono overflow-x-auto pr-12">
                        <code>curl https://pingpay.app/api/solana/tokens?address=YOUR_WALLET_ADDRESS</code>
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Transactions */}
                <div className="border border-slate-200 rounded-lg overflow-hidden hover:border-slate-300 transition-colors">
                  <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded uppercase">GET</span>
                        <code className="text-sm font-mono text-slate-800">/api/solana/transactions</code>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mt-2">Returns recent transaction history for a wallet</p>
                  </div>
                  <div className="p-5 bg-white">
                    <div className="relative bg-slate-900 rounded-lg p-4">
                      <CopyButton text="curl https://pingpay.app/api/solana/transactions?address=YOUR_WALLET_ADDRESS" />
                      <pre className="text-xs text-slate-300 font-mono overflow-x-auto pr-12">
                        <code>curl https://pingpay.app/api/solana/transactions?address=YOUR_WALLET_ADDRESS</code>
                      </pre>
                    </div>
                  </div>
                </div>

                {/* NFT */}
                <div className="border border-slate-200 rounded-lg overflow-hidden hover:border-slate-300 transition-colors">
                  <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded uppercase">GET</span>
                        <code className="text-sm font-mono text-slate-800">/api/solana/nft</code>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mt-2">Returns NFTs owned by a wallet address</p>
                  </div>
                  <div className="p-5 bg-white">
                    <div className="relative bg-slate-900 rounded-lg p-4">
                      <CopyButton text="curl https://pingpay.app/api/solana/nft?address=YOUR_WALLET_ADDRESS" />
                      <pre className="text-xs text-slate-300 font-mono overflow-x-auto pr-12">
                        <code>curl https://pingpay.app/api/solana/nft?address=YOUR_WALLET_ADDRESS</code>
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Validator */}
                <div className="border border-slate-200 rounded-lg overflow-hidden hover:border-slate-300 transition-colors">
                  <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded uppercase">GET</span>
                        <code className="text-sm font-mono text-slate-800">/api/solana/validator</code>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mt-2">Returns validator information for a vote account</p>
                  </div>
                  <div className="p-5 bg-white">
                    <div className="relative bg-slate-900 rounded-lg p-4">
                      <CopyButton text="curl https://pingpay.app/api/solana/validator?vote_account=YOUR_VOTE_ACCOUNT" />
                      <pre className="text-xs text-slate-300 font-mono overflow-x-auto pr-12">
                        <code>curl https://pingpay.app/api/solana/validator?vote_account=YOUR_VOTE_ACCOUNT</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Authentication */}
            <section id="authentication">
              <h2 className="text-2xl font-bold mb-6 text-slate-900 tracking-tight">Authentication</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="border border-slate-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Lock className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-semibold text-slate-900">API Keys</h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">
                    Prepaid balance-based authentication. Ideal for high-volume usage with predictable costs.
                  </p>
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                    <code className="text-xs font-mono text-slate-700">Authorization: Bearer pp_live_...</code>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Zap className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold text-slate-900">x402 Protocol</h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">
                    Pay-per-request using Solana transactions. No account required, instant settlement.
                  </p>
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                    <code className="text-xs font-mono text-slate-700">X-Transaction-Signature: ...</code>
                  </div>
                </div>
              </div>
            </section>

            {/* x402 Protocol */}
            <section id="x402">
              <h2 className="text-2xl font-bold mb-6 text-slate-900 tracking-tight">x402 Protocol</h2>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 mb-6">
                <p className="text-sm text-amber-900">
                  <strong className="font-semibold">Note:</strong> The x402 protocol enables HTTP 402 Payment Required responses with Solana settlement.
                  Learn more at <a href="https://www.x402.org/" target="_blank" rel="noreferrer" className="underline hover:text-amber-950">x402.org</a>
                </p>
              </div>

              <h3 className="text-lg font-semibold mb-4 text-slate-900">Request Flow</h3>
              <div className="space-y-3 mb-8">
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-semibold text-indigo-700">1</div>
                  <div>
                    <p className="font-medium text-slate-900">Initial Request</p>
                    <p className="text-sm text-slate-600">Make an API request without payment credentials</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-semibold text-indigo-700">2</div>
                  <div>
                    <p className="font-medium text-slate-900">402 Response</p>
                    <p className="text-sm text-slate-600">Server responds with payment details and quote ID</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-semibold text-indigo-700">3</div>
                  <div>
                    <p className="font-medium text-slate-900">Submit Payment</p>
                    <p className="text-sm text-slate-600">Send SOL or USDC to the specified Solana address</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-semibold text-indigo-700">4</div>
                  <div>
                    <p className="font-medium text-slate-900">Retry with Signature</p>
                    <p className="text-sm text-slate-600">Include transaction signature in headers to receive data</p>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-4 text-slate-900">Response Headers</h3>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-5 py-3 font-semibold text-slate-900">Header</th>
                      <th className="text-left px-5 py-3 font-semibold text-slate-900">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-mono text-xs text-slate-700">X-Payment-Required</td>
                      <td className="px-5 py-3 text-slate-600">Always "true" on 402 responses</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-mono text-xs text-slate-700">X-Quote-Id</td>
                      <td className="px-5 py-3 text-slate-600">Unique identifier for this payment quote</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-mono text-xs text-slate-700">X-Amount-USD</td>
                      <td className="px-5 py-3 text-slate-600">Price in USD for this request</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-mono text-xs text-slate-700">X-Solana-Address</td>
                      <td className="px-5 py-3 text-slate-600">Recipient wallet address for payment</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-mono text-xs text-slate-700">X-Expires-At</td>
                      <td className="px-5 py-3 text-slate-600">ISO 8601 timestamp for quote expiration</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-lg font-semibold mb-4 mt-8 text-slate-900">Example</h3>
              <div className="relative bg-slate-900 rounded-lg p-5">
                <CopyButton text={`# Step 1: Initial request (receives 402)
curl https://pingpay.app/api/solana/balance?address=YOUR_WALLET

# Step 2: Server responds with 402 and payment details
# {
#   "quote_id": "abc123...",
#   "amount_usd": 0.01,
#   "solana_address": "...",
#   "expires_at": "2025-10-30T12:00:00Z"
# }

# Step 3: Submit Solana payment transaction

# Step 4: Retry with transaction signature
curl -H "X-Quote-Id: abc123" \\
     -H "X-Transaction-Signature: YourSolanaSignature..." \\
     https://pingpay.app/api/solana/balance?address=YOUR_WALLET`} />
                <pre className="text-xs text-slate-300 font-mono overflow-x-auto pr-12">
                  <code>{`# Step 1: Initial request (receives 402)
curl https://pingpay.app/api/solana/balance?address=YOUR_WALLET

# Step 2: Server responds with 402 and payment details
# {
#   "quote_id": "abc123...",
#   "amount_usd": 0.01,
#   "solana_address": "...",
#   "expires_at": "2025-10-30T12:00:00Z"
# }

# Step 3: Submit Solana payment transaction

# Step 4: Retry with transaction signature
curl -H "X-Quote-Id: abc123" \\
     -H "X-Transaction-Signature: YourSolanaSignature..." \\
     https://pingpay.app/api/solana/balance?address=YOUR_WALLET`}</code>
                </pre>
              </div>
            </section>

            {/* For Creators */}
            <section id="creators">
              <h2 className="text-2xl font-bold mb-6 text-slate-900 tracking-tight">For API Creators</h2>
              <p className="text-slate-600 mb-6">
                Monetize your own APIs through Ping Pay's marketplace. Set your price, publish your endpoint, 
                and earn revenue directly to your Solana wallet.
              </p>

              <div className="grid md:grid-cols-2 gap-8 mb-6">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Benefits</h3>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 mt-0.5">•</span>
                      <span>Host your API anywhere (AWS, Vercel, custom)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 mt-0.5">•</span>
                      <span>Automated payment verification and settlement</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 mt-0.5">•</span>
                      <span>Direct USDC payments to your wallet</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600 mt-0.5">•</span>
                      <span>Real-time analytics and usage tracking</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Getting Started</h3>
                  <ol className="space-y-2 text-sm text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-indigo-600">1.</span>
                      <span>Connect your Solana wallet</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-indigo-600">2.</span>
                      <span>Set your payout wallet address</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-indigo-600">3.</span>
                      <span>Create your API listing with pricing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-indigo-600">4.</span>
                      <span>Start earning from API requests</span>
                    </li>
                  </ol>
                </div>
              </div>

              <Link
                href="/creators"
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
              >
                Get Started as a Creator
              </Link>
            </section>

            {/* Support */}
            <section id="support">
              <h2 className="text-2xl font-bold mb-6 text-slate-900 tracking-tight">Support & Community</h2>
              <p className="text-slate-600 mb-6">
                Need help or have questions? Connect with our community and development team.
              </p>

              <div className="flex gap-4">
                <a
                  href="https://github.com/JermWang/PingPay"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  GitHub
                </a>
                <a
                  href="https://x.com/PingPaySol"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition-colors"
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
