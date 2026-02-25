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

    if (!accessToken) {
      console.log("[v0] Tasks GET: No access token")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = getUserIdFromToken(accessToken)
    if (!userId) {
      console.log("[v0] Tasks GET: Invalid token")
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    console.log("[v0] Tasks GET: Fetching tasks for user:", userId)
    
    // Skip daily reset during rate limiting to reduce requests
    // The reset will happen on next successful request or via cron job
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/tasks?user_id=eq.${userId}&order=display_order.asc,created_at.desc`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )

    if (!response.ok) {
      console.log("[v0] Tasks GET: Supabase error:", response.status)
      
      // Handle rate limiting
      if (response.status === 429) {
        console.warn("[v0] Tasks GET: Rate limited (429), returning empty list")
        // Return empty list instead of error to allow UI to show cached data
        return NextResponse.json({ tasks: [], rateLimited: true }, { status: 200 })
      }
      
      const errorText = await response.text()
      console.log("[v0] Tasks GET: Error response:", errorText.substring(0, 100))
      
      // Check if error response contains "Too Many" (rate limit from proxy)
      if (errorText.includes("Too Many") || errorText.includes("429")) {
        console.warn("[v0] Tasks GET: Rate limited (proxy), returning empty list")
        return NextResponse.json({ tasks: [], rateLimited: true }, { status: 200 })
      }
      
      return NextResponse.json({ error: "Failed to fetch tasks", tasks: [] }, { status: 200 })
    }

    // Safely parse JSON response
    let tasks
    try {
      const text = await response.text()
      
      // Check if response is actually JSON (not HTML error page)
      if (!text || !text.trim().startsWith("[") && !text.trim().startsWith("{")) {
        console.error("[v0] Tasks GET - Response is not JSON:", text.substring(0, 100))
        
        // If response contains "Too Many" or "429", it's a rate limit error
        if (text.includes("Too Many") || text.includes("429")) {
          return NextResponse.json({ error: "Rate limited" }, { status: 429, headers: { "Retry-After": "60" } })
        }
        
        return NextResponse.json({ error: "Invalid response format" }, { status: 500 })
      }
      
      tasks = JSON.parse(text)
    } catch (parseError) {
      console.error("[v0] Tasks GET: Failed to parse JSON:", parseError)
      return NextResponse.json({ error: "Invalid response format" }, { status: 500 })
    }
    
    console.log("[v0] Tasks GET: Retrieved", Array.isArray(tasks) ? tasks.length : 'unknown', "tasks")
    return NextResponse.json({ tasks })
  } catch (error: any) {
    console.error("[v0] Tasks GET error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
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

    const body = await request.json()

    const taskData = {
      ...body,
      user_id: userId,
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${accessToken}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify(taskData),
    })

    if (!response.ok) {
      // Handle rate limiting first
      if (response.status === 429) {
        return NextResponse.json({ error: "Rate limited" }, { status: 429, headers: { "Retry-After": "60" } })
      }
      
      // Try to parse error response safely
      let errorMessage = "Failed to create task"
      try {
        const errorText = await response.text()
        
        // Check if it's actually JSON
        if (errorText.trim().startsWith("{")) {
          const error = JSON.parse(errorText)
          errorMessage = error.message || errorMessage
        } else if (errorText.includes("Too Many") || errorText.includes("429")) {
          return NextResponse.json({ error: "Rate limited" }, { status: 429, headers: { "Retry-After": "60" } })
        }
      } catch (parseErr) {
        // If JSON parsing fails, just use generic message
        console.error("[v0] Failed to parse task error response:", parseErr)
      }
      
      console.error("[v0] Task creation failed:", { status: response.status })
      return NextResponse.json({ error: errorMessage }, { status: response.status })
    }

    let task
    try {
      const text = await response.text()
      
      // Check if response is actually JSON
      if (!text || !text.trim().startsWith("[") && !text.trim().startsWith("{")) {
        console.error("[v0] Task POST - Response is not JSON:", text.substring(0, 100))
        return NextResponse.json({ error: "Invalid response format" }, { status: 500 })
      }
      
      task = JSON.parse(text)
    } catch (parseError) {
      console.error("[v0] Task POST: Failed to parse JSON:", parseError)
      return NextResponse.json({ error: "Invalid response format" }, { status: 500 })
    }
    console.log("[v0] Task created successfully:", task)
    
    // Send push notification for new task
    try {
      const taskData = Array.isArray(task) ? task[0] : task
      
      console.log("[v0] Attempting to send notification for new task:", taskData.id)
      const notifResponse = await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          title: "Nueva tarea creada",
          body: taskData.title || "Tienes una nueva tarea",
          taskId: taskData.id,
          type: "task",
          url: "/app/tasks",
        }),
      })
      if (notifResponse.ok) {
        const notifResult = await notifResponse.json()
        console.log("[v0] Push notification sent successfully")
      } else {
        console.warn("[v0] Notification service returned status:", notifResponse.status)
      }
    } catch (notifError) {
      console.warn("[v0] Failed to send notification (non-critical):", notifError)
    }
    
    return NextResponse.json(task)
  } catch (error: any) {
    console.error("[SERVER] Task API error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("sb-access-token")?.value

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, ...updates } = await request.json()

    // If marking task as completed, set completed_at timestamp
    // If marking as incomplete, clear completed_at
    const updatedData = {
      ...updates,
      ...(updates.completed !== undefined && {
        completed_at: updates.completed ? new Date().toISOString() : null
      })
    }

    console.log("[v0] Updating task:", id, "with data:", updatedData)

    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/tasks?id=eq.${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${accessToken}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify(updatedData),
    })

    const task = await response.json()
    return NextResponse.json({ task })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("sb-access-token")?.value

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, ...updates } = await request.json()

    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/tasks?id=eq.${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${accessToken}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("[SERVER] Task update failed:", error)
      return NextResponse.json({ error: error.message || "Failed to update task" }, { status: response.status })
    }

    const task = await response.json()
    return NextResponse.json({ task })
  } catch (error: any) {
    console.error("[SERVER] Update task error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("sb-access-token")?.value

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "Task ID required" }, { status: 400 })
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/tasks?id=eq.${id}`, {
      method: "DELETE",
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("[SERVER] Task deletion failed:", error)
      return NextResponse.json({ error: error.message || "Failed to delete task" }, { status: response.status })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[SERVER] Delete task error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
