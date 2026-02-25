import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { CREDIT_PACKS } from "@/lib/paypal"

// Valid plans with their credit amounts
const VALID_PLANS = {
  premium: 100,
  pro: 500,
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const eventType = body.event_type

    const webhookId = request.headers.get("paypal-transmission-id")
    const timestamp = request.headers.get("paypal-transmission-time")

    if (!webhookId || !timestamp) {
      console.error("Invalid webhook headers")
      return NextResponse.json({ error: "Invalid webhook" }, { status: 401 })
    }

    const supabase = await createClient()

    // Handle different event types
    switch (eventType) {
      case "PAYMENT.CAPTURE.COMPLETED": {
        // One-time payment for credit packs
        const customId = body.resource?.purchase_units?.[0]?.custom_id
        if (!customId) break

        const { userId, packId, type } = JSON.parse(customId)

        if (type === "credits") {
          const pack = CREDIT_PACKS.find((p) => p.id === packId)
          if (!pack) break

          // Update user's purchased credits
          const { data: userData } = await supabase
            .from("users")
            .select("ai_credits_purchased")
            .eq("id", userId)
            .single()

          const currentCredits = userData?.ai_credits_purchased || 0

          await supabase
            .from("users")
            .update({
              ai_credits_purchased: currentCredits + pack.credits,
            })
            .eq("id", userId)
        }
        break
      }

      case "BILLING.SUBSCRIPTION.ACTIVATED":
      case "BILLING.SUBSCRIPTION.UPDATED": {
        // Subscription activated or updated
        const customId = body.resource?.custom_id
        if (!customId) break

        const { userId, plan } = JSON.parse(customId)

        if (!plan || !(plan.toLowerCase() in VALID_PLANS)) {
          console.error("Invalid plan in webhook:", plan)
          break
        }

        const subscriptionId = body.resource?.id
        const nextBillingTime = body.resource?.billing_info?.next_billing_time

        // Calculate subscription end date (1 month from now)
        const subscriptionEnd = new Date(nextBillingTime || Date.now())
        subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1)

        // Update user subscription
        const normalizedPlan = plan.toLowerCase()
        const updates: any = {
          subscription_plan: normalizedPlan,
          subscription_end: subscriptionEnd.toISOString(),
          paypal_subscription_id: subscriptionId,
          ai_credits_monthly: VALID_PLANS[normalizedPlan as keyof typeof VALID_PLANS],
        }

        await supabase.from("users").update(updates).eq("id", userId)
        break
      }

      case "BILLING.SUBSCRIPTION.CANCELLED":
      case "BILLING.SUBSCRIPTION.EXPIRED": {
        // Subscription cancelled or expired
        const subscriptionId = body.resource?.id

        // Get user info for notification
        const { data: userData } = await supabase
          .from("users")
          .select("id, email, name")
          .eq("paypal_subscription_id", subscriptionId)
          .single()

        const reason = eventType === "BILLING.SUBSCRIPTION.CANCELLED" 
          ? "Tu suscripción fue cancelada"
          : "Tu suscripción ha expirado"

        console.log("[PAYPAL] Subscription event - reason:", reason, "user:", userData?.email)
        // Supabase Auth handles email notifications automatically
        // Log for admin visibility
        if (userData) {
          console.log("[PAYPAL] Subscription update for user:", userData.email, "- Plan downgrade to free")
        }

        await supabase
          .from("users")
          .update({
            subscription_plan: "free",
            subscription_end: null,
            ai_credits_monthly: 0,
            paypal_subscription_id: null,
          })
          .eq("paypal_subscription_id", subscriptionId)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("PayPal webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
