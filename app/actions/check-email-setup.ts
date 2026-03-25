"use server"

import { createClient } from "@supabase/supabase-js"

export async function checkEmailSetup() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Get all auth users
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers()
    if (authError) {
      return { status: "error", message: authError.message }
    }

    const authUsers = authData?.users ?? []
    const authVerified = authUsers.filter((u) => !!u.email_confirmed_at)
    const authUnverified = authUsers.filter((u) => !u.email_confirmed_at)

    // 2. Get users table
    const { data: dbUsers, error: dbError } = await supabase
      .from("users")
      .select("email, email_verified, created_at")
      .order("created_at", { ascending: false })

    if (dbError) {
      return { status: "error", message: dbError.message }
    }

    const dbVerified = (dbUsers ?? []).filter((u) => u.email_verified === true)

    return {
      status: "ok",
      auth: {
        totalUsers: authUsers.length,
        verified: authVerified.length,
        unverified: authUnverified.length,
        unverifiedSample: authUnverified.slice(0, 5).map((u) => ({
          email: u.email ?? "unknown",
          createdAt: u.created_at,
          reason: "email_confirmed_at is NULL",
        })),
      },
      database: {
        totalUsers: (dbUsers ?? []).length,
        verified: dbVerified.length,
        sample: (dbUsers ?? []).slice(0, 10).map((u) => ({
          email: u.email,
          email_verified: u.email_verified,
          created_at: u.created_at,
        })),
      },
      instructions: {
        problem:
          authUnverified.length > 0
            ? `${authUnverified.length} users in Supabase Auth have no email_confirmed_at — email template not configured correctly.`
            : "All users in Supabase Auth are verified.",
        solution: "Configure email template in Supabase Dashboard",
        steps: [
          "Go to Supabase Dashboard > Project Settings > Email Templates",
          "Edit 'Confirm Signup' template",
          "Change the button href to: {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup",
          "Save and test with a new account",
        ],
        testNewUser:
          "Register a new account — the verification link in the email must contain token_hash and type as query params.",
      },
    }
  } catch (error: any) {
    return { status: "error", message: error.message || "Error checking email setup" }
  }
}
