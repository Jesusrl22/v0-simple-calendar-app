export type ThemeTier = "free" | "premium" | "pro"

export interface Theme {
  id: string
  name: string
  tier: ThemeTier
  primary: string // Main accent color
  primaryForeground?: string // Primary foreground (defaults to text)
  secondary: string // Secondary accent
  secondaryForeground?: string // Secondary foreground (defaults to text)
  background: string // Main background
  foreground: string // Main text color
  card: string // Card background
  cardForeground: string // Card text color
  muted?: string // Muted backgrounds
  mutedForeground?: string // Muted text
  accent?: string // Accent color
  accentForeground?: string // Accent foreground
  border?: string // Border color
  input?: string // Input field color
  ring?: string // Focus ring color
  description: string
}

// Free themes - 5 basic themes including default
export const freeThemes: Theme[] = [
  {
    id: "default",
    name: "Default Dark",
    tier: "free",
    primary: "84 100% 65%", // Neon green
    secondary: "84 60% 45%",
    background: "0 0% 5%", // Very dark
    foreground: "0 0% 98%", // Almost white text
    card: "0 0% 10%",
    cardForeground: "0 0% 98%",
    description: "Original neon green theme",
  },
  {
    id: "light-mode",
    name: "Light Mode",
    tier: "free",
    primary: "210 70% 50%", // Blue accent
    secondary: "210 50% 70%",
    background: "0 0% 100%", // White
    foreground: "0 0% 10%", // Dark text
    card: "0 0% 95%",
    cardForeground: "0 0% 10%",
    description: "Clean light theme",
  },
  {
    id: "ocean-blue",
    name: "Ocean Blue",
    tier: "free",
    primary: "210 80% 55%", // Bright blue
    secondary: "200 60% 45%",
    background: "215 30% 15%", // Dark blue-gray
    foreground: "210 40% 98%", // Light blue-white
    card: "215 25% 20%",
    cardForeground: "210 40% 98%",
    description: "Calm blue tones",
  },
  {
    id: "forest-green",
    name: "Forest Green",
    tier: "free",
    primary: "140 60% 50%", // Bright green
    secondary: "130 50% 40%",
    background: "140 20% 12%", // Dark green-gray
    foreground: "140 30% 95%", // Light greenish-white
    card: "140 20% 18%",
    cardForeground: "140 30% 95%",
    description: "Natural green theme",
  },
  {
    id: "pink-blossom",
    name: "Pink Blossom",
    tier: "free",
    primary: "330 75% 65%", // Soft pink
    secondary: "340 65% 55%", // Rose pink
    background: "330 15% 96%", // Very light pink-white
    foreground: "330 30% 15%", // Dark pink-gray text
    card: "330 20% 92%",
    cardForeground: "330 30% 15%",
    description: "Soft pink light theme",
  },
]

// Premium themes - 5 more sophisticated themes
export const premiumThemes: Theme[] = [
  {
    id: "neon-tech",
    name: "Neon Tech",
    tier: "premium",
    primary: "180 100% 50%", // Cyan neon
    secondary: "280 80% 60%", // Purple accent
    background: "0 0% 8%",
    foreground: "180 100% 95%",
    card: "0 0% 12%",
    cardForeground: "180 100% 95%",
    description: "Cyberpunk neon aesthetic",
  },
  {
    id: "sunset-orange",
    name: "Sunset Orange",
    tier: "premium",
    primary: "25 95% 60%", // Bright orange
    secondary: "10 90% 55%", // Red-orange
    background: "25 30% 12%",
    foreground: "25 40% 98%",
    card: "25 25% 18%",
    cardForeground: "25 40% 98%",
    description: "Warm sunset gradient",
  },
  {
    id: "purple-haze",
    name: "Purple Haze",
    tier: "premium",
    primary: "270 80% 65%", // Bright purple
    secondary: "290 70% 55%",
    background: "270 30% 12%",
    foreground: "270 30% 98%",
    card: "270 25% 18%",
    cardForeground: "270 30% 98%",
    description: "Rich purple tones",
  },
  {
    id: "cyber-pink",
    name: "Cyber Pink",
    tier: "premium",
    primary: "330 85% 65%", // Hot pink
    secondary: "200 80% 60%", // Cyan
    background: "330 20% 10%",
    foreground: "330 30% 98%",
    card: "330 15% 15%",
    cardForeground: "330 30% 98%",
    description: "Cyberpunk vibes",
  },
  {
    id: "mint-fresh",
    name: "Mint Fresh",
    tier: "premium",
    primary: "160 70% 55%", // Bright mint
    secondary: "180 60% 50%",
    background: "160 25% 12%",
    foreground: "160 30% 98%",
    card: "160 20% 18%",
    cardForeground: "160 30% 98%",
    description: "Cool mint aesthetic",
  },
]

