export type SubscriptionTier = "free" | "premium" | "pro"

export interface SubscriptionAccess {
  notes: boolean
  wishlist: boolean
  ai: boolean
  futureTasks: boolean
  admin: boolean
}

export function getSubscriptionAccess(tier: SubscriptionTier | null): SubscriptionAccess {
  const normalizedTier = tier?.toLowerCase() as SubscriptionTier

  switch (normalizedTier) {
    case "pro":
      return {
        notes: true,
        wishlist: true,
        ai: true,
        futureTasks: true,
        admin: false,
      }
    case "premium":
      return {
        notes: true,
        wishlist: true,
        ai: true,
        futureTasks: true,
        admin: false,
      }
    case "free":
    default:
      return {
        notes: false,
        wishlist: false,
        ai: false, // Will be checked separately with purchased credits
        futureTasks: false,
        admin: false,
      }
  }
}

export function canAccessFeature(tier: SubscriptionTier | null, feature: keyof SubscriptionAccess): boolean {
  const access = getSubscriptionAccess(tier)
  return access[feature]
}

export function canAccessAdvancedPomodoro(tier: SubscriptionTier | null): boolean {
  const normalizedTier = tier?.toLowerCase() as SubscriptionTier
  return normalizedTier === "premium" || normalizedTier === "pro"
}

export function canAccessStatistics(tier: SubscriptionTier | null): boolean {
  const normalizedTier = tier?.toLowerCase() as SubscriptionTier
  return normalizedTier === "pro"
}

export function canAccessCustomTheme(tier: SubscriptionTier | null): boolean {
  const normalizedTier = tier?.toLowerCase() as SubscriptionTier
  return normalizedTier === "pro"
}

export function getAICredits(tier: SubscriptionTier | null): number {
  const normalizedTier = tier?.toLowerCase() as SubscriptionTier
  switch (normalizedTier) {
    case "pro":
      return 500
    case "premium":
      return 100
    case "free":
    default:
      return 0
  }
}

export function canAccessAI(tier: SubscriptionTier | null, purchasedCredits = 0): boolean {
  const normalizedTier = tier?.toLowerCase() as SubscriptionTier
  // Premium and Pro always have access
  if (normalizedTier === "premium" || normalizedTier === "pro") {
    return true
  }
  // Free users can access if they have purchased credits
  return purchasedCredits > 0
}
