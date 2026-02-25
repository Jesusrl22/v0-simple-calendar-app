"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Check, Zap, ShoppingCart } from "@/components/icons"
import dynamic from "next/dynamic"
import { PayPalSubscriptionButton } from "@/components/paypal-subscription-button"
import { useTranslation } from "@/hooks/useTranslation"

const CreditPacksModal = dynamic(() => import("@/components/credit-packs-modal").then((mod) => mod.CreditPacksModal), {
  ssr: false,
  loading: () => <div>Loading...</div>,
})

const plans = [
  {
    nameKey: "plan_free",
    monthlyPrice: 0,
    annualPrice: 0,
    credits: 0,
    monthlyPlanId: null,
    annualPlanId: null,
    features: [
      "subscription_feature_ai_credits_free",
      "subscription_feature_calendar",
      "subscription_feature_unlimited_tasks",
      "subscription_feature_basic_pomodoro",
      "subscription_feature_free_themes",
      "subscription_feature_free_achievements",
      "subscription_feature_basic_settings",
    ],
  },
  {
    nameKey: "plan_premium",
    monthlyPrice: 2.49,
    annualPrice: 24.99,
    credits: 100,
    monthlyPlanId: "P-29883874AF135140VNDN3GSI",
    annualPlanId: "P-51R760946S251264PNEXLCXA",
    features: [
      "subscription_feature_ai_credits_premium",
      "subscription_feature_everything_free",
      "subscription_feature_advanced_pomodoro",
      "subscription_feature_notes",
      "subscription_feature_wishlist",
      "subscription_feature_premium_themes",
      "subscription_feature_premium_achievements",
      "subscription_feature_premium_teams",
      "subscription_feature_shared_tasks",
      "subscription_feature_task_assignment",
      "subscription_feature_team_members_view",
    ],
    popular: true,
  },
  {
    nameKey: "plan_pro",
    monthlyPrice: 6.49,
    annualPrice: 64.9,
    credits: 500,
    monthlyPlanId: "P-4L790010RN962751KNEW7AZY",
    annualPlanId: "P-3D496349LL1798321NEXLAYY",
    features: [
      "subscription_feature_ai_credits_pro",
      "subscription_feature_everything_premium",
      "subscription_feature_statistics",
      "subscription_feature_custom_themes",
      "subscription_feature_all_themes",
      "subscription_feature_pro_achievements",
      "subscription_feature_priority_support",
      "subscription_feature_pro_teams",
      "subscription_feature_team_calendar",
      "subscription_feature_team_comments",
      "subscription_feature_team_stats",
      "subscription_feature_team_members_view",
    ],
  },
]

