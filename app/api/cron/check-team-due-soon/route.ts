import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { notifyTaskDueSoon } from "@/lib/team-notifications"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function run() {
  const now = new Date()
  // Window: tasks due between 23h and 25h from now (i.e. ~24h reminder)
  const from = new Date(now.getTime() + 23 * 60 * 60 * 1000)
  const to = new Date(now.getTime() + 25 * 60 * 60 * 1000)

  const { data: tasks, error } = await supabase
    .from("team_tasks")
    .select("id, title, due_date, assigned_to, team_id")
    .gte("due_date", from.toISOString())
    .lte("due_date", to.toISOString())
    .eq("completed", false)
    .not("assigned_to", "is", null)

  if (error) {
    console.error("[v0] team-due-soon: fetch error", error)
    return { success: false, error: error.message }
  }

  if (!tasks || tasks.length === 0) {
    return { success: true, sent: 0 }
  }

  // Dedup: skip if we already sent this notification in the last 26h
  const { data: alreadySent } = await supabase
    .from("sent_notifications")
    .select("event_id")
    .in("event_id", tasks.map((t) => t.id))
    .eq("notification_type", "team-task-due-soon")
    .gte("sent_at", new Date(now.getTime() - 26 * 60 * 60 * 1000).toISOString())

  const sentIds = new Set((alreadySent || []).map((n: any) => n.event_id))

  let sent = 0
  for (const task of tasks) {
    if (sentIds.has(task.id)) continue

    // Get the team name
    const { data: team } = await supabase
      .from("teams")
      .select("name")
      .eq("id", task.team_id)
      .single()

    await notifyTaskDueSoon({
      assigneeId: task.assigned_to,
      taskId: task.id,
      taskTitle: task.title,
      teamId: task.team_id,
      teamName: team?.name || "",
      dueDate: task.due_date,
    }).catch(() => {})

    // Record dedup
    await supabase.from("sent_notifications").insert({
      event_id: task.id,
      user_id: task.assigned_to,
      notification_type: "team-task-due-soon",
      sent_at: now.toISOString(),
    })

    sent++
  }

  return { success: true, sent, total: tasks.length, timestamp: now.toISOString() }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET
    const userAgent = (request.headers.get("user-agent") || "").toLowerCase()
    const isVercelCron = userAgent.includes("vercel")

    if (isVercelCron && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await run()
    return NextResponse.json(result)
  } catch (err) {
    console.error("[v0] team-due-soon cron error:", err)
    return NextResponse.json({ error: "Cron failed", details: String(err) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}
