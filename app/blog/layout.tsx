import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Blog - Future Task",
  description: "Discover tips, strategies, and insights to boost your productivity",
  verification: {
    other: {
      "google-adsense-account": ["ca-pub-3746054566396266"],
    },
  },
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
