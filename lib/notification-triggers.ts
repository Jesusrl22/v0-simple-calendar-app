// Utilities to send notifications from various events

import { sendPushNotificationToUser } from "./push-notification-sender"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

async function getPushSubscriptions(userId: string) {
  try {
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

    const { data, error } = await supabase
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .eq("user_id", userId)

    if (error) {
      console.error("[v0] Error fetching subscriptions:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("[v0] Error in getPushSubscriptions:", error)
    return []
  }
}

export async function notifyTaskCompleted(userId: string, taskTitle: string) {
  const subscriptions = await getPushSubscriptions(userId)
  if (subscriptions.length === 0) return

  await sendPushNotificationToUser(subscriptions, {
    title: "Task Completed",
    body: `Great job! You completed: ${taskTitle}`,
    type: "task",
    url: "/app/tasks",
  })
}

export async function notifyAchievementUnlocked(userId: string, achievementTitle: string) {
  const subscriptions = await getPushSubscriptions(userId)
  if (subscriptions.length === 0) return

  await sendPushNotificationToUser(subscriptions, {
    title: "Achievement Unlocked!",
    body: `Congratulations! You unlocked: ${achievementTitle}`,
    type: "achievement",
    url: "/app/achievements",
  })
}

export async function notifyTaskDueReminder(userId: string, taskTitle: string) {
  const subscriptions = await getPushSubscriptions(userId)
  if (subscriptions.length === 0) return

  await sendPushNotificationToUser(subscriptions, {
    title: "Task Due Soon",
    body: `Reminder: ${taskTitle} is due soon`,
    type: "reminder",
    url: "/app/calendar",
  })
}

export async function notifyPomodoroCompleted(userId: string, sessionType: "work" | "break") {
  const subscriptions = await getPushSubscriptions(userId)
  if (subscriptions.length === 0) return

  const title = sessionType === "work" ? "Work Session Complete" : "Break Time Over"
  const body =
    sessionType === "work" ? "Great focus session! Time for a break." : "Break is over. Ready for the next session?"

  await sendPushNotificationToUser(subscriptions, {
    title,
    body,
    type: "reminder",
    url: "/app/pomodoro",
  })
}

export async function notifyTeamTaskAssigned(userId: string, taskTitle: string, teamName: string) {
  const subscriptions = await getPushSubscriptions(userId)
  if (subscriptions.length === 0) return

  await sendPushNotificationToUser(subscriptions, {
    title: "New Task Assigned",
    body: `${taskTitle} has been assigned to you in ${teamName}`,
    type: "task",
    url: "/app/teams",
  })
}
