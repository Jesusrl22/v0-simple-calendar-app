import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendEmail } from "@/lib/brevo"

export async function POST(request: Request) {
  try {
    console.log("[v0] Confirm password reset: Request received")
    
    const { email, password } = await request.json()
    console.log("[v0] Confirm password reset: Email:", email)

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    console.log("[v0] Confirm password reset: Updating password for", email)

    // Update password via Supabase Admin API
    const { data: users } = await supabase.auth.admin.listUsers()
    const user = users?.users?.find((u) => u.email === email)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password: password,
    })

    if (updateError) {
      console.error("[v0] Password update error:", updateError.message)
      return NextResponse.json({ error: "Failed to update password" }, { status: 500 })
    }

    console.log("[v0] Password updated, sending confirmation email...")

    // Send confirmation email via Brevo
    const htmlContent = `
      <h2>Password Changed Successfully</h2>
      <p>Your password for Future Task has been successfully changed.</p>
      <p>If you didn't make this change, please <a href="https://future-task.com">contact support</a> immediately.</p>
      <p style="margin-top: 16px; color: #666; font-size: 12px;">This is an automated message, please do not reply.</p>
    `

    const result = await sendEmail({
      to: email,
      subject: "Your Future Task password has been changed",
      htmlContent,
      textContent: "Your password has been successfully changed",
    })

    console.log("[v0] Confirmation email result:", result)

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    })
  } catch (error: any) {
    console.error("[v0] Confirm password reset error:", error.message)
    return NextResponse.json(
      { error: error.message || "Failed to confirm password reset" },
      { status: 500 }
    )
  }
}
