import { NextResponse } from "next/server"
import { rateLimit } from "@/lib/redis"
import { createClient } from "@supabase/supabase-js"

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

    // Authenticate with Supabase
    const loginResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      },
      body: JSON.stringify({ email, password }),
    })

    const loginData = await loginResponse.json().catch((e) => {
      console.error("[SERVER][API] Failed to parse login response:", e.message)
      return { error: "Invalid response from auth server" }
    })

    console.log("[SERVER][API] Supabase response status:", loginResponse.status)

    if (!loginResponse.ok || loginData.error) {
      console.error("[SERVER][API] Login error:", loginData.error?.message || loginData.error_description)
      return NextResponse.json(
        { error: loginData.error_description || loginData.error?.message || "Invalid credentials" },
        { status: 400 },
      )
    }

    const userId = loginData.user?.id
    console.log("[SERVER][API] Supabase auth passed for user:", userId)

    // Create Supabase admin client for database operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check email verification: Supabase auth field is the source of truth
    const emailConfirmedAt = loginData.user?.email_confirmed_at
    console.log("[SERVER][API] email_confirmed_at from auth:", emailConfirmedAt)

    // Also check our users table as a fallback
    const { data: userRecord, error: userFetchError } = await supabase
      .from("users")
      .select("id, email_verified, last_login_ip")
      .eq("id", userId)
      .single()

    console.log("[SERVER][API] users table record:", userRecord, "error:", userFetchError?.message)

    const isAuthConfirmed = !!emailConfirmedAt
    const isTableVerified = userRecord?.email_verified === true

    console.log("[SERVER][API] isAuthConfirmed:", isAuthConfirmed, "isTableVerified:", isTableVerified)

    if (!isAuthConfirmed && !isTableVerified) {
      console.log("[SERVER][API] Login blocked: email not verified for:", email)
      return NextResponse.json(
        {
          error: "email_not_verified",
          message: "Please verify your email before logging in. Check your inbox for the verification link.",
        },
        { status: 403 },
      )
    }

    // If auth is confirmed but table isn't synced, sync it now
    if (isAuthConfirmed && !isTableVerified && userRecord) {
      console.log("[SERVER][API] Syncing email_verified flag in users table")
      await supabase
        .from("users")
        .update({ email_verified: true, updated_at: new Date().toISOString() })
        .eq("id", userId)
    }

    const lastLoginIp = request.headers.get("x-forwarded-for") || "Unknown"

    // Create profile if missing
    if (!userRecord) {
      console.log("[SERVER][API] Profile not found, creating...")
      await supabase.from("users").insert({
        id: userId,
        email: loginData.user.email,
        name: loginData.user.user_metadata?.name || loginData.user.email.split("@")[0],
        email_verified: isAuthConfirmed,
        subscription_tier: "free",
        subscription_plan: "free",
        plan: "free",
        ai_credits_monthly: 0,
        ai_credits_purchased: 0,
        last_login_ip: lastLoginIp,
        last_login_at: new Date().toISOString(),
      })
      console.log("[SERVER][API] Profile created")
    } else {
      // Update last login info
      await supabase
        .from("users")
        .update({
          last_login_ip: lastLoginIp,
          last_login_at: new Date().toISOString(),
        })
        .eq("id", userId)
    }

    const loginSuccessResponse = NextResponse.json({ success: true, user: loginData.user })

    loginSuccessResponse.cookies.set("sb-access-token", loginData.access_token, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    })

    loginSuccessResponse.cookies.set("sb-refresh-token", loginData.refresh_token, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    })

    console.log("[SERVER][API] Login successful, cookies set")
    return loginSuccessResponse
  } catch (error: any) {
    console.error("[SERVER][API] Login exception:", error.message)
    return NextResponse.json({ error: error.message || "Login failed" }, { status: 500 })
  }
}
