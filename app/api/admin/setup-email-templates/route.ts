import { NextResponse } from "next/server"

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

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    // IMPORTANT: Email template configurations for Supabase
    // These are the EXACT URLs to use in Supabase Dashboard > Project Settings > Email Templates
    const templates = {
      confirm_signup: {
        name: "Confirm Signup",
        url: `${appUrl}/auth/confirm`,
        // For Supabase, use these variables in email template:
        // In the Email Editor > Confirm Signup > href: {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup
        correctTemplate: "{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup",
      },
      reset_password: {
        name: "Reset Password",
        url: `${appUrl}/auth/reset`,
        // In the Email Editor > Reset Password > href: {{ .SiteURL }}/auth/reset?token_hash={{ .TokenHash }}&type=recovery
        correctTemplate: "{{ .SiteURL }}/auth/reset?token_hash={{ .TokenHash }}&type=recovery",
      },
      invite: {
        name: "Invite User",
        url: `${appUrl}/auth/confirm`,
        // In the Email Editor > Invite > href: {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite
        correctTemplate: "{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite",
      },
    }

    console.log("[v0] Email template configuration:")
    console.log("App URL:", appUrl)
    console.log("")
    console.log("DO THIS IN SUPABASE DASHBOARD:")
    console.log("1. Go to Project Settings > Email Templates")
    console.log("")
    console.log("2. Edit 'Confirm Signup' template:")
    console.log("   - Find the button/link href attribute")
    console.log("   - Replace with:", templates.confirm_signup.correctTemplate)
    console.log("")
    console.log("3. Edit 'Reset Password' template:")
    console.log("   - Find the button/link href attribute")
    console.log("   - Replace with:", templates.reset_password.correctTemplate)
    console.log("")
    console.log("4. (Optional) Edit 'Invite' template:")
    console.log("   - Find the button/link href attribute")
    console.log("   - Replace with:", templates.invite.correctTemplate)

    return NextResponse.json({
      message: "Email template configuration - Follow the instructions above",
      templates,
      instructions: {
        critical: "These are the EXACT URLs to paste in Supabase Dashboard",
        location: "Project Settings > Email Templates > Edit each template",
        variables: {
          TokenHash: "The verification token from Supabase",
          SiteURL: "Your app URL (e.g., https://future-task.com)",
          type: "signup | recovery | invite",
        },
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
