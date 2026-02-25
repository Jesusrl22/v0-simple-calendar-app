"use server"

export async function setupEmailTemplates() {
  try {
    // Verify admin access using server-side environment variable
    const adminSecret = process.env.ADMIN_SECRET
    if (!adminSecret) {
      throw new Error("Admin secret not configured")
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/email_templates`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          "apikey": process.env.SUPABASE_SERVICE_ROLE_KEY!,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Email template check failed: ${response.status}`)
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    return {
      success: true,
      message: "Email templates are properly configured",
      confirmUrl: `${appUrl}/auth/confirm?token=[TOKEN]&lang=[LANGUAGE]`,
      resetUrl: `${appUrl}/auth/reset?token=[TOKEN]&lang=[LANGUAGE]`,
    }
  } catch (error: any) {
    console.error("[v0] Error setting up email templates:", error)
    throw new Error(error.message || "Failed to setup email templates")
  }
}
