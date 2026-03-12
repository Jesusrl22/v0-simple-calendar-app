import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Forgot Password - Future Task",
  description: "Reset your Future Task account password",
  verification: {
    other: {
      "google-adsense-account": ["ca-pub-3746054566396266"],
    },
  },
}

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
