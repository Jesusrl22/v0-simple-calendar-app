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

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    let text = buffer.toString("latin1")
    const matches = text.match(/BT\s+(.*?)\s+ET/gs) || []
    const extractedText = matches
      .map((m) => m.replace(/BT|ET|Tj|TJ|Td|T\*|[[\]<>()]/g, " ").trim())
      .filter((t) => t.length > 0)
      .join(" ")

    if (extractedText.length > 100) {
      return extractedText.substring(0, 10000)
    }

    text = buffer.toString("utf8")
    return text
      .replace(/[^\w\s.,!?-]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 0)
      .slice(0, 3000)
      .join(" ")
      .substring(0, 10000)
  } catch (error) {
    console.error("[v0] PDF extraction error:", error)
    return buffer.toString("utf8").substring(0, 10000)
  }
}

async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  try {
    const { default: JSZip } = await import("jszip")
    const uint8Array = new Uint8Array(buffer)
    const zip = new JSZip()
    await zip.loadAsync(uint8Array)

    // Read document.xml which contains the actual text
    const documentXml = zip.file("word/document.xml")

    if (documentXml) {
      const xmlString = await documentXml.async("string")
      console.log("[v0] XML content length:", xmlString.length)

      // Extract all text nodes from the XML
      const textMatches = xmlString.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || []
      console.log("[v0] Found text matches:", textMatches.length)

      const text = textMatches
        .map((match) => match.replace(/<[^>]+>/g, ""))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim()

      console.log("[v0] Extracted text length:", text.length)
      if (text.length > 0) {
        return text.substring(0, 10000)
      }
    }

    // If jszip extraction fails, try as UTF-8 text
    const text = buffer.toString("utf8")
    const textMatches = text.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || []
    if (textMatches.length > 0) {
      const extracted = textMatches.map((m) => m.replace(/<[^>]+>/g, "")).join(" ")
      if (extracted.length > 0) {
        return extracted.substring(0, 10000)
      }
    }

    // Last resort: return raw UTF-8 with cleanup
    return buffer
      .toString("utf8")
      .replace(/[^\w\s.,!?-]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 0)
      .slice(0, 3000)
      .join(" ")
      .substring(0, 10000)
  } catch (error) {
    console.error("[v0] DOCX extraction error:", error)
    return "Unable to extract document text. Please ensure the file is a valid .docx file."
  }
}

async function imageBufferToBase64(buffer: Buffer, mimeType: string): Promise<string> {
  return `data:${mimeType};base64,${buffer.toString("base64")}`
}

async function processFileContent(file: File, fileType: string): Promise<{ type: "text" | "image"; content: string }> {
  const buffer = Buffer.from(await file.arrayBuffer())

  if (fileType === "application/pdf") {
    return { type: "text", content: await extractTextFromPDF(buffer) }
  } else if (
    fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    fileType === "application/msword"
  ) {
    return { type: "text", content: await extractTextFromDocx(buffer) }
  } else if (fileType.startsWith("image/")) {
    const base64DataUrl = await imageBufferToBase64(buffer, fileType)
    return { type: "image", content: base64DataUrl }
  } else if (fileType.startsWith("text/")) {
    return { type: "text", content: buffer.toString("utf8").substring(0, 10000) }
  }

  return { type: "text", content: buffer.toString("utf8").substring(0, 10000) }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const message = formData.get("prompt") as string
    const file = formData.get("file") as File | null
    const language = (formData.get("language") as string) || "en"

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

    const creditCost = file ? 3 : 2

    if (totalCredits < creditCost) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 402 })
    }

    let newMonthlyCredits = monthlyCredits
    let newPurchasedCredits = purchasedCredits

    if (monthlyCredits >= creditCost) {
      newMonthlyCredits -= creditCost
    } else if (monthlyCredits > 0) {
      const remaining = creditCost - monthlyCredits
      newMonthlyCredits = 0
      newPurchasedCredits -= remaining
    } else {
      newPurchasedCredits -= creditCost
    }

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

    let fileContent = { type: "text" as const, content: "" }
    if (file) {
      fileContent = await processFileContent(file, file.type)
    }

    const languageInstruction = language !== "en" ? `\n\nRespond exclusively in ${getLanguageName(language)}.` : ""

    let fullPrompt: string | { type: "image" | "text"; text?: string; image?: string }[] = ""

    if (fileContent.type === "image") {
      // For images, use the content array format for Vision API
      fullPrompt = [
        {
          type: "image" as const,
          image: fileContent.content,
        },
        {
          type: "text" as const,
          text: `${message}\n\nPlease analyze and describe the visual content of this image in detail, including any text, diagrams, charts, or important visual elements.${languageInstruction}`,
        },
      ]
    } else {
      // For text documents
      fullPrompt =
        fileContent.content && fileContent.content.length > 0
          ? `File: ${file?.name || "document"}\n\nContent:\n${fileContent.content}\n\nUser request: ${message}${languageInstruction}`
          : `${message}${languageInstruction}`
    }

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: typeof fullPrompt === "string" ? fullPrompt : undefined,
      // @ts-ignore - Vision API format
      messages: typeof fullPrompt !== "string" ? [{ role: "user" as const, content: fullPrompt }] : undefined,
    })

    return NextResponse.json({
      response: text,
      creditsUsed: creditCost,
      creditsRemaining: newMonthlyCredits + newPurchasedCredits,
    })
  } catch (error) {
    console.error("[v0] Error in AI chat with file:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
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
