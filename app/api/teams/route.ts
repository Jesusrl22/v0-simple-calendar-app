import { NextResponse } from "next/server"
import { createServerClient, createServiceRoleClient } from "@/lib/supabase/server"
import crypto from "crypto"

export async function GET() {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabaseAdmin = await createServiceRoleClient()

    // Get team IDs where user is a member
    const { data: memberships, error: memberError } = await supabaseAdmin
      .from("team_members")
      .select("team_id, role")
      .eq("user_id", user.id)

    if (memberError) {
      console.error("[v0] Error fetching memberships:", memberError)
      return NextResponse.json({ error: memberError.message }, { status: 500 })
    }

    if (!memberships || memberships.length === 0) {
      return NextResponse.json({ teams: [] })
    }

    const teamIds = memberships.map((m) => m.team_id)

    // Get teams details
    const { data: teams, error: teamsError } = await supabaseAdmin
      .from("teams")
      .select("*")
      .in("id", teamIds)
      .order("created_at", { ascending: false })

    if (teamsError) {
      console.error("[v0] Error fetching teams:", teamsError)
      return NextResponse.json({ error: teamsError.message }, { status: 500 })
    }

    // Get member counts for each team
    const teamsWithCounts = await Promise.all(
      teams.map(async (team) => {
        const { count } = await supabaseAdmin
          .from("team_members")
          .select("*", { count: "exact", head: true })
          .eq("team_id", team.id)

        const membership = memberships.find((m) => m.team_id === team.id)

        return {
          ...team,
          role: membership?.role || "member",
          member_count: count || 0,
        }
      }),
    )

    return NextResponse.json({ teams: teamsWithCounts })
  } catch (error: any) {
    console.error("[v0] Error in teams GET:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabaseAdmin = await createServiceRoleClient()

    // Check user's subscription plan for team limits
    const { data: userData, error: userError } = await supabaseAdmin
      .from("users")
      .select("subscription_tier")
      .eq("id", user.id)
      .maybeSingle()

    if (userError) {
      console.error("[v0] Error fetching user:", userError)
      return NextResponse.json({ error: userError.message }, { status: 500 })
    }

    // Check current team count
    const { data: existingTeams, error: countError } = await supabaseAdmin
      .from("team_members")
      .select("team_id")
      .eq("user_id", user.id)

    if (countError) {
      console.error("[v0] Error counting teams:", countError)
      return NextResponse.json({ error: countError.message }, { status: 500 })
    }

    // Note: Team limits removed to allow all users to create teams
    // const teamCount = existingTeams?.length || 0
    // const plan = userData?.subscription_tier || "free"

    const body = await request.json()
    const { name, description } = body

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Team name is required" }, { status: 400 })
    }

    const inviteToken = crypto.randomUUID().replace(/-/g, "").substring(0, 24)

    // Create team - disable RLS check by using service role
    const { data: team, error: createError } = await supabaseAdmin
      .from("teams")
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        owner_id: user.id,
        invite_token: inviteToken,
      })
      .select()
      .maybeSingle()

    if (createError || !team) {
      console.error("[v0] Error creating team:", createError)
      return NextResponse.json({ error: createError?.message || "Failed to create team" }, { status: 500 })
    }

    // Add creator as owner in team_members - using service role to bypass RLS
    const { error: memberError } = await supabaseAdmin.from("team_members").insert({
      team_id: team.id,
      user_id: user.id,
      role: "owner",
    })

    if (memberError) {
      console.error("[v0] Error adding team member:", memberError)
      // Rollback - delete the team
      await supabaseAdmin.from("teams").delete().eq("id", team.id)
      return NextResponse.json({ error: memberError.message }, { status: 500 })
    }

    return NextResponse.json({ team }, { status: 201 })
  } catch (error: any) {
    console.error("[v0] Error in teams POST:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
