import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { teamId, memberId } = body

    if (!teamId || !memberId) {
      return NextResponse.json({ error: "Missing teamId or memberId" }, { status: 400 })
    }

    // Check if user is owner or admin
    const { data: membership, error: memberError } = await supabase
      .from("team_members")
      .select("role")
      .eq("team_id", teamId)
      .eq("user_id", user.id)
      .single()

    if (memberError || !membership || !["owner", "admin"].includes(membership.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Check the role of the member being removed
    const { data: targetMember, error: targetError } = await supabase
      .from("team_members")
      .select("role")
      .eq("id", memberId)
      .single()

    if (targetError) {
      return NextResponse.json({ error: targetError.message }, { status: 404 })
    }

    // Cannot remove owner
    if (targetMember.role === "owner") {
      return NextResponse.json({ error: "Cannot remove team owner" }, { status: 403 })
    }

    // Remove member
    const { error: deleteError } = await supabase.from("team_members").delete().eq("id", memberId)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Error in members DELETE:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ members: [] })
}
