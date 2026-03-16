import { NextResponse } from "next/server"
import { cookies } from "next/headers"
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

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find((u) => u.email === email)

    if (existingUser) {
      // Check if profile exists
      const { data: profiles } = await supabase.from("users").select("*").eq("id", existingUser.id)

      if (profiles && profiles.length > 0) {
        console.log("[SERVER][v0] User already exists")
        return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
      }
    }

    let userId = existingUser?.id
    const language = "es"

    // Create user in auth FIRST if doesn't exist
    if (!userId) {
      console.log("[SERVER][v0] Creating new user in auth...")
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

      userId = authData?.user?.id
      console.log("[SERVER][v0] User created with ID:", userId)
    }

    // Now generate verification link after user exists
    console.log("[SERVER][v0] Generating verification link...")
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "signup",
      email: email,
      options: {
        redirectTo: `https://future-task.com/auth/confirm`,
      },
    })

    if (linkError || !linkData?.properties?.verification_url) {
      console.error("[SERVER][v0] Failed to generate verification link:", linkError)
      return NextResponse.json({ error: "Failed to generate verification link" }, { status: 500 })
    }

    const verificationUrl = linkData.properties.verification_url
    console.log("[SERVER][v0] Verification link generated successfully")

    // Create profile in users table
    console.log("[SERVER][v0] Creating user profile for ID:", userId)
    const { error: profileError } = await supabase.from("users").insert({
      id: userId,
      email: email,
      name: name,
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
      language: "es",
      is_admin: false,
    })

    if (profileError) {
      console.error("[SERVER][v0] Failed to create profile:", profileError)
      return NextResponse.json({ error: "Failed to create user profile. Please try again." }, { status: 500 })
    }

    console.log("[SERVER][v0] Profile created successfully")

    // Send verification email via Brevo
    console.log("[SERVER][v0] Sending verification email via Brevo...")
    console.log("[SERVER][v0] BREVO_API_KEY available:", !!process.env.BREVO_API_KEY)
    console.log("[SERVER][v0] Email to send to:", email)

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

    console.log("[SERVER][v0] ✓ Verification email sent successfully")

    return NextResponse.json({
      success: true,
      message: "Account created successfully! Check your email to verify your account and then login.",
    })
  } catch (error: any) {
    console.error("[SERVER][v0] Signup error:", error)
    return NextResponse.json({ error: error.message || "Signup failed" }, { status: 500 })
  }
}

