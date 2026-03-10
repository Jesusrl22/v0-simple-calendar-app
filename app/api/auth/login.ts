import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    console.log("[v0] Login attempt:", email)

    const supabase = await createServerClient()

    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("[v0] Login error:", error)
      return NextResponse.json({ error: error.message, message: error.message }, { status: 401 })
    }

    if (!data.user) {
      console.error("[v0] Login: No user data returned")
      return NextResponse.json({ error: "No user data returned" }, { status: 401 })
    }

    console.log("[v0] Login success for:", data.user.email, "verified:", data.user.email_confirmed_at)

    // Check if email is verified
    if (!data.user.email_confirmed_at) {
      return NextResponse.json(
        { error: "email_not_verified", message: "Please verify your email first" },
        { status: 403 }
      )
    }

    // Save tokens to cookies
    const cookieStore = await cookies()
    if (data.session) {
      console.log("[v0] Saving session tokens to cookies")
      cookieStore.set("sb-access-token", data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      })
      cookieStore.set("sb-refresh-token", data.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      })
    }

    return NextResponse.json({ authenticated: true, user: { id: data.user.id, email: data.user.email } })
  } catch (error: any) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
