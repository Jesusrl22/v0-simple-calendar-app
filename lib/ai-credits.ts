import { createServerClient } from "@/lib/supabase/server"

export async function shouldResetMonthlyCredits(userId: string) {
  const supabase = await createServerClient()

  const { data: user, error } = await supabase
    .from("users")
    .select("last_credit_reset, ai_credits, subscription_tier")
    .eq("id", userId)
    .single()

  if (error) {
    console.error("Error fetching user for credit reset check:", error)
    return { shouldReset: false, remainingMonthlyCredits: 0, remainingPurchasedCredits: 0 }
  }

  if (!user) {
    return { shouldReset: false, remainingMonthlyCredits: 0, remainingPurchasedCredits: 0 }
  }

  const lastReset = user.last_credit_reset ? new Date(user.last_credit_reset) : new Date(0)
  const now = new Date()

  const lastResetMonth = new Date(lastReset.getFullYear(), lastReset.getMonth(), lastReset.getDate())
  const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())

  // If current month day is smaller than last reset day, go to previous month
  if (now.getDate() < lastReset.getDate()) {
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() + 1)
  }

  const shouldReset = lastResetMonth < oneMonthAgo

  return {
    shouldReset,
    currentMonthlyCredits: user.ai_credits || 0,
    subscriptionTier: user.subscription_tier,
  }
}

export async function resetMonthlyCreditsIfNeeded(userId: string) {
  const supabase = await createServerClient()

  const { data: user, error } = await supabase
    .from("users")
    .select("last_credit_reset, subscription_tier, ai_credits_purchased, ai_credits")
    .eq("id", userId)
    .single()

  if (error || !user) {
    console.error("Error fetching user for reset:", error)
    return { monthlyCredits: 0, purchasedCredits: 0, resetPerformed: false }
  }

  const now = new Date()
  const lastReset = user.last_credit_reset ? new Date(user.last_credit_reset) : null

  let shouldReset = false

  if (!lastReset) {
    shouldReset = true
    console.log("[v0] No previous reset found, resetting credits")
  } else {
    const lastResetDate = new Date(lastReset)
    const lastResetMonth = lastResetDate.getMonth()
    const lastResetYear = lastResetDate.getFullYear()
    const nowMonth = now.getMonth()
    const nowYear = now.getFullYear()

    // Reset if we're in a different month/year than the last reset
    if (lastResetMonth !== nowMonth || lastResetYear !== nowYear) {
      shouldReset = true
      console.log(
        `[v0] Month changed: last reset was ${lastResetMonth}/${lastResetYear}, now is ${nowMonth}/${nowYear}`,
      )
    } else {
      console.log(`[v0] Already reset this month (${nowMonth}/${nowYear})`)
    }
  }

  if (!shouldReset) {
    // No reset needed, return current credits
    return {
      monthlyCredits: user.ai_credits || 0,
      purchasedCredits: user.ai_credits_purchased || 0,
      resetPerformed: false,
    }
  }

  const tierCredits: Record<string, number> = {
    free: 0,
    premium: 100,
    pro: 500,
  }

  const monthlyCredits = tierCredits[user.subscription_tier?.toLowerCase() || "free"] || 0

  const { data: updatedUser, error: updateError } = await supabase
    .from("users")
    .update({
      ai_credits: monthlyCredits,
      last_credit_reset: now.toISOString(),
    })
    .eq("id", userId)
    .select("ai_credits, ai_credits_purchased")
    .single()

  if (updateError) {
    console.error("[v0] Error resetting credits:", updateError)
    return { monthlyCredits: 0, purchasedCredits: user.ai_credits_purchased || 0, resetPerformed: false }
  }

  console.log("[v0] Credits reset performed successfully:", {
    userId,
    monthlyCredits,
    purchasedCredits: updatedUser?.ai_credits_purchased,
    date: now.toISOString(),
  })

  return {
    monthlyCredits: updatedUser?.ai_credits || monthlyCredits,
    purchasedCredits: updatedUser?.ai_credits_purchased || 0,
    resetPerformed: true,
  }
}

export async function resetCreditsForPlanChange(userId: string) {
  const supabase = await createServerClient()

  const { data: user, error } = await supabase
    .from("users")
    .select("subscription_tier, ai_credits_purchased")
    .eq("id", userId)
    .single()

  if (error || !user) {
    console.error("Error fetching user for plan change reset:", error)
    return { monthlyCredits: 0, purchasedCredits: 0 }
  }

  const tierCredits: Record<string, number> = {
    free: 0,
    premium: 100,
    pro: 500,
  }

  const monthlyCredits = tierCredits[user.subscription_tier?.toLowerCase() || "free"] || 0

  const { data: updatedUser, error: updateError } = await supabase
    .from("users")
    .update({
      ai_credits: monthlyCredits,
      last_credit_reset: new Date().toISOString(),
    })
    .eq("id", userId)
    .select("ai_credits, ai_credits_purchased")
    .single()

  if (updateError) {
    console.error("[v0] Error resetting credits on plan change:", updateError)
    return { monthlyCredits: 0, purchasedCredits: user.ai_credits_purchased || 0 }
  }

  console.log("[v0] Credits reset on plan change:", {
    userId,
    newTier: user.subscription_tier,
    monthlyCredits,
    purchasedCredits: updatedUser?.ai_credits_purchased,
  })

  return {
    monthlyCredits: updatedUser?.ai_credits || monthlyCredits,
    purchasedCredits: updatedUser?.ai_credits_purchased || 0,
  }
}
