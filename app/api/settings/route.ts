import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("sb-access-token")?.value

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      },
    })

    if (!userResponse.ok) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const authUser = await userResponse.json()

    const profileResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/users?id=eq.${authUser.id}&select=*`,
      {
        headers: {
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        },
      },
    )

    if (!profileResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
    }

    const profile = await profileResponse.json()
    const userProfile = profile[0]

    if (userProfile.theme_preference) {
      try {
        const themePreference =
          typeof userProfile.theme_preference === "string"
            ? JSON.parse(userProfile.theme_preference)
            : userProfile.theme_preference

        if (themePreference.customPrimary) {
          userProfile.customPrimary = themePreference.customPrimary
        }
        if (themePreference.customSecondary) {
          userProfile.customSecondary = themePreference.customSecondary
        }
      } catch (e) {
        // Silently fail if theme preference parsing fails
      }
    }

    // Parse custom_themes if it exists
    if (userProfile.custom_themes) {
      try {
        userProfile.custom_themes =
          typeof userProfile.custom_themes === "string"
            ? JSON.parse(userProfile.custom_themes)
            : userProfile.custom_themes
      } catch (e) {
        userProfile.custom_themes = []
      }
    } else {
      userProfile.custom_themes = []
    }

    return NextResponse.json({ profile: userProfile, email: authUser.email })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("sb-access-token")?.value

    if (!accessToken) {
      console.error("[v0] Settings PATCH - No access token")
      return NextResponse.json({ error: "Unauthorized - No access token" }, { status: 401 })
    }

    const body = await request.json()
    console.log("[v0] Settings PATCH - Received body:", body)

    const {
      theme,
      theme_preference,
      custom_themes,
      language,
      timezone,
      pomodoro_work_duration,
      pomodoro_break_duration,
      pomodoro_long_break_duration,
    } = body

    const userResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      },
    })

    if (!userResponse.ok) {
      const errorText = await userResponse.text()
      console.error("[v0] Settings PATCH - Auth failed:", errorText)
      return NextResponse.json({ error: "Failed to authenticate", details: errorText }, { status: 401 })
    }

    const user = await userResponse.json()
    console.log("[v0] Settings PATCH - User ID:", user.id)

    const updates: any = { updated_at: new Date().toISOString() }
    if (theme !== undefined) {
      updates.theme = theme
      console.log("[v0] Settings PATCH - Setting theme to:", theme)
    }
    if (theme_preference !== undefined) {
      updates.theme_preference = theme_preference ? JSON.stringify(theme_preference) : null
    }
    if (custom_themes !== undefined) {
      updates.custom_themes = custom_themes ? JSON.stringify(custom_themes) : null
      console.log("[v0] Settings PATCH - Saving custom themes:", custom_themes)
    }
    if (language !== undefined) updates.language = language
    if (timezone !== undefined) updates.timezone = timezone
    if (pomodoro_work_duration !== undefined) updates.pomodoro_work_duration = pomodoro_work_duration
    if (pomodoro_break_duration !== undefined) updates.pomodoro_break_duration = pomodoro_break_duration
    if (pomodoro_long_break_duration !== undefined) updates.pomodoro_long_break_duration = pomodoro_long_break_duration

    console.log("[v0] Settings PATCH - Updates to apply:", updates)

    const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/users?id=eq.${user.id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(updates),
    })

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text()
      console.error("[v0] Settings PATCH - Update failed:", errorText)
      return NextResponse.json(
        {
          error: "Failed to update settings",
          status: updateResponse.status,
          details: errorText,
        },
        { status: updateResponse.status },
      )
    }

    const updatedUser = await updateResponse.json()
    console.log("[v0] Settings PATCH - Successfully updated user:", updatedUser)

    return NextResponse.json({ success: true, user: updatedUser[0] || updatedUser })
  } catch (error: any) {
    console.error("[v0] Settings PATCH - Error:", error)
    return NextResponse.json(
      {
        error: "Failed to update settings",
        message: error.message,
      },
      { status: 500 },
    )
  }
}
