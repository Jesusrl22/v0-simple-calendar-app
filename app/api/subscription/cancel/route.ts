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

    const cancelPaypalResponse = await fetch(process.env.NEXT_PUBLIC_BASE_URL + "/api/paypal/cancel-subscription", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    })

    if (!cancelPaypalResponse.ok) {
      console.error("Error cancelling PayPal subscription")
      // Continue with local cancellation even if PayPal fails
    }

    // Update database to mark subscription as cancelled
    const { error } = await supabase
      .from("users")
      .update({
        subscription_tier: "free",
        subscription_plan: "free",
        plan: "free",
        subscription_status: "cancelled",
        ai_credits_monthly: 0,
        subscription_expires_at: null,
        paypal_subscription_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (error) {
      console.error("Error updating subscription in database:", error)
      return NextResponse.json({ error: "Failed to cancel subscription" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Subscription cancelled successfully" })
  } catch (error) {
    console.error("Error cancelling subscription:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
