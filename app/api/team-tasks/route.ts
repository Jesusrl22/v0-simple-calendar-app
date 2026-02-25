import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = await createServerClient()
    const serviceSupabase = await createServiceRoleClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get("teamId")

    if (!teamId) {
      return NextResponse.json({ error: "Team ID required" }, { status: 400 })
    }

    const { data: membership } = await serviceSupabase
      .from("team_members")
      .select("role")
      .eq("team_id", teamId)
      .eq("user_id", user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { data: tasks, error } = await serviceSupabase
      .from("team_tasks")
      .select(`
        *,
        assigned_user:users!team_tasks_assigned_to_fkey(id, name, email),
        created_by_user:users!team_tasks_created_by_fkey(id, name, email)
      `)
      .eq("team_id", teamId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ tasks: tasks || [] })
  } catch (error: any) {
    console.error("[SERVER] Team tasks GET error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const serviceSupabase = await createServiceRoleClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { teamId, ...taskData } = body

    if (!teamId) {
      return NextResponse.json({ error: "Team ID required" }, { status: 400 })
    }

    const { data: membership } = await serviceSupabase
      .from("team_members")
      .select("role")
      .eq("team_id", teamId)
      .eq("user_id", user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { data: task, error } = await serviceSupabase
      .from("team_tasks")
      .insert({
        ...taskData,
        team_id: teamId,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) throw error

    if (taskData.assigned_to) {
      const { data: assignedUser } = await serviceSupabase
        .from("users")
        .select("email, name")
        .eq("id", taskData.assigned_to)
        .single()

      if (assignedUser && taskData.assigned_to !== user.id) {
        const { data: creator } = await serviceSupabase.from("users").select("name").eq("id", user.id).single()

        // Send notification to assigned user
        await fetch("https://" + request.headers.get("host") + "/api/notifications/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: taskData.assigned_to,
            title: `Nueva tarea asignada`,
            body: `${creator?.name || "Un miembro"} te asignó: ${taskData.title}`,
            type: "task_assigned",
            taskId: task.id,
          }),
        }).catch((err) => console.error("[v0] Failed to send notification:", err))

        // Store notification in database
        await serviceSupabase.from("notifications").insert({
          user_id: taskData.assigned_to,
          title: `Nueva tarea asignada`,
          message: `${creator?.name || "Un miembro"} te asignó: ${taskData.title}`,
          type: "task_assigned",
          task_id: task.id,
        })
      }
    }

    return NextResponse.json({ task })
  } catch (error: any) {
    console.error("[SERVER] Team task creation error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createServerClient()
    const serviceSupabase = await createServiceRoleClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, teamId, ...updates } = await request.json()

    if (!id || !teamId) {
      return NextResponse.json({ error: "Task ID and Team ID required" }, { status: 400 })
    }

    const { data: membership } = await serviceSupabase
      .from("team_members")
      .select("role")
      .eq("team_id", teamId)
      .eq("user_id", user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get previous task data to check if assignment changed
    const { data: previousTask } = await serviceSupabase
      .from("team_tasks")
      .select("assigned_to, title")
      .eq("id", id)
      .single()

    const { data: task, error } = await serviceSupabase
      .from("team_tasks")
      .update(updates)
      .eq("id", id)
      .eq("team_id", teamId)
      .select()
      .single()

    if (error) throw error

    if (updates.assigned_to && updates.assigned_to !== previousTask?.assigned_to && updates.assigned_to !== user.id) {
      const { data: assignedUser } = await serviceSupabase
        .from("users")
        .select("email, name")
        .eq("id", updates.assigned_to)
        .single()

      if (assignedUser) {
        const { data: creator } = await serviceSupabase.from("users").select("name").eq("id", user.id).single()

        // Send notification to newly assigned user
        await fetch("https://" + request.headers.get("host") + "/api/notifications/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: updates.assigned_to,
            title: `Tarea reasignada`,
            body: `${creator?.name || "Un miembro"} te asignó: ${previousTask?.title || "Tarea"}`,
            type: "task_assigned",
            taskId: task.id,
          }),
        }).catch((err) => console.error("[v0] Failed to send notification:", err))

        // Store notification in database
        await serviceSupabase.from("notifications").insert({
          user_id: updates.assigned_to,
          title: `Tarea reasignada`,
          message: `${creator?.name || "Un miembro"} te asignó: ${previousTask?.title || "Tarea"}`,
          type: "task_assigned",
          task_id: id,
        })
      }
    }

    return NextResponse.json({ task })
  } catch (error: any) {
    console.error("[SERVER] Team task update error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createServerClient()
    const serviceSupabase = await createServiceRoleClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, teamId } = await request.json()

    if (!id || !teamId) {
      return NextResponse.json({ error: "Task ID and Team ID required" }, { status: 400 })
    }

    const { data: membership } = await serviceSupabase
      .from("team_members")
      .select("role")
      .eq("team_id", teamId)
      .eq("user_id", user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { error } = await serviceSupabase.from("team_tasks").delete().eq("id", id).eq("team_id", teamId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[SERVER] Team task delete error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
