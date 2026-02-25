"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Language } from "@/lib/translations"

type LanguageContextType = {
  language: Language
  setLanguage: (lang: Language) => void
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const savedLang = localStorage.getItem("language") as Language | null
    const browserLang = navigator.language.split("-")[0] as Language
    const validLanguages: Language[] = ["en", "es", "fr", "de", "it"]
    const initialLang =
      savedLang && validLanguages.includes(savedLang)
        ? savedLang
        : validLanguages.includes(browserLang)
          ? browserLang
          : "en"
    setLanguageState(initialLang)
    setMounted(true)

    const handleLanguageChange = () => {
      const newLang = localStorage.getItem("language") as Language | null
      if (newLang && validLanguages.includes(newLang)) {
        setLanguageState(newLang)
      }
    }

    window.addEventListener("languagechange", handleLanguageChange)
    window.addEventListener("storage", handleLanguageChange)

    return () => {
      window.removeEventListener("languagechange", handleLanguageChange)
      window.removeEventListener("storage", handleLanguageChange)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("language", lang)
    window.dispatchEvent(new Event("languagechange"))
  }

  return (
    <LanguageContext.Provider value={{ language: mounted ? language : "en", setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
