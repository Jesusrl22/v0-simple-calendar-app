import { NextResponse } from "next/server"
import { createServerClient, createServiceRoleClient } from "@/lib/supabase/server"
import { randomBytes } from "crypto"

export async function POST(request: Request, { params }: { params: { teamId: string } }) {
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
    const { email, role = "member" } = body

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
    }

    const { data: membership, error: memberError } = await supabaseAdmin
      .from("team_members")
      .select("role")
      .eq("team_id", teamId)
      .eq("user_id", user.id)
      .maybeSingle()

    if (memberError || !membership || !["owner", "admin"].includes(membership.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Check team member limits based on subscription
    const { data: teamData, error: teamError } = await supabaseAdmin
      .from("teams")
      .select("owner_id, team_members(count)")
      .eq("id", teamId)
      .single()

    if (teamError) {
      return NextResponse.json({ error: teamError.message }, { status: 500 })
    }

    const { data: ownerData, error: ownerError } = await supabaseAdmin
      .from("users")
      .select("subscription_tier")
      .eq("id", teamData.owner_id)
      .single()

    if (ownerError) {
      return NextResponse.json({ error: ownerError.message }, { status: 500 })
    }

    const memberCount = teamData.team_members?.[0]?.count || 0
    const plan = ownerData.subscription_tier || "free"

    if (plan === "free" && memberCount >= 3) {
      return NextResponse.json({ error: "Member limit reached for free plan" }, { status: 403 })
    }
    if (plan === "premium" && memberCount >= 10) {
      return NextResponse.json({ error: "Member limit reached for premium plan" }, { status: 403 })
    }

    // Check if email is already a member by looking up user by email
    const { data: invitedUser, error: userLookupError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase())
      .maybeSingle()

    if (!userLookupError && invitedUser) {
      // User exists, check if already a member
      const { data: existingMember } = await supabaseAdmin
        .from("team_members")
        .select("id")
        .eq("team_id", teamId)
        .eq("user_id", invitedUser.id)
        .maybeSingle()

      if (existingMember) {
        return NextResponse.json({ error: "User is already a team member" }, { status: 400 })
      }
    }

    // Generate invitation token
    const token = randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    // Create invitation
    const { data: invitation, error: inviteError } = await supabaseAdmin
      .from("team_invitations")
      .insert({
        team_id: teamId,
        email: email.toLowerCase(),
        invited_by: user.id,
        token,
        role,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single()

    if (inviteError) {
      return NextResponse.json({ error: inviteError.message }, { status: 500 })
    }

    const { data: teamInfo } = await supabaseAdmin.from("teams").select("name").eq("id", teamId).single()

    const { data: inviterInfo } = await supabaseAdmin.from("users").select("name, email").eq("id", user.id).single()

    const teamName = teamInfo?.name || "a team"
    const inviterName = inviterInfo?.name || inviterInfo?.email || "Someone"

    const invitationLink = `${process.env.NEXT_PUBLIC_APP_URL || "https://future-task.com"}/invite/${token}`

    console.log("[v0] Invitation link generated:", invitationLink)

    return NextResponse.json(
      {
        invitation,
        invitationLink,
        message: "Invitation link generated. Share this link with the user to invite them to the team.",
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("[v0] Error in team invite POST:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
