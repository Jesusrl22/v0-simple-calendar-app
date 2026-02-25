import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const now = new Date().toISOString()
    const { data: expiredUsers, error: fetchError } = await supabase
      .from("users")
      .select("id, email, name, subscription_tier, subscription_expires_at, ai_credits_purchased")
      .not("subscription_expires_at", "is", null)
      .lt("subscription_expires_at", now)
      .neq("subscription_tier", "free")

    if (fetchError) {
      // Handle rate limiting
      const errorMsg = String(fetchError).toLowerCase()
      if (errorMsg.includes("429") || errorMsg.includes("too many")) {
        console.warn("[v0] Rate limited fetching expired users")
        return NextResponse.json({ 
          error: "Rate limited", 
          rateLimit: true,
          message: "Will retry later"
        }, { status: 429, headers: { "Retry-After": "60" } })
      }
      console.error("[v0] Error fetching expired users:", fetchError)
      return NextResponse.json({ error: String(fetchError) }, { status: 500 })
    }

    if (!expiredUsers || expiredUsers.length === 0) {
      return NextResponse.json({
        message: "No expired subscriptions found",
        count: 0,
      })
    }

    for (const user of expiredUsers) {
      const purchasedCredits = user.ai_credits_purchased || 0
      const { error: updateError } = await supabase
        .from("users")
        .update({
          subscription_tier: "free",
          subscription_plan: "free",
          plan: "free",
          ai_credits_monthly: 0,
          ai_credits: purchasedCredits, // Keep only purchased credits
          subscription_expires_at: null,
        })
        .eq("id", user.id)
      
      if (updateError) {
        console.error("[v0] Failed to update user", user.id, updateError)
      }
    }

    return NextResponse.json({
      message: "Successfully processed expired subscriptions",
      count: expiredUsers.length,
      users: expiredUsers.map((u) => ({ id: u.id, email: u.email, name: u.name })),
    })
  } catch (error) {
    console.error("[v0] Unexpected error in cron job:", error)
    
    // Check if error is rate limiting
    const errorMsg = String(error).toLowerCase()
    if (errorMsg.includes("429") || errorMsg.includes("too many")) {
      return NextResponse.json({ 
        error: "Rate limited", 
        rateLimit: true,
        message: "Will retry later"
      }, { status: 429, headers: { "Retry-After": "60" } })
    }
    
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  return POST(request)
}
