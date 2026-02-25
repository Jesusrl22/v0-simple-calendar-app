import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()

    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.delete({ name, ...options })
        },
      },
    })

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's PayPal subscription ID
    const { data: userData, error: fetchError } = await supabase
      .from("users")
      .select("paypal_subscription_id")
      .eq("id", user.id)
      .single()

    if (fetchError || !userData?.paypal_subscription_id) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 400 })
    }

    const authString = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString(
      "base64",
    )

    const paypalResponse = await fetch(
      `https://api.${process.env.PAYPAL_ENVIRONMENT === "production" ? "" : "sandbox."}paypal.com/v1/billing/subscriptions/${userData.paypal_subscription_id}/cancel`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${authString}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: "Customer requested cancellation",
        }),
      },
    )

    if (!paypalResponse.ok) {
      const error = await paypalResponse.text()
      console.error("PayPal cancellation error:", error)
      return NextResponse.json({ error: "Failed to cancel PayPal subscription" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error cancelling PayPal subscription:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
