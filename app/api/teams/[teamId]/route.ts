import { NextResponse } from "next/server"
import { createServerClient, createServiceRoleClient } from "@/lib/supabase/server"

export async function GET(request: Request, { params }: { params: { teamId: string } }) {
  try {
    const supabase = await createServerClient()
    const supabaseAdmin = await createServiceRoleClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { teamId } = params

    const { data: team, error: teamError } = await supabaseAdmin.from("teams").select("*").eq("id", teamId).single()

    if (teamError) {
      return NextResponse.json({ error: teamError.message }, { status: 404 })
    }

    const { data: membership, error: memberError } = await supabaseAdmin
      .from("team_members")
      .select("role")
      .eq("team_id", teamId)
      .eq("user_id", user.id)
      .single()

    if (memberError || !membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { data: members, error: membersError } = await supabaseAdmin
      .from("team_members")
      .select(`
        id,
        role,
        joined_at,
        user_id
      `)
      .eq("team_id", teamId)

    if (membersError) {
      console.error("[v0] Error fetching members:", membersError)
    }

    const membersWithDetails = []
    if (members) {
      for (const member of members) {
        const { data: userData } = await supabaseAdmin
          .from("users")
          .select("id, name, email")
          .eq("id", member.user_id)
          .single()

        membersWithDetails.push({
          ...member,
          users: userData,
        })
      }
    }

    return NextResponse.json({
      ...team,
      role: membership.role,
      members: membersWithDetails,
    })
  } catch (error: any) {
    console.error("[v0] Error in team GET:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { teamId: string } }) {
  try {
    const supabase = await createServerClient()
    const supabaseAdmin = await createServiceRoleClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { teamId } = params
    const body = await request.json()
    const { name, description } = body

    const { data: membership, error: memberError } = await supabaseAdmin
      .from("team_members")
      .select("role")
      .eq("team_id", teamId)
      .eq("user_id", user.id)
      .single()

    if (memberError || !membership || !["owner", "admin"].includes(membership.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { data: team, error: updateError } = await supabaseAdmin
      .from("teams")
      .update({
        name: name?.trim(),
        description: description?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", teamId)
      .select()
      .single()

    if (updateError) {
      console.error("[v0] Team update error:", updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json(team)
  } catch (error: any) {
    console.error("[v0] Error in team PATCH:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { teamId: string } }) {
  try {
    const supabase = await createServerClient()
    const supabaseAdmin = await createServiceRoleClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { teamId } = params

    const { data: team, error: teamError } = await supabaseAdmin
      .from("teams")
      .select("owner_id")
      .eq("id", teamId)
      .single()

    if (teamError || !team || team.owner_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { error: deleteError } = await supabaseAdmin.from("teams").delete().eq("id", teamId)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Error in team DELETE:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
