import type React from "react"
import type { Metadata } from "next"
import Script from "next/script"
import "./globals.css"
import { ThemeLoader } from "@/components/theme-loader"
import { LanguageProvider } from "@/contexts/language-context"
import { HelpChatbot } from "@/components/help-chatbot"
import { ScrollToTop } from "@/components/scroll-to-top"

export const metadata: Metadata = {
  title: "Future Task - Smart Task Management & Productivity App",
  description: "Organize your tasks, notes, and projects with AI-powered assistance. Master task management with our intelligent platform.",
  generator: "v0.app",
  manifest: "/manifest.json",
  keywords: ["task management", "productivity app", "AI assistant", "todo list", "team collaboration", "task tracking", "productivity tools"],
  authors: [{ name: "Future Task" }],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon-16x16.jpg", sizes: "16x16", type: "image/jpeg" },
      { url: "/favicon-32x32.jpg", sizes: "32x32", type: "image/jpeg" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.jpg", sizes: "180x180", type: "image/jpeg" }],
    shortcut: [{ url: "/favicon.ico" }],
  },
  verification: {
    other: {
      "google-adsense-account": ["ca-pub-3746054566396266"],
    },
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: "cover",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Future Task - Smart Task Management",
    description: "Organize your tasks with AI-powered assistance and seamless collaboration",
    siteName: "Future Task",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" data-theme="default" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Future Task" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="color-scheme" content="light dark" />
        <link rel="canonical" href="https://future-task.com" />
        <script
          type="text/javascript"
          src="//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js"
          async
        />
      </head>
      <body className="font-sans antialiased" style={{ backgroundColor: 'hsl(var(--color-background))', color: 'hsl(var(--color-foreground))' }}>
        <ThemeLoader />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3746054566396266"
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
        <LanguageProvider>
          {children}
          <ScrollToTop />
          <HelpChatbot />
        </LanguageProvider>
      </body>
    </html>
  )
}

