"use client"

import { createContext, useState, useEffect, type ReactNode } from "react"
import type { Language } from "@/lib/translations"

export const LanguageContext = createContext<Language>("en")

interface LanguageProviderProps {
  children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>("en")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Get language from localStorage or browser preference
    const stored = localStorage.getItem("language") as Language
    const browserLang = (navigator.language || "en").split("-")[0] as Language
    const validLanguages: Language[] = ["en", "es", "fr", "de", "it"]

    const lang = stored || (validLanguages.includes(browserLang) ? browserLang : "en")
    setLanguage(lang)
    localStorage.setItem("language", lang)
    setMounted(true)
  }, [])

  if (!mounted) return <>{children}</>

  return <LanguageContext.Provider value={language}>{children}</LanguageContext.Provider>
}
