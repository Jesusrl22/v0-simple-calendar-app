import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// This cron job deletes unverified Supabase Auth users older than 24 hours
// Configure in vercel.json: { "crons": [{ "path": "/api/cron/cleanup-unverified-users", "schedule": "0 3 * * *" }] }
export async function GET(request: Request) {
  try {
    // Validate cron secret to prevent unauthorized calls
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Fetch all users (paginated)
    const { data: { users }, error } = await supabase.auth.admin.listUsers({ perPage: 1000 })

    if (error) {
      console.error("[CRON] Failed to list users:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const now = new Date()
    const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000) // 24 hours ago

    const toDelete = users.filter((u) => {
      // User has not confirmed email
      if (u.email_confirmed_at) return false
      // User was created more than 24 hours ago
      const createdAt = new Date(u.created_at)
      return createdAt < cutoff
    })

    console.log(`[CRON] Found ${toDelete.length} unverified users older than 24h out of ${users.length} total`)

    const deleted: string[] = []
    const failed: string[] = []

    for (const user of toDelete) {
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)
      if (deleteError) {
        console.error(`[CRON] Failed to delete user ${user.id} (${user.email}):`, deleteError.message)
        failed.push(user.email || user.id)
      } else {
        console.log(`[CRON] Deleted unverified user: ${user.email} (created: ${user.created_at})`)
        deleted.push(user.email || user.id)
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        total_users: users.length,
        unverified_expired: toDelete.length,
        deleted: deleted.length,
        failed: failed.length,
      },
      deleted,
      failed,
    })
  } catch (error: any) {
    console.error("[CRON] cleanup-unverified-users exception:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
