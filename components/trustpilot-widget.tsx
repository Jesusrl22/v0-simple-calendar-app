"use client"

import React from "react"
import { useEffect } from "react"
import { useLanguage } from "@/contexts/language-context"
import { useTranslation } from "@/hooks/useTranslation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Star } from "lucide-react"

interface TrustpilotWidgetProps {
  templateId?: string
  height?: string
  theme?: "light" | "dark"
}

export function TrustpilotWidget({ 
  templateId = "56278e9abfbbba0bdcd568bc", 
  height = "52px",
  theme = "light" 
}: TrustpilotWidgetProps) {
  const { language } = useLanguage()

  // Map language codes to Trustpilot locales
  const getTrustpilotLocale = (lang: string) => {
    const localeMap: Record<string, string> = {
      es: "es-ES",
      en: "en-US",
      fr: "fr-FR",
      de: "de-DE",
      it: "it-IT",
      pt: "pt-BR",
      ru: "ru-RU",
      zh: "zh-CN",
      ja: "ja-JP",
      ko: "ko-KR",
      ar: "ar-AE",
      hi: "hi-IN",
    }
    return localeMap[lang] || "en-US"
  }

  useEffect(() => {
    // Wait for Trustpilot script to load
    const checkAndLoad = () => {
      if (typeof window !== "undefined" && (window as any).Trustpilot) {
        const element = document.getElementById("trustpilot-widget")
        if (element) {
          ;(window as any).Trustpilot.loadFromElement(element, true)
        }
      } else {
        setTimeout(checkAndLoad, 500)
      }
    }
    
    checkAndLoad()
  }, [language])

  return (
    <div
      id="trustpilot-widget"
      className="trustpilot-widget"
      data-locale={getTrustpilotLocale(language)}
      data-template-id={templateId}
      data-businessunit-id="63a5f4eee19b8abb0b35f82f"
      data-style-height={height}
      data-style-width="100%"
      data-theme={theme}
      data-token="7b27f41d-88e4-4dea-938e-a3301b341de1"
    >
      <a href="https://www.trustpilot.com/review/future-task.com" target="_blank" rel="noopener">
        Trustpilot
      </a>
    </div>
  )
}

// Mini widget for reviews carousel (5-star rating display)
export function TrustpilotMiniWidget() {
  const { language } = useLanguage()

  const getTrustpilotLocale = (lang: string) => {
    const localeMap: Record<string, string> = {
      es: "es-ES",
      en: "en-US",
      fr: "fr-FR",
      de: "de-DE",
      it: "it-IT",
      pt: "pt-BR",
      ru: "ru-RU",
      zh: "zh-CN",
      ja: "ja-JP",
      ko: "ko-KR",
      ar: "ar-AE",
      hi: "hi-IN",
    }
    return localeMap[lang] || "en-US"
  }

  useEffect(() => {
    // Wait for Trustpilot script to load
    const checkAndLoad = () => {
      if (typeof window !== "undefined" && (window as any).Trustpilot) {
        const element = document.getElementById("trustpilot-mini")
        if (element) {
          ;(window as any).Trustpilot.loadFromElement(element, true)
        }
      } else {
        setTimeout(checkAndLoad, 500)
      }
    }
    
    checkAndLoad()
  }, [language])

  return (
    <div
      id="trustpilot-mini"
      className="trustpilot-widget"
      data-locale={getTrustpilotLocale(language)}
      data-template-id="5419b6a8b0d04a076446a9ad"
      data-businessunit-id="63a5f4eee19b8abb0b35f82f"
      data-style-height="24px"
      data-style-width="100%"
      data-theme="light"
    >
      <a href="https://www.trustpilot.com/review/future-task.com" target="_blank" rel="noopener">
        Trustpilot
      </a>
    </div>
  )
}

// Reviews carousel widget - improved responsive design
export function TrustpilotCarousel() {
  const { language } = useLanguage()

  const getTrustpilotLocale = (lang: string) => {
    const localeMap: Record<string, string> = {
      es: "es-ES",
      en: "en-US",
      fr: "fr-FR",
      de: "de-DE",
      it: "it-IT",
      pt: "pt-BR",
      ru: "ru-RU",
      zh: "zh-CN",
      ja: "ja-JP",
      ko: "ko-KR",
      ar: "ar-AE",
      hi: "hi-IN",
    }
    return localeMap[lang] || "en-US"
  }

  useEffect(() => {
    // Wait for Trustpilot script to load
    const checkAndLoad = () => {
      if (typeof window !== "undefined" && (window as any).Trustpilot) {
        const element = document.getElementById("trustpilot-carousel")
        if (element) {
          ;(window as any).Trustpilot.loadFromElement(element, true)
        }
      } else {
        // Retry after a delay if Trustpilot not loaded yet
        setTimeout(checkAndLoad, 500)
      }
    }
    
    checkAndLoad()
  }, [language])

  return (
    <Card className="glass-card p-6 sm:p-8 border border-primary/20 hover:border-primary/40 transition-colors">
      <div
        id="trustpilot-carousel"
        className="trustpilot-widget w-full"
        data-locale={getTrustpilotLocale(language)}
        data-template-id="54ad5defc6454f065c28af8b"
        data-businessunit-id="63a5f4eee19b8abb0b35f82f"
        data-style-height="auto"
        data-style-width="100%"
        data-theme="light"
        data-stars="4,5"
        data-review-languages={language}
      >
        <a href="https://www.trustpilot.com/review/future-task.com" target="_blank" rel="noopener">
          Trustpilot
        </a>
      </div>
    </Card>
  )
}

// Featured reviews CTA section
export function TrustpilotCTA({ locale = "es" }: { locale?: string }) {
  const { language } = useLanguage()
  const { t } = useTranslation()

  const getTrustpilotUrl = (lang: string) => {
    const localeMap: Record<string, string> = {
      es: "es",
      en: "www",
      fr: "fr",
      de: "de",
      it: "it",
      pt: "pt",
      ru: "ru",
      zh: "cn",
      ja: "jp",
      ko: "kr",
    }
    const subdomain = localeMap[lang] || "www"
    return `https://${subdomain}.trustpilot.com/review/future-task.com`
  }

  const lang = locale || language

  return (
    <a
      href={getTrustpilotUrl(lang)}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full"
    >
      <Card className="glass-card p-6 sm:p-8 border border-primary/20 hover:border-primary/40 transition-all duration-300 group cursor-pointer">
        <div className="text-center space-y-4 sm:space-y-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto group-hover:bg-primary/30 transition-colors">
            <Star className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          </div>
          <div>
            <h3 className="text-lg sm:text-2xl font-semibold">{t("seeAndWriteReviews")}</h3>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">
              {t("seeAndWriteReviewsDescription")}
            </p>
          </div>
          <div className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 sm:px-8 py-3 sm:py-4 rounded-lg inline-flex items-center justify-center gap-2 transition-all text-sm sm:text-base font-medium group-hover:shadow-lg">
            {t("seeAndWriteReviews")}
            <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>
      </Card>
    </a>
  )
}
