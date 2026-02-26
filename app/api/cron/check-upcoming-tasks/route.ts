import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function run() {
  const supabase = createClient(supabaseUrl, supabaseKey)

  const now = new Date()

  // Look for tasks due in the next 30 minutes
  const windows = [
    {
      label: "task-30min",
      minutesBefore: 30,
      bodyFn: (title: string) => `Tarea "${title}" vence en 30 minutos`,
      titleFn: () => "Recordatorio de tarea",
    },
    {
      label: "task-due",
      minutesBefore: 2,
      bodyFn: (title: string) => `Tu tarea "${title}" vence ahora`,
      titleFn: (title: string) => `Tarea vencida: ${title}`,
    },
  ]

  let totalSent = 0
  const failures: string[] = []

  for (const window of windows) {
    const fromTime = new Date(now.getTime() + (window.minutesBefore - 5) * 60 * 1000)
    const toTime = new Date(now.getTime() + (window.minutesBefore + 5) * 60 * 1000)

    const { data: tasks, error } = await supabase
      .from("tasks")
      .select("id, title, due_date, user_id, completed")
      .gte("due_date", fromTime.toISOString())
      .lte("due_date", toTime.toISOString())
      .eq("completed", false)

    if (error) {
      console.error("[v0] Error fetching tasks for window", window.label, error)
      continue
    }

    if (!tasks || tasks.length === 0) continue

    // Check dedup
    const { data: alreadySent } = await supabase
      .from("sent_notifications")
      .select("event_id, notification_type")
      .in("event_id", tasks.map((t) => t.id))
      .eq("notification_type", window.label)
      .gte("sent_at", new Date(now.getTime() - 30 * 60 * 1000).toISOString())

    const sentKeys = new Set(
      (alreadySent || []).map((n: any) => `${n.event_id}::${n.notification_type}`)
    )

    for (const task of tasks) {
      const key = `${task.id}::${window.label}`
      if (sentKeys.has(key)) continue

      const title = window.titleFn(task.title)
      const body = window.bodyFn(task.title)

      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        const res = await fetch(`${appUrl}/api/notifications/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: task.user_id,
            title,
            body,
            type: "task-reminder",
            eventId: task.id,
            url: "/app/tasks",
          }),
        })

        if (!res.ok) {
          const err = await res.text()
          console.error("[v0] Task notification send failed:", task.id, err)
          failures.push(task.id)
          continue
        }

        await supabase.from("sent_notifications").insert({
          event_id: task.id,
          user_id: task.user_id,
          notification_type: window.label,
          sent_at: now.toISOString(),
        })

        totalSent++
      } catch (err) {
        console.error("[v0] Failed sending task notification:", task.id, err)
        failures.push(task.id)
      }
    }
  }

  return { success: true, sent: totalSent, failures: failures.length, timestamp: now.toISOString() }
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
    console.error("[v0] Cron error:", err)
    return NextResponse.json({ error: "Cron failed", details: String(err) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}
