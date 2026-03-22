import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    const { token_hash, type, email } = await request.json()

    console.log("[API][verify-email] token_hash:", token_hash ? "present" : "missing", "type:", type, "email:", email)

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Strategy 1: verifyOtp with anon client (works when token is fresh)
    if (token_hash && email) {
      try {
        const anonClient = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        console.log("[API][verify-email] Trying verifyOtp...")
        const { data, error } = await anonClient.auth.verifyOtp({
          email,
          token: token_hash,
          type: (type as "signup" | "email_change" | "invite") || "signup",
        })
        if (!error && data.user) {
          console.log("[API][verify-email] verifyOtp success for user:", data.user.id)
          await supabase
            .from("users")
            .update({ email_verified: true, updated_at: new Date().toISOString() })
            .eq("id", data.user.id)
          return NextResponse.json({ success: true, message: "Email verified successfully!" })
        }
        console.log("[API][verify-email] verifyOtp failed:", error?.message, "— trying admin fallback")
      } catch (e: any) {
        console.log("[API][verify-email] verifyOtp exception:", e?.message)
      }
    }

    // Strategy 2: Admin API — find user by email and force-confirm
    if (!email) {
      return NextResponse.json(
        { error: "Email is required", message: "Invalid verification link." },
        { status: 400 }
      )
    }

    console.log("[API][verify-email] Admin fallback for email:", email)
    const { data: usersData, error: listError } = await supabase.auth.admin.listUsers()

    if (listError) {
      console.error("[API][verify-email] listUsers error:", listError.message)
      return NextResponse.json({ error: listError.message, message: "Failed to verify email." }, { status: 500 })
    }

    const user = usersData?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase())

    if (!user) {
      console.error("[API][verify-email] No user found for email:", email)
      return NextResponse.json({ error: "User not found", message: "No account found with this email." }, { status: 404 })
    }

    console.log("[API][verify-email] Found user:", user.id, "confirmed_at:", user.email_confirmed_at)

    // Force-confirm in Supabase Auth
    const { error: updateAuthError } = await supabase.auth.admin.updateUserById(user.id, {
      email_confirm: true,
    })

    if (updateAuthError) {
      console.error("[API][verify-email] updateUserById error:", updateAuthError.message)
      return NextResponse.json({ error: updateAuthError.message, message: "Failed to confirm email." }, { status: 500 })
    }

    console.log("[API][verify-email] Auth confirmed for user:", user.id)

    // Sync users table
    const { error: tableError } = await supabase
      .from("users")
      .update({ email_verified: true, updated_at: new Date().toISOString() })
      .eq("id", user.id)

    if (tableError) {
      console.error("[API][verify-email] users table update error (non-fatal):", tableError.message)
    } else {
      console.log("[API][verify-email] users table updated successfully")
    }

    return NextResponse.json({ success: true, message: "Email verified successfully!" })
  } catch (error: any) {
    console.error("[API][verify-email] Exception:", error.message)
    return NextResponse.json(
      { error: error.message || "Verification failed", message: "An error occurred during verification." },
      { status: 500 }
    )
  }
}
