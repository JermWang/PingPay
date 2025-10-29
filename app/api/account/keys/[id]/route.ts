import { type NextRequest, NextResponse } from "next/server"
import { revokeApiKey, updateApiKeyName } from "@/lib/api-key-manager"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get("wallet")

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address required" },
        { status: 400 }
      )
    }

    const { id } = await params
    await revokeApiKey(id, walletAddress)

    return NextResponse.json({
      success: true,
      message: "API key revoked successfully",
    })
  } catch (error) {
    console.error("[API Keys Revoke] Error:", error)
    return NextResponse.json(
      {
        error: "Failed to revoke API key",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { wallet, name } = body

    if (!wallet || !name) {
      return NextResponse.json(
        { error: "Wallet address and name required" },
        { status: 400 }
      )
    }

    const { id } = await params
    const updatedKey = await updateApiKeyName(id, wallet, name)

    return NextResponse.json({
      success: true,
      message: "API key updated successfully",
      data: updatedKey,
    })
  } catch (error) {
    console.error("[API Keys Update] Error:", error)
    return NextResponse.json(
      {
        error: "Failed to update API key",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

