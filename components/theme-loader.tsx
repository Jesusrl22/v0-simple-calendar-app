"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { applyTheme } from "@/lib/themes"

export function ThemeLoader() {
  const pathname = usePathname()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const isPublicPage =
      pathname === "/" ||
      pathname === "/blog" ||
      pathname === "/login" ||
      pathname === "/signup" ||
      pathname === "/forgot-password" ||
      pathname === "/reset-password" ||
      pathname === "/auth/confirm" ||
      pathname === "/auth/reset" ||
      pathname === "/contact" ||
      pathname === "/admin" ||
      pathname === "/privacy" ||
      pathname === "/terms" ||
      pathname?.startsWith("/blog/") ||
      pathname?.startsWith("/invite/")

    if (isPublicPage) {
      applyTheme("default")
      setIsInitialized(true)
      return
    }

    const initializeTheme = async () => {
      try {
        const response = await fetch("/api/settings")
        if (response.ok) {
          const data = await response.json()
          const dbTheme = data.profile?.theme || "default"

          // Get custom themes from localStorage
          let customThemes = []
          const savedThemes = localStorage.getItem("customThemes")
          if (savedThemes) {
            try {
              customThemes = JSON.parse(savedThemes)
            } catch (e) {
              customThemes = []
            }
          }

          localStorage.setItem("theme", dbTheme)

          // Check if the theme is a custom theme
          const customTheme = customThemes.find((t: any) => t.id === dbTheme)
          if (customTheme) {
            applyTheme(dbTheme, customTheme.primary, customTheme.secondary)
          } else {
            applyTheme(dbTheme)
          }
        } else {
          const savedTheme = localStorage.getItem("theme") || "default"
          applyTheme(savedTheme)
        }
      } catch (error) {
        const savedTheme = localStorage.getItem("theme") || "default"
        applyTheme(savedTheme)
      } finally {
        setIsInitialized(true)
      }
    }

    initializeTheme()
  }, [pathname])

  return null
}
