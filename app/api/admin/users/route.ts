import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { rateLimit } from "@/lib/redis"

async function getUserIdFromRequest(request: Request): Promise<string | null> {
  try {
    const cookieHeader = request.headers.get("cookie")
    if (!cookieHeader) return null

    const accessTokenMatch = cookieHeader.match(/sb-access-token=([^;]+)/)
    if (!accessTokenMatch) return null

    const token = accessTokenMatch[1]
    const payload = JSON.parse(atob(token.split(".")[1]))
    return payload.sub || null
  } catch {
    return null
  }
}

export async function GET(request: Request) {
  try {
    const userId = (await getUserIdFromRequest(request)) || request.headers.get("x-forwarded-for") || "anonymous"
    const rateLimitResult = await rateLimit(userId, "admin")

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Too many requests",
          message: "Please slow down",
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
        },
        { status: 429 },
      )
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { data: users, error } = await supabase
      .from("users")
      .select(
        "id, email, name, subscription_tier, subscription_expires_at, created_at, ai_credits, ai_credits_purchased",
      )
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] GET users error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Fetched users from DB:", users?.length)

    const usersWithStats = await Promise.all(
      (users || []).map(async (user) => {
        const { count: tasksCount } = await supabase
          .from("tasks")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)

        const { count: notesCount } = await supabase
          .from("notes")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)

        const { count: pomodorosCount } = await supabase
          .from("pomodoro_sessions")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)

        const initialCredits = {
          free: 0,
          premium: 100,
          pro: 500,
        }
        const planCredits = initialCredits[(user.subscription_tier || "free") as keyof typeof initialCredits] || 0
        const monthlyCredits = user.ai_credits || 0
        const purchasedCredits = user.ai_credits_purchased || 0
        const totalCredits = monthlyCredits + purchasedCredits
        const creditsUsed = planCredits > 0 ? planCredits - monthlyCredits : 0

        return {
          ...user,
          subscription_plan: user.subscription_tier, // Map subscription_tier to subscription_plan for backwards compatibility
          stats: {
            tasks: tasksCount || 0,
            notes: notesCount || 0,
            pomodoros: pomodorosCount || 0,
            creditsUsed: creditsUsed,
            creditsRemaining: totalCredits,
          },
        }
      }),
    )

    console.log("[v0] Returning users with stats:", usersWithStats[0])
    return NextResponse.json({ users: usersWithStats })
  } catch (error) {
    console.error("[v0] GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = (await getUserIdFromRequest(request)) || request.headers.get("x-forwarded-for") || "anonymous"
    const rateLimitResult = await rateLimit(userId, "admin")

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Too many requests",
          message: "Please slow down",
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
        },
        { status: 429 },
      )
    }

    const { userId: targetUserId, updates } = await request.json()

    console.log("[v0] ===== ADMIN UPDATE START =====")
    console.log("[v0] Admin API PATCH - userId:", targetUserId)
    console.log("[v0] Admin API PATCH - updates received:", updates)

    if (!targetUserId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    if (updates.subscription_tier) {
      const planName = updates.subscription_tier.toLowerCase()

      const creditsMap = {
        free: 0,
        premium: 100,
        pro: 500,
      }

      updates.subscription_plan = planName
      updates.subscription_tier = planName
      updates.plan = planName
      updates.ai_credits = creditsMap[planName as keyof typeof creditsMap] || 0
      updates.last_credit_reset = new Date().toISOString()

      if (!updates.subscription_expires_at) {
        updates.subscription_expires_at = null
      }

      console.log("[v0] Admin API PATCH - plan being set to:", planName)
      console.log("[v0] Admin API PATCH - monthly credits being set to:", updates.ai_credits)
      console.log("[v0] Admin API PATCH - final updates object:", updates)
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { data: beforeUpdate, error: fetchError } = await supabase
      .from("users")
      .select("id, email, subscription_tier, subscription_plan, ai_credits, ai_credits_purchased")
      .eq("id", targetUserId)
      .single()

    if (fetchError) {
      console.error("[v0] Admin API PATCH - Error fetching user before update:", fetchError)
    } else {
      console.log("[v0] Admin API PATCH - User BEFORE update:", beforeUpdate)
    }

    const { data, error } = await supabase.from("users").update(updates).eq("id", targetUserId).select()

    if (error) {
      console.error("[v0] Admin API PATCH - Supabase update error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Admin API PATCH - User AFTER update:", data?.[0])
    console.log("[v0] ===== ADMIN UPDATE END =====")

    return NextResponse.json({ user: data?.[0] })
  } catch (error) {
    console.error("[v0] Admin API PATCH - Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = (await getUserIdFromRequest(request)) || request.headers.get("x-forwarded-for") || "anonymous"
    const rateLimitResult = await rateLimit(userId, "admin")

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Too many requests",
          message: "Please slow down",
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
        },
        { status: 429 },
      )
    }

    const { userId: targetUserId } = await request.json()

    if (!targetUserId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Delete user from database
    const { error: dbError } = await supabase.from("users").delete().eq("id", targetUserId)

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    const { error: authError } = await supabase.auth.admin.deleteUser(targetUserId)

    if (authError) {
      console.error("[v0] Error deleting user from auth:", authError)
      // Continue anyway since db deletion succeeded
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
      deletedUserId: targetUserId,
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
