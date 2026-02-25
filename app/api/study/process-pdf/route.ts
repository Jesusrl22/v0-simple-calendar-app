import { type NextRequest, NextResponse } from "next/server"
import Groq from "groq-sdk"

export async function POST(req: NextRequest) {
  try {
    const { pdfText, fileName } = await req.json()

    if (!pdfText) {
      return NextResponse.json({ error: "PDF text is required" }, { status: 400 })
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY not configured", message: "Service temporarily unavailable" },
        { status: 500 },
      )
    }

    const groq = new Groq({ apiKey })

    console.log("[v0] Processing PDF:", fileName)

    const response = await groq.chat.completions.create({
      model: "mixtral-8x7b-32768",
      max_tokens: 2048,
      messages: [
        {
          role: "system",
          content:
            "You are an expert study assistant. Analyze the provided document and create a comprehensive study guide. Include: 1) Main concepts summary, 2) Key points list, 3) Important definitions, 4) Study questions. Format your response clearly with sections.",
        },
        {
          role: "user",
          content: `Please analyze this document and create a study guide:\n\n${pdfText.substring(0, 3000)}`,
        },
      ],
      temperature: 0.5,
    })

    const analysis = response.choices[0]?.message?.content || "Unable to analyze document"

    console.log("[v0] PDF analysis completed")

    return NextResponse.json({
      analysis,
      fileName,
      success: true,
    })
  } catch (error) {
    console.error("[v0] PDF Processing Error:", error instanceof Error ? error.message : error)
    return NextResponse.json(
      {
        error: "Failed to process PDF",
        message: "Unable to analyze the PDF. Please try again.",
      },
      { status: 500 },
    )
  }
}
