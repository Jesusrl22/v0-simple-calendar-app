import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function run() {
  const supabase = createClient(supabaseUrl, supabaseKey)

  // Server UTC time - due_date is always stored as UTC ISO string,
  // so comparing server UTC with stored UTC is always correct.
  const now = new Date()

  // Look for events in a ±2 minute window around "10 minutes from now"
  // and a ±2 minute window around "exactly now".
  // This handles the case where the cron fires slightly early/late.
  const windows = [
    // 10-minute advance warning
    {
      label: "reminder",
      from: new Date(now.getTime() + 8 * 60 * 1000),
      to: new Date(now.getTime() + 12 * 60 * 1000),
      bodyFn: (title: string, mins: number) =>
        `"${title}" comienza en ${mins} minuto${mins !== 1 ? "s" : ""}`,
      titleFn: () => "Recordatorio de evento",
    },
    // Exact event time
    {
      label: "now",
      from: new Date(now.getTime() - 1 * 60 * 1000),
      to: new Date(now.getTime() + 2 * 60 * 1000),
      bodyFn: (title: string) => `Tu evento "${title}" comienza ahora`,
      titleFn: (title: string) => `Evento ahora: ${title}`,
    },
  ]

  let totalSent = 0
  const failures: string[] = []

  for (const window of windows) {
    const { data: events, error } = await supabase
      .from("calendar_events")
      .select("id, title, due_date, user_id, completed")
      .gte("due_date", window.from.toISOString())
      .lte("due_date", window.to.toISOString())
      .eq("completed", false)

    if (error) {
      console.error("[v0] Error fetching events for window", window.label, error)
      continue
    }

    if (!events || events.length === 0) continue

    // Check which events were already notified in this window (dedup key = event_id + label)
    const dedupKeys = events.map((e) => `${e.id}::${window.label}`)

    const { data: alreadySent } = await supabase
      .from("sent_notifications")
      .select("event_id, notification_type")
      .in("event_id", events.map((e) => e.id))
      .eq("notification_type", window.label)
      .gte("sent_at", new Date(now.getTime() - 30 * 60 * 1000).toISOString())

    const sentKeys = new Set(
      (alreadySent || []).map((n: any) => `${n.event_id}::${n.notification_type}`)
    )

    for (const event of events) {
      const key = `${event.id}::${window.label}`
      if (sentKeys.has(key)) continue

      const eventTime = new Date(event.due_date)
      const minsUntil = Math.round((eventTime.getTime() - now.getTime()) / 60_000)

      const title = window.titleFn(event.title)
      const body = window.bodyFn(event.title, minsUntil)

      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        const res = await fetch(`${appUrl}/api/notifications/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: event.user_id,
            title,
            body,
            type: "reminder",
            eventId: event.id,
            url: "/app/calendar",
          }),
        })

        if (!res.ok) {
          const err = await res.text()
          console.error("[v0] Notification send failed:", event.id, err)
          failures.push(event.id)
          continue
        }

        // Mark as sent with notification_type for dedup
        await supabase.from("sent_notifications").insert({
          event_id: event.id,
          user_id: event.user_id,
          notification_type: window.label,
          sent_at: now.toISOString(),
        })

        totalSent++
      } catch (err) {
        console.error("[v0] Failed sending notification:", event.id, err)
        failures.push(event.id)
      }
    }
  }

  return { success: true, sent: totalSent, failures: failures.length, timestamp: now.toISOString() }
}

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for Vercel automated requests
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

// Also allow POST for client-side polling
export async function POST(request: NextRequest) {
  return GET(request)
}
