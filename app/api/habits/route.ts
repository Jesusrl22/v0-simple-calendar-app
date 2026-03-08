import { NextResponse } from "next/server"
import { cookies } from "next/headers"

function getUserIdFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString())
    return payload.sub || null
  } catch {
    return null
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("sb-access-token")?.value
    if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = getUserIdFromToken(accessToken)
    if (!userId) return NextResponse.json({ error: "Invalid token" }, { status: 401 })

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/habits?user_id=eq.${userId}&order=created_at.asc`,
      {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
      }
    )
    const habits = await response.json()
    const habitsWithColor = Array.isArray(habits) ? habits.map((h: any) => {
      let recurrenceDays = h.recurrence_days || [0, 1, 2, 3, 4, 5, 6]
      // Parse if it's a string (Supabase stores JSON as string)
      if (typeof recurrenceDays === 'string') {
        try {
          recurrenceDays = JSON.parse(recurrenceDays)
        } catch {
          recurrenceDays = [0, 1, 2, 3, 4, 5, 6]
        }
      }
      return {
        ...h,
        color: h.color || "#54d946",
        icon: h.icon || "",
        recurrence_type: h.recurrence_type || "daily",
        recurrence_days: Array.isArray(recurrenceDays) ? recurrenceDays : [0, 1, 2, 3, 4, 5, 6],
      }
    }) : []
    return NextResponse.json({ habits: habitsWithColor })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("sb-access-token")?.value
    if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = getUserIdFromToken(accessToken)
    if (!userId) return NextResponse.json({ error: "Invalid token" }, { status: 401 })

    const { name, color, icon, recurrence_type, recurrence_days } = await request.json()
    if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 })

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/habits`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        user_id: userId,
        name: name.trim(),
        color: color || "#54d946",
        icon: icon || "",
        recurrence_type: recurrence_type || "daily",
        recurrence_days: recurrence_days || [0, 1, 2, 3, 4, 5, 6],
      }),
    })

    const text = await response.text()
    if (!response.ok) {
      return NextResponse.json({ error: `Supabase error: ${text}` }, { status: 500 })
    }
    const habit = JSON.parse(text)
    return NextResponse.json({ habit: habit[0] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("sb-access-token")?.value
    if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await request.json()
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/habits?id=eq.${id}`, {
      method: "DELETE",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
