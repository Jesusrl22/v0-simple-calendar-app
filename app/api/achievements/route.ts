import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { achievementsList } from "@/lib/achievements"

function getUserIdFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return payload.sub
  } catch {
    return null
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("sb-access-token")?.value

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = getUserIdFromToken(accessToken)
    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const achievementsResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/achievements?user_id=eq.${userId}&select=*`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        },
      },
    )

    const [tasksResponse, notesResponse, pomodoroResponse] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/tasks?user_id=eq.${userId}&completed=eq.true&select=id`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Prefer: "count=exact",
        },
      }),
      fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/notes?user_id=eq.${userId}&select=id`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Prefer: "count=exact",
        },
      }),
      fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/pomodoro_sessions?user_id=eq.${userId}&completed=eq.true&select=id`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            Prefer: "count=exact",
          },
        },
      ),
    ])

    const existingAchievements = await achievementsResponse.json()
    const tasksCount = Number.parseInt(tasksResponse.headers.get("content-range")?.split("/")[1] || "0")
    const notesCount = Number.parseInt(notesResponse.headers.get("content-range")?.split("/")[1] || "0")
    const pomodoroCount = Number.parseInt(pomodoroResponse.headers.get("content-range")?.split("/")[1] || "0")

    const stats = {
      tasks: tasksCount,
      notes: notesCount,
      pomodoro: pomodoroCount,
    }

    const unlockedIds = new Set(existingAchievements.map((a: any) => a.achievement_type))
    const newAchievements = []

    for (const achievement of achievementsList) {
      if (!unlockedIds.has(achievement.id)) {
        let shouldUnlock = false

        // Determine which stat to check based on achievement ID
        if (
          achievement.id.startsWith("task_") ||
          achievement.id === "first_task" ||
          achievement.id === "productivity_god"
        ) {
          shouldUnlock = stats.tasks >= achievement.requirement
        } else if (achievement.id.startsWith("note_")) {
          shouldUnlock = stats.notes >= achievement.requirement
        } else if (achievement.id.startsWith("focus_")) {
          shouldUnlock = stats.pomodoro >= achievement.requirement
        }

        if (shouldUnlock) {
          const newAchievement = {
            user_id: userId,
            achievement_type: achievement.id,
            title: achievement.title,
            description: achievement.description,
            icon: achievement.icon,
            unlocked_at: new Date().toISOString(),
          }

          const insertResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/achievements`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
              "Content-Type": "application/json",
              Prefer: "return=representation",
            },
            body: JSON.stringify(newAchievement),
          })

          if (insertResponse.ok) {
            const inserted = await insertResponse.json()
            newAchievements.push(inserted[0])
          }
        }
      }
    }

    const updatedAchievementsResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/achievements?user_id=eq.${userId}&select=*`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        },
      },
    )

    const finalAchievements = await updatedAchievementsResponse.json()

    return NextResponse.json({
      achievements: finalAchievements,
      stats,
      newUnlocks: newAchievements.length,
    })
  } catch (error) {
    console.error("Error fetching achievements:", error)
    return NextResponse.json({ error: "Failed to fetch achievements" }, { status: 500 })
  }
}
