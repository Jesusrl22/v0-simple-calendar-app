import { createClient, createServiceRoleClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Use service role client to bypass RLS for reading user stats
    const serviceSupabase = await createServiceRoleClient()

    // Get user stats using service role to avoid RLS infinite recursion
    const { data: userData, error: userError } = await serviceSupabase
      .from("users")
      .select("current_streak, longest_streak, last_activity_date, total_tasks_completed, total_study_hours")
      .eq("id", user.id)
      .single()

    if (userError) throw userError

    // Get today's completed tasks
    const today = new Date().toISOString().split("T")[0]
    const { count: todayTasks } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("completed", true)
      .gte("updated_at", `${today}T00:00:00`)

    // Get this week's stats
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { count: weekTasks } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("completed", true)
      .gte("updated_at", weekAgo)

    return NextResponse.json({
      currentStreak: userData?.current_streak || 0,
      longestStreak: userData?.longest_streak || 0,
      lastActivityDate: userData?.last_activity_date,
      totalTasksCompleted: userData?.total_tasks_completed || 0,
      totalStudyHours: userData?.total_study_hours || 0,
      todayTasks: todayTasks || 0,
      weekTasks: weekTasks || 0,
    })
  } catch (error: any) {
    console.error("[v0] Error fetching streaks:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { type, value } = body // type: 'task' | 'study', value: hours for study

    // Use service role client to bypass RLS
    const serviceSupabase = await createServiceRoleClient()

    // Get current user data
    const { data: userData, error: fetchError } = await serviceSupabase
      .from("users")
      .select("current_streak, longest_streak, last_activity_date, total_tasks_completed, total_study_hours")
      .eq("id", user.id)
      .single()

    if (fetchError) throw fetchError

    const today = new Date().toISOString().split("T")[0]
    const lastActivity = userData?.last_activity_date
    let currentStreak = userData?.current_streak || 0
    let longestStreak = userData?.longest_streak || 0

    // Check if last activity was yesterday or today
    if (lastActivity) {
      const lastDate = new Date(lastActivity).toISOString().split("T")[0]
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0]

      if (lastDate === yesterday) {
        currentStreak += 1
      } else if (lastDate !== today) {
        currentStreak = 1 // Reset streak
      }
    } else {
      currentStreak = 1
    }

    if (currentStreak > longestStreak) {
      longestStreak = currentStreak
    }

    // Update stats based on type
    const updates: any = {
      current_streak: currentStreak,
      longest_streak: longestStreak,
      last_activity_date: today,
    }

    if (type === "task") {
      updates.total_tasks_completed = (userData?.total_tasks_completed || 0) + 1
    } else if (type === "study" && value) {
      updates.total_study_hours = (userData?.total_study_hours || 0) + parseFloat(value)
    }

    const { error: updateError } = await serviceSupabase.from("users").update(updates).eq("id", user.id)

    if (updateError) throw updateError

    return NextResponse.json({
      currentStreak,
      longestStreak,
      message: "Streak updated successfully",
    })
  } catch (error: any) {
    console.error("[v0] Error updating streak:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
