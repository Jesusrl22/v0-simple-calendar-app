"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useTranslation } from "@/hooks/useTranslation"
import { useLanguage } from "@/contexts/language-context"
import { useToast } from "@/hooks/use-toast"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, getDay } from "date-fns"
import { es, fr, de, enUS } from "date-fns/locale"

type Habit = {
  id: string
  name: string
  color: string
  icon: string
}

type HabitLog = {
  habit_id: string
  completed_date: string
}

const PRESET_COLORS = [
  "#54d946", "#3b82f6", "#f59e0b", "#ef4444",
  "#8b5cf6", "#ec4899", "#06b6d4", "#f97316",
]

export default function HabitsPage() {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const { toast } = useToast()

  const [habits, setHabits] = useState<Habit[]>([])
  const [logs, setLogs] = useState<HabitLog[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newHabitName, setNewHabitName] = useState("")
  const [newHabitColor, setNewHabitColor] = useState("#54d946")
  const [saving, setSaving] = useState(false)

  const dateLocale = language === "es" ? es : language === "fr" ? fr : language === "de" ? de : enUS

  // All days in current month
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Day headers - start Monday
  const dayHeaders = ["L", "M", "X", "J", "V", "S", "D"]
  const dayHeadersEn = ["M", "T", "W", "T", "F", "S", "S"]
  const dayHeadersFr = ["L", "M", "M", "J", "V", "S", "D"]
  const dayHeadersDe = ["M", "D", "M", "D", "F", "S", "S"]
  const headers = language === "en" ? dayHeadersEn : language === "fr" ? dayHeadersFr : language === "de" ? dayHeadersDe : dayHeaders

  const fetchHabits = useCallback(async () => {
    try {
      const res = await fetch("/api/habits")
      if (res.ok) {
        const data = await res.json()
        setHabits(Array.isArray(data.habits) ? data.habits : [])
      } else {
        setHabits([])
      }
    } catch (error) {
      console.error("[v0] Failed to fetch habits:", error)
      setHabits([])
    }
  }, [])

  const fetchLogs = useCallback(async () => {
    try {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1
      const res = await fetch(`/api/habits/logs?year=${year}&month=${month}`)
      if (res.ok) {
        const data = await res.json()
        setLogs(Array.isArray(data.logs) ? data.logs : [])
      } else {
        setLogs([])
      }
    } catch (error) {
      console.error("[v0] Failed to fetch logs:", error)
      setLogs([])
    }
  }, [currentDate])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      await Promise.all([fetchHabits(), fetchLogs()])
      setLoading(false)
    }
    load()
  }, [fetchHabits, fetchLogs])

  const isCompleted = (habitId: string, date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd")
    return logs.some((l) => l.habit_id === habitId && l.completed_date === dateStr)
  }

  const toggleLog = async (habitId: string, date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd")
    const key = `${habitId}-${dateStr}`
    setToggling(key)

    const wasCompleted = isCompleted(habitId, date)
    // Optimistic update
    if (wasCompleted) {
      setLogs((prev) => prev.filter((l) => !(l.habit_id === habitId && l.completed_date === dateStr)))
    } else {
      setLogs((prev) => [...prev, { habit_id: habitId, completed_date: dateStr }])
    }

    const res = await fetch("/api/habits/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habit_id: habitId, date: dateStr }),
    })

    if (!res.ok) {
      // Revert
      if (wasCompleted) {
        setLogs((prev) => [...prev, { habit_id: habitId, completed_date: dateStr }])
      } else {
        setLogs((prev) => prev.filter((l) => !(l.habit_id === habitId && l.completed_date === dateStr)))
      }
    }
    setToggling(null)
  }

  const addHabit = async () => {
    if (!newHabitName.trim()) return
    setSaving(true)
    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newHabitName.trim(), color: newHabitColor }),
      })
      const responseText = await res.text()
      if (res.ok && responseText) {
        const data = JSON.parse(responseText)
        if (data.habit) {
          const newHabit = {
            id: data.habit.id,
            name: data.habit.name,
            color: data.habit.color || newHabitColor || "#54d946",
            icon: data.habit.icon || "",
          }
          setHabits((prev) => [...prev, newHabit])
          setNewHabitName("")
          setNewHabitColor("#54d946")
          setIsAddOpen(false)
          toast({ title: t("habit_added") || "Habit added!" })
        }
      } else {
        toast({ title: "Error", description: responseText || "Failed to add habit", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: String(error), variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const deleteHabit = async (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id))
    await fetch("/api/habits", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
  }

  // Stats
  const totalPossible = habits.length * daysInMonth.length
  const totalCompleted = logs.length
  const progressPct = totalPossible === 0 ? 0 : Math.round((totalCompleted / totalPossible) * 100)

  // Per habit count
  const habitCount = (habitId: string) => logs.filter((l) => l.habit_id === habitId).length

  // Daily count
  const dayCount = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd")
    return logs.filter((l) => l.completed_date === dateStr).length
  }

  // Week numbers for header grouping (weeks 1-5)
  const firstDayOfWeek = (getDay(monthStart) + 6) % 7 // Monday=0
  const totalCells = firstDayOfWeek + daysInMonth.length
  const numWeeks = Math.ceil(totalCells / 7)
  const weeks = Array.from({ length: numWeeks }, (_, i) => i + 1)

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t("habit_tracker") || "Habit Tracker"}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">{t("track_daily_habits") || "Track your daily habits"}</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          <span className="text-sm">{t("add_habit") || "Add Habit"}</span>
        </Button>
      </div>

      {/* Month nav + progress - stacked on mobile */}
      <div className="flex flex-col gap-3">
        {/* Month navigator */}
        <div className="flex items-center gap-2 bg-secondary/20 border border-border rounded-lg px-3 py-2 justify-center sm:justify-start">
          <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="text-muted-foreground hover:text-foreground transition-colors p-1">
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <span className="text-sm sm:text-lg font-bold text-foreground min-w-[120px] sm:min-w-[140px] text-center">
            {format(currentDate, "MMM yyyy", { locale: dateLocale })}
          </span>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="text-muted-foreground hover:text-foreground transition-colors p-1">
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3">
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-2 md:p-3 text-center">
            <p className="text-lg md:text-xl font-bold text-primary">{totalCompleted}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{t("completed_habits") || "Completed"}</p>
          </div>
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-2 md:p-3 text-center">
            <p className="text-lg md:text-xl font-bold text-primary">{progressPct}%</p>
            <p className="text-xs text-muted-foreground mt-0.5">{t("monthly_progress") || "Progress"}</p>
          </div>
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-2 md:p-3 text-center col-span-2 md:col-span-1">
            <p className="text-lg md:text-xl font-bold text-primary">{habits.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{t("habits") || "Habits"}</p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-secondary/20 border border-border rounded-lg p-3 md:p-4 space-y-2">
        <div className="flex justify-between text-xs md:text-sm font-medium">
          <span className="text-foreground">{t("progress") || "Progress"}</span>
          <span className="text-primary font-bold">{progressPct}%</span>
        </div>
        <div className="w-full h-4 md:h-5 bg-secondary rounded-full overflow-hidden border border-border/30">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 md:py-20 text-muted-foreground">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3" />
          <span className="text-sm md:text-base">{t("loading") || "Loading..."}</span>
        </div>
      ) : habits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 md:py-20 space-y-3 border-2 border-dashed border-border rounded-lg">
          <p className="text-muted-foreground font-medium text-sm md:text-base">{t("no_habits") || "No habits yet"}</p>
          <p className="text-xs text-muted-foreground text-center px-2">{t("add_first_habit") || "Add your first habit to start tracking"}</p>
          <Button onClick={() => setIsAddOpen(true)} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            {t("add_habit") || "Add Habit"}
          </Button>
        </div>
      ) : (
        /* Main Tracker Table - Hidden on mobile, shown on sm+ */
        <div className="hidden sm:block overflow-x-auto rounded-lg border-2 border-border">
          <table className="w-full text-xs md:text-sm">
            <thead>
              {/* Week headers */}
              <tr className="bg-primary/20 border-b border-border">
                <th className="sticky left-0 bg-primary/20 text-left px-2 md:px-4 py-2 md:py-3 font-bold text-foreground border-r border-border min-w-[100px] md:min-w-[150px] text-xs md:text-sm">
                  {t("habits") || "Habits"}
                </th>
                {weeks.map((week) => (
                  <th key={week} colSpan={7} className="text-center px-1 md:px-2 py-2 md:py-3 font-bold text-foreground border-r border-border/50 text-xs">
                    {t("week") || "Week"} {week}
                  </th>
                ))}
              </tr>
              {/* Day of week headers */}
              <tr className="bg-secondary/30 border-b border-border">
                <th className="sticky left-0 bg-secondary/30 border-r border-border px-2 md:px-4 py-1 md:py-2" />
                {Array.from({ length: numWeeks * 7 }, (_, i) => {
                  const dayIndex = i - firstDayOfWeek
                  const date = dayIndex >= 0 && dayIndex < daysInMonth.length ? daysInMonth[dayIndex] : null
                  const isToday = date ? format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") : false
                  return (
                    <th key={i} className={`px-0.5 md:px-1 py-1 md:py-2 text-center border-r border-border/30 min-w-[28px] md:min-w-[32px] ${isToday ? "bg-primary/20" : ""}`}>
                      {date ? (
                        <div className="text-xs">
                          <div className="text-muted-foreground text-[10px] md:text-xs">{headers[(i) % 7]}</div>
                          <div className={`font-bold text-xs md:text-sm ${isToday ? "text-primary" : "text-foreground"}`}>
                            {format(date, "d")}
                          </div>
                        </div>
                      ) : null}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {habits.map((habit, idx) => (
                <tr key={habit.id} className={`border-b border-border/50 ${idx % 2 === 0 ? "bg-secondary/5" : "bg-background"} hover:bg-secondary/10 transition-colors`}>
                  <td className="sticky left-0 bg-inherit border-r border-border px-2 md:px-4 py-1 md:py-2">
                    <div className="flex items-center justify-between gap-1 md:gap-2 group">
                      <div className="flex items-center gap-1 md:gap-2 min-w-0">
                        <div className="w-2 md:w-3 h-2 md:h-3 rounded-full flex-shrink-0" style={{ backgroundColor: habit.color || "#54d946" }} />
                        <span className="font-medium text-foreground text-xs md:text-sm truncate">{habit.name}</span>
                      </div>
                      <button onClick={() => deleteHabit(habit.id)} className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100">
                        <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                      </button>
                    </div>
                  </td>
                  {Array.from({ length: numWeeks * 7 }, (_, i) => {
                    const dayIndex = i - firstDayOfWeek
                    const date = dayIndex >= 0 && dayIndex < daysInMonth.length ? daysInMonth[dayIndex] : null
                    const isToday = date ? format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") : false
                    const done = date ? isCompleted(habit.id, date) : false
                    const key = date ? `${habit.id}-${format(date, "yyyy-MM-dd")}` : null
                    const isToggling = key !== null && toggling === key

                    return (
                      <td key={i} className={`px-0.5 md:px-1 py-1 md:py-2 text-center border-r border-border/30 ${isToday ? "bg-primary/5" : ""}`}>
                        {date ? (
                          <button
                            onClick={() => toggleLog(habit.id, date)}
                            disabled={isToggling}
                            className={`w-5 md:w-6 h-5 md:h-6 rounded border-2 flex items-center justify-center transition-all mx-auto ${
                              done
                                ? "border-transparent"
                                : "border-border hover:border-primary/60"
                            }`}
                            style={done ? { backgroundColor: habit.color || "#54d946", borderColor: habit.color || "#54d946" } : {}}
                          >
                            {done && (
                              <svg className="w-2.5 md:w-3 h-2.5 md:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        ) : null}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
            {/* Footer: daily counts */}
            <tfoot>
              <tr className="bg-primary/10 border-t-2 border-primary/40 font-bold">
                <td className="sticky left-0 bg-primary/10 border-r border-border px-2 md:px-4 py-1 md:py-2 text-xs font-bold text-foreground">
                  {t("daily") || "Daily"}
                </td>
                {Array.from({ length: numWeeks * 7 }, (_, i) => {
                  const dayIndex = i - firstDayOfWeek
                  const date = dayIndex >= 0 && dayIndex < daysInMonth.length ? daysInMonth[dayIndex] : null
                  const count = date ? dayCount(date) : null
                  const isToday = date ? format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") : false
                  return (
                    <td key={i} className={`px-0.5 md:px-1 py-1 md:py-2 text-center border-r border-border/30 text-xs font-bold ${isToday ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}>
                      {count !== null ? (
                        <span className={count > 0 ? "text-primary" : ""}>{count}</span>
                      ) : null}
                    </td>
                  )
                })}
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Mobile table view - last 7 days only */}
      {!loading && habits.length > 0 && (
        <div className="sm:hidden overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-primary/20 border-b border-border">
                <th className="sticky left-0 bg-primary/20 text-left px-2 py-2 font-bold text-foreground border-r border-border min-w-[80px]">
                  {t("habits") || "Habits"}
                </th>
                {/* Last 7 days */}
                {Array.from({ length: Math.min(7, daysInMonth.length) }, (_, i) => {
                  const date = daysInMonth[Math.max(0, daysInMonth.length - 7 + i)]
                  const isToday = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
                  return (
                    <th
                      key={i}
                      className={`px-1.5 py-2 text-center border-r border-border/30 min-w-[36px] text-[10px] font-bold ${isToday ? "bg-primary/30 text-primary" : ""}`}
                    >
                      <div className="text-muted-foreground">{format(date, "EEE").substring(0, 1)}</div>
                      <div className={isToday ? "text-primary font-bold" : "text-foreground"}>{format(date, "d")}</div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {habits.map((habit, idx) => (
                <tr key={habit.id} className={`border-b border-border/50 ${idx % 2 === 0 ? "bg-secondary/5" : ""}`}>
                  <td className="sticky left-0 bg-inherit border-r border-border px-2 py-2">
                    <div className="flex items-center gap-1 min-w-0">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: habit.color || "#54d946" }} />
                      <span className="font-medium text-foreground text-xs truncate">{habit.name}</span>
                    </div>
                  </td>
                  {Array.from({ length: Math.min(7, daysInMonth.length) }, (_, i) => {
                    const date = daysInMonth[Math.max(0, daysInMonth.length - 7 + i)]
                    const done = isCompleted(habit.id, date)
                    const isToday = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
                    const key = `${habit.id}-${format(date, "yyyy-MM-dd")}`
                    const isToggling = toggling === key

                    return (
                      <td key={i} className={`px-1.5 py-2 text-center border-r border-border/30 ${isToday ? "bg-primary/10" : ""}`}>
                        <button
                          onClick={() => toggleLog(habit.id, date)}
                          disabled={isToggling}
                          className={`w-5 h-5 rounded border-1.5 flex items-center justify-center transition-all mx-auto text-white text-[10px] ${
                            done
                              ? "border-transparent"
                              : "border-border/50 hover:border-primary/60"
                          }`}
                          style={done ? { backgroundColor: habit.color || "#54d946", borderColor: habit.color || "#54d946" } : {}}
                        >
                          {done && <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile progress cards view */}
      {!loading && habits.length > 0 && (
        <div className="sm:hidden space-y-3">
          <h3 className="text-sm font-bold text-foreground">{t("your_habits") || "Your Habits"}</h3>
          {habits.map((habit) => {
            const count = habitCount(habit.id)
            const pct = daysInMonth.length === 0 ? 0 : Math.round((count / daysInMonth.length) * 100)
            return (
              <div key={habit.id} className="bg-secondary/20 border border-border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: habit.color || "#54d946" }} />
                    <span className="font-medium text-foreground text-sm truncate">{habit.name}</span>
                  </div>
                  <button onClick={() => deleteHabit(habit.id)} className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0 ml-2">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="w-full h-3 bg-secondary rounded-full overflow-hidden border border-border/30">
                  <div
                    className="h-full rounded transition-all duration-300"
                    style={{ width: `${pct}%`, backgroundColor: habit.color || "#54d946" }}
                  />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{count} {t("of") || "of"} {daysInMonth.length} {t("days") || "days"}</span>
                  <span className="font-bold" style={{ color: habit.color || "#54d946" }}>{pct}%</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Per-habit progress cards - desktop view */}
      {habits.length > 0 && (
        <div className="hidden sm:block">
          <h3 className="text-sm font-bold text-foreground mb-3">{t("each_habit") || "Each Habit"}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {habits.map((habit) => {
              const count = habitCount(habit.id)
              const pct = daysInMonth.length === 0 ? 0 : Math.round((count / daysInMonth.length) * 100)
              return (
                <div key={habit.id} className="bg-secondary/20 border border-border rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: habit.color || "#54d946" }} />
                    <p className="text-xs font-medium text-foreground truncate">{habit.name}</p>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{t("count") || "Count"}</span>
                    <span className="font-bold" style={{ color: habit.color || "#54d946" }}>{count}</span>
                  </div>
                  <div className="w-full h-4 bg-secondary rounded overflow-hidden border border-border/30">
                    <div
                      className="h-full rounded transition-all duration-300"
                      style={{ width: `${pct}%`, backgroundColor: habit.color || "#54d946" }}
                    />
                  </div>
                  <p className="text-xs text-center font-bold" style={{ color: habit.color || "#54d946" }}>{pct}%</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Add Habit Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("add_habit") || "Add Habit"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="habit-input">{t("habit_name") || "Habit name"}</Label>
              <Input
                id="habit-input"
                placeholder={t("habit_placeholder") || "e.g. Exercise, Read, Meditate..."}
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addHabit()}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("color") || "Color"}</Label>
              <div className="flex gap-2 flex-wrap">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewHabitColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${newHabitColor === color ? "border-foreground scale-110" : "border-transparent"}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
              {t("cancel") || "Cancel"}
            </Button>
            <Button
              type="button"
              onClick={addHabit}
              disabled={saving || !newHabitName.trim()}
              className="bg-primary text-primary-foreground"
            >
              {saving ? (t("saving") || "Saving...") : (t("add") || "Add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
