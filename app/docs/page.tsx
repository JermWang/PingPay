"use client"

import Link from "next/link"
import { ArrowLeft, Code, Key, Zap, Shield, BookOpen, Rocket, DollarSign, Lock, Copy, Check } from "lucide-react"
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
      className="absolute top-2 right-2 p-1.5 rounded-md bg-slate-700/50 hover:bg-slate-600/50 transition-colors border border-slate-600/50"
      title="Copy to clipboard"
    >
      {copied ? (
        <Check className="w-4 h-4 text-green-400" />
      ) : (
        <Copy className="w-4 h-4 text-slate-300" />
      )}
    </button>
  )
}

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-x-hidden">
      {/* Subtle gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-green-500/5 pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="container mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-green-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 mb-6">
            <BookOpen className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-200">Developer Documentation</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-[#9945FF] via-[#14F195] to-[#00FFA3] bg-clip-text text-transparent">
            Documentation
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Everything you need to integrate Ping Pay's micropayment APIs with Solana
          </p>
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-16">
          <a href="#quick-start" className="group bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all">
            <Rocket className="w-8 h-8 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-semibold mb-2 text-white">Quick Start</h3>
            <p className="text-sm text-slate-400">
              Get up and running in 5 minutes
            </p>
          </a>

          <a href="#auth" className="group bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/10 transition-all">
            <Key className="w-8 h-8 text-green-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-semibold mb-2 text-white">Authentication</h3>
            <p className="text-sm text-slate-400">
              x402 headers & API keys
            </p>
          </a>

          <a href="#creators" className="group bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all">
            <DollarSign className="w-8 h-8 text-cyan-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-semibold mb-2 text-white">For Creators</h3>
            <p className="text-sm text-slate-400">
              Monetize your own APIs
            </p>
          </a>

          <a href="#security" className="group bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10 transition-all">
            <Lock className="w-8 h-8 text-orange-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-semibold mb-2 text-white">Security</h3>
            <p className="text-sm text-slate-400">
              Best practices & limits
            </p>
          </a>
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 lg:gap-10">
          {/* Sidebar TOC */}
          <aside className="hidden lg:block sticky top-6 self-start">
            <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-5">
              <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-4">On this page</div>
              <nav className="space-y-2">
                <a href="#overview" className="block text-sm text-slate-300 hover:text-purple-400 hover:translate-x-1 transition-all py-1">Overview</a>
                <a href="#quick-start" className="block text-sm text-slate-300 hover:text-purple-400 hover:translate-x-1 transition-all py-1">Quick Start</a>
                <a href="#auth" className="block text-sm text-slate-300 hover:text-purple-400 hover:translate-x-1 transition-all py-1">Auth Methods</a>
                <a href="#endpoints" className="block text-sm text-slate-300 hover:text-purple-400 hover:translate-x-1 transition-all py-1">API Endpoints</a>
                <a href="#creators" className="block text-sm text-slate-300 hover:text-purple-400 hover:translate-x-1 transition-all py-1">For Creators</a>
                <a href="#payouts" className="block text-sm text-slate-300 hover:text-purple-400 hover:translate-x-1 transition-all py-1">Payouts</a>
                <a href="#support" className="block text-sm text-slate-300 hover:text-purple-400 hover:translate-x-1 transition-all py-1">Support</a>
              </nav>
            </div>
          </aside>

          <div className="space-y-10 lg:space-y-12 pb-12 overflow-hidden">
            {/* Overview */}
            <section id="overview" className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center gap-3">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Overview</span>
              </h2>
              <p className="text-slate-300 leading-relaxed">
                Ping Pay lets you monetize APIs with Solana. Users can pay per request (x402), or use API keys with prepaid balance.
                Our marketplace features creator-made APIs so creators earn revenue directly to their wallet.
              </p>
            </section>

          {/* How it Works */}
            <section id="quick-start" className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">How It Works</span>
              </h2>
              <p className="text-slate-300 mb-6 leading-relaxed">
                Ping Pay uses the x402 payment protocol to enable micropayments for API requests. 
                Here's how a typical request flow works:
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700/30">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm font-bold">1</div>
                  <p className="text-slate-300 pt-0.5">Client makes an API request without payment</p>
                </div>
                <div className="flex items-start gap-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700/30">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm font-bold">2</div>
                  <p className="text-slate-300 pt-0.5">Server responds with <code className="text-green-400 bg-slate-900/50 px-2 py-0.5 rounded text-sm">402 Payment Required</code> and quote details</p>
                </div>
                <div className="flex items-start gap-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700/30">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm font-bold">3</div>
                  <p className="text-slate-300 pt-0.5">Client initiates Solana SOL or USDC payment</p>
                </div>
                <div className="flex items-start gap-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700/30">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm font-bold">4</div>
                  <p className="text-slate-300 pt-0.5">Client includes transaction signature in <code className="text-green-400 bg-slate-900/50 px-2 py-0.5 rounded text-sm">x-transaction-signature</code> header</p>
                </div>
                <div className="flex items-start gap-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700/30">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm font-bold">5</div>
                  <p className="text-slate-300 pt-0.5">Server verifies payment and returns API response</p>
                </div>
            </div>
          </section>

            {/* API Endpoints */}
            <section id="endpoints" className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">API Endpoints</span>
              </h2>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-200">
                  <span className="font-semibold">Note:</span> Replace <code className="bg-slate-900/50 px-1.5 py-0.5 rounded text-blue-300">YOUR_WALLET_ADDRESS</code> with your actual address. 
                  Click the copy button to grab any code snippet.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Balance */}
                <div className="bg-slate-800/40 border border-slate-700/40 rounded-lg p-4 hover:border-slate-600/50 transition-colors">
                  <h3 className="text-base font-semibold mb-1 text-white">GET /api/solana/balance</h3>
                  <p className="text-slate-400 mb-3 text-sm">Returns SOL balance for a wallet</p>
                  <div className="relative bg-slate-900/70 rounded p-3 border border-slate-700/50 overflow-hidden">
                    <CopyButton text="curl https://pingpay.app/api/solana/balance?address=YOUR_WALLET_ADDRESS" />
                    <pre className="text-xs text-green-300 pr-10 overflow-x-auto"><code>curl https://pingpay.app/api/solana/balance?address=YOUR_WALLET_ADDRESS</code></pre>
                  </div>
                </div>

                {/* Tokens */}
                <div className="bg-slate-800/40 border border-slate-700/40 rounded-lg p-4 hover:border-slate-600/50 transition-colors">
                  <h3 className="text-base font-semibold mb-1 text-white">GET /api/solana/tokens</h3>
                  <p className="text-slate-400 mb-3 text-sm">Lists SPL tokens held by a wallet</p>
                  <div className="relative bg-slate-900/70 rounded p-3 border border-slate-700/50 overflow-hidden">
                    <CopyButton text="curl https://pingpay.app/api/solana/tokens?address=YOUR_WALLET_ADDRESS" />
                    <pre className="text-xs text-green-300 pr-10 overflow-x-auto"><code>curl https://pingpay.app/api/solana/tokens?address=YOUR_WALLET_ADDRESS</code></pre>
                  </div>
                </div>

                {/* Transactions */}
                <div className="bg-slate-800/40 border border-slate-700/40 rounded-lg p-4 hover:border-slate-600/50 transition-colors">
                  <h3 className="text-base font-semibold mb-1 text-white">GET /api/solana/transactions</h3>
                  <p className="text-slate-400 mb-3 text-sm">Recent transactions for a wallet</p>
                  <div className="relative bg-slate-900/70 rounded p-3 border border-slate-700/50 overflow-hidden">
                    <CopyButton text="curl https://pingpay.app/api/solana/transactions?address=YOUR_WALLET_ADDRESS" />
                    <pre className="text-xs text-green-300 pr-10 overflow-x-auto"><code>curl https://pingpay.app/api/solana/transactions?address=YOUR_WALLET_ADDRESS</code></pre>
                  </div>
                </div>

                {/* NFT */}
                <div className="bg-slate-800/40 border border-slate-700/40 rounded-lg p-4 hover:border-slate-600/50 transition-colors">
                  <h3 className="text-base font-semibold mb-1 text-white">GET /api/solana/nft</h3>
                  <p className="text-slate-400 mb-3 text-sm">Fetch NFTs owned by a wallet</p>
                  <div className="relative bg-slate-900/70 rounded p-3 border border-slate-700/50 overflow-hidden">
                    <CopyButton text="curl https://pingpay.app/api/solana/nft?address=YOUR_WALLET_ADDRESS" />
                    <pre className="text-xs text-green-300 pr-10 overflow-x-auto"><code>curl https://pingpay.app/api/solana/nft?address=YOUR_WALLET_ADDRESS</code></pre>
                  </div>
                </div>

                {/* Validator */}
                <div className="bg-slate-800/40 border border-slate-700/40 rounded-lg p-4 hover:border-slate-600/50 transition-colors">
                  <h3 className="text-base font-semibold mb-1 text-white">GET /api/solana/validator</h3>
                  <p className="text-slate-400 mb-3 text-sm">Validator info for a vote account</p>
                  <div className="relative bg-slate-900/70 rounded p-3 border border-slate-700/50 overflow-hidden">
                    <CopyButton text="curl https://pingpay.app/api/solana/validator?vote_account=YOUR_VOTE_ACCOUNT" />
                    <pre className="text-xs text-green-300 pr-10 overflow-x-auto"><code>curl https://pingpay.app/api/solana/validator?vote_account=YOUR_VOTE_ACCOUNT</code></pre>
                  </div>
                </div>

                {/* API Key Example */}
                <div className="bg-slate-800/40 border border-slate-700/40 rounded-lg p-4 hover:border-slate-600/50 transition-colors">
                  <h3 className="text-base font-semibold mb-1 text-white">With API Key</h3>
                  <p className="text-slate-400 mb-3 text-sm">Prepaid API key authentication</p>
                  <div className="relative bg-slate-900/70 rounded p-3 border border-slate-700/50 overflow-hidden">
                    <CopyButton text='curl -H "Authorization: Bearer YOUR_API_KEY" https://pingpay.app/api/solana/balance?address=YOUR_WALLET_ADDRESS' />
                    <pre className="text-xs text-green-300 pr-10 overflow-x-auto"><code>curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://pingpay.app/api/solana/balance?address=...</code></pre>
                  </div>
                </div>
              </div>
            </section>

            {/* x402 Headers */}
            <section id="auth" className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">x402 Headers</span>
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-slate-800/40 border border-slate-700/40 rounded-lg p-5">
                  <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                    Standard Headers (402 Response)
                  </h3>
                  <ul className="space-y-2.5">
                    <li className="flex flex-col gap-1">
                      <code className="bg-slate-900/50 px-2 py-1 rounded text-purple-300 text-sm w-fit">X-Payment-Required</code>
                      <span className="text-xs text-slate-400">always "true" on 402</span>
                    </li>
                    <li className="flex flex-col gap-1">
                      <code className="bg-slate-900/50 px-2 py-1 rounded text-purple-300 text-sm w-fit">X-Quote-Id</code>
                      <span className="text-xs text-slate-400">unique quote identifier</span>
                    </li>
                    <li className="flex flex-col gap-1">
                      <code className="bg-slate-900/50 px-2 py-1 rounded text-purple-300 text-sm w-fit">X-Amount-USD</code>
                      <span className="text-xs text-slate-400">price for this request</span>
                    </li>
                    <li className="flex flex-col gap-1">
                      <code className="bg-slate-900/50 px-2 py-1 rounded text-purple-300 text-sm w-fit">X-Solana-Address</code>
                      <span className="text-xs text-slate-400">receiver address</span>
                    </li>
                    <li className="flex flex-col gap-1">
                      <code className="bg-slate-900/50 px-2 py-1 rounded text-purple-300 text-sm w-fit">X-Expires-At</code>
                      <span className="text-xs text-slate-400">ISO timestamp when quote expires</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-slate-800/40 border border-slate-700/40 rounded-lg p-5">
                  <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                    Client Retry (After Paying)
                  </h3>
                  <ul className="space-y-2.5">
                    <li className="flex flex-col gap-1">
                      <code className="bg-slate-900/50 px-2 py-1 rounded text-green-300 text-sm w-fit">X-Transaction-Signature</code>
                      <span className="text-xs text-slate-400">Solana transaction signature</span>
                    </li>
                    <li className="flex flex-col gap-1">
                      <code className="bg-slate-900/50 px-2 py-1 rounded text-green-300 text-sm w-fit">X-Quote-Id</code>
                      <span className="text-xs text-slate-400">the same quote id you received</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-slate-800/40 border border-slate-700/40 rounded-lg p-5">
                <h3 className="text-lg font-semibold mb-4 text-white">Example x402 Flow</h3>
                <div className="relative bg-slate-900/70 rounded p-4 border border-slate-700/50">
                  <CopyButton text={`# Step 1: Initial request (gets 402)
curl https://pingpay.app/api/solana/balance?address=YOUR_WALLET

# Step 2: Pay the quote on Solana, get tx signature

# Step 3: Retry with signature
curl -H "X-Quote-Id: abc123" \\
     -H "X-Transaction-Signature: YourSolanaSignature" \\
     https://pingpay.app/api/solana/balance?address=YOUR_WALLET`} />
                  <pre className="text-xs text-green-300 pr-10"><code>{`# Step 1: Initial request (gets 402)
curl https://pingpay.app/api/solana/balance?address=YOUR_WALLET

# Step 2: Pay the quote on Solana, get tx signature

# Step 3: Retry with signature
curl -H "X-Quote-Id: abc123" \\
     -H "X-Transaction-Signature: YourSolanaSignature" \\
     https://pingpay.app/api/solana/balance?address=YOUR_WALLET`}</code></pre>
                </div>
              </div>

              <div className="border-t border-slate-700/50 pt-4 mt-6">
                <p className="text-xs text-slate-400">
                  Learn more about x402 at <a className="underline text-purple-400 hover:text-purple-300" href="https://www.x402.org/" target="_blank" rel="noreferrer">x402.org</a>
                </p>
            </div>
          </section>

            {/* For Creators */}
            <section id="creators" className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">For API Creators</span>
              </h2>
              <p className="text-slate-300 mb-6 leading-relaxed">
                Want to monetize your own APIs? Connect your wallet and create an API in minutes:
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-cyan-400" />
                  </div>
                  <span className="text-slate-300">Host your API anywhere (AWS, Vercel, your own server)</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-cyan-400" />
                  </div>
                  <span className="text-slate-300">Set your price per request</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-cyan-400" />
                  </div>
                  <span className="text-slate-300">Ping Pay handles payments and verification automatically</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-cyan-400" />
                  </div>
                  <span className="text-slate-300">Earn revenue in USDC directly to your wallet</span>
                </li>
              </ul>
                <Link
                  href="/creators"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-lg font-semibold hover:from-cyan-600 hover:to-teal-600 transition-all shadow-lg shadow-cyan-500/20"
                >
                  Get Started as a Creator
                </Link>
            </section>

            {/* Payouts */}
            <section id="payouts" className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">Payouts & Withdrawals</span>
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-sm font-bold">1</div>
                  <p className="text-slate-300 pt-0.5">Go to Creators → set your <strong>Payout Wallet</strong></p>
                </div>
                <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-sm font-bold">2</div>
                  <p className="text-slate-300 pt-0.5">Earn revenue as users pay for your API calls</p>
                </div>
                <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-sm font-bold">3</div>
                  <p className="text-slate-300 pt-0.5">Request a withdrawal; we'll send USDC to your payout wallet</p>
              </div>
            </div>
          </section>

          {/* Support */}
            <section id="support" className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Need Help?</span>
              </h2>
              <p className="text-slate-300 mb-6">
              Join our community or reach out for support:
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="https://github.com/JermWang/PingPay"
                target="_blank"
                rel="noopener noreferrer"
                  className="px-6 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all font-medium"
              >
                GitHub
              </a>
              <a
                href="https://x.com/PingPaySol"
                target="_blank"
                rel="noopener noreferrer"
                  className="px-6 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all font-medium"
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
