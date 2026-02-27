import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServiceRoleClient } from "@/lib/supabase/server"

function getUserIdFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return payload.sub || null
  } catch {
    return null
  }
}

const CREDIT_COSTS = {
  "presentation-5": 7,
  "presentation-10": 12,
}

export async function POST(req: NextRequest) {
  try {
    const { content, title = "Presentation", slideCount = 5 } = await req.json()

    if (!content || !Array.isArray(content) || content.length === 0) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    const cookieStore = await cookies()
    const accessToken = cookieStore.get("sb-access-token")?.value

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = getUserIdFromToken(accessToken)
    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const supabaseAdmin = await createServiceRoleClient()

    // Get user credits
    const { data: userData, error: userError } = await supabaseAdmin
      .from("users")
      .select("ai_credits, ai_credits_purchased")
      .eq("id", userId)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const creditCost =
      slideCount === 5 ? CREDIT_COSTS["presentation-5"] : CREDIT_COSTS["presentation-10"]
    const totalCredits = (userData.ai_credits || 0) + (userData.ai_credits_purchased || 0)

    if (totalCredits < creditCost) {
      return NextResponse.json(
        {
          error: "Insufficient credits",
          message: `This presentation requires ${creditCost} credits, but you only have ${totalCredits}`,
        },
        { status: 402 },
      )
    }

    // Create presentation data as JSON (for HTML viewer)
    const presentationData = {
      title,
      slides: content.slice(0, slideCount).map((item: any, idx: number) => ({
        id: idx,
        title: item.title || `Slide ${idx}`,
        content: item.text || "",
        imageUrl: item.imageUrl,
      })),
      createdAt: new Date().toISOString(),
    }

    // Deduct credits
    let newMonthlyCredits = userData.ai_credits || 0
    let newPurchasedCredits = userData.ai_credits_purchased || 0

    if (creditCost <= newMonthlyCredits) {
      newMonthlyCredits -= creditCost
    } else {
      const remaining = creditCost - newMonthlyCredits
      newMonthlyCredits = 0
      newPurchasedCredits -= remaining
    }

    await supabaseAdmin
      .from("users")
      .update({
        ai_credits: Math.max(0, newMonthlyCredits),
        ai_credits_purchased: Math.max(0, newPurchasedCredits),
      })
      .eq("id", userId)

    // Return as JSON file
    const buffer = Buffer.from(JSON.stringify(presentationData, null, 2))
    
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${title.replace(/\s+/g, "_")}_presentation.json"`,
      },
    })
  } catch (error: any) {
    console.error("[v0] Error exporting presentation:", error)
    return NextResponse.json(
      { error: "Failed to export presentation", message: error.message },
      { status: 500 },
    )
  }
}