// Pro themes - 5 premium quality themes
export const proThemes: Theme[] = [
  {
    id: "aurora-borealis",
    name: "Aurora Borealis",
    tier: "pro",
    primary: "180 85% 55%", // Cyan-teal
    secondary: "280 75% 60%", // Purple
    background: "200 30% 10%",
    foreground: "180 40% 98%",
    card: "200 25% 15%",
    cardForeground: "180 40% 98%",
    description: "Northern lights inspired",
  },
  {
    id: "golden-hour",
    name: "Golden Hour",
    tier: "pro",
    primary: "45 95% 65%", // Bright gold
    secondary: "35 90% 60%", // Orange-gold
    background: "40 25% 12%",
    foreground: "45 30% 98%",
    card: "40 20% 18%",
    cardForeground: "45 30% 98%",
    description: "Warm golden gradient",
  },
  {
    id: "deep-ocean",
    name: "Deep Ocean",
    tier: "pro",
    primary: "200 85% 50%", // Deep blue
    secondary: "220 75% 45%",
    background: "210 40% 8%",
    foreground: "200 30% 98%",
    card: "210 35% 12%",
    cardForeground: "200 30% 98%",
    description: "Mysterious ocean depths",
  },
  {
    id: "lavender-dreams",
    name: "Lavender Dreams",
    tier: "pro",
    primary: "280 70% 70%", // Light lavender
    secondary: "260 60% 65%",
    background: "270 25% 12%",
    foreground: "280 20% 98%",
    card: "270 20% 18%",
    cardForeground: "280 20% 98%",
    description: "Soft lavender gradient",
  },
  {
    id: "fire-ember",
    name: "Fire & Ember",
    tier: "pro",
    primary: "15 95% 65%", // Bright red-orange
    secondary: "0 90% 60%", // Red
    background: "10 30% 10%",
    foreground: "15 30% 98%",
    card: "10 25% 15%",
    cardForeground: "15 30% 98%",
    description: "Fiery red and orange",
  },
]

export const allThemes = [...freeThemes, ...premiumThemes, ...proThemes]

export function getThemesByTier(userPlan: string): Theme[] {
  const plan = (userPlan || "free").toLowerCase().trim()

  if (plan === "pro") {
    return allThemes
  } else if (plan === "premium") {
    return [...freeThemes, ...premiumThemes]
  } else {
    return freeThemes
  }
}

export function canUseCustomTheme(userPlan: string): boolean {
  return userPlan.toLowerCase().trim() === "pro"
}

function hexToHSL(hex: string): string {
  // Remove the # if present
  hex = hex.replace(/^#/, "")

  // Parse the hex values
  const r = Number.parseInt(hex.substring(0, 2), 16) / 255
  const g = Number.parseInt(hex.substring(2, 4), 16) / 255
  const b = Number.parseInt(hex.substring(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  // Convert to HSL format for CSS variables (H S% L%)
  const hDeg = Math.round(h * 360)
  const sPercent = Math.round(s * 100)
  const lPercent = Math.round(l * 100)

  return `${hDeg} ${sPercent}% ${lPercent}%`
}

export function applyTheme(themeId: string, customPrimary?: string, customSecondary?: string) {
  // Only execute on client-side
  if (typeof document === "undefined") {
    return
  }

  const root = document.documentElement
  
  if (!root) {
    console.error("[v0] Could not find document root")
    return
  }

  if ((themeId.startsWith("custom-") || customPrimary || customSecondary) && customPrimary && customSecondary) {
    // Remove attribute first to force update
    root.removeAttribute("data-theme")
    
    // Convert hex to HSL if needed
    const primaryHSL = customPrimary.startsWith("#") ? hexToHSL(customPrimary) : customPrimary
    const secondaryHSL = customSecondary.startsWith("#") ? hexToHSL(customSecondary) : customSecondary
    
    // Force reflow to ensure changes apply
    void root.offsetHeight
    
    // Set all CSS variables for custom theme
    root.style.setProperty("--color-primary", primaryHSL)
    root.style.setProperty("--color-secondary", secondaryHSL)
    // Also set derived colors
    root.style.setProperty("--color-primary-foreground", "0 0% 5%")
    root.style.setProperty("--color-secondary-foreground", "0 0% 5%")
    root.style.setProperty("--color-accent", primaryHSL)
    root.style.setProperty("--color-accent-foreground", "0 0% 5%")

    // Set the attribute after styles
    root.setAttribute("data-theme", themeId)

    localStorage.setItem("theme", themeId)
    if (customPrimary) localStorage.setItem("customPrimary", customPrimary)
    if (customSecondary) localStorage.setItem("customSecondary", customSecondary)

    return
  }

  const theme = allThemes.find((t) => t.id === themeId)
  if (theme) {
    // Force theme change by resetting
    root.removeAttribute("data-theme")
    
    // Force reflow
    void root.offsetHeight
    
    // Set all CSS variables
    root.style.setProperty("--color-background", theme.background)
    root.style.setProperty("--color-foreground", theme.foreground)
    root.style.setProperty("--color-card", theme.card)
    root.style.setProperty("--color-card-foreground", theme.cardForeground)
    root.style.setProperty("--color-primary", theme.primary)
    root.style.setProperty("--color-primary-foreground", theme.primaryForeground || theme.foreground)
    root.style.setProperty("--color-secondary", theme.secondary)
    root.style.setProperty("--color-secondary-foreground", theme.secondaryForeground || theme.foreground)
    root.style.setProperty("--color-muted", theme.muted || "0 0% 45%")
    root.style.setProperty("--color-muted-foreground", theme.mutedForeground || theme.foreground)
    root.style.setProperty("--color-accent", theme.accent || theme.primary)
    root.style.setProperty("--color-accent-foreground", theme.accentForeground || theme.foreground)
    root.style.setProperty("--color-border", theme.border || theme.card)
    root.style.setProperty("--color-input", theme.input || theme.card)
    root.style.setProperty("--color-ring", theme.ring || theme.primary)
    
    // Set the attribute after styles
    root.setAttribute("data-theme", themeId)
  } else {
    console.warn("[v0] Theme not found:", themeId)
  }

  localStorage.setItem("theme", themeId)
}
