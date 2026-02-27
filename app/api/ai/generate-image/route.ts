import { type NextRequest, NextResponse } from "next/server"
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

// Credit costs for different image generation types
const CREDIT_COSTS = {
  image: 3,
  schema: 3,
  "presentation-5": 7,
  "presentation-10": 12,
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, imageType = "image" } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
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

    const rateLimitResult = await rateLimit(userId, "aiImage")
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Too many image generation requests",
          message: "You're generating images too quickly. Please wait a moment.",
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
        },
        { status: 429 },
      )
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

    const totalCredits = (userData.ai_credits || 0) + (userData.ai_credits_purchased || 0)
    const creditCost = CREDIT_COSTS[imageType as keyof typeof CREDIT_COSTS] || CREDIT_COSTS.image

    if (totalCredits < creditCost) {
      return NextResponse.json(
        {
          error: "Insufficient credits",
          message: `This requires ${creditCost} credits, but you only have ${totalCredits}`,
          creditsNeeded: creditCost,
          creditsAvailable: totalCredits,
        },
        { status: 402 },
      )
    }

    console.log("[v0] Generating image with Fal:", { prompt, imageType, creditCost })

    // Enhance prompt for schema generation
    let enhancedPrompt = prompt
    if (imageType === "schema") {
      enhancedPrompt = `Create a professional diagram/flowchart/schema showing: ${prompt}. Use clear boxes, arrows, connections, and labels. Style: modern, clean, organized. Use colors to distinguish different elements.`
    }

    // Generate image using Fal flux schnell model via REST API
    const falResponse = await fetch("https://api.falai.com/v1/fal-ai/flux/schnell", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Key ${process.env.FAL_KEY || ""}`,
      },
      body: JSON.stringify({
        input: {
          prompt: enhancedPrompt,
          image_size: "square_hd",
          num_inference_steps: 4,
          num_images: 1,
        },
      }),
    })

    if (!falResponse.ok) {
      const error = await falResponse.text()
      console.error("[v0] Fal API error:", error)
      throw new Error(`Fal API error: ${falResponse.status}`)
    }

    const result = await falResponse.json()
    const imageUrl = result.images?.[0]?.url

    if (!imageUrl) {
      throw new Error("No image generated")
    }

    // Deduct credits from user
    let newMonthlyCredits = userData.ai_credits || 0
    let newPurchasedCredits = userData.ai_credits_purchased || 0

    if (creditCost <= newMonthlyCredits) {
      newMonthlyCredits -= creditCost
    } else {
      const remaining = creditCost - newMonthlyCredits
      newMonthlyCredits = 0
      newPurchasedCredits -= remaining
    }

    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({
        ai_credits: newMonthlyCredits,
        ai_credits_purchased: newPurchasedCredits,
      })
      .eq("id", userId)

    if (updateError) {
      console.error("[v0] Error updating credits:", updateError)
      return NextResponse.json(
        { error: "Failed to process image generation" },
        { status: 500 },
      )
    }

    return NextResponse.json({
      imageUrl,
      creditsCost: creditCost,
      creditsRemaining: newMonthlyCredits + newPurchasedCredits,
    })
  } catch (error: any) {
    console.error("[v0] Error generating image:", error)
    return NextResponse.json(
      {
        error: "Failed to generate image",
        message: error.message || "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
