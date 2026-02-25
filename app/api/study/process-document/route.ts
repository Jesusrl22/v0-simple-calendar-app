import { type NextRequest, NextResponse } from "next/server"
import Groq from "groq-sdk"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 })
    }

    const fileName = file.name
    const fileType = file.type
    let fileContent = ""

    if (fileType.includes("pdf")) {
      // For PDFs, we'll extract text using a simple approach
      const buffer = await file.arrayBuffer()
      // Since we don't have pdf-parse in this environment, send base64
      const base64 = Buffer.from(buffer).toString("base64")
      fileContent = `[PDF Content - Base64]\n${base64.substring(0, 3000)}`
    } else if (fileType.includes("image")) {
      // For images, convert to base64
      const buffer = await file.arrayBuffer()
      const base64 = Buffer.from(buffer).toString("base64")
      fileContent = `[Image - ${fileType}]\ndata:${fileType};base64,${base64}`
    } else if (fileType.includes("text") || fileType.includes("document")) {
      // For text files and documents
      fileContent = await file.text()
    } else {
      return NextResponse.json({ error: `Unsupported file type: ${fileType}` }, { status: 400 })
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY not configured", message: "Service temporarily unavailable" },
        { status: 500 },
      )
    }

    const groq = new Groq({ apiKey })

    console.log("[v0] Processing document:", fileName, "Type:", fileType, "Content length:", fileContent.length)

    let systemPrompt =
      "You are an expert study assistant and document analyzer. Analyze the provided document and create a comprehensive study guide with actionable insights."

    if (fileType.includes("image")) {
      systemPrompt +=
        " This appears to be an image (photo of notes, whiteboard, textbook, or diagram). Describe what you see, extract all visible text and concepts, and organize them into a study guide."
    } else if (fileType.includes("text") || fileType.includes("document")) {
      systemPrompt += " This is a document file. Extract key information and create a structured study guide."
    } else if (fileType.includes("pdf")) {
      systemPrompt += " This is content from a PDF document. Analyze and create a comprehensive study guide."
    }

    systemPrompt +=
      " Format your response with clear sections: 1) Title/Topic, 2) Main Concepts (bullet points), 3) Key Definitions, 4) Important Points to Remember, 5) Study Questions (5-7 questions), 6) Visual Diagram Description (if applicable). Be thorough and educational."

    const messageContent = fileType.includes("image")
      ? `Analyze this image and create a detailed study guide. Please extract all visible text, identify concepts, and provide structured learning material.\n\nImage content: ${fileContent.substring(0, 2000)}`
      : `Analyze this ${fileType.includes("pdf") ? "PDF" : "document"} and create a comprehensive study guide:\n\n${fileContent.substring(0, 4000)}`

    const response = await groq.chat.completions.create({
      model: "mixtral-8x7b-32768",
      max_tokens: 2048,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: messageContent,
        },
      ],
      temperature: 0.7,
    })

    const analysis = response.choices[0]?.message?.content || "Unable to analyze document"

    console.log("[v0] Document analysis completed successfully")

    return NextResponse.json({
      analysis,
      fileName,
      fileType,
      success: true,
    })
  } catch (error) {
    console.error("[v0] Document Processing Error:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      {
        error: "Failed to process document",
        message: "Unable to analyze the file. Please try again.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
