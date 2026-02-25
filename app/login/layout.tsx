import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Login - Future Task",
  description: "Sign in to your Future Task account",
  verification: {
    other: {
      "google-adsense-account": ["ca-pub-3746054566396266"],
    },
  },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
