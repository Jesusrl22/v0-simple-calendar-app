import { type NextRequest, NextResponse } from "next/server"
import Groq from "groq-sdk"

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json()

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      console.error("[v0] GROQ_API_KEY not configured")
      return NextResponse.json(
        { error: "GROQ_API_KEY not configured", message: "Service temporarily unavailable" },
        { status: 500 },
      )
    }

    const groq = new Groq({
      apiKey: apiKey,
    })

    console.log("[v0] Calling Groq API with message:", message.substring(0, 50) + "...")

    const response = await groq.chat.completions.create({
      model: "mixtral-8x7b-32768",
      max_tokens: 1024,
      messages: [
        {
          role: "system",
          content:
            "You are a helpful study assistant. Provide clear, educational explanations. Help users understand concepts, create study plans, quiz them on topics, and give learning advice. Keep responses concise but informative.",
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.7,
    })

    const text = response.choices[0]?.message?.content || "Unable to generate response"

    console.log("[v0] Groq response received, length:", text.length)

    return NextResponse.json({
      response: text,
      message: text,
    })
  } catch (error) {
    console.error("[v0] Study AI Error:", error instanceof Error ? error.message : error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      {
        error: "Failed to generate response",
        message: "Sorry, I couldn't generate a response. Please try again.",
        details: errorMessage,
      },
      { status: 500 },
    )
  }
}
