"use client"

import React, { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, Edit2, Calendar, CheckCircle2, Circle, Zap } from "lucide-react"
import { Task, getTodayTasks, sortTasks } from "@/lib/task-utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface TaskDayViewProps {
  tasks: Task[]
  onTaskToggle: (taskId: string, completed: boolean) => void
  onTaskDelete: (taskId: string) => void
  onTaskEdit: (task: Task) => void
  onTaskCreate: (title: string, priority: string, duration?: string) => void
}

export function TaskDayView({
  tasks,
  onTaskToggle,
  onTaskDelete,
  onTaskEdit,
  onTaskCreate,
}: TaskDayViewProps) {
  const [quickAddTitle, setQuickAddTitle] = useState("")
  const [quickAddPriority, setQuickAddPriority] = useState("medium")
  const [quickAddDuration, setQuickAddDuration] = useState("")
  const [isAddingQuick, setIsAddingQuick] = useState(false)

  const todayTasks = sortTasks(getTodayTasks(tasks))
  const activeTasks = todayTasks.filter((t) => !t.completed)
  const completedTasks = todayTasks.filter((t) => t.completed)

  const handleQuickAdd = async () => {
    if (!quickAddTitle.trim()) return

    setIsAddingQuick(true)
    try {
      await onTaskCreate(quickAddTitle, quickAddPriority, quickAddDuration)
      setQuickAddTitle("")
      setQuickAddPriority("medium")
      setQuickAddDuration("")
    } finally {
      setIsAddingQuick(false)
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 border-red-200 text-red-700"
      case "medium":
        return "bg-amber-500/10 border-amber-200 text-amber-700"
      case "low":
        return "bg-emerald-500/10 border-emerald-200 text-emerald-700"
      default:
        return "bg-slate-500/10 border-slate-200 text-slate-700"
    }
  }

  const getPriorityIcon = (priority?: string) => {
    if (priority === "high") return <Zap className="h-3 w-3" />
    return null
  }

  const getPriorityBadge = (priority?: string) => {
    const labels: Record<string, string> = {
      high: "Alta",
      medium: "Media",
      low: "Baja",
    }
    return labels[priority || "medium"] || "Media"
  }

  return (
    <div className="space-y-6">
      {/* Quick Add Task */}
      <Card className="border-2 border-dashed border-primary/40 bg-gradient-to-br from-primary/5 to-primary/2 p-5 backdrop-blur-sm">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Añade una tarea para hoy..."
              value={quickAddTitle}
              onChange={(e) => setQuickAddTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleQuickAdd()
                }
              }}
              className="bg-background/80 flex-1 border-primary/30"
            />
            <input
              type="text"
              placeholder="Ej: 30 min"
              value={quickAddDuration}
              onChange={(e) => setQuickAddDuration(e.target.value)}
              className="px-3 py-2 border border-primary/30 rounded-lg bg-background/80 text-sm w-full sm:w-28"
            />
            <select
              value={quickAddPriority}
              onChange={(e) => setQuickAddPriority(e.target.value)}
              className="px-3 py-2 border border-primary/30 rounded-lg bg-background/80 text-sm w-full sm:w-28"
            >
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
          </div>
          <Button
            onClick={handleQuickAdd}
            disabled={isAddingQuick || !quickAddTitle.trim()}
            className="gap-2 w-full"
          >
            <Plus className="h-4 w-4" />
            Añadir Tarea
          </Button>
        </div>
      </Card>

      {/* Active Tasks */}
      {activeTasks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Circle className="h-5 w-5 text-blue-600 fill-blue-600" />
              </div>
              Tareas Pendientes
              <span className="ml-auto text-sm font-normal text-muted-foreground bg-primary/10 px-3 py-1 rounded-full">
                {activeTasks.length}
              </span>
            </h3>
          </div>
          <div className="space-y-2">
            {activeTasks.map((task) => (
              <Card 
                key={task.id} 
                className="p-4 hover:shadow-lg hover:border-primary/50 transition-all duration-200 border border-border/50 group"
              >
                <div className="flex items-start gap-4">
                  <div 
                    className="mt-1 cursor-pointer hover:scale-110 transition-transform"
                    onClick={() => onTaskToggle(task.id, false)}
                  >
                    <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground text-balance">{task.title}</h4>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-1.5">{task.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {getPriorityIcon(task.priority)}
                        {getPriorityBadge(task.priority)}
                      </span>
                      {task.category && (
                        <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-medium bg-secondary/10 text-secondary-foreground border border-secondary/30">
                          {task.category}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTaskEdit(task)}
                      className="hover:bg-blue-500/10 hover:text-blue-600"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTaskDelete(task.id)}
                      className="hover:bg-red-500/10 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              Completadas
              <span className="ml-auto text-sm font-normal text-muted-foreground bg-emerald-500/10 px-3 py-1 rounded-full">
                {completedTasks.length}
              </span>
            </h3>
          </div>
          <div className="space-y-2">
            {completedTasks.map((task) => (
              <Card
                key={task.id}
                className="p-4 bg-emerald-500/5 border border-emerald-200/30 hover:border-emerald-200/50 transition-all duration-200 group"
              >
                <div className="flex items-start gap-4">
                  <div 
                    className="mt-1 cursor-pointer hover:scale-110 transition-transform"
                    onClick={() => onTaskToggle(task.id, true)}
                  >
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-emerald-700/70 line-through text-balance">{task.title}</h4>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onTaskDelete(task.id)}
                    className="flex-shrink-0 hover:bg-red-500/10 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {todayTasks.length === 0 && (
        <Card className="p-12 text-center border border-dashed border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-primary/3">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <Calendar className="h-8 w-8 text-primary/60" />
            </div>
          </div>
          <h3 className="font-semibold text-foreground mb-2 text-lg">No hay tareas para hoy</h3>
          <p className="text-muted-foreground text-sm">¡Crea una nueva tarea arriba para empezar!</p>
        </Card>
      )}
    </div>
  )
}
