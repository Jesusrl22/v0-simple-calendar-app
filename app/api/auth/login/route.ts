import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { rateLimit } from "@/lib/redis"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    const identifier = email || request.headers.get("x-forwarded-for") || "anonymous"
    const rateLimitResult = await rateLimit(identifier, "auth")

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Too many login attempts",
          message: "Please try again later",
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
        },
        { status: 429 },
      )
    }

    console.log("[SERVER][API] Login request for:", email)

    const loginResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })

    const loginData = await loginResponse.json().catch((e) => {
      console.error("[SERVER][API] Failed to parse login response:", e.message)
      return { error: "Invalid response from auth server" }
    })

    if (!loginResponse.ok || loginData.error) {
      console.error("[SERVER][API] Login error:", loginData.error?.message || loginData.error_description)
      return NextResponse.json(
        { error: loginData.error_description || loginData.error?.message || "Invalid credentials" },
        { status: 400 },
      )
    }

    console.log("[SERVER][API] Login successful for user:", loginData.user.id)

    // Check email confirmation in database first (more reliable than checking JWT)
    const confirmCheckResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/users?id=eq.${loginData.user.id}&select=id,email_confirmed_at`,
      {
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
        },
      },
    ).then((res) => res.json()).catch(() => [])

    // If email is not confirmed and user doesn't exist in DB, they need to verify
    const userRecord = Array.isArray(confirmCheckResponse) ? confirmCheckResponse[0] : null
    const isEmailConfirmed = loginData.user.email_confirmed_at || userRecord?.email_confirmed_at
    
    if (!isEmailConfirmed && !userRecord) {
      console.log("[SERVER][API] Email not confirmed for new user:", loginData.user.email)
      return NextResponse.json(
        { 
          error: "email_not_verified",
          message: "Email not verified. Please check your inbox for the verification link." 
        },
        { status: 403 },
      )
    }

    // Get user agent to detect new device
    const userAgent = request.headers.get("user-agent") || "Unknown device"
    const lastLoginIp = request.headers.get("x-forwarded-for") || "Unknown"

    // Use the userRecord we already fetched instead of fetching again
    let profiles = [userRecord]
    if (!userRecord) {
      // If userRecord is null, fetch just to check if profile exists
      const profileCheckResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/users?id=eq.${loginData.user.id}&select=id`,
        {
          headers: {
            apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
          },
        },
      ).then(res => res.json()).catch(() => [])
      profiles = profileCheckResponse
    }

    if (!profiles || profiles.length === 0) {
      console.log("[SERVER][API] Profile not found, creating...")

      await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          id: loginData.user.id,
          email: loginData.user.email,
          name: loginData.user.user_metadata?.name || loginData.user.email.split("@")[0],
          subscription_tier: "free",
          subscription_plan: "free",
          plan: "free",
          ai_credits_monthly: 0,
          ai_credits_purchased: 0,
        }),
      })

      console.log("[SERVER][API] Profile created")
    }

    // Check if this is a new device by comparing IP addresses
    const isNewDevice = userRecord?.last_login_ip !== lastLoginIp
    
    // Log new device login for security monitoring
    if (isNewDevice) {
      console.log("[SERVER][API] New device login detected from IP:", lastLoginIp, "User Agent:", userAgent)
      // Supabase Auth can send custom emails if configured in Auth settings
    }

    // Update last login info
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/users?id=eq.${loginData.user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
        },
        body: JSON.stringify({
          last_login_ip: lastLoginIp,
          last_login_at: new Date().toISOString(),
        }),
      })
    } catch (updateError) {
      console.error("[SERVER][API] Failed to update last login:", updateError)
    }

    const cookieStore = await cookies()

    cookieStore.set("sb-access-token", loginData.access_token, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    })

    cookieStore.set("sb-refresh-token", loginData.refresh_token, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    })

    console.log("[SERVER][API] Cookies set successfully")

    return NextResponse.json({ success: true, user: loginData.user })
  } catch (error: any) {
    console.error("[SERVER][API] Login exception:", error.message)
    return NextResponse.json({ error: error.message || "Login failed" }, { status: 500 })
  }
}
