import { NextRequest, NextResponse } from "next/server"
import { createServerClient, createServiceRoleClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const serviceSupabase = await createServiceRoleClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get("taskId")
    const teamId = searchParams.get("teamId")

    if (!taskId || !teamId) {
      return NextResponse.json({ error: "taskId and teamId required" }, { status: 400 })
    }

    // Verify membership
    const { data: membership } = await serviceSupabase
      .from("team_members")
      .select("role")
      .eq("team_id", teamId)
      .eq("user_id", user.id)
      .single()

    if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const { data: comments, error } = await serviceSupabase
      .from("task_comments")
      .select("id, comment, created_at, user_id")
      .eq("task_id", taskId)
      .order("created_at", { ascending: true })

    if (error) throw error

    // Enrich with user names
    const enriched = await Promise.all(
      (comments || []).map(async (c) => {
        const { data: u } = await serviceSupabase
          .from("users")
          .select("name, email")
          .eq("id", c.user_id)
          .single()
        return { ...c, user: u }
      })
    )

    return NextResponse.json({ comments: enriched })
  } catch (err: any) {
    console.error("[v0] task-comments GET error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const serviceSupabase = await createServiceRoleClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { taskId, teamId, comment } = await request.json()

    if (!taskId || !teamId || !comment?.trim()) {
      return NextResponse.json({ error: "taskId, teamId and comment required" }, { status: 400 })
    }

    // Verify membership
    const { data: membership } = await serviceSupabase
      .from("team_members")
      .select("role")
      .eq("team_id", teamId)
      .eq("user_id", user.id)
      .single()

    if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const { data: newComment, error } = await serviceSupabase
      .from("task_comments")
      .insert({ task_id: taskId, user_id: user.id, comment: comment.trim() })
      .select("id, comment, created_at, user_id")
      .single()

    if (error) throw error

    const { data: u } = await serviceSupabase
      .from("users")
      .select("name, email")
      .eq("id", user.id)
      .single()

    return NextResponse.json({ comment: { ...newComment, user: u } })
  } catch (err: any) {
    console.error("[v0] task-comments POST error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const serviceSupabase = await createServiceRoleClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { commentId } = await request.json()
    if (!commentId) return NextResponse.json({ error: "commentId required" }, { status: 400 })

    // Only allow deleting own comments
    const { error } = await serviceSupabase
      .from("task_comments")
      .delete()
      .eq("id", commentId)
      .eq("user_id", user.id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("[v0] task-comments DELETE error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
