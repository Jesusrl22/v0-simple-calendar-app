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

    console.log("[v0] Fetching messages for team:", params.teamId, "limit:", limit, "offset:", offset)

    // First, verify user is member of team
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { data: isMember, error: memberCheckError } = await supabase
      .from("team_members")
      .select("id")
      .eq("team_id", params.teamId)
      .eq("user_id", user.id)
      .single()

    if (memberCheckError || !isMember) {
      console.log("[v0] User not member of team")
      return NextResponse.json(
        { error: "User is not a member of this team" },
        { status: 403 }
      )
    }

    const { data: messages, error } = await supabase
      .from("team_messages")
      .select("id, message as content, created_at, user_id", { count: "exact" })
      .eq("team_id", params.teamId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error("[v0] Supabase error fetching messages:", error)
      throw error
    }

    console.log("[v0] Messages fetched successfully:", messages?.length || 0)
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
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Verify user is member of team
    const { data: member, error: memberError } = await supabase
      .from("team_members")
      .select("id")
      .eq("team_id", params.teamId)
      .eq("user_id", user.id)
      .single()

    if (memberError || !member) {
      console.log("[v0] User not member for POST:", memberError)
      return NextResponse.json(
        { error: "User is not a member of this team" },
        { status: 403 }
      )
    }

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
      throw error
    }

    console.log("[v0] Message created successfully:", message?.id)
    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error in POST /messages:", error)
    return NextResponse.json(
      { error: "Failed to create message", details: String(error) },
      { status: 500 }
    )
  }
}
