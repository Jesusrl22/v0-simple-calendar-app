import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServiceRoleClient } from "@/lib/supabase/server"
import PptxGenJS from "pptxgen-js"

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

    const totalCredits = (userData.ai_credits || 0) + (userData.ai_credits_purchased || 0)
    const creditCost = slideCount <= 5 ? CREDIT_COSTS["presentation-5"] : CREDIT_COSTS["presentation-10"]

    if (totalCredits < creditCost) {
      return NextResponse.json(
        {
          error: "Insufficient credits",
          message: `This presentation requires ${creditCost} credits, but you only have ${totalCredits}`,
          creditsNeeded: creditCost,
          creditsAvailable: totalCredits,
        },
        { status: 402 },
      )
    }

    // Create presentation
    const prs = new PptxGenJS()

    // Set default theme
    prs.defineLayout({ name: "MASTER", master: true })
    prs.defineLayout({
      name: "TITLE_SLIDE",
      master: true,
    })

    // Add slides
    content.slice(0, slideCount).forEach((item: any, index: number) => {
      const slide = prs.addSlide()

      // Add background color
      slide.background = { color: "1f2937" }

      if (index === 0) {
        // Title slide
        slide.addText(title, {
          x: 0.5,
          y: 2.0,
          w: 9.0,
          h: 1.5,
          fontSize: 44,
          bold: true,
          color: "54d946",
          align: "center",
        })

        slide.addText(item.subtitle || "AI Generated Presentation", {
          x: 0.5,
          y: 3.8,
          w: 9.0,
          h: 1.0,
          fontSize: 24,
          color: "ffffff",
          align: "center",
        })
      } else {
        // Content slide
        slide.addText(item.title || `Slide ${index}`, {
          x: 0.5,
          y: 0.5,
          w: 9.0,
          h: 0.8,
          fontSize: 32,
          bold: true,
          color: "54d946",
        })

        // Add content
        if (item.imageUrl) {
          try {
            slide.addImage({
              path: item.imageUrl,
              x: 0.5,
              y: 1.5,
              w: 4.0,
              h: 3.5,
            })

            slide.addText(item.text || "", {
              x: 4.8,
              y: 1.5,
              w: 4.7,
              h: 3.5,
              fontSize: 14,
              color: "ffffff",
              valign: "top",
              wrap: true,
            })
          } catch {
            // If image fails, just add text
            slide.addText(item.text || "", {
              x: 0.5,
              y: 1.5,
              w: 9.0,
              h: 4.0,
              fontSize: 14,
              color: "ffffff",
              valign: "top",
              wrap: true,
            })
          }
        } else {
          slide.addText(item.text || "", {
            x: 0.5,
            y: 1.5,
            w: 9.0,
            h: 4.0,
            fontSize: 14,
            color: "ffffff",
            valign: "top",
            wrap: true,
          })
        }
      }

      // Add footer
      slide.addText(`Slide ${index + 1}`, {
        x: 0.5,
        y: 6.8,
        w: 9.0,
        h: 0.4,
        fontSize: 10,
        color: "6b7280",
        align: "right",
      })
    })

    // Generate PowerPoint buffer
    const presentation = await prs.write({ outputType: "arraybuffer" })
    const buffer = Buffer.from(presentation)

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
        ai_credits: newMonthlyCredits,
        ai_credits_purchased: newPurchasedCredits,
      })
      .eq("id", userId)

    // Return presentation as file
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${title.replace(/\s+/g, "_")}_presentation.pptx"`,
        "X-Credits-Cost": String(creditCost),
        "X-Credits-Remaining": String(newMonthlyCredits + newPurchasedCredits),
      },
    })
  } catch (error: any) {
    console.error("[v0] Error exporting presentation:", error)
    return NextResponse.json(
      {
        error: "Failed to export presentation",
        message: error.message || "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
