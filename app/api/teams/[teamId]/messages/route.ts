import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET messages for a team
export async function GET(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const { data: messages, error } = await supabase
      .from("team_messages")
      .select("id, message as content, created_at, user_id")
      .eq("team_id", params.teamId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({ messages: messages?.reverse() || [] });
  } catch (error) {
    console.error("[v0] Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// POST a new message
export async function POST(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const { content, userId } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Message cannot be empty" },
        { status: 400 }
      );
    }

    // Verify user is member of team
    const { data: member, error: memberError } = await supabase
      .from("team_members")
      .select("id")
      .eq("team_id", params.teamId)
      .eq("user_id", userId)
      .single();

    if (memberError || !member) {
      return NextResponse.json(
        { error: "User is not a member of this team" },
        { status: 403 }
      );
    }

    const { data: message, error } = await supabase
      .from("team_messages")
      .insert({
        team_id: params.teamId,
        user_id: userId,
        message: content.trim(),
      })
      .select("id, message as content, created_at, user_id")
      .single();

    if (error) throw error;

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("[v0] Error creating message:", error);
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 }
    );
  }
}
