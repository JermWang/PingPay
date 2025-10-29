import { type NextRequest, NextResponse } from "next/server"
import { withX402Protection } from "@/lib/x402-middleware"

export async function GET(request: NextRequest) {
  return withX402Protection(
    request,
    async () => {
      // This is the protected handler that only runs after payment
      return NextResponse.json({
        message: "Payment successful! Here's your protected data.",
        data: {
          timestamp: new Date().toISOString(),
          demo: true,
        },
      })
    },
    "/api/test-402",
  )
}
