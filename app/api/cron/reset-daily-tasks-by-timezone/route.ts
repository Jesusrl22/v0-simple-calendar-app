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

    console.log("[v0] Starting daily tasks reset by timezone...")

    // Call the database function that handles timezone-aware reset
    const { data, error } = await supabase.rpc("reset_daily_tasks_by_timezone")

    if (error) {
      // Handle rate limiting
      const errorMsg = String(error).toLowerCase()
      if (errorMsg.includes("429") || errorMsg.includes("too many")) {
        console.warn("[v0] Rate limited resetting daily tasks")
        return NextResponse.json({ 
          error: "Rate limited", 
          rateLimit: true,
          message: "Will retry later"
        }, { status: 429, headers: { "Retry-After": "60" } })
      }
      console.error("[v0] Error resetting daily tasks:", error)
      throw error
    }

    console.log("[v0] Successfully reset daily tasks by timezone")
    console.log("[v0] Result:", data)

    return NextResponse.json({
      message: "Successfully reset daily tasks by timezone",
      result: data,
    })
  } catch (error) {
    console.error("[v0] Error in reset-daily-tasks-by-timezone:", error)
    
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
