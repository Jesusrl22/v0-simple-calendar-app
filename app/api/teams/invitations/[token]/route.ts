import { NextResponse } from "next/server"
import { createServerClient, createServiceRoleClient } from "@/lib/supabase/server"

export async function GET(request: Request, { params }: { params: { token: string } }) {
  try {
    const supabaseAdmin = await createServiceRoleClient()
    const teamId = params.token

    const { data: team, error } = await supabaseAdmin
      .from("teams")
      .select("id, name, description")
      .eq("id", teamId)
      .maybeSingle()

    if (error || !team) {
      console.log("[v0] Team not found:", error)
      return NextResponse.json({ error: "Invalid team link" }, { status: 404 })
    }

    return NextResponse.json({
      invitation: {
        id: teamId,
        team_id: teamId,
        teams: {
          name: team.name,
          description: team.description,
        },
        users: {
          name: "Team Admin",
          email: "admin@team.com",
        },
        role: "member",
      },
    })
  } catch (error: any) {
    console.error("[v0] Error in invitation GET:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { token: string } }) {
  try {
    const supabase = await createServerClient()
    const supabaseAdmin = await createServiceRoleClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log("[v0] Auth error:", authError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] User accepting team invite:", user.id, user.email)

    const teamId = params.token

    // Verify team exists
    const { data: team, error: teamError } = await supabaseAdmin
      .from("teams")
      .select("id, name, description")
      .eq("id", teamId)
      .maybeSingle()

    if (teamError || !team) {
      console.log("[v0] Team not found:", teamError)
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    console.log("[v0] Team found:", team.name)

    // Check if already a member
    const { data: existingMember } = await supabaseAdmin
      .from("team_members")
      .select("id")
      .eq("team_id", teamId)
      .eq("user_id", user.id)
      .maybeSingle()

    if (existingMember) {
      console.log("[v0] User already member of team:", teamId)
      return NextResponse.json({ success: true, teamId })
    }

    console.log("[v0] Attempting to insert team member:", { team_id: teamId, user_id: user.id })

    const { data: insertResult, error: insertError } = await supabaseAdmin.from("team_members").insert({
      team_id: teamId,
      user_id: user.id,
      role: "member",
    })

    console.log("[v0] Insert result:", insertResult)
    console.log("[v0] Insert error:", insertError)

    if (insertError) {
      console.error("[v0] Error adding team member:", {
        message: insertError.message,
        code: insertError.code,
        details: insertError.details,
        hint: insertError.hint,
      })
      return NextResponse.json({ error: `Failed to add member: ${insertError.message}` }, { status: 500 })
    }

    console.log("[v0] Successfully added user to team:", teamId)
    return NextResponse.json({ success: true, teamId })
  } catch (error: any) {
    console.error("[v0] Error accepting team invite:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
