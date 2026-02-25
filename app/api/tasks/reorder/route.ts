import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("sb-access-token")?.value

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { taskOrders } = await request.json()

    if (!taskOrders || !Array.isArray(taskOrders)) {
      return NextResponse.json({ error: "Invalid task orders" }, { status: 400 })
    }

    // Update each task's display_order
    const updatePromises = taskOrders.map(({ id, order }: { id: string; order: number }) => {
      return fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/tasks?id=eq.${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ display_order: order }),
      })
    })

    await Promise.all(updatePromises)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[SERVER] Reorder tasks error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
