import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email es requerido" }, { status: 400 })
    }

    console.log("[TEST-EMAIL] Testing email via Supabase Auth:", email)

    // Use Supabase Auth to send a test magic link - this verifies email functionality
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email: email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/test-email-success`,
      },
    })

    if (error) {
      console.error("[TEST-EMAIL] ❌ Supabase Auth error:", error.message)
      return NextResponse.json(
        {
          success: false,
          error: "Error sending test email via Supabase Auth",
          details: error.message,
        },
        { status: 400 }
      )
    }

    console.log("[TEST-EMAIL] ✓ Test email sent successfully via Supabase Auth")
    return NextResponse.json({
      success: true,
      message: "Test email sent successfully via Supabase Auth! Check your inbox for the recovery link.",
    })
  } catch (error: any) {
    console.error("[TEST-EMAIL] Unhandled error:", error)
    return NextResponse.json(
      { 
        success: false,
        error: error.message || "Error sending test email"
      },
      { status: 500 }
    )
  }
}
