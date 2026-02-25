import HomePageClient from "./HomePageClient"

// Revalidate every 60 seconds for ISR (Incremental Static Regeneration)
export const revalidate = 60

export const metadata = {
  title: "Future Task - Smart Task Management",
  description: "Organize your tasks, notes, and projects with AI-powered assistance",
  other: {
    "google-adsense-account": "ca-pub-3746054566396266",
  },
}

export default function HomePage() {
  return <HomePageClient />
}
