import { resetCreditsForPlanChange } from "@/lib/ai-credits"
import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await resetCreditsForPlanChange(user.id)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in reset-credits-for-plan-change endpoint:", error)
    return NextResponse.json({ error: "Failed to reset credits" }, { status: 500 })
  }
}
