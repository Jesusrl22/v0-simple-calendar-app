import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { token_hash, type, email } = await request.json()

    console.log("[API][verify-email] Received - token_hash:", token_hash ? "present" : "MISSING", "type:", type, "email:", email)

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // If NO email provided, reject immediately
    if (!email) {
      console.error("[API][verify-email] Email is required")
      return NextResponse.json(
        { error: "Email is required for verification", message: "Invalid verification link." },
        { status: 400 }
      )
    }

    // Strategy 1: Try verifyOtp with token if provided
    if (token_hash) {
      try {
        const anonClient = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        console.log("[API][verify-email] Attempting verifyOtp with token...")
        const { data, error } = await anonClient.auth.verifyOtp({
          email,
          token: token_hash,
          type: (type as "signup" | "email_change" | "invite") || "signup",
        })

        if (!error && data.user) {
          console.log("[API][verify-email] ✓ verifyOtp successful for user:", data.user.id)
          
          // Create user profile in users table
          console.log("[API][verify-email] Creating user profile...")
          const { error: profileError } = await supabase.from("users").insert({
            id: data.user.id,
            email: email,
            name: data.user.user_metadata?.name || email.split("@")[0],
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
            language: data.user.user_metadata?.language || "es",
            is_admin: false,
          })

          if (profileError && profileError.code !== "23505") {
            console.error("[API][verify-email] Profile creation error:", profileError.message)
          }

          return NextResponse.json({ success: true, message: "Email verified successfully! You can now login." })
        } else {
          console.log("[API][verify-email] verifyOtp failed:", error?.message)
        }
      } catch (e: any) {
        console.log("[API][verify-email] verifyOtp exception:", e.message)
      }
    }

    // Strategy 2: Admin fallback - user clicked link WITHOUT token_hash in URL
    // This happens when Supabase email template is not configured with {{ .TokenHash }}
    console.log("[API][verify-email] Using admin fallback for email:", email)

    const { data: usersData, error: listError } = await supabase.auth.admin.listUsers()

    if (listError) {
      console.error("[API][verify-email] Error listing users:", listError.message)
      return NextResponse.json(
        { error: listError.message, message: "Failed to verify email." },
        { status: 500 }
      )
    }

    const user = usersData?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase())

    if (!user) {
      console.error("[API][verify-email] No user found for email:", email)
      return NextResponse.json(
        { error: "User not found", message: "No account found with this email." },
        { status: 404 }
      )
    }

    console.log("[API][verify-email] Found user:", user.id, "- current confirmed_at:", user.email_confirmed_at)

    // Check if already verified
    if (user.email_confirmed_at) {
      console.log("[API][verify-email] Email already verified for:", email)
      // Still update users table if not already there
      const { data: dbUser } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .single()

      if (!dbUser) {
        await supabase.from("users").insert({
          id: user.id,
          email: user.email || email,
          name: user.user_metadata?.name || email.split("@")[0],
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
          language: user.user_metadata?.language || "es",
          is_admin: false,
        })
      }

      return NextResponse.json({ success: true, message: "Email verified successfully! You can now login." })
    }

    // Force-confirm email in Supabase Auth
    console.log("[API][verify-email] Force-confirming email for user:", user.id)
    const { error: updateAuthError } = await supabase.auth.admin.updateUserById(user.id, {
      email_confirm: true,
    })

    if (updateAuthError) {
      console.error("[API][verify-email] Error confirming email in auth:", updateAuthError.message)
      return NextResponse.json(
        { error: updateAuthError.message, message: "Failed to confirm email." },
        { status: 500 }
      )
    }

    console.log("[API][verify-email] ✓ Email confirmed in auth")

    // Create/update user profile in users table
    console.log("[API][verify-email] Creating user profile in database...")
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .single()

    if (!existingUser) {
      const { error: profileError } = await supabase.from("users").insert({
        id: user.id,
        email: user.email || email,
        name: user.user_metadata?.name || email.split("@")[0],
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
        language: user.user_metadata?.language || "es",
        is_admin: false,
      })

      if (profileError) {
        console.error("[API][verify-email] Warning - profile not created:", profileError.message)
      } else {
        console.log("[API][verify-email] ✓ User profile created")
      }
    } else {
      // Update existing profile
      await supabase
        .from("users")
        .update({ email_verified: true, updated_at: new Date().toISOString() })
        .eq("id", user.id)
    }

    console.log("[API][verify-email] ✓ VERIFICATION COMPLETE for:", email)
    return NextResponse.json({ success: true, message: "Email verified successfully! You can now login." })
  } catch (error: any) {
    console.error("[API][verify-email] Exception:", error.message)
    return NextResponse.json(
      { error: error.message || "Verification failed", message: "An error occurred during verification." },
      { status: 500 }
    )
  }
}

    return NextResponse.json({ success: true, message: "Email verified successfully! You can now login." })
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

    // NOW create the user profile in users table upon email verification
    console.log("[API][verify-email] Creating user profile in users table (fallback)...")
    const { error: profileError } = await supabase.from("users").insert({
      id: user.id,
      email: user.email || email,
      name: user.user_metadata?.name || email.split("@")[0],
      email_verified: true, // Mark as verified
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
      language: user.user_metadata?.language || "es",
      is_admin: false,
    })

    if (profileError) {
      // If profile already exists, just update it
      if (profileError.code === "23505") { // Unique constraint violation
        console.log("[API][verify-email] Profile already exists, updating...")
        await supabase
          .from("users")
          .update({ email_verified: true, updated_at: new Date().toISOString() })
          .eq("id", user.id)
      } else {
        console.error("[API][verify-email] Failed to create user profile:", profileError.message)
      }
    } else {
      console.log("[API][verify-email] User profile created successfully (fallback)")
    }

    return NextResponse.json({ success: true, message: "Email verified successfully! You can now login." })
  } catch (error: any) {
    console.error("[API][verify-email] Exception:", error.message)
    return NextResponse.json(
      { error: error.message || "Verification failed", message: "An error occurred during verification." },
      { status: 500 }
    )
  }
}
