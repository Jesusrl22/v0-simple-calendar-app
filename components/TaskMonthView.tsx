"use client"

import React, { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Task, getTasksForMonth, isToday } from "@/lib/task-utils"

interface TaskMonthViewProps {
  tasks: Task[]
  onTaskClick?: (task: Task) => void
  onDayClick?: (date: Date) => void
}

export function TaskMonthView({ tasks, onTaskClick, onDayClick }: TaskMonthViewProps) {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())

  const monthTasks = getTasksForMonth(tasks, currentYear, currentMonth)

  // Group tasks by day
  const tasksByDay: Record<number, Task[]> = {}
  monthTasks.forEach((task) => {
    if (task.due_date) {
      const day = new Date(task.due_date).getDate()
      if (!tasksByDay[day]) tasksByDay[day] = []
      tasksByDay[day].push(task)
    }
  })

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfMonthJS = new Date(currentYear, currentMonth, 1).getDay()
  // Convertir de domingo=0 a lunes=0 (restar 1 y manejar el caso domingo)
  const firstDayOfMonth = firstDayOfMonthJS === 0 ? 6 : firstDayOfMonthJS - 1

  const monthName = new Date(currentYear, currentMonth).toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  })

  const days = []
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const getTaskColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "bg-red-950 text-red-400"
      case "medium":
        return "bg-yellow-950 text-yellow-300"
      case "low":
        return "bg-green-950 text-green-400"
      default:
        return "bg-secondary/20 text-secondary-foreground"
    }
  }

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between bg-card p-4 rounded-lg border border-border">
        <Button
          variant="outline"
          size="sm"
          onClick={prevMonth}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
        <h2 className="text-xl font-bold capitalize text-center flex-1 text-foreground">
          {monthName}
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={nextMonth}
          className="gap-1"
        >
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-border bg-primary/10">
          {["Lun", "Mar", "Mié", "Jue", "Vie", "Sab", "Dom"].map((day) => (
            <div key={day} className="p-3 text-center font-semibold text-sm text-muted-foreground border-r border-border last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const taskList = day ? tasksByDay[day] || [] : []
            const isCurrentDay = day &&
              day === today.getDate() &&
              currentMonth === today.getMonth() &&
              currentYear === today.getFullYear()
            
            const dayDate = day ? new Date(currentYear, currentMonth, day) : null

            return (
              <div
                key={index}
                className={`min-h-24 p-2 border-r border-b border-border last:border-r-0 ${
                  isCurrentDay ? "bg-primary/10" : "bg-card hover:bg-primary/5"
                } transition-colors cursor-pointer last-row:border-b-0`}
                onClick={() => day && dayDate && onDayClick?.(dayDate)}
              >
                {day ? (
                  <div className="h-full flex flex-col">
                    <p
                      className={`text-sm font-semibold mb-1 ${
                        isCurrentDay ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {day}
                    </p>
                    <div className="flex-1 space-y-1 overflow-hidden">
                      {taskList.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-2">
                          Click para agregar
                        </p>
                      ) : (
                        <>
                          {taskList.slice(0, 3).map((task, taskIndex) => (
                            <div
                              key={task.id}
                              className={`text-xs px-2 py-1 rounded truncate cursor-pointer hover:shadow-md transition-shadow ${getTaskColor(
                                task.priority
                              )}`}
                              onClick={(e) => {
                                e.stopPropagation()
                                onTaskClick?.(task)
                              }}
                              title={task.title}
                            >
                              {task.completed && "✓ "}
                              {task.title}
                            </div>
                          ))}
                          {taskList.length > 3 && (
                            <div className="text-xs px-2 py-1 text-muted-foreground font-medium">
                              +{taskList.length - 3} más
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-muted h-full rounded" />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Summary */}
      <Card className="p-4 bg-primary/5 border border-primary/20">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-primary">
              {monthTasks.length}
            </p>
            <p className="text-sm text-muted-foreground">Tareas este mes</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-500">
              {monthTasks.filter((t) => t.completed).length}
            </p>
            <p className="text-sm text-muted-foreground">Completadas</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-500">
              {monthTasks.filter((t) => !t.completed).length}
            </p>
            <p className="text-sm text-muted-foreground">Pendientes</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
