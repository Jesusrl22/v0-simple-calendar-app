import { NextResponse } from "next/server"
import { cookies } from "next/headers"

function decodeJWT(token: string): any {
  try {
    const base64Payload = token.split(".")[1]
    const payload = Buffer.from(base64Payload, "base64url").toString("utf-8")
    return JSON.parse(payload)
  } catch {
    return null
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("sb-access-token")?.value

    if (!accessToken) {
      return NextResponse.json({ authenticated: false })
    }

    const payload = decodeJWT(accessToken)

    if (!payload) {
      return NextResponse.json({ authenticated: false })
    }

    // Check token expiry
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < now) {
      // Token expired — try to refresh
      const refreshToken = cookieStore.get("sb-refresh-token")?.value
      if (!refreshToken) {
        return NextResponse.json({ authenticated: false })
      }

      // Call Supabase to refresh
      const refreshRes = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        }
      )

      if (!refreshRes.ok) {
        return NextResponse.json({ authenticated: false })
      }

      const refreshData = await refreshRes.json()
      const newPayload = decodeJWT(refreshData.access_token)

      if (!newPayload) {
        return NextResponse.json({ authenticated: false })
      }

      // Update cookies with new tokens
      const response = NextResponse.json({
        authenticated: true,
        user: { id: newPayload.sub, email: newPayload.email },
      })
      response.cookies.set("sb-access-token", refreshData.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      })
      response.cookies.set("sb-refresh-token", refreshData.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      })
      return response
    }

    return NextResponse.json({
      authenticated: true,
      user: { id: payload.sub, email: payload.email },
    })
  } catch (error: any) {
    console.error("[v0] check-session error:", error.message)
    return NextResponse.json({ authenticated: false })
  }
}
