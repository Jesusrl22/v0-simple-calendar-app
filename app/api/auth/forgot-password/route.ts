import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendEmail } from "@/lib/brevo"

export async function POST(request: Request) {
  try {
    console.log("[v0] Forgot password: Request received")
    
    const { email } = await request.json()
    console.log("[v0] Forgot password: Email:", email)

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
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

    console.log("[v0] Forgot password: Generating recovery link...")

    // Generate password recovery link via Supabase
    const { data, error: generateError } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email: email.toLowerCase(),
      options: {
        redirectTo: `https://future-task.com/auth/reset-password`,
      },
    })

    if (generateError) {
      console.error("[v0] Error generating reset link:", generateError.message)
    }

    const resetUrl = data?.properties?.action_link
    console.log("[v0] Forgot password: Reset URL generated:", !!resetUrl)

    if (resetUrl) {
      // Send reset email via Brevo
      const htmlContent = `
        <h2>Reset Your Password</h2>
        <p>Click the link below to reset your password for your Future Task account:</p>
        <a href="${resetUrl}" style="background-color: #54d946; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Reset Password</a>
        <p style="margin-top: 16px;">Or copy and paste this link in your browser:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p style="margin-top: 16px; color: #666; font-size: 12px;">This link will expire in 24 hours.</p>
        <p style="color: #666; font-size: 12px;">If you didn't request this, please ignore this email or contact support.</p>
      `

      console.log("[v0] Forgot password: Calling sendEmail...")
      const result = await sendEmail({
        to: email,
        subject: "Reset your Future Task password",
        htmlContent,
        textContent: `Reset your password: ${resetUrl}`,
      })

      console.log("[v0] Forgot password: sendEmail result:", result)

      if (!result.success) {
        console.error("[v0] Failed to send reset email:", result.error)
      }
    } else {
      console.warn("[v0] Forgot password: No reset URL generated")
    }

    // Always return success for security (don't reveal if email exists)
    return NextResponse.json({
      success: true,
      message: "If an account exists with that email, you'll receive instructions to reset your password.",
    })
  } catch (error: any) {
    console.error("[v0] Forgot password error:", error.message)
    // Return success for security
    return NextResponse.json({
      success: true,
      message: "If an account exists with that email, you'll receive instructions to reset your password.",
    })
  }
}


