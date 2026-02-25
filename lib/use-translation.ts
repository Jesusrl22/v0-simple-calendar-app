"use client"

import { useContext } from "react"
import { LanguageContext } from "@/providers/language-provider"
import { getTranslation, type Language } from "@/lib/translations"

export function useTranslation() {
  const language = (useContext(LanguageContext) as Language) || "en"

  return (key: string): string => {
    return getTranslation(language, key as any)
  }
}
