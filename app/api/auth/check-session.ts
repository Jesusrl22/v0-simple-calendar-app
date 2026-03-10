import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    console.log("[v0] check-session: user=", user?.email, "error=", error?.message)

    if (error || !user) {
      console.log("[v0] check-session: No user found")
      return NextResponse.json({ authenticated: false })
    }

    console.log("[v0] check-session: User authenticated -", user.email)
    return NextResponse.json({ authenticated: true, user: { id: user.id, email: user.email } })
  } catch (error: any) {
    console.error("[v0] Error checking session:", error)
    return NextResponse.json({ authenticated: false, error: error.message }, { status: 500 })
  }
}
