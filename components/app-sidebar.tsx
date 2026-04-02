"use client"

import {
  Home,
  Calendar,
  CheckSquare,
  FileText,
  Heart,
  Timer,
  BarChart3,
  Bot,
  Trophy,
  CreditCard,
  Settings,
  LogOut,
  Users,
  Activity,
} from "@/components/icons"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useEffect, useState } from "react"
import { useTranslation } from "@/hooks/useTranslation"

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const { t, language, setLanguage } = useTranslation()
  const [subscriptionTier, setSubscriptionTier] = useState<string | null>(null)
  const [purchasedCredits, setPurchasedCredits] = useState(0)

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const response = await fetch("/api/settings")
        const data = await response.json()
        if (data.profile?.language) {
          setLanguage(data.profile.language)
        }
      } catch (error) {
        // Language will default to context's initial value
      }
    }
    loadLanguage()
  }, [setLanguage])

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/user/profile")
        if (response.ok) {
          const data = await response.json()
          setSubscriptionTier(data.subscription_plan || "free")
          setPurchasedCredits(data.ai_credits_purchased || 0)
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      }
    }
    fetchProfile()
  }, [])

  useEffect(() => {
    // Force re-render when language changes to update menu items
  }, [language])

  const menuItemsTranslated = [
    { icon: Home, label: t("dashboard"), href: "/app" },
    { icon: Calendar, label: t("calendar"), href: "/app/calendar" },
    { icon: CheckSquare, label: t("tasks"), href: "/app/tasks" },
    { icon: Activity, label: t("habit_tracker") || "Habits", href: "/app/habits" },
    { icon: FileText, label: t("notes"), href: "/app/notes" },
    { icon: Heart, label: t("wishlist"), href: "/app/wishlist" },
    { icon: Timer, label: t("pomodoro"), href: "/app/pomodoro" },
    { icon: BarChart3, label: t("stats"), href: "/app/stats" },
    { icon: Bot, label: t("ai"), href: "/app/ai" },
    { icon: Users, label: t("teams"), href: "/app/teams" },
    { icon: Trophy, label: t("achievements"), href: "/app/achievements" },
    { icon: CreditCard, label: t("subscription"), href: "/app/subscription" },
    { icon: Settings, label: t("settings"), href: "/app/settings" },
  ]

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
  }

  const handleNavClick = () => {
    if (onNavigate) {
      onNavigate()
    }
  }

  return (
    <div className="flex flex-col h-full w-full border-r border-primary/20 bg-background overflow-hidden">
      {/* Logo */}
      <div className="p-4 sm:p-6 border-b border-primary/20 flex-shrink-0">
        <Link href="/app" className="flex items-center gap-2 sm:gap-3 group" onClick={handleNavClick}>
          <Image
            src="/future-task-logo-64x64.png"
            alt="Future Task"
            width={40}
            height={40}
            className="w-9 sm:w-10 h-9 sm:h-10 rounded-lg flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
          />
          <div className="hidden sm:block">
            <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Future</span>
            <span className="text-lg font-bold ml-1">Task</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 sm:px-3 py-3 sm:py-4">
        <nav className="space-y-1 sm:space-y-2">
          {menuItemsTranslated.map((item) => {
            const isActive = pathname === item.href

            return (
              <Link key={item.href} href={item.href} onClick={handleNavClick}>
                <Button
                  variant="ghost"
                  title={item.label}
                  className={`w-full justify-start gap-2 sm:gap-3 px-3 sm:px-4 py-2 h-auto rounded-lg transition-all duration-300 ${
                    isActive
                      ? "bg-primary/20 text-primary border border-primary/50 shadow-lg shadow-primary/20"
                      : "text-foreground/70 hover:text-foreground hover:bg-primary/10 border border-transparent"
                  }`}
                >
                  <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-primary" : ""}`} />
                  <span className="font-medium inline sm:inline text-sm lg:text-base">{item.label}</span>
                  {isActive && <div className="ml-auto w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      <div className="p-3 sm:p-4 border-t border-primary/20 space-y-2 flex-shrink-0">
        <Button
          variant="ghost"
          title={t("logout")}
          className="w-full justify-start gap-2 sm:gap-3 px-3 sm:px-4 py-2 h-auto rounded-lg text-foreground/70 hover:text-destructive hover:bg-destructive/10 transition-all duration-300"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium inline sm:inline text-sm lg:text-base">{t("logout")}</span>
        </Button>
      </div>
    </div>
  )
}