export default function SubscriptionPage() {
  const { t } = useTranslation()
  const [currentPlan, setCurrentPlan] = useState("free")
  const [monthlyCredits, setMonthlyCredits] = useState(0)
  const [purchasedCredits, setPurchasedCredits] = useState(0)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreditPacks, setShowCreditPacks] = useState(false)
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly")
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    fetchSubscription()

    const interval = setInterval(() => {
      fetchSubscription()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const fetchSubscription = async () => {
    try {
      const response = await fetch("/api/user/profile", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })
      if (response.ok) {
        const data = await response.json()
        setCurrentPlan(data.subscription_tier || "free")
        setMonthlyCredits(data.ai_credits_monthly || 0)
        setPurchasedCredits(data.ai_credits_purchased || 0)
        setExpiresAt(data.subscription_expires_at || null)
      }
    } catch (error) {
      console.error("Error fetching subscription:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (planName: string) => {
    return
    alert(`Upgrade to ${planName} plan - Payment integration coming soon!`)
  }

  const handleCancelSubscription = async () => {
    if (!confirm(t("cancel_subscription_description"))) {
      return
    }

    setCancelling(true)
    try {
      const response = await fetch("/api/subscription/cancel", {
        method: "POST",
      })

      if (response.ok) {
        alert(t("subscription_cancelled_successfully"))
        await fetchSubscription()
      } else {
        alert(t("failed_cancel_subscription"))
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error)
      alert(t("error_occurred"))
    } finally {
      setCancelling(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
  }

  const totalCredits = monthlyCredits + purchasedCredits

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="hidden md:block text-4xl font-bold mb-8">
            <span className="text-primary neon-text">{t("subscription")}</span>
          </h1>

          <Card className="glass-card p-4 md:p-6 neon-glow mb-6 md:mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold mb-2">
                  {t("current_plan")}: {t(`plan_${currentPlan}`)}
                </h2>
                <p className="text-sm text-muted-foreground">{t("manage_subscription")}</p>
                {expiresAt && (
                  <p className="text-xs md:text-sm text-orange-500 mt-2">
                    {t("plan_expires")}: {formatDate(expiresAt)}
                  </p>
                )}
              </div>
              {totalCredits > 0 && (
                <div className="text-center">
                  <Zap className="w-10 h-10 md:w-12 md:h-12 text-primary mx-auto mb-2" />
                  <p className="text-xl md:text-2xl font-bold text-primary">
                    {totalCredits} {t("credits")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {monthlyCredits} {t("monthly_credits")} · {purchasedCredits} {t("purchased_credits")}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {currentPlan !== "free" && (
            <Card className="glass-card p-4 mb-6 border-orange-500/50">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold mb-1">{t("cancel_subscription")}</h3>
                  <p className="text-sm text-muted-foreground">{t("cancel_subscription")}</p>
                </div>
                <Button
                  variant="destructive"
                  onClick={handleCancelSubscription}
                  disabled={cancelling}
                  className="w-full md:w-auto"
                >
                  {cancelling ? t("processing") : t("cancel_plan")}
                </Button>
              </div>
            </Card>
          )}

          <div className="mb-6 md:mb-8">
            <Button
              onClick={() => setShowCreditPacks(true)}
              className="w-full md:w-auto neon-glow-hover"
              size="lg"
              disabled
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {t("buy_extra_credits")}
            </Button>
            <p className="text-sm text-muted-foreground mt-2">{t("purchase_additional_credits")}</p>
          </div>

          <div className="flex justify-center mb-6 md:mb-8">
            <div className="inline-flex items-center gap-2 p-1 bg-muted rounded-lg">
              <Button
                variant={billingPeriod === "monthly" ? "default" : "ghost"}
                size="sm"
                onClick={() => setBillingPeriod("monthly")}
                className={billingPeriod === "monthly" ? "neon-glow" : ""}
              >
                {t("billing_monthly")}
              </Button>
              <Button
                variant={billingPeriod === "annual" ? "default" : "ghost"}
                size="sm"
                onClick={() => setBillingPeriod("annual")}
                className={billingPeriod === "annual" ? "neon-glow" : ""}
              >
                {t("billing_annual")}
                <span className="ml-2 text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded">
                  {t("save_20_percent")}
                </span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {plans.map((plan) => {
              const price = billingPeriod === "monthly" ? plan.monthlyPrice : plan.annualPrice
              const planId = billingPeriod === "monthly" ? plan.monthlyPlanId : plan.annualPlanId
              const periodLabel = billingPeriod === "monthly" ? t("billing_monthly") : t("billing_annual")
              const isCurrentPlan = currentPlan.toLowerCase() === plan.nameKey.replace("plan_", "").toLowerCase()

              return (
                <motion.div
                  key={plan.nameKey}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`relative ${plan.popular ? "md:scale-105" : ""}`}
                >
                  <Card
                    className={`p-8 relative flex flex-col h-full ${plan.popular ? "border-primary ring-2 ring-primary/20" : ""}`}
                  >
                    {plan.popular && (
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                        {t("popular")}
                      </div>
                    )}

                    <h3 className="text-2xl font-bold mb-2 text-foreground">{t(plan.nameKey)}</h3>

                    <div className="mb-6">
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-4xl font-bold text-primary">
                          ${billingPeriod === "monthly" ? plan.monthlyPrice : plan.annualPrice}
                        </span>
                        <span className="text-muted-foreground">
                          /{billingPeriod === "monthly" ? t("month") : t("year")}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <Zap className="w-4 h-4" />
                        <span>
                          {plan.credits} {t("monthly_ai_credits")} {t("ai_credits")}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-8 flex-1">
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-foreground">{t(feature)}</span>
                        </div>
                      ))}
                    </div>

                    {isCurrentPlan ? (
                      <Button disabled className="w-full">
                        {t("current_plan")}
                      </Button>
                    ) : plan.monthlyPrice === 0 ? (
                      <Button disabled className="w-full opacity-50">
                        {t("free_plan")}
                      </Button>
                    ) : (
                      <PayPalSubscriptionButton
                        planId={planId || ""}
                        planName={plan.nameKey.replace("plan_", "")}
                        onSuccess={() => {
                          fetchSubscription()
                        }}
                      />
                    )}
                  </Card>
                </motion.div>
              )
            })}
          </div>

          <CreditPacksModal open={showCreditPacks} onOpenChange={setShowCreditPacks} userPlan={currentPlan} />
        </motion.div>
      )}
    </div>
  )
}
