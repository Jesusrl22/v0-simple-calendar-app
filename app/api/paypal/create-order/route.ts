import { type NextRequest, NextResponse } from "next/server"
import { createPayPalOrder, createPayPalSubscription } from "@/lib/paypal"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { type, packId, plan } = await request.json()

    let orderData

    if (type === "credits" && packId) {
      // Create order for credit pack
      orderData = await createPayPalOrder(packId, user.id)
    } else if (type === "subscription" && plan) {
      // Create subscription
      orderData = await createPayPalSubscription(plan, user.id)
    } else {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    if (orderData.id) {
      return NextResponse.json({
        id: orderData.id,
        approvalUrl: orderData.links?.find((link: any) => link.rel === "approve")?.href,
      })
    }

    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  } catch (error) {
    console.error("PayPal order creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
