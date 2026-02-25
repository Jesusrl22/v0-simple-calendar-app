import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ authenticated: false })
    }

    return NextResponse.json({ authenticated: true, user: { id: user.id, email: user.email } })
  } catch (error: any) {
    console.error("[v0] Error checking session:", error)
    return NextResponse.json({ authenticated: false, error: error.message }, { status: 500 })
  }
}
