"use client"

import { Card } from "@/components/ui/card"

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: {
    value: number
    direction: "up" | "down"
  }
  subtitle?: string
  color?: string
  onClick?: () => void
  locked?: boolean
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  subtitle,
  color = "text-primary",
  onClick,
  locked = false,
}: StatCardProps) {
  return (
    <Card
      onClick={onClick}
      className={`glass-card overflow-hidden p-6 transition-all duration-300 group ${
        locked ? "cursor-pointer opacity-75" : "hover:shadow-lg"
      } ${locked ? "hover:border-primary" : "border border-border/50"}`}
    >
      {/* Header with icon and trend */}
      <div className="flex items-center justify-between mb-6">
        <div className={`w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        {trend && (
          <div
            className={`text-sm font-semibold flex items-center gap-1 ${
              trend.direction === "up" ? "text-green-500" : "text-red-500"
            }`}
          >
            {trend.direction === "up" ? "↑" : "↓"}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mb-4">
        <h3 className="text-4xl font-bold mb-2">{value}</h3>
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>

      {/* Subtitle or locked state */}
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      {locked && <p className="text-xs text-primary font-medium mt-2">Upgrade required</p>}
    </Card>
  )
}
