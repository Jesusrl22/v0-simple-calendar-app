import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { cookies } from "next/headers"
import { rateLimit } from "@/lib/redis"
import { createServiceRoleClient } from "@/lib/supabase/server"

function getUserIdFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return payload.sub || null
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const { message, language = "en", mode = "chat", systemPrompt } = await req.json()

    const cookieStore = await cookies()
    const accessToken = cookieStore.get("sb-access-token")?.value

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = getUserIdFromToken(accessToken)
    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const rateLimitResult = await rateLimit(userId, "aiChat")

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Too many AI requests",
          message: "You're sending messages too quickly. Please wait a moment.",
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
        },
        { status: 429 },
      )
    }

    const supabaseAdmin = await createServiceRoleClient()

    const { data: profiles, error: profileError } = await supabaseAdmin
      .from("users")
      .select("ai_credits,ai_credits_purchased,subscription_tier")
      .eq("id", userId)
      .maybeSingle()

    if (profileError || !profiles) {
      console.error("[v0] Failed to fetch profile:", profileError)
      return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
    }

    const profile = profiles
    const monthlyCredits = profile.ai_credits || 0
    const purchasedCredits = profile.ai_credits_purchased || 0
    const totalCredits = monthlyCredits + purchasedCredits

    if (totalCredits < 2) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 402 })
    }

    let newMonthlyCredits = monthlyCredits
    let newPurchasedCredits = purchasedCredits

    if (monthlyCredits >= 2) {
      newMonthlyCredits -= 2
    } else if (monthlyCredits > 0) {
      const remaining = 2 - monthlyCredits
      newMonthlyCredits = 0
      newPurchasedCredits -= remaining
    } else {
      newPurchasedCredits -= 2
    }

    const newTotalCredits = newMonthlyCredits + newPurchasedCredits

    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({
        ai_credits: newMonthlyCredits,
        ai_credits_purchased: newPurchasedCredits,
      })
      .eq("id", userId)

    if (updateError) {
      console.error("[v0] Failed to update credits:", updateError)
      return NextResponse.json({ error: "Failed to update credits" }, { status: 500 })
    }

    const languageInstruction = language !== "en" ? `\n\nRespond exclusively in ${getLanguageName(language)}.` : ""

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      system: systemPrompt ? systemPrompt + languageInstruction : undefined,
      prompt: message,
    })

    console.log("[v0] AI Chat response - Credits remaining:", {
      total: newTotalCredits,
      monthly: newMonthlyCredits,
      purchased: newPurchasedCredits,
    })

    return NextResponse.json({
      response: text,
      creditsRemaining: newMonthlyCredits, // For compatibility with frontend
      remainingCredits: newTotalCredits,
      remainingMonthlyCredits: newMonthlyCredits,
      remainingPurchasedCredits: newPurchasedCredits,
    })
  } catch (error) {
    console.error("[v0] AI Chat Error:", error)
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 })
  }
}

function getLanguageName(code: string): string {
  const languages: Record<string, string> = {
    es: "Spanish",
    fr: "French",
    de: "German",
    it: "Italian",
    en: "English",
  }
  return languages[code] || "English"
}
