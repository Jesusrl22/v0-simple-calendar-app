import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// GET messages for a team
export async function GET(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch messages - RLS policies will handle access control
    const { data: messages, error } = await supabase
      .from("team_messages")
      .select("id, message as content, created_at, user_id")
      .eq("team_id", params.teamId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error("[v0] Error fetching messages:", error)
      return NextResponse.json(
        { error: "Failed to fetch messages", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ messages: messages?.reverse() || [] })
  } catch (error) {
    console.error("[v0] Error in GET /messages:", error)
    return NextResponse.json(
      { error: "Failed to fetch messages", details: String(error) },
      { status: 500 }
    )
  }
}

// POST a new message
export async function POST(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const supabase = await createClient()
    const { content } = await request.json()

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Message cannot be empty" },
        { status: 400 }
      )
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Insert message - RLS policies will handle access control
    const { data: message, error } = await supabase
      .from("team_messages")
      .insert({
        team_id: params.teamId,
        user_id: user.id,
        message: content.trim(),
      })
      .select("id, message as content, created_at, user_id")
      .single()

    if (error) {
      console.error("[v0] Error creating message:", error)
      return NextResponse.json(
        { error: "Failed to create message", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error in POST /messages:", error)
    return NextResponse.json(
      { error: "Failed to create message", details: String(error) },
      { status: 500 }
    )
  }
}
