"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Star } from "lucide-react"
import { useTranslation } from "@/lib/use-translation"
import { TrustpilotCarousel, TrustpilotMiniWidget, TrustpilotCTA } from "@/components/trustpilot-widget"
import { useLanguage } from "@/contexts/language-context"

interface UserReviewsProps {
  isDarkMode?: boolean
}

export function UserReviews({ isDarkMode = false }: UserReviewsProps) {
  const t = useTranslation()
  const { language } = useLanguage()

  return (
    <section className="w-full bg-gradient-to-b from-background to-background/80 py-12 sm:py-16 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 space-y-3 sm:space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
            {t("user_reviews_title") || "Lo que Dicen Nuestros Usuarios"}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            {t("verifiedReviewsTrustpilot") || "Reseñas verificadas de Trustpilot"}
          </p>
        </div>

        {/* Rating Widget */}
        <div className="flex justify-center mb-8 sm:mb-12">
          <div className="w-full max-w-md">
            <TrustpilotMiniWidget />
          </div>
        </div>

        {/* Carousel */}
        <div className="mb-8 sm:mb-12">
          <TrustpilotCarousel />
        </div>

        {/* CTA Section */}
        <div className="mt-8 sm:mt-12">
          <TrustpilotCTA locale={language} />
        </div>
      </div>
    </section>
  )
}
