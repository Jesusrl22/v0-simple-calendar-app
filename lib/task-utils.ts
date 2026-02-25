// Task utilities for organizing and filtering tasks by time periods

export interface Task {
  id: string
  title: string
  description?: string
  due_date?: string
  completed: boolean
  priority?: string
  status?: string
  display_order?: number
  created_at?: string
  updated_at?: string
  category?: string
  tags?: string[]
  completed_at?: string
}

/**
 * Get tasks for a specific day
 */
export function getTasksForDay(tasks: Task[], date: Date): Task[] {
  const dayStart = new Date(date)
  dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(date)
  dayEnd.setHours(23, 59, 59, 999)

  return tasks.filter((task) => {
    if (!task.due_date) return false
    const taskDate = new Date(task.due_date)
    return taskDate >= dayStart && taskDate <= dayEnd
  })
}

/**
 * Get tasks for the current week (Monday to Sunday)
 */
export function getTasksForWeek(tasks: Task[], startDate: Date): Task[] {
  const weekStart = new Date(startDate)
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1) // Monday
  weekStart.setHours(0, 0, 0, 0)

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6) // Sunday
  weekEnd.setHours(23, 59, 59, 999)

  return tasks.filter((task) => {
    if (!task.due_date) return false
    const taskDate = new Date(task.due_date)
    return taskDate >= weekStart && taskDate <= weekEnd
  })
}

/**
 * Get tasks for a specific month
 */
export function getTasksForMonth(tasks: Task[], year: number, month: number): Task[] {
  const monthStart = new Date(year, month, 1)
  monthStart.setHours(0, 0, 0, 0)

  const monthEnd = new Date(year, month + 1, 0)
  monthEnd.setHours(23, 59, 59, 999)

  return tasks.filter((task) => {
    if (!task.due_date) return false
    const taskDate = new Date(task.due_date)
    return taskDate >= monthStart && taskDate <= monthEnd
  })
}

/**
 * Group tasks by day of week for week view
 */
export function groupTasksByDay(tasks: Task[], startDate: Date): Record<string, Task[]> {
  const dayNames = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
  const grouped: Record<string, Task[]> = {}

  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() - date.getDay() + 1 + i)
    const dayKey = date.toISOString().split("T")[0]
    const dayName = dayNames[i]
    grouped[dayKey] = getTasksForDay(tasks, date)
  }

  return grouped
}

/**
 * Group tasks by date for month view
 */
export function groupTasksByDate(tasks: Task[]): Record<string, Task[]> {
  const grouped: Record<string, Task[]> = {}

  tasks.forEach((task) => {
    if (task.due_date) {
      const dateKey = task.due_date.split("T")[0]
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(task)
    }
  })

  return grouped
}

/**
 * Sort tasks by display order and priority
 */
export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    // First by display_order
    if ((a.display_order ?? Infinity) !== (b.display_order ?? Infinity)) {
      return (a.display_order ?? Infinity) - (b.display_order ?? Infinity)
    }

    // Then by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 3
    const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 3
    if (aPriority !== bPriority) return aPriority - bPriority

    // Finally by due_date
    if (a.due_date && b.due_date) {
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    }

    return 0
  })
}

/**
 * Get overdue tasks
 */
export function getOverdueTasks(tasks: Task[]): Task[] {
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  return tasks.filter(
    (task) =>
      !task.completed &&
      task.due_date &&
      new Date(task.due_date) < now
  )
}

/**
 * Get today's tasks
 */
export function getTodayTasks(tasks: Task[]): Task[] {
  return getTasksForDay(tasks, new Date())
}

/**
 * Format date for display
 */
export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("es-ES", { month: "short", day: "numeric" })
}

/**
 * Get day name in Spanish
 */
export function getDayNameES(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
  return dayNames[d.getDay()]
}

/**
 * Check if date is today
 */
export function isToday(date: Date | string): boolean {
  const d = typeof date === "string" ? new Date(date) : date
  const today = new Date()
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  )
}

/**
 * Get percentage of tasks completed
 */
export function getCompletionPercentage(tasks: Task[]): number {
  if (tasks.length === 0) return 0
  const completed = tasks.filter((t) => t.completed).length
  return Math.round((completed / tasks.length) * 100)
}
