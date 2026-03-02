"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { format, startOfWeek, addDays, startOfMonth, eachDayOfInterval, endOfMonth, isSameDay } from "date-fns"
import { es, fr, de } from "date-fns/locale"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"
import { useTheme } from "@/contexts/theme-context"
import { useLanguage } from "@/contexts/language-context"
import { useTranslation } from "@/hooks/useTranslation"

interface Task {
  id: string
  title: string
  completed: boolean
  dueDate: string
  priority?: "low" | "medium" | "high"
  icon?: string
}

interface TaskTrackerViewProps {
  tasks: Task[]
  onTaskToggle: (taskId: string, date: string, completed: boolean) => void
  viewMode?: "week" | "month"
}

export function TaskTrackerView({ tasks, onTaskToggle, viewMode = "week" }: TaskTrackerViewProps) {
  const { theme } = useTheme()
  const { language } = useLanguage()
  const { t } = useTranslation(language)
  const today = new Date()

  // Get locale for date formatting
  const locales = { es, fr, de, en: undefined }
  const dateLocale = locales[language as keyof typeof locales]

  // Generate date range
  const getDateRange = () => {
    if (viewMode === "week") {
      const weekStart = startOfWeek(today, { weekStartsOn: 0 })
      return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
    } else {
      const monthStart = startOfMonth(today)
      const monthEnd = endOfMonth(today)
      return eachDayOfInterval({ start: monthStart, end: monthEnd })
    }
  }

  const dateRange = getDateRange()
  const monthLabel = format(today, "MMMM yyyy", { locale: dateLocale })

  // Group tasks by date
  const tasksByDate = useMemo(() => {
    const grouped: Record<string, Task[]> = {}
    dateRange.forEach((date) => {
      const key = format(date, "yyyy-MM-dd")
      grouped[key] = tasks.filter((t) => {
        const tDate = format(new Date(t.dueDate), "yyyy-MM-dd")
        return tDate === key
      })
    })
    return grouped
  }, [tasks, dateRange])

  // Unique tasks (by title, get all occurrences)
  const uniqueTasks = useMemo(() => {
    const seen = new Set<string>()
    const unique: Task[] = []
    tasks.forEach((task) => {
      if (!seen.has(task.title)) {
        seen.add(task.title)
        unique.push(task)
      }
    })
    return unique
  }, [tasks])

  // Calculate progress
  const calculateProgress = (task: Task) => {
    const taskOccurrences = tasks.filter((t) => t.title === task.title)
    const completed = taskOccurrences.filter((t) => t.completed).length
    return Math.round((completed / Math.max(taskOccurrences.length, 1)) * 100)
  }

  // Get theme colors
  const bgColor = theme?.colors?.bg || "#0f172a"
  const primaryColor = theme?.colors?.primary || "#54d946"
  const borderColor = theme?.colors?.border || "#334155"

  // Day initials
  const dayLabels = viewMode === "week" ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] : undefined

  return (
    <div className="w-full space-y-4">
      {/* Month Header */}
      <div
        className="rounded-lg border p-4 text-center text-xl font-bold"
        style={{
          backgroundColor: theme?.colors?.secondary || "#1e293b",
          borderColor,
          color: theme?.colors?.foreground || "#fff",
        }}
      >
        {monthLabel}
      </div>

      {/* Tracker Table */}
      <div className="w-full overflow-x-auto rounded-lg border" style={{ borderColor }}>
        <table className="w-full" style={{ backgroundColor: theme?.colors?.secondary || "#1e293b" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${borderColor}` }}>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: primaryColor, minWidth: "150px" }}>
                Tasks
              </th>

              {/* Date Headers */}
              {dateRange.map((date, idx) => {
                const isToday = isSameDay(date, today)
                const dayLabel = viewMode === "week" ? dayLabels?.[idx] : format(date, "d")
                const dateNum = format(date, "dd")

                return (
                  <th
                    key={format(date, "yyyy-MM-dd")}
                    className="px-2 py-3 text-center text-sm font-semibold"
                    style={{
                      color: isToday ? primaryColor : theme?.colors?.foreground || "#fff",
                      backgroundColor: isToday ? `${primaryColor}20` : "transparent",
                      borderRight: `1px solid ${borderColor}`,
                    }}
                  >
                    <div className="text-xs">{dayLabel}</div>
                    <div className="text-sm font-bold">{dateNum}</div>
                  </th>
                )
              })}

              {/* Progress Header */}
              <th
                className="px-4 py-3 text-center font-semibold"
                style={{ color: primaryColor, minWidth: "100px" }}
              >
                Progress
              </th>
            </tr>
          </thead>

          <tbody>
            {uniqueTasks.map((task, taskIdx) => {
              const progress = calculateProgress(task)

              return (
                <tr
                  key={task.id}
                  style={{
                    borderBottom: `1px solid ${borderColor}`,
                    backgroundColor: taskIdx % 2 === 0 ? "transparent" : `${primaryColor}08`,
                  }}
                >
                  {/* Task Name */}
                  <td className="px-4 py-3 font-medium" style={{ color: theme?.colors?.foreground || "#fff" }}>
                    <div className="flex items-center gap-2">
                      <span>{task.icon}</span>
                      <span>{task.title}</span>
                    </div>
                  </td>

                  {/* Checkbox for each date */}
                  {dateRange.map((date) => {
                    const key = format(date, "yyyy-MM-dd")
                    const taskForDate = tasks.find((t) => t.title === task.title && format(new Date(t.dueDate), "yyyy-MM-dd") === key)
                    const isCompleted = taskForDate?.completed || false

                    return (
                      <td
                        key={`${task.title}-${key}`}
                        className="px-2 py-3 text-center"
                        style={{ borderRight: `1px solid ${borderColor}` }}
                      >
                        <button
                          onClick={() => {
                            if (taskForDate) {
                              onTaskToggle(taskForDate.id, key, !isCompleted)
                            }
                          }}
                          className="mx-auto flex h-6 w-6 items-center justify-center rounded border transition-all"
                          style={{
                            borderColor: isCompleted ? primaryColor : borderColor,
                            backgroundColor: isCompleted ? primaryColor : "transparent",
                            cursor: taskForDate ? "pointer" : "default",
                            opacity: taskForDate ? 1 : 0.3,
                          }}
                        >
                          {isCompleted && (
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth={3}>
                              <path d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      </td>
                    )
                  })}

                  {/* Progress Bar */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-6 flex-1 overflow-hidden rounded-full border" style={{ borderColor }}>
                        <div
                          className="h-full transition-all"
                          style={{
                            width: `${progress}%`,
                            backgroundColor: primaryColor,
                          }}
                        />
                      </div>
                      <span
                        className="text-xs font-bold"
                        style={{ color: primaryColor, minWidth: "30px" }}
                      >
                        {progress}%
                      </span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {uniqueTasks.map((task) => {
          const progress = calculateProgress(task)
          const taskOccurrences = tasks.filter((t) => t.title === task.title)
          const completed = taskOccurrences.filter((t) => t.completed).length

          return (
            <Card
              key={task.title}
              className="p-4"
              style={{
                backgroundColor: theme?.colors?.secondary || "#1e293b",
                borderColor,
              }}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{task.icon}</span>
                  <h3 style={{ color: theme?.colors?.foreground || "#fff" }} className="font-semibold">
                    {task.title}
                  </h3>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: theme?.colors?.mutedForeground || "#94a3b8" }}>
                    {completed} / {taskOccurrences.length}
                  </span>
                  <span style={{ color: primaryColor }} className="font-bold">
                    {progress}%
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full border" style={{ borderColor }}>
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: primaryColor,
                    }}
                  />
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
