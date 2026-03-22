"use client"

import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { useTranslation } from "@/hooks/useTranslation"
import { ThemeLoader } from "@/components/theme-loader"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { t } = useTranslation()

  const getPageTitle = () => {
    const path = pathname.split("/").pop() || "app"
    const titleMap: { [key: string]: string } = {
      app: t("dashboard"),
      calendar: t("calendar"),
      tasks: t("tasks"),
      notes: t("notes"),
      pomodoro: t("pomodoro"),
      ai: t("ai"),
      teams: t("teams"),
      stats: t("stats"),
      achievements: t("achievements"),
      settings: t("settings"),
      subscription: t("subscription"),
      wishlist: t("wishlist"),
      habits: t("habit_tracker") || "Habits",
    }
    return titleMap[path] || t("dashboard")
  }

  return (
    <>
      <ThemeLoader />
      {/* Mobile Layout */}
      <div className="lg:hidden flex h-screen overflow-hidden bg-background flex-col">
        <div className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-b border-primary/20 px-4 py-3 flex items-center gap-3 h-16">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="neon-glow-hover bg-background/95 backdrop-blur-sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[280px] sm:w-[320px] z-50">
              <AppSidebar onNavigate={() => setMobileMenuOpen(false)} />
            </SheetContent>
          </Sheet>
          <span className="text-lg font-semibold text-primary neon-text truncate">{getPageTitle()}</span>
        </div>

        {/* Mobile content area */}
        <main className="flex-1 overflow-y-auto pt-16 pb-4 px-2 sm:px-4">
          {children}
        </main>
      </div>

      {/* Tablet and Desktop Layout */}
      <div className="hidden lg:flex h-screen overflow-hidden bg-background">
        <ResizablePanelGroup direction="horizontal" className="h-screen">
          <ResizablePanel defaultSize={18} minSize={15} maxSize={28} className="border-r border-primary/20">
            <AppSidebar />
          </ResizablePanel>

          <ResizableHandle withHandle className="bg-primary/10 hover:bg-primary/20 transition-colors" />

          <ResizablePanel defaultSize={82}>
            <main className="flex-1 h-full overflow-y-auto">{children}</main>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Tablet specific adjustment (md:lg) */}
      <div className="hidden md:flex lg:hidden h-screen overflow-hidden bg-background">
        <ResizablePanelGroup direction="horizontal" className="h-screen">
          <ResizablePanel defaultSize={22} minSize={18} maxSize={32} className="border-r border-primary/20">
            <AppSidebar />
          </ResizablePanel>

          <ResizableHandle withHandle className="bg-primary/10 hover:bg-primary/20 transition-colors" />

          <ResizablePanel defaultSize={78}>
            <main className="flex-1 h-full overflow-y-auto">{children}</main>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </>
  )
}
