"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, ChevronLeft, ChevronRight, Pencil } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useTranslation } from "@/hooks/useTranslation"
import { useLanguage } from "@/contexts/language-context"
import { useToast } from "@/hooks/use-toast"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, getDay, addDays } from "date-fns"
import { es, fr, de, enUS } from "date-fns/locale"

type Habit = {
  id: string
  name: string
  color: string
  icon: string
  recurrence_type: "daily" | "custom"
  recurrence_days: number[]
}

type HabitLog = {
  habit_id: string
  completed_date: string
}

const PRESET_COLORS = [
  "#54d946", "#3b82f6", "#f59e0b", "#ef4444",
  "#8b5cf6", "#ec4899", "#06b6d4", "#f97316",
]

const DAY_LABELS: Record<string, string[]> = {
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  es: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
  fr: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
  de: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
}

export default function HabitsPage() {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const { toast } = useToast()

  const [habits, setHabits] = useState<Habit[]>([])
  const [logs, setLogs] = useState<HabitLog[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)

  // Add dialog state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newHabitName, setNewHabitName] = useState("")
  const [newHabitColor, setNewHabitColor] = useState("#54d946")
  const [saving, setSaving] = useState(false)
  const [recurrenceType, setRecurrenceType] = useState<"daily" | "custom">("daily")
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6])

  // Edit dialog state
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [editName, setEditName] = useState("")
  const [editColor, setEditColor] = useState("#54d946")
  const [editRecurrenceType, setEditRecurrenceType] = useState<"daily" | "custom">("daily")
  const [editSelectedDays, setEditSelectedDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6])

  const dateLocale = language === "es" ? es : language === "fr" ? fr : language === "de" ? de : enUS
  const dayLabels = DAY_LABELS[language] || DAY_LABELS.en

  // All days in current month
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Current week (Monday to Sunday)
  const today = new Date()
  const todayDow = getDay(today)
  const weekStart = addDays(today, -(todayDow === 0 ? 6 : todayDow - 1))
  const currentWeekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  // Day headers - start Monday
  const dayHeaders = ["L", "M", "X", "J", "V", "S", "D"]
  const dayHeadersEn = ["M", "T", "W", "T", "F", "S", "S"]
  const dayHeadersFr = ["L", "M", "M", "J", "V", "S", "D"]
  const dayHeadersDe = ["M", "D", "M", "D", "F", "S", "S"]
  const headers = language === "en" ? dayHeadersEn : language === "fr" ? dayHeadersFr : language === "de" ? dayHeadersDe : dayHeaders

  const parseRecurrenceDays = (val: any): number[] => {
    if (Array.isArray(val)) return val
    if (typeof val === "string") {
      try { return JSON.parse(val) } catch { return [0, 1, 2, 3, 4, 5, 6] }
    }
    return [0, 1, 2, 3, 4, 5, 6]
  }

  const fetchHabits = useCallback(async () => {
    try {
      const res = await fetch("/api/habits")
      if (res.ok) {
        const data = await res.json()
        const habitsData: Habit[] = Array.isArray(data.habits)
          ? data.habits.map((h: any) => ({
              ...h,
              recurrence_type: h.recurrence_type || "daily",
              recurrence_days: parseRecurrenceDays(h.recurrence_days),
            }))
          : []
        setHabits(habitsData)
      } else {
        setHabits([])
      }
    } catch (error) {
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
    if (wasCompleted) {
      setLogs((prev) => prev.filter((l) => !(l.habit_id === habitId && l.completed_date === dateStr)))
    } else {
      setLogs((prev) => [...prev, { habit_id: habitId, completed_date: dateStr }])
    }
    try {
      const res = await fetch("/api/habits/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habit_id: habitId, date: dateStr }),
      })
      if (!res.ok) {
        if (wasCompleted) {
          setLogs((prev) => [...prev, { habit_id: habitId, completed_date: dateStr }])
        } else {
          setLogs((prev) => prev.filter((l) => !(l.habit_id === habitId && l.completed_date === dateStr)))
        }
        toast({ title: "Error", description: "Failed to save", variant: "destructive" })
      }
    } catch (error) {
      if (wasCompleted) {
        setLogs((prev) => [...prev, { habit_id: habitId, completed_date: dateStr }])
      } else {
        setLogs((prev) => prev.filter((l) => !(l.habit_id === habitId && l.completed_date === dateStr)))
      }
    } finally {
      setToggling(null)
    }
  }

  const openAdd = () => {
    setNewHabitName("")
    setNewHabitColor("#54d946")
    setRecurrenceType("daily")
    setSelectedDays([0, 1, 2, 3, 4, 5, 6])
    setIsAddOpen(true)
  }

  const addHabit = async () => {
    if (!newHabitName.trim()) return
    setSaving(true)
    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newHabitName.trim(),
          color: newHabitColor,
          recurrence_type: recurrenceType,
          recurrence_days: recurrenceType === "daily" ? [0, 1, 2, 3, 4, 5, 6] : selectedDays,
        }),
      })
      const responseText = await res.text()
      if (res.ok && responseText) {
        const data = JSON.parse(responseText)
        if (data.habit) {
          const newHabit: Habit = {
            id: data.habit.id,
            name: data.habit.name,
            color: data.habit.color || "#54d946",
            icon: data.habit.icon || "",
            recurrence_type: data.habit.recurrence_type || "daily",
            recurrence_days: parseRecurrenceDays(data.habit.recurrence_days),
          }
          setHabits((prev) => [...prev, newHabit])
          setIsAddOpen(false)
          toast({ title: t("habit_added") || "Habit added!" })
        }
      } else {
        toast({ title: "Error", description: responseText || "Failed", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: String(error), variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const openEdit = (habit: Habit) => {
    setEditingHabit(habit)
    setEditName(habit.name)
    setEditColor(habit.color || "#54d946")
    setEditRecurrenceType(habit.recurrence_type || "daily")
    setEditSelectedDays(parseRecurrenceDays(habit.recurrence_days))
    setIsEditOpen(true)
  }

  const saveEdit = async () => {
    if (!editingHabit || !editName.trim()) return
    setSaving(true)
    try {
      const newDays = editRecurrenceType === "daily" ? [0, 1, 2, 3, 4, 5, 6] : editSelectedDays
      const res = await fetch("/api/habits", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingHabit.id,
          name: editName.trim(),
          color: editColor,
          recurrence_type: editRecurrenceType,
          recurrence_days: newDays,
        }),
      })
      if (res.ok) {
        setHabits((prev) =>
          prev.map((h) =>
            h.id === editingHabit.id
              ? { ...h, name: editName.trim(), color: editColor, recurrence_type: editRecurrenceType, recurrence_days: newDays }
              : h
          )
        )
        setIsEditOpen(false)
        toast({ title: t("habit_updated") || "Habit updated!" })
      } else {
        const err = await res.text()
        toast({ title: "Error", description: err, variant: "destructive" })
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

  // Stats - only count applicable days per habit
  const totalPossible = habits.reduce((sum, habit) => {
    const rd = habit.recurrence_days
    return sum + daysInMonth.filter((d) => rd.includes(getDay(d))).length
  }, 0)
  const totalCompleted = logs.length
  const progressPct = totalPossible === 0 ? 0 : Math.round((totalCompleted / totalPossible) * 100)

  const habitCount = (habitId: string) => {
    const habit = habits.find((h) => h.id === habitId)
    const rd = habit?.recurrence_days || [0, 1, 2, 3, 4, 5, 6]
    return logs.filter(
      (l) => l.habit_id === habitId && rd.includes(getDay(new Date(l.completed_date + "T00:00:00")))
    ).length
  }

  const dayCount = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd")
    const dow = getDay(date)
    return logs.filter((l) => {
      const habit = habits.find((h) => h.id === l.habit_id)
      const rd = habit?.recurrence_days || [0, 1, 2, 3, 4, 5, 6]
      return l.completed_date === dateStr && rd.includes(dow)
    }).length
  }

  // Week layout helpers
  const firstDayOfWeek = (getDay(monthStart) + 6) % 7
  const totalCells = firstDayOfWeek + daysInMonth.length
  const numWeeks = Math.ceil(totalCells / 7)
  const weeks = Array.from({ length: numWeeks }, (_, i) => i + 1)

  // Shared day picker component
  const DayPicker = ({
    days,
    onChange,
  }: {
    days: number[]
    onChange: (d: number[]) => void
  }) => (
    <div className="grid grid-cols-7 gap-1.5">
      {dayLabels.map((label, index) => {
        const isSelected = days.includes(index)
        return (
          <button
            key={index}
            type="button"
            onClick={() =>
              onChange(isSelected ? days.filter((d) => d !== index) : [...days, index].sort())
            }
            className={`p-2 text-xs font-bold rounded transition-all ${
              isSelected
                ? "bg-primary text-primary-foreground border-2 border-primary"
                : "bg-secondary text-secondary-foreground border-2 border-border hover:border-primary/50"
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t("habit_tracker") || "Habit Tracker"}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">{t("track_daily_habits") || "Track your daily habits"}</p>
        </div>
        <Button onClick={openAdd} size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          <span className="text-sm">{t("add_habit") || "Add Habit"}</span>
        </Button>
      </div>

      {/* Month nav + stats */}
      <div className="flex flex-col gap-3">
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
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
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
          <Button onClick={openAdd} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            {t("add_habit") || "Add Habit"}
          </Button>
        </div>
      ) : (
        /* Desktop table */
        <div className="hidden sm:block overflow-x-auto rounded-lg border-2 border-border">
          <table className="w-full text-xs md:text-sm">
            <thead>
              <tr className="bg-primary/20 border-b border-border">
                <th className="sticky left-0 bg-primary/20 text-left px-2 md:px-4 py-2 md:py-3 font-bold text-foreground border-r border-border min-w-[120px] md:min-w-[160px] text-xs md:text-sm">
                  {t("habits") || "Habits"}
                </th>
                {weeks.map((week) => (
                  <th key={week} colSpan={7} className="text-center px-1 md:px-2 py-2 md:py-3 font-bold text-foreground border-r border-border/50 text-xs">
                    {t("week") || "Week"} {week}
                  </th>
                ))}
              </tr>
              <tr className="bg-secondary/30 border-b border-border">
                <th className="sticky left-0 bg-secondary/30 border-r border-border px-2 md:px-4 py-1 md:py-2" />
                {Array.from({ length: numWeeks * 7 }, (_, i) => {
                  const dayIndex = i - firstDayOfWeek
                  const date = dayIndex >= 0 && dayIndex < daysInMonth.length ? daysInMonth[dayIndex] : null
                  const isToday = date ? format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") : false
                  return (
                    <th key={i} className={`px-0.5 md:px-1 py-1 md:py-2 text-center border-r border-border/30 min-w-[28px] md:min-w-[32px] ${isToday ? "bg-primary/20" : ""}`}>
                      {date ? (
                        <div>
                          <div className="text-muted-foreground text-[10px] md:text-xs">{headers[i % 7]}</div>
                          <div className={`font-bold text-xs md:text-sm ${isToday ? "text-primary" : "text-foreground"}`}>{format(date, "d")}</div>
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
                    <div className="flex items-center justify-between gap-1 group">
                      <div className="flex items-center gap-1 md:gap-2 min-w-0">
                        <div className="w-2 md:w-3 h-2 md:h-3 rounded-full flex-shrink-0" style={{ backgroundColor: habit.color }} />
                        <span className="font-medium text-foreground text-xs md:text-sm truncate">{habit.name}</span>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button onClick={() => openEdit(habit)} className="text-muted-foreground hover:text-primary transition-colors">
                          <Pencil className="h-3 w-3 md:h-4 md:w-4" />
                        </button>
                        <button onClick={() => deleteHabit(habit.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                        </button>
                      </div>
                    </div>
                  </td>
                  {Array.from({ length: numWeeks * 7 }, (_, i) => {
                    const dayIndex = i - firstDayOfWeek
                    const date = dayIndex >= 0 && dayIndex < daysInMonth.length ? daysInMonth[dayIndex] : null
                    const isToday = date ? format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") : false
                    const dayOfWeek = date ? getDay(date) : null
                    const recDays = habit.recurrence_days || [0, 1, 2, 3, 4, 5, 6]
                    const shouldShow = dayOfWeek !== null ? recDays.includes(dayOfWeek) : false
                    const done = date ? isCompleted(habit.id, date) : false
                    const key = date ? `${habit.id}-${format(date, "yyyy-MM-dd")}` : null
                    const isToggling = key !== null && toggling === key
                    return (
                      <td key={i} className={`px-0.5 md:px-1 py-1 md:py-2 text-center border-r border-border/30 ${isToday ? "bg-primary/5" : ""}`}>
                        {date ? (
                          shouldShow ? (
                            <button
                              onClick={() => toggleLog(habit.id, date)}
                              disabled={isToggling}
                              className={`w-5 md:w-6 h-5 md:h-6 rounded border-2 flex items-center justify-center transition-all mx-auto ${done ? "border-transparent" : "border-border hover:border-primary/60"}`}
                              style={done ? { backgroundColor: habit.color, borderColor: habit.color } : {}}
                            >
                              {done && (
                                <svg className="w-2.5 md:w-3 h-2.5 md:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </button>
                          ) : (
                            <div className="w-5 md:w-6 h-5 md:h-6 mx-auto bg-secondary/30 rounded" />
                          )
                        ) : null}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
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
                      {count !== null ? <span className={count > 0 ? "text-primary" : ""}>{count}</span> : null}
                    </td>
                  )
                })}
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Mobile table - current week */}
      {!loading && habits.length > 0 && (
        <div className="sm:hidden overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-primary/20 border-b border-border">
                <th className="sticky left-0 bg-primary/20 text-left px-2 py-2 font-bold text-foreground border-r border-border min-w-[90px]">
                  {t("habits") || "Habits"}
                </th>
                {currentWeekDays.map((date, i) => {
                  const isToday = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
                  return (
                    <th key={i} className={`px-1.5 py-2 text-center border-r border-border/30 min-w-[36px] text-[10px] font-bold ${isToday ? "bg-primary/30" : ""}`}>
                      <div className="text-muted-foreground">{format(date, "EEE", { locale: dateLocale }).substring(0, 1)}</div>
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
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1 min-w-0">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: habit.color }} />
                        <span className="font-medium text-foreground text-xs truncate max-w-[55px]">{habit.name}</span>
                      </div>
                      <div className="flex gap-0.5 flex-shrink-0">
                        <button onClick={() => openEdit(habit)} className="text-muted-foreground hover:text-primary transition-colors p-0.5">
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button onClick={() => deleteHabit(habit.id)} className="text-muted-foreground hover:text-destructive transition-colors p-0.5">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </td>
                  {currentWeekDays.map((date, i) => {
                    const dow = getDay(date)
                    const recDays = habit.recurrence_days || [0, 1, 2, 3, 4, 5, 6]
                    const shouldShow = recDays.includes(dow)
                    if (i === 0) console.log(`[v0] Habit "${habit.name}": recurrence_days=${JSON.stringify(recDays)}, dow=${dow}, shouldShow=${shouldShow}`)
                    const done = isCompleted(habit.id, date)
                    const isToday = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
                    const key = `${habit.id}-${format(date, "yyyy-MM-dd")}`
                    const isToggling = toggling === key
                    return (
                      <td key={i} className={`px-1.5 py-2 text-center border-r border-border/30 ${isToday ? "bg-primary/10" : ""}`}>
                        {shouldShow ? (
                          <button
                            onClick={() => toggleLog(habit.id, date)}
                            disabled={isToggling}
                            className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all mx-auto ${done ? "border-transparent" : "border-border/50 hover:border-primary/60"}`}
                            style={done ? { backgroundColor: habit.color, borderColor: habit.color } : {}}
                          >
                            {done && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>}
                          </button>
                        ) : (
                          <div className="w-6 h-6 mx-auto bg-secondary/30 rounded" />
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile progress cards */}
      {!loading && habits.length > 0 && (
        <div className="sm:hidden space-y-3">
          <h3 className="text-sm font-bold text-foreground">{t("your_habits") || "Your Habits"}</h3>
          {habits.map((habit) => {
            const count = habitCount(habit.id)
            const recDays = habit.recurrence_days || [0, 1, 2, 3, 4, 5, 6]
            const daysApplicable = daysInMonth.filter((d) => recDays.includes(getDay(d))).length
            const pct = daysApplicable === 0 ? 0 : Math.round((count / daysApplicable) * 100)
            return (
              <div key={habit.id} className="bg-secondary/20 border border-border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: habit.color }} />
                    <span className="font-medium text-foreground text-sm truncate">{habit.name}</span>
                  </div>
                  <div className="flex gap-1 flex-shrink-0 ml-2">
                    <button onClick={() => openEdit(habit)} className="text-muted-foreground hover:text-primary transition-colors p-1">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => deleteHabit(habit.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="w-full h-3 bg-secondary rounded-full overflow-hidden border border-border/30">
                  <div className="h-full rounded transition-all duration-300" style={{ width: `${pct}%`, backgroundColor: habit.color }} />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{count} {t("of") || "of"} {daysApplicable} {t("days") || "days"}</span>
                  <span className="font-bold" style={{ color: habit.color }}>{pct}%</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Desktop per-habit progress cards */}
      {habits.length > 0 && (
        <div className="hidden sm:block">
          <h3 className="text-sm font-bold text-foreground mb-3">{t("each_habit") || "Each Habit"}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {habits.map((habit) => {
              const count = habitCount(habit.id)
              const daysApplicable = daysInMonth.filter((d) => habit.recurrence_days.includes(getDay(d))).length
              const pct = daysApplicable === 0 ? 0 : Math.round((count / daysApplicable) * 100)
              return (
                <div key={habit.id} className="bg-secondary/20 border border-border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: habit.color }} />
                      <p className="text-xs font-medium text-foreground truncate">{habit.name}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => openEdit(habit)} className="text-muted-foreground hover:text-primary transition-colors">
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button onClick={() => deleteHabit(habit.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{t("count") || "Count"}</span>
                    <span className="font-bold" style={{ color: habit.color }}>{count}/{daysApplicable}</span>
                  </div>
                  <div className="w-full h-4 bg-secondary rounded overflow-hidden border border-border/30">
                    <div className="h-full rounded transition-all duration-300" style={{ width: `${pct}%`, backgroundColor: habit.color }} />
                  </div>
                  <p className="text-xs text-center font-bold" style={{ color: habit.color }}>{pct}%</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Add Habit Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
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
                  <button key={color} type="button" onClick={() => setNewHabitColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${newHabitColor === color ? "border-foreground scale-110" : "border-transparent"}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("frequency") || "Frequency"}</Label>
              <div className="flex gap-2">
                <Button type="button" size="sm" variant={recurrenceType === "daily" ? "default" : "outline"} onClick={() => setRecurrenceType("daily")} className="flex-1">
                  {t("daily") || "Daily"}
                </Button>
                <Button type="button" size="sm" variant={recurrenceType === "custom" ? "default" : "outline"} onClick={() => setRecurrenceType("custom")} className="flex-1">
                  {t("custom_days") || "Custom"}
                </Button>
              </div>
            </div>
            {recurrenceType === "custom" && (
              <div className="space-y-2">
                <Label>{t("select_days") || "Select days"}</Label>
                <DayPicker days={selectedDays} onChange={setSelectedDays} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
              {t("cancel") || "Cancel"}
            </Button>
            <Button type="button" onClick={addHabit} disabled={saving || !newHabitName.trim()} className="bg-primary text-primary-foreground">
              {saving ? (t("saving") || "Saving...") : (t("add") || "Add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Habit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("edit_habit") || "Edit Habit"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-input">{t("habit_name") || "Habit name"}</Label>
              <Input
                id="edit-input"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveEdit()}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("color") || "Color"}</Label>
              <div className="flex gap-2 flex-wrap">
                {PRESET_COLORS.map((color) => (
                  <button key={color} type="button" onClick={() => setEditColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${editColor === color ? "border-foreground scale-110" : "border-transparent"}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("frequency") || "Frequency"}</Label>
              <div className="flex gap-2">
                <Button type="button" size="sm" variant={editRecurrenceType === "daily" ? "default" : "outline"} onClick={() => setEditRecurrenceType("daily")} className="flex-1">
                  {t("daily") || "Daily"}
                </Button>
                <Button type="button" size="sm" variant={editRecurrenceType === "custom" ? "default" : "outline"} onClick={() => setEditRecurrenceType("custom")} className="flex-1">
                  {t("custom_days") || "Custom"}
                </Button>
              </div>
            </div>
            {editRecurrenceType === "custom" && (
              <div className="space-y-2">
                <Label>{t("select_days") || "Select days"}</Label>
                <DayPicker days={editSelectedDays} onChange={setEditSelectedDays} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
              {t("cancel") || "Cancel"}
            </Button>
            <Button type="button" onClick={saveEdit} disabled={saving || !editName.trim()} className="bg-primary text-primary-foreground">
              {saving ? (t("saving") || "Saving...") : (t("save") || "Save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
