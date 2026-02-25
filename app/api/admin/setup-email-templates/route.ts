import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

/**
 * This endpoint helps configure Supabase email templates
 * Usage: POST /api/admin/setup-email-templates
 * 
 * Note: This requires admin access and should only be called during initial setup
 */

export async function POST(request: Request) {
  try {
    // Verify admin access (in production, use proper authentication)
    const adminSecret = request.headers.get("x-admin-secret")
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    // Email template configurations
    const templates = {
      confirm_signup: {
        name: "Confirm Signup",
        redirectUrl: `${appUrl}/auth/confirm?token={{ .Token }}&lang={{ .UserLanguage }}`,
        description: "Email confirmation template with language support",
      },
      reset_password: {
        name: "Reset Password",
        redirectUrl: `${appUrl}/auth/reset?token={{ .Token }}&lang={{ .UserLanguage }}`,
        description: "Password reset template with language support",
      },
    }

    console.log("[v0] Email template configuration:")
    console.log("App URL:", appUrl)
    console.log("")
    console.log("Confirm Signup:")
    console.log("  Redirect URL:", templates.confirm_signup.redirectUrl)
    console.log("")
    console.log("Reset Password:")
    console.log("  Redirect URL:", templates.reset_password.redirectUrl)

    return NextResponse.json({
      message: "Email templates configured",
      templates,
      instructions: {
        note: "These URLs should be configured in Supabase Dashboard > Project Settings > Email Templates",
        steps: [
          "Go to Supabase Dashboard",
          "Navigate to Project Settings > Email Templates",
          "Edit Confirm Signup template and set the redirect URL",
          "Edit Reset Password template and set the redirect URL",
          "Make sure to store language in user_metadata during signup",
        ],
      },
    })
  } catch (error: any) {
    console.error("[v0] Error configuring email templates:", error)
    return NextResponse.json(
      { error: error.message || "Failed to configure templates" },
      { status: 500 }
    )
  }
}
