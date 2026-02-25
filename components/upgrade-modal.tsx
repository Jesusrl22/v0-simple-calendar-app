"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Lock, ShoppingCart } from "@/components/icons"
import { useTranslation } from "@/hooks/useTranslation"

interface UpgradeModalProps {
  feature: string
  requiredPlan: "premium" | "pro" | "free"
  isExclusivePro?: boolean
  customMessage?: string
}

export function UpgradeModal({ feature, requiredPlan, isExclusivePro = false, customMessage }: UpgradeModalProps) {
  const { t } = useTranslation()

  const showBothPlans = !isExclusivePro && requiredPlan !== "free"
  const displayPlan = isExclusivePro ? "pro" : requiredPlan === "free" ? "premium" : requiredPlan
  const planName = displayPlan === "pro" ? "Pro" : "Premium"
  const planPrice = displayPlan === "pro" ? "€6.49" : "€2.49"

  return (
    <div className="p-4 md:p-8">
      <Card className="glass-card p-8 md:p-12 text-center neon-glow max-w-2xl mx-auto">
        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 md:mb-6">
          <Lock className="w-6 h-6 md:w-8 md:h-8 text-primary" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          <span className="text-primary neon-text">{t("plan_required")}</span>
        </h2>
        <p className="text-sm md:text-base text-muted-foreground mb-2">
          {customMessage || `${feature} ${t("requires_plan")} ${showBothPlans ? "Premium or Pro" : planName}.`}
        </p>
        <p className="text-base md:text-lg mb-6 md:mb-8">
          {t("upgrade_to")} {showBothPlans ? "Premium" : planName} {t("for_just")}{" "}
          <span className="text-primary font-bold">{showBothPlans ? "€2.49 or €6.49" : planPrice}</span>
          /month {t("to_unlock")}.
        </p>

        {feature === t("ai_assistant") && (
          <div className="mb-6 md:mb-8 p-4 bg-secondary/20 rounded-lg border border-border/50">
            <p className="text-sm md:text-base mb-4">{t("or_purchase_credits")}</p>
            <Link href="/app/subscription">
              <Button size="lg" variant="secondary" className="neon-glow-hover w-full md:w-auto">
                <ShoppingCart className="w-4 h-4 mr-2" />
                {t("view_credit_packs")}
              </Button>
            </Link>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link href="/app/subscription" className="w-full md:w-auto">
            <Button size="lg" className="neon-glow-hover w-full">
              {t("upgrade_to")} {showBothPlans ? "Premium" : planName}
            </Button>
          </Link>
          {showBothPlans && (
            <Link href="/app/subscription" className="w-full md:w-auto">
              <Button size="lg" className="neon-glow-hover w-full bg-violet-600 hover:bg-violet-700 text-white">
                {t("upgrade_to")} Pro
              </Button>
            </Link>
          )}
          <Link href="/app" className="w-full md:w-auto">
            <Button size="lg" variant="outline" className="w-full bg-transparent">
              {t("go_to_dashboard")}
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
