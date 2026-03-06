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

const getServiceKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!

// GET logs for a given month: ?year=2026&month=3
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("sb-access-token")?.value
    if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = getUserIdFromToken(accessToken)
    if (!userId) return NextResponse.json({ error: "Invalid token" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const year = searchParams.get("year") || new Date().getFullYear()
    const month = searchParams.get("month") || new Date().getMonth() + 1
    const monthStr = String(month).padStart(2, "0")
    const start = `${year}-${monthStr}-01`
    const lastDay = new Date(Number(year), Number(month), 0).getDate()
    const end = `${year}-${monthStr}-${lastDay}`

    const serviceKey = getServiceKey()
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/habit_logs?user_id=eq.${userId}&date=gte.${start}&date=lte.${end}`,
      {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
      }
    )
    const logs = await response.json()
    // Map 'date' column to 'completed_date' for frontend compatibility
    const mapped = Array.isArray(logs) ? logs.map(l => ({ ...l, completed_date: l.date })) : []
    return NextResponse.json({ logs: mapped })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST to toggle a habit log for a specific date
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("sb-access-token")?.value
    if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = getUserIdFromToken(accessToken)
    if (!userId) return NextResponse.json({ error: "Invalid token" }, { status: 401 })

    const { habit_id, date } = await request.json()
    if (!habit_id || !date) return NextResponse.json({ error: "habit_id and date required" }, { status: 400 })

    const serviceKey = getServiceKey()

    // Check if log already exists
    const checkRes = await fetch(
      `${SUPABASE_URL}/rest/v1/habit_logs?user_id=eq.${userId}&habit_id=eq.${habit_id}&date=eq.${date}`,
      {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
      }
    )
    const checkText = await checkRes.text()
    let existing = []
    try {
      existing = JSON.parse(checkText)
    } catch (e) {
      console.error("[v0] Failed to parse check response:", checkText)
    }

    if (Array.isArray(existing) && existing.length > 0) {
      // Delete (toggle off)
      const deleteRes = await fetch(
        `${SUPABASE_URL}/rest/v1/habit_logs?user_id=eq.${userId}&habit_id=eq.${habit_id}&date=eq.${date}`,
        {
          method: "DELETE",
          headers: {
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
          },
        }
      )
      if (!deleteRes.ok) {
        const errorText = await deleteRes.text()
        console.error("[v0] Delete failed:", deleteRes.status, errorText)
        return NextResponse.json({ error: "Failed to delete log" }, { status: 500 })
      }
      return NextResponse.json({ completed: false, success: true })
    } else {
      // Insert (toggle on)
      const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/habit_logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ user_id: userId, habit_id, date }),
      })
      if (!insertRes.ok) {
        const errorText = await insertRes.text()
        console.error("[v0] Insert failed:", insertRes.status, errorText)
        return NextResponse.json({ error: "Failed to insert log" }, { status: 500 })
      }
      return NextResponse.json({ completed: true, success: true })
    }
  } catch (error: any) {
    console.error("[v0] POST logs error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
