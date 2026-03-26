import type React from "react"
import type { Metadata, Viewport } from "next"
import Script from "next/script"
import "./globals.css"
import { ThemeLoader } from "@/components/theme-loader"
import { LanguageProvider } from "@/contexts/language-context"
import { HelpChatbot } from "@/components/help-chatbot"
import { ScrollToTop } from "@/components/scroll-to-top"
import { ErrorBoundary } from "@/components/error-boundary"
import "@/lib/error-suppressor"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
}

export const metadata: Metadata = {
  title: "Future Task",
  description: "Organize your tasks, notes, and projects with AI-powered assistance. Master task management with our intelligent platform.",
  generator: "v0.app",
  manifest: "/manifest.json",
  keywords: ["task management", "productivity app", "AI assistant", "todo list", "team collaboration", "task tracking", "productivity tools"],
  authors: [{ name: "Future Task" }],
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  verification: {
    other: {
      "google-adsense-account": ["ca-pub-3746054566396266"],
    },
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
        {/* Google Analytics */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-L2KH22ZLXW"
          strategy="afterInteractive"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-L2KH22ZLXW');
            `,
          }}
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
        <ErrorBoundary>
          <LanguageProvider>
            {children}
            <ScrollToTop />
            <HelpChatbot />
          </LanguageProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}

