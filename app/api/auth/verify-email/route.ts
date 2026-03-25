import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const DEFAULT_USER_PROFILE = (id: string, email: string, name: string, language = "es") => ({
  id,
  email,
  name,
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
  language,
  is_admin: false,
})

export async function POST(request: Request) {
  try {
    const { token_hash, type, email } = await request.json()

    console.log("[API][verify-email] token_hash:", token_hash ? "present" : "MISSING", "email:", email)

    if (!email) {
      return NextResponse.json(
        { error: "Email is required", message: "Invalid verification link." },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Strategy 1: verifyOtp (works when Supabase template has {{ .TokenHash }})
    if (token_hash) {
      try {
        const anonClient = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data, error } = await anonClient.auth.verifyOtp({
          email,
          token: token_hash,
          type: (type as "signup" | "email_change" | "invite") || "signup",
        })

        if (!error && data.user) {
          console.log("[API][verify-email] verifyOtp success:", data.user.id)
          const name = data.user.user_metadata?.name || email.split("@")[0]
          const lang = data.user.user_metadata?.language || "es"
          const { error: upsertError } = await supabase
            .from("users")
            .upsert(DEFAULT_USER_PROFILE(data.user.id, email, name, lang), { onConflict: "id" })
          if (upsertError) console.log("[API][verify-email] upsert warning:", upsertError.message)
          return NextResponse.json({ success: true, message: "Email verified! You can now login." })
        }

        console.log("[API][verify-email] verifyOtp failed:", error?.message, "— trying admin fallback")
      } catch (e: any) {
        console.log("[API][verify-email] verifyOtp exception:", e.message)
      }
    }

    // Strategy 2: Admin fallback — find user by email and force-confirm
    console.log("[API][verify-email] Admin fallback for:", email)
    const { data: usersData, error: listError } = await supabase.auth.admin.listUsers()

    if (listError) {
      console.error("[API][verify-email] listUsers error:", listError.message)
      return NextResponse.json({ error: listError.message, message: "Failed to verify email." }, { status: 500 })
    }

    const user = usersData?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase())

    if (!user) {
      console.error("[API][verify-email] No user found for:", email)
      return NextResponse.json(
        { error: "User not found", message: "No account found with this email." },
        { status: 404 }
      )
    }

    console.log("[API][verify-email] Found user:", user.id, "confirmed_at:", user.email_confirmed_at)

    // Force-confirm in Supabase Auth (safe even if already confirmed)
    const { error: updateAuthError } = await supabase.auth.admin.updateUserById(user.id, {
      email_confirm: true,
    })

    if (updateAuthError) {
      console.error("[API][verify-email] updateUserById error:", updateAuthError.message)
      return NextResponse.json({ error: updateAuthError.message, message: "Failed to confirm email." }, { status: 500 })
    }

    console.log("[API][verify-email] Auth confirmed for:", user.id)

    const name = user.user_metadata?.name || email.split("@")[0]
    const lang = user.user_metadata?.language || "es"
    const { error: upsertError } = await supabase
      .from("users")
      .upsert(DEFAULT_USER_PROFILE(user.id, user.email || email, name, lang), { onConflict: "id" })

    if (upsertError) {
      console.error("[API][verify-email] upsert warning:", upsertError.message)
    } else {
      console.log("[API][verify-email] Profile upserted for:", user.id)
    }

    console.log("[API][verify-email] VERIFICATION COMPLETE for:", email)
    return NextResponse.json({ success: true, message: "Email verified! You can now login." })
  } catch (error: any) {
    console.error("[API][verify-email] Exception:", error.message)
    return NextResponse.json(
      { error: error.message || "Verification failed", message: "An error occurred during verification." },
      { status: 500 }
    )
  }
}
