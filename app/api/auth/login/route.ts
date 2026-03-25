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

    // Step 1: Check email verified in Supabase Auth (source of truth)
    const emailConfirmedAt = loginData.user?.email_confirmed_at
    console.log("[SERVER][API] email_confirmed_at:", emailConfirmedAt)

    if (!emailConfirmedAt) {
      console.log("[SERVER][API] Blocked: email not confirmed in auth for:", email)
      return NextResponse.json(
        {
          error: "email_not_verified",
          message: "Please verify your email before logging in. Check your inbox for the verification link.",
        },
        { status: 403 },
      )
    }

    // Step 2: Check users table profile exists
    const { data: userRecord, error: userFetchError } = await supabase
      .from("users")
      .select("id, email_verified")
      .eq("id", userId)
      .single()

    console.log("[SERVER][API] users table record:", userRecord?.id ?? "NOT FOUND", "error:", userFetchError?.message)

    if (!userRecord) {
      console.log("[SERVER][API] Profile missing in users table — creating it now for:", email)
      // Auth is confirmed, so create the profile
      const authUser = loginData.user
      await supabase.from("users").insert({
        id: userId,
        email: authUser.email,
        name: authUser.user_metadata?.name || authUser.email.split("@")[0],
        email_verified: true,
        subscription_tier: "free",
        subscription_plan: "free",
        plan: "free",
        ai_credits_monthly: 0,
        ai_credits_purchased: 0,
        theme: "dark",
        theme_preference: "dark",
        subscription_status: "active",
        billing_cycle: "monthly",
        pomodoro_work_duration: 25,
        pomodoro_break_duration: 5,
        pomodoro_long_break_duration: 15,
        pomodoro_sessions_until_long_break: 4,
        language: authUser.user_metadata?.language || "es",
        is_admin: false,
      })
    }

    // Step 3: Sync email_verified in users table if needed
    if (userRecord && !userRecord.email_verified) {
      console.log("[SERVER][API] Syncing email_verified=true in users table")
      await supabase
        .from("users")
        .update({ email_verified: true, updated_at: new Date().toISOString() })
        .eq("id", userId)
    }

    // Step 4: Update last login
    const lastLoginIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    await supabase
      .from("users")
      .update({ last_login_ip: lastLoginIp, last_login_at: new Date().toISOString() })
      .eq("id", userId)

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
