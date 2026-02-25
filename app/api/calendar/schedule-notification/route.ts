import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { notifyTaskDueReminder } from "@/lib/notification-triggers"

export async function POST(request: Request) {
  try {
    const { taskId, taskTitle, dueDate } = await request.json()

    const cookieStore = await cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    })

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Calculate notification time (exactly at due date)
    const notificationTime = new Date(dueDate).getTime()
    const now = Date.now()
    const delayMs = notificationTime - now

    if (delayMs > 0 && delayMs < 86400000) {
      // Only schedule if within 24 hours
      // Schedule the notification
      setTimeout(async () => {
        await notifyTaskDueReminder(user.id, taskTitle)
      }, delayMs)

      return Response.json({
        success: true,
        message: `Notification scheduled for ${new Date(dueDate).toLocaleString()}`,
        scheduledFor: dueDate,
      })
    }

    return Response.json(
      {
        error: "Invalid notification time",
        message: "Notification time must be in the future and within 24 hours",
      },
      { status: 400 },
    )
  } catch (error) {
    console.error("[v0] Error scheduling notification:", error)
    return Response.json({ error: "Failed to schedule notification" }, { status: 500 })
  }
}
