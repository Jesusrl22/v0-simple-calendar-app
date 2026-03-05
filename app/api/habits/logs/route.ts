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
      `${SUPABASE_URL}/rest/v1/habit_logs?user_id=eq.${userId}&completed_date=gte.${start}&completed_date=lte.${end}`,
      {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
      }
    )
    const logs = await response.json()
    return NextResponse.json({ logs: Array.isArray(logs) ? logs : [] })
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
      `${SUPABASE_URL}/rest/v1/habit_logs?user_id=eq.${userId}&habit_id=eq.${habit_id}&completed_date=eq.${date}`,
      {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
      }
    )
    const existing = await checkRes.json()

    if (Array.isArray(existing) && existing.length > 0) {
      // Delete (toggle off)
      await fetch(
        `${SUPABASE_URL}/rest/v1/habit_logs?user_id=eq.${userId}&habit_id=eq.${habit_id}&completed_date=eq.${date}`,
        {
          method: "DELETE",
          headers: {
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
          },
        }
      )
      return NextResponse.json({ completed: false })
    } else {
      // Insert (toggle on)
      await fetch(`${SUPABASE_URL}/rest/v1/habit_logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ user_id: userId, habit_id, completed_date: date }),
      })
      return NextResponse.json({ completed: true })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
