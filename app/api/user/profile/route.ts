import { NextResponse } from "next/server"
import { cookies } from "next/headers"

function getUserIdFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return payload.sub || null
  } catch {
    return null
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("sb-access-token")?.value

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = getUserIdFromToken(accessToken)
    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    console.log("[v0] Profile API - Fetching user:", userId)

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/users?id=eq.${userId}&select=id,email,name,subscription_plan,subscription_tier,subscription_expires_at,ai_credits,ai_credits_purchased,theme,language,theme_preference,timezone,pomodoro_work_duration,pomodoro_break_duration,pomodoro_long_break_duration,pomodoro_sessions_until_long_break,created_at,updated_at,is_admin`,
      {
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
        cache: "no-store",
      },
    )

    if (!response.ok) {
      console.error("[v0] Profile API - Fetch failed:", response.status)
      
      // Handle rate limiting with proper status code
      if (response.status === 429) {
        return NextResponse.json(
          { error: "Too many requests, please try again later" },
          { status: 429, headers: { "Retry-After": "60" } },
        )
      }
      
      // Handle other HTTP errors
      if (response.status >= 500) {
        return NextResponse.json({ error: "Service unavailable" }, { status: 503 })
      }
      
      return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
    }

    // Safely parse JSON response
    let users
    try {
      const text = await response.text()
      
      // Check if response is actually JSON (not HTML error page)
      if (!text || !text.trim().startsWith("{") && !text.trim().startsWith("[")) {
        console.error("[v0] Profile API - Response is not JSON:", text.substring(0, 100))
        
        // If response contains "Too Many" or "429", it's a rate limit error
        if (text.includes("Too Many") || text.includes("429")) {
          return NextResponse.json(
            { error: "Too many requests, please try again later" },
            { status: 429, headers: { "Retry-After": "60" } },
          )
        }
        
        return NextResponse.json({ error: "Invalid response format" }, { status: 500 })
      }
      
      if (text) {
        users = JSON.parse(text)
      } else {
        console.error("[v0] Profile API - Empty response body")
        return NextResponse.json({ error: "Invalid response format" }, { status: 500 })
      }
    } catch (parseError) {
      console.error("[v0] Profile API - Failed to parse JSON:", parseError)
      return NextResponse.json({ error: "Invalid response format" }, { status: 500 })
    }

    if (!users || users.length === 0) {
      console.error("[v0] Profile API - User not found")
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = users[0]
    
    // FREE users should have 0 credits
    if (user.subscription_tier === "free" || !user.subscription_tier) {
      user.ai_credits = 0
      user.ai_credits_purchased = 0
    }
    
    console.log("[v0] Profile API - User data:", {
      subscription_plan: user.subscription_plan,
      subscription_tier: user.subscription_tier,
      ai_credits: user.ai_credits,
      ai_credits_purchased: user.ai_credits_purchased,
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("[v0] Profile API - Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
