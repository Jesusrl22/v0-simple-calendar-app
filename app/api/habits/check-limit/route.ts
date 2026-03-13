import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get user from Authorization header
    const authHeader = request.headers.get("Authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const { data: userData, error: userError } = await supabase.auth.getUser(token)

    if (userError || !userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = userData.user.id

    // Get user's subscription plan
    const { data: user } = await supabase
      .from("users")
      .select("subscription_plan")
      .eq("id", userId)
      .single()

    const plan = user?.subscription_plan || "free"

    // Only Pro can access habits
    if (plan !== "pro") {
      return NextResponse.json({
        plan,
        blocked: true,
        reason: "Habits feature is exclusive to Pro plan members",
        canAddMore: false,
      })
    }

    // Get subscription plan details
    const { data: planDetails } = await supabase
      .from("subscription_plans")
      .select("max_habits, features")
      .eq("name", plan)
      .single()

    // Count user's habits
    const { count: habitCount } = await supabase
      .from("habits")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)

    const maxHabits = planDetails?.max_habits || 15
    const hasReachedLimit = (habitCount || 0) >= maxHabits
    const features = planDetails?.features || []

    return NextResponse.json({
      plan,
      blocked: false,
      currentHabits: habitCount || 0,
      maxHabits,
      hasReachedLimit,
      features,
      canAddMore: !hasReachedLimit,
    })
  } catch (error: any) {
    console.error("[v0] Error checking habit limits:", error)
    return NextResponse.json(
      { error: "Failed to check limits" },
      { status: 500 }
    )
  }
}
