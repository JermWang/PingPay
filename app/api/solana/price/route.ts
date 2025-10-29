import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd',
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 30 } // Cache for 30 seconds
      }
    )

    if (!res.ok) {
      throw new Error(`CoinGecko API error: ${res.status}`)
    }

    const data = await res.json()

    if (!data.solana?.usd) {
      throw new Error('Invalid price data from CoinGecko')
    }

    return NextResponse.json({ 
      price: data.solana.usd,
      timestamp: Date.now()
    })

  } catch (error: any) {
    console.error('Error fetching SOL price:', error)
    return NextResponse.json(
      { error: 'Failed to fetch SOL price', details: error.message },
      { status: 500 }
    )
  }
}

