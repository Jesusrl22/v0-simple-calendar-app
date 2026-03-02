"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { format, startOfWeek, addDays, isSameDay } from "date-fns"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"

interface Task {
  id: string
  title: string
  completed?: boolean
  completed_at?: string
  due_date?: string
  priority?: string
}

interface TaskTrackerViewProps {
  tasks: Task[]
  onTaskToggle?: (taskId: string, completed: boolean) => void
  viewMode?: "week" | "month"
}

export function TaskTrackerView({ tasks = [], onTaskToggle, viewMode = "week" }: TaskTrackerViewProps) {
  const [selectedWeekStart] = useState(startOfWeek(new Date()))

  // Generate days for the week view
  const weekDays = useMemo(() => {
    const days = []
    for (let i = 0; i < 7; i++) {
      days.push(addDays(selectedWeekStart, i))
    }
    return days
  }, [selectedWeekStart])

  // Calculate task completion for each day
  const tasksByDay = useMemo(() => {
    const taskMap: Record<string, Task[]> = {}
    
    weekDays.forEach((day) => {
      const dayKey = format(day, "yyyy-MM-dd")
      taskMap[dayKey] = tasks.filter((task) => {
        if (!task.due_date) return false
        return isSameDay(new Date(task.due_date), day)
      })
    })
    
    return taskMap
  }, [tasks, weekDays])

  // Calculate progress percentage
  const calculateProgress = (dayTasks: Task[]) => {
    if (dayTasks.length === 0) return 0
    const completed = dayTasks.filter((t) => t.completed).length
    return Math.round((completed / dayTasks.length) * 100)
  }

  return (
    <div className="w-full space-y-6">
      {/* Tracker Table */}
      <Card className="overflow-hidden border border-primary/30 bg-background/50 backdrop-blur">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Header */}
            <div className="grid gap-2 p-4 border-b border-primary/20" style={{ gridTemplateColumns: "200px repeat(7, 1fr)" }}>
              <div className="font-semibold text-foreground">Tareas</div>
              {weekDays.map((day, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-xs font-semibold text-primary">{format(day, "EEE").toUpperCase()}</div>
                  <div className="text-sm text-muted-foreground">{format(day, "d")}</div>
                </div>
              ))}
            </div>

            {/* Tasks Rows */}
            <div className="divide-y divide-primary/10">
              {tasks.slice(0, 10).map((task) => (
                <div
                  key={task.id}
                  className="grid gap-2 p-4 hover:bg-primary/5 transition-colors"
                  style={{ gridTemplateColumns: "200px repeat(7, 1fr)" }}
                >
                  <div className="truncate font-medium text-sm text-foreground">
                    <div className="truncate">{task.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {task.priority && `${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}`}
                    </div>
                  </div>

                  {weekDays.map((day, idx) => {
                    const dayKey = format(day, "yyyy-MM-dd")
                    const dayTasks = tasksByDay[dayKey] || []
                    const taskForDay = dayTasks.find((t) => t.id === task.id)
                    
                    return (
                      <div key={idx} className="flex items-center justify-center">
                        {taskForDay ? (
                          <button
                            onClick={() => onTaskToggle?.(task.id, !taskForDay.completed)}
                            className={`relative w-6 h-6 rounded border-2 transition-all ${
                              taskForDay.completed
                                ? "bg-primary border-primary"
                                : "border-primary/30 hover:border-primary/50"
                            }`}
                          >
                            {taskForDay.completed && (
                              <svg
                                className="w-4 h-4 text-background absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                        ) : (
                          <div className="w-6 h-6 rounded border border-border/50 bg-muted/20" />
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {weekDays.map((day, idx) => {
          const dayKey = format(day, "yyyy-MM-dd")
          const dayTasks = tasksByDay[dayKey] || []
          const progress = calculateProgress(dayTasks)
          const completed = dayTasks.filter((t) => t.completed).length

          return (
            <Card key={idx} className="p-4 border border-primary/20 bg-background/50">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{format(day, "EEEE")}</p>
                  <p className="text-xs text-muted-foreground">{format(day, "d MMMM")}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{completed}</p>
                  <p className="text-xs text-muted-foreground">de {dayTasks.length}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-primary/10 overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">{progress}% completado</p>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
