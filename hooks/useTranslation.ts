"use client"

import { useContext } from "react"
import { LanguageContext } from "@/contexts/language-context"
import { translations } from "@/lib/translations"

export function useTranslation() {
  const context = useContext(LanguageContext)

  if (!context) {
    // Fallback for server-side or when context is not available
    return {
      t: (key: string) => {
        const keys = key.split(".")
        let value: any = translations.en
        for (const k of keys) {
          value = value[k]
        }
        return value || key
      },
      language: "en" as const,
      setLanguage: () => {},
    }
  }

  const { language, setLanguage } = context

  const t = (key: string, replacements?: Record<string, string>) => {
    const keys = key.split(".")
    let value: any = translations[language]

    for (const k of keys) {
      value = value?.[k]
    }

    let result = value || key

    // Handle replacements like {plan} in strings
    if (replacements && typeof result === "string") {
      Object.keys(replacements).forEach((replaceKey) => {
        result = result.replace(`{${replaceKey}}`, replacements[replaceKey])
      })
    }

    return result
  }

  return { t, language, setLanguage }
}
