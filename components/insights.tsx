"use client"

import { Card } from "@/components/ui/card"

interface InsightItem {
  label: string
  value: number
  color: string
  percentage: number
}

interface InsightsProps {
  title: string
  subtitle?: string
  items: InsightItem[]
  mainValue?: string | number
  mainLabel?: string
}

export function Insights({ title, subtitle, items, mainValue, mainLabel }: InsightsProps) {
  const total = items.reduce((sum, item) => sum + item.value, 0)
  const circumference = 2 * Math.PI * 45

  return (
    <Card className="glass-card p-6 lg:p-8">
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      {subtitle && <p className="text-sm text-muted-foreground mb-6">{subtitle}</p>}

      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Circular Chart */}
        <div className="flex-shrink-0 flex flex-col items-center">
          <svg width="200" height="200" viewBox="0 0 120 120" className="mb-4">
            {/* Background circle */}
            <circle cx="60" cy="60" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />

            {/* Progress circles */}
            {items.map((item, index) => {
              const startAngle = items.slice(0, index).reduce((sum, i) => sum + (i.percentage / 100) * circumference, 0)
              const endAngle = startAngle + (item.percentage / 100) * circumference

              return (
                <circle
                  key={item.label}
                  cx="60"
                  cy="60"
                  r="45"
                  fill="none"
                  stroke={item.color}
                  strokeWidth="8"
                  strokeDasharray={`${(item.percentage / 100) * circumference} ${circumference}`}
                  strokeDashoffset={-startAngle}
                  strokeLinecap="round"
                  style={{
                    transform: "rotate(-90deg)",
                    transformOrigin: "60px 60px",
                    transition: "stroke-dashoffset 0.3s ease",
                  }}
                />
              )
            })}

            {/* Center text */}
            <text x="60" y="55" textAnchor="middle" className="text-2xl font-bold fill-foreground" fontSize="20">
              {mainValue || Math.round((items[0]?.percentage || 0))}%
            </text>
            {mainLabel && (
              <text x="60" y="70" textAnchor="middle" className="text-xs fill-muted-foreground" fontSize="10">
                {mainLabel}
              </text>
            )}
          </svg>
        </div>

        {/* Items List */}
        <div className="flex-1 space-y-4">
          {items.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.value}</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-primary">{item.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
