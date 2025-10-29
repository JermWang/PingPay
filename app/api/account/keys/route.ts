import { type NextRequest, NextResponse } from "next/server"
import { generateApiKey, listUserApiKeys } from "@/lib/api-key-manager"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get("wallet")

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address required" },
        { status: 400 }
      )
    }

    const keys = await listUserApiKeys(walletAddress)

    return NextResponse.json({
      success: true,
      data: keys,
    })
  } catch (error) {
    console.error("[API Keys List] Error:", error)
    return NextResponse.json(
      {
        error: "Failed to get API keys",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { wallet, name, is_test } = body

    if (!wallet) {
      return NextResponse.json(
        { error: "Wallet address required" },
        { status: 400 }
      )
    }

    const { apiKey, plainKey } = await generateApiKey(wallet, name, is_test)

    return NextResponse.json({
      success: true,
      message: "API key created successfully. Save this key - it won't be shown again!",
      data: {
        ...apiKey,
        plain_key: plainKey, // Only shown once
      },
    })
  } catch (error) {
    console.error("[API Keys Create] Error:", error)
    return NextResponse.json(
      {
        error: "Failed to create API key",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

