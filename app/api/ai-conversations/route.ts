import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log("[v0] AI Conversations GET: User error:", userError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
      const { data: conversations, error } = await supabase
        .from("ai_conversations")
        .select("id, title, created_at, updated_at, messages, mode")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })

      if (error) {
        // Check if it's a rate limit error
        if (error.message?.includes("429") || error.message?.includes("Too Many")) {
          console.warn("[v0] AI Conversations - Rate limited")
          return NextResponse.json([], { status: 429, headers: { "Retry-After": "60" } })
        }
        console.error("[v0] AI Conversations GET error:", error)
        throw error
      }

      console.log("[v0] Loaded", conversations?.length || 0, "conversations")
      return NextResponse.json(conversations || [])
    } catch (dbError: any) {
      // Handle database connection errors
      if (dbError?.message?.includes("429") || dbError?.status === 429) {
        console.warn("[v0] AI Conversations - Rate limited (catch)")
        return NextResponse.json([], { status: 429, headers: { "Retry-After": "60" } })
      }
      throw dbError
    }
  } catch (error) {
    console.error("[v0] Error fetching conversations:", error)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    // Check if error is rate limiting
    if (userError) {
      const errorMsg = typeof userError === 'object' 
        ? JSON.stringify(userError).toLowerCase()
        : String(userError).toLowerCase()
      
      if (errorMsg.includes("429") || errorMsg.includes("too many")) {
        console.warn("[v0] AI Conversations POST - Rate limited (auth)")
        return NextResponse.json({ error: "Rate limited" }, { status: 429, headers: { "Retry-After": "60" } })
      }
      
      console.log("[v0] AI Conversations POST: User error:", userError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, title, messages, mode } = await req.json()

    if (!id) {
      return NextResponse.json({ error: "Conversation ID required" }, { status: 400 })
    }

    const { data: existing, error: existingError } = await supabase
      .from("ai_conversations")
      .select("id")
      .eq("id", String(id))
      .eq("user_id", user.id)
      .maybeSingle()

    if (existingError) {
      // Check if rate limited
      const errorMsg = String(existingError).toLowerCase()
      if (errorMsg.includes("429") || errorMsg.includes("too many")) {
        console.warn("[v0] AI Conversations - Rate limited (existing check)")
        return NextResponse.json({ error: "Rate limited" }, { status: 429, headers: { "Retry-After": "60" } })
      }
      throw existingError
    }

    let result
    if (existing) {
      // UPDATE existing conversation
      const { data, error } = await supabase
        .from("ai_conversations")
        .update({
          title: title || "New Conversation",
          messages: messages || [],
          mode: mode || "chat",
          updated_at: new Date().toISOString(),
        })
        .eq("id", String(id))
        .eq("user_id", user.id)
        .select()
        .single()

      if (error) {
        // Check if rate limited
        const errorMsg = String(error).toLowerCase()
        if (errorMsg.includes("429") || errorMsg.includes("too many")) {
          console.warn("[v0] AI Conversations - Rate limited (update)")
          return NextResponse.json({ error: "Rate limited" }, { status: 429, headers: { "Retry-After": "60" } })
        }
        throw error
      }
      result = data
    } else {
      // INSERT new conversation
      const { data, error } = await supabase
        .from("ai_conversations")
        .insert({
          id: String(id),
          user_id: user.id,
          title: title || "New Conversation",
          messages: messages || [],
          mode: mode || "chat",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        // Check if rate limited
        const errorMsg = String(error).toLowerCase()
        if (errorMsg.includes("429") || errorMsg.includes("too many")) {
          console.warn("[v0] AI Conversations - Rate limited (insert)")
          return NextResponse.json({ error: "Rate limited" }, { status: 429, headers: { "Retry-After": "60" } })
        }
        throw error
      }
      result = data
    }

    console.log("[v0] Saved conversation:", result?.id)
    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Error saving conversation:", error)
    
    // Check if the error itself is rate limiting
    const errorMsg = String(error).toLowerCase()
    if (errorMsg.includes("429") || errorMsg.includes("too many")) {
      return NextResponse.json({ error: "Rate limited" }, { status: 429, headers: { "Retry-After": "60" } })
    }
    
    return NextResponse.json({ error: "Failed to save conversation" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    // Check if error is rate limiting
    if (userError) {
      const errorMsg = typeof userError === 'object' 
        ? JSON.stringify(userError).toLowerCase()
        : String(userError).toLowerCase()
      
      if (errorMsg.includes("429") || errorMsg.includes("too many")) {
        console.warn("[v0] AI Conversations DELETE - Rate limited (auth)")
        return NextResponse.json({ error: "Rate limited" }, { status: 429, headers: { "Retry-After": "60" } })
      }
      
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const id = url.searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Missing conversation ID" }, { status: 400 })
    }

    console.log("[v0] Deleting conversation:", id, "for user:", user.id)

    const { error } = await supabase
      .from("ai_conversations")
      .delete()
      .eq("id", String(id))
      .eq("user_id", user.id)

    if (error) {
      // Check if rate limited
      const errorMsg = String(error).toLowerCase()
      if (errorMsg.includes("429") || errorMsg.includes("too many")) {
        console.warn("[v0] AI Conversations - Rate limited (delete)")
        return NextResponse.json({ error: "Rate limited" }, { status: 429, headers: { "Retry-After": "60" } })
      }
      throw error
    }

    console.log("[v0] Conversation deleted:", id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting conversation:", error)
    
    // Check if the error itself is rate limiting
    const errorMsg = String(error).toLowerCase()
    if (errorMsg.includes("429") || errorMsg.includes("too many")) {
      return NextResponse.json({ error: "Rate limited" }, { status: 429, headers: { "Retry-After": "60" } })
    }
    
    return NextResponse.json({ error: "Failed to delete conversation" }, { status: 500 })
  }
}
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) throw error

    console.log("[v0] Conversation deleted successfully")
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Error deleting conversation:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
