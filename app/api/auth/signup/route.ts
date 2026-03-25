import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendEmail } from "@/lib/brevo"

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()

    console.log("[SERVER][v0] Starting signup for:", email, "with name:", name)

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Check if user already exists in auth
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find((u) => u.email === email)

    if (existingUser) {
      console.log("[SERVER][v0] User already exists in auth")
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    const language = "es"

    // Create user in auth ONLY - do NOT create in users table yet
    console.log("[SERVER][v0] Creating new user in auth (email NOT confirmed)...")
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // Require email confirmation before login
      user_metadata: {
        name: name,
        language: language,
      },
    })

    if (authError) {
      console.error("[SERVER][v0] Auth creation failed:", authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    const userId = authData?.user?.id
    console.log("[SERVER][v0] User created in auth with ID:", userId, "- email NOT confirmed yet")

    // Generate verification link using Supabase admin API
    console.log("[SERVER][v0] Generating verification link for email:", email)
    let verificationUrl = ""
    
    try {
      // Use Supabase admin generateLink to create a proper verification link
      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: "signup",
        email: email,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://future-task.com'}/auth/confirm`,
        },
      })

      if (linkError) {
        console.error("[SERVER][v0] generateLink error:", linkError?.message)
        verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://future-task.com'}/auth/confirm?email=${encodeURIComponent(email)}`
      } else if (linkData?.properties?.verification_url) {
        verificationUrl = linkData.properties.verification_url
        console.log("[SERVER][v0] Verification link generated successfully")
      } else {
        console.warn("[SERVER][v0] No verification URL in response, using fallback")
        verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://future-task.com'}/auth/confirm?email=${encodeURIComponent(email)}`
      }
    } catch (linkGenError) {
      console.error("[SERVER][v0] Exception generating link:", linkGenError)
      verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://future-task.com'}/auth/confirm?email=${encodeURIComponent(email)}`
    }

    console.log("[SERVER][v0] Verification URL ready for email")

    // Send verification email via Brevo
    console.log("[SERVER][v0] Sending verification email via Brevo...")

    const htmlContent = `
      <h2>Welcome to Future Task!</h2>
      <p>Hi ${name},</p>
      <p>Thank you for signing up! Please verify your email to complete your registration and start using Future Task.</p>
      
      <p style="margin-top: 20px;">
        <a href="${verificationUrl}" style="background-color: #54d946; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Verify Email</a>
      </p>
      <p style="margin-top: 20px;">Or copy and paste this link in your browser:</p>
      <p><a href="${verificationUrl}">${verificationUrl}</a></p>
      <p style="margin-top: 20px; color: #666; font-size: 12px;">This link will expire in 24 hours.</p>
    `

    const emailResult = await sendEmail({
      to: email,
      subject: "Verify your Future Task email",
      htmlContent,
      textContent: `Verify your email: ${verificationUrl}`,
    })

    if (!emailResult.success) {
      console.error("[SERVER][v0] Failed to send verification email:", emailResult.error)
      return NextResponse.json(
        { error: "Account created but failed to send verification email. Please request a resend." },
        { status: 500 }
      )
    }

    console.log("[SERVER][v0] ✓ Verification email sent successfully - user profile will be created after email verification")

    return NextResponse.json({
      success: true,
      message: "Account created successfully! Check your email to verify your account and then login.",
    })
  } catch (error: any) {
    console.error("[SERVER][v0] Signup error:", error)
    return NextResponse.json({ error: error.message || "Signup failed" }, { status: 500 })
  }
}

