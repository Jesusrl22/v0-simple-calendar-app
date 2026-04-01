const BREVO_API_KEY = process.env.BREVO_API_KEY
const BREVO_API_URL = "https://api.brevo.com/v3"

export interface SendEmailOptions {
  to: string
  subject: string
  htmlContent: string
  textContent?: string
}

export async function sendEmail(options: SendEmailOptions) {
  if (!BREVO_API_KEY) {
    console.error("[v0] BREVO_API_KEY not configured")
    return { success: false, error: "Email service not configured" }
  }

  try {
    const payload = {
      to: [{ email: options.to }],
      sender: { email: "noreply@future-task.com", name: "Future Task" },
      subject: options.subject,
      htmlContent: options.htmlContent,
      textContent: options.textContent,
    }

    const response = await fetch(`${BREVO_API_URL}/smtp/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("[v0] Brevo error response:", data)
      return { success: false, error: data.message || "Failed to send email" }
    }

    return { success: true, messageId: data.messageId }
  } catch (error: any) {
    console.error("[v0] Error sending email:", error.message)
    return { success: false, error: error.message }
  }
}

