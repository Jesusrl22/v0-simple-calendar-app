import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    // Call Supabase Auth REST API directly
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        },
        body: JSON.stringify({ email, password }),
      }
    )

    const data = await res.json()

    if (!res.ok) {
      const message = data.error_description || data.msg || data.error || "Invalid credentials"
      return NextResponse.json({ error: message, message }, { status: 401 })
    }

    if (!data.access_token) {
      return NextResponse.json({ error: "No access token returned" }, { status: 401 })
    }

    // Decode JWT to get user info
    const base64Payload = data.access_token.split(".")[1]
    const payload = JSON.parse(Buffer.from(base64Payload, "base64url").toString("utf-8"))

    // Check email verification
    if (!payload.email_confirmed_at && !data.user?.email_confirmed_at) {
      return NextResponse.json(
        { error: "email_not_verified", message: "Please verify your email first" },
        { status: 403 }
      )
    }

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    }

    // Set cookies on the response object so they're sent to the browser
    const response = NextResponse.json({
      authenticated: true,
      user: { id: payload.sub, email: payload.email },
    })

    response.cookies.set("sb-access-token", data.access_token, cookieOptions)
    response.cookies.set("sb-refresh-token", data.refresh_token, cookieOptions)

    return response
  } catch (error: any) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
