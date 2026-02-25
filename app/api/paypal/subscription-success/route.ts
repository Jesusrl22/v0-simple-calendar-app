import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Valid plans with their credit amounts
const VALID_PLANS = {
  premium: 100,
  pro: 500,
}

export async function POST(request: Request) {
  try {
    const { subscriptionId, planName } = await request.json()

    const normalizedPlan = planName?.toLowerCase()
    if (!normalizedPlan || !(normalizedPlan in VALID_PLANS)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

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

    const credits = VALID_PLANS[normalizedPlan as keyof typeof VALID_PLANS]

    // Calculate expiration date (1 month from now)
    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + 1)

    if (!subscriptionId) {
      return NextResponse.json({ error: "Missing subscription ID" }, { status: 400 })
    }

    const { error } = await supabase
      .from("users")
      .update({
        subscription_plan: normalizedPlan,
        subscription_tier: normalizedPlan,
        plan: normalizedPlan,
        subscription_expires_at: expiresAt.toISOString(),
        paypal_subscription_id: subscriptionId,
        ai_credits_monthly: credits,
        last_credit_reset: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (error) {
      console.error("Error updating subscription:", error)
      return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in subscription success:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
