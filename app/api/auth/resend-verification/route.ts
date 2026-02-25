import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

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

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.email_confirmed_at) {
      return NextResponse.json({ error: "Email already verified" }, { status: 400 })
    }

    // Use Supabase Auth to resend verification email
    console.log("[SERVER][v0] Resending verification email to:", email)
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email: email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?email=${encodeURIComponent(email)}`,
      },
    })

    if (resendError) {
      console.error("[SERVER][v0] Resend verification error:", resendError)
      return NextResponse.json(
        { error: "Failed to resend verification email" },
        { status: 500 }
      )
    }

    console.log("[SERVER][v0] Verification email resent successfully")

    return NextResponse.json({
      success: true,
      message: "Verification email sent successfully. Please check your inbox.",
    })
  } catch (error: any) {
    console.error("[SERVER][v0] Resend verification error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to resend verification email" },
      { status: 500 }
    )
  }
}
