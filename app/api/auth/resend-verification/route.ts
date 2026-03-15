import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendEmail } from "@/lib/brevo"

export async function POST(request: Request) {
  try {
    console.log("[v0] Resend verification: Request received")
    
    const { email } = await request.json()
    console.log("[v0] Resend verification: Email:", email)

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get the user
    const { data: users } = await supabase.auth.admin.listUsers()
    const user = users?.users?.find((u) => u.email === email)

    console.log("[v0] Resend verification: User found:", !!user)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.email_confirmed_at) {
      return NextResponse.json({ error: "Email already verified" }, { status: 400 })
    }

    // Generate verification link
    console.log("[v0] Resend verification: Generating verification link...")
    
    const { data, error: signUpError } = await supabase.auth.admin.generateLink({
      type: "signup",
      email: email,
      options: {
        redirectTo: `https://future-task.com/auth/confirm`,
      },
    })

    if (signUpError || !data?.properties?.verification_url) {
      console.error("[v0] Failed to generate verification link:", signUpError)
      return NextResponse.json({ error: "Failed to generate verification link" }, { status: 500 })
    }

    // Send verification email via Brevo
    const verificationUrl = data.properties.verification_url
    console.log("[v0] Resend verification: URL generated, sending email...")
    
    const htmlContent = `
      <h2>Verify your email</h2>
      <p>Click the link below to verify your email address and complete your signup:</p>
      <a href="${verificationUrl}" style="background-color: #54d946; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
      <p>Or copy this link: <a href="${verificationUrl}">${verificationUrl}</a></p>
      <p>This link will expire in 24 hours.</p>
    `

    console.log("[v0] Resend verification: Calling sendEmail...")
    
    const result = await sendEmail({
      to: email,
      subject: "Verify your Future Task email",
      htmlContent,
      textContent: `Verify your email: ${verificationUrl}`,
    })

    console.log("[v0] Resend verification: sendEmail result:", result)

    if (!result.success) {
      console.error("[v0] Failed to send verification email:", result.error)
      return NextResponse.json(
        { error: "Failed to send verification email" },
        { status: 500 }
      )
    }

    console.log("[v0] Verification email sent successfully to", email)

    return NextResponse.json({
      success: true,
      message: "Verification email sent successfully. Please check your inbox.",
    })
  } catch (error: any) {
    console.error("[v0] Resend verification error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to resend verification email" },
      { status: 500 }
    )
  }
}

