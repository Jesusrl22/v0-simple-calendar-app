"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Flame, Trophy, Target, Clock } from "lucide-react"

interface StreaksData {
  currentStreak: number
  longestStreak: number
  totalTasksCompleted: number
  totalStudyHours: number
  todayTasks: number
  weekTasks: number
}

export function StreaksWidget() {
  const [streaks, setStreaks] = useState<StreaksData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStreaks()
  }, [])

  const fetchStreaks = async () => {
    try {
      const response = await fetch("/api/streaks")
      if (response.ok) {
        const data = await response.json()
        setStreaks(data)
      }
    } catch (error) {
      console.error("[v0] Error fetching streaks:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-16 bg-muted rounded" />
            <div className="h-16 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!streaks) return null

  return (
    <Card className="glass-card border-primary/20 hover:border-primary/40 transition-colors">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
          <Flame className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500" />
          Tu Progreso
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Streak Stats - Responsive Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="flex flex-col items-center justify-center p-3 sm:p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-lg border border-orange-500/20 hover:border-orange-500/40 transition-colors">
            <Flame className="h-6 sm:h-8 w-6 sm:w-8 text-orange-500 mb-2" />
            <div className="text-2xl sm:text-3xl font-bold text-center">{streaks.currentStreak}</div>
            <div className="text-xs sm:text-sm text-muted-foreground text-center">Racha Actual</div>
          </div>
          <div className="flex flex-col items-center justify-center p-3 sm:p-4 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20 hover:border-yellow-500/40 transition-colors">
            <Trophy className="h-6 sm:h-8 w-6 sm:w-8 text-yellow-500 mb-2" />
            <div className="text-2xl sm:text-3xl font-bold text-center">{streaks.longestStreak}</div>
            <div className="text-xs sm:text-sm text-muted-foreground text-center">Mejor Racha</div>
          </div>
        </div>

        {/* Additional Stats - Responsive */}
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 sm:p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
            <div className="flex items-center gap-2 min-w-0">
              <Target className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-muted-foreground truncate">Tareas Completadas</span>
            </div>
            <Badge variant="secondary" className="ml-2 flex-shrink-0">{streaks.totalTasksCompleted}</Badge>
          </div>
          <div className="flex items-center justify-between p-3 sm:p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
            <div className="flex items-center gap-2 min-w-0">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-muted-foreground truncate">Horas de Estudio</span>
            </div>
            <Badge variant="secondary" className="ml-2 flex-shrink-0">{streaks.totalStudyHours.toFixed(1)}h</Badge>
          </div>
        </div>

        {/* Today/Week Progress - Responsive */}
        <div className="pt-3 sm:pt-4 border-t space-y-2">
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-muted-foreground">Hoy</span>
            <span className="font-medium">{streaks.todayTasks} tareas</span>
          </div>
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-muted-foreground">Esta Semana</span>
            <span className="font-medium">{streaks.weekTasks} tareas</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
