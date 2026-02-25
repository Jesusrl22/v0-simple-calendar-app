"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { canAccessStatistics } from "@/lib/subscription"
import { UpgradeModal } from "@/components/upgrade-modal"
import { useTranslation } from "@/hooks/useTranslation"

type TimeRange = "day" | "week" | "month"

export default function StatsPage() {
  const { t } = useTranslation()
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    totalNotes: 0,
    totalPomodoro: 0,
    totalFocusTime: 0,
  })
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userTier, setUserTier] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<TimeRange>("day")
  const [userTimezone, setUserTimezone] = useState<string>("UTC")

  useEffect(() => {
    checkAccess()
  }, [])

  useEffect(() => {
    if (userTier && canAccessStatistics(userTier)) {
      fetchStats()
    }
  }, [timeRange, userTier])

  const checkAccess = async () => {
    try {
      const response = await fetch("/api/user/profile")
      if (response.ok) {
        const data = await response.json()
        setUserTier(data.subscription_tier || "free")
        setUserTimezone(data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone)
      }
    } catch (error) {
      console.error("Error checking access:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/stats?range=${timeRange}&timezone=${encodeURIComponent(userTimezone)}`)
      if (response.ok) {
        const data = await response.json()
        setStats({
          totalTasks: data.totalTasks || 0,
          completedTasks: data.completedTasks || 0,
          totalNotes: data.totalNotes || 0,
          totalPomodoro: data.totalPomodoro || 0,
          totalFocusTime: data.totalFocusTime || 0,
        })
        setChartData(data.chartData || [])
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const completionRate = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-muted-foreground">{t("loading")}</div>
      </div>
    )
  }

  if (!canAccessStatistics(userTier)) {
    return <UpgradeModal feature={t("statistics")} requiredPlan="pro" />
  }

  return (
    <div className="p-4 md:p-8">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h1 className="text-3xl md:text-4xl font-bold">
            <span className="text-primary neon-text">{t("your_statistics")}</span>
          </h1>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={timeRange === "day" ? "default" : "outline"}
              onClick={() => setTimeRange("day")}
              className={timeRange === "day" ? "bg-primary/20 border-primary text-primary hover:bg-primary/30" : ""}
            >
              {t("day")}
            </Button>
            <Button
              variant={timeRange === "week" ? "default" : "outline"}
              onClick={() => setTimeRange("week")}
              className={timeRange === "week" ? "bg-primary/20 border-primary text-primary hover:bg-primary/30" : ""}
            >
              {t("week")}
            </Button>
            <Button
              variant={timeRange === "month" ? "default" : "outline"}
              onClick={() => setTimeRange("month")}
              className={timeRange === "month" ? "bg-primary/20 border-primary text-primary hover:bg-primary/30" : ""}
            >
              {t("month")}
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: t("total_tasks"),
              value: stats.totalTasks,
              showProgress: false,
            },
            {
              title: t("tasks_completed"),
              value: stats.completedTasks,
              max: stats.totalTasks,
              showProgress: stats.totalTasks > 0,
            },
            {
              title: t("total_pomodoros"),
              value: stats.totalPomodoro,
              showProgress: false,
            },
            {
              title: t("focus_time"),
              value: `${stats.totalFocusTime}h`,
              showProgress: false,
            },
          ].map((stat) => (
            <div key={stat.title}>
              <Card
                className="glass-card p-4 md:p-6 border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/20 hover:scale-105 transition-transform duration-300"
              >
                <h3 className="text-xs md:text-sm text-muted-foreground mb-2">{stat.title}</h3>
                <p className="text-2xl md:text-3xl font-bold text-primary mb-3">{stat.value}</p>
                
                {stat.showProgress && stat.max && stat.max > 0 && (
                  <div className="space-y-2">
                    <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-primary h-full transition-all duration-300"
                        style={{ width: `${Math.min((stat.value / stat.max) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{stat.value}/{stat.max}</span>
                      <span>{Math.round((stat.value / stat.max) * 100)}%</span>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          ))}
        </div>

        {/* Charts and Insights Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart Card */}
          <Card className="glass-card p-4 md:p-6 border-2 border-primary/30">
            <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6">{t("activity_over_time")}</h2>
            <Tabs defaultValue="tasks">
              <TabsList className="mb-4 w-full">
                <TabsTrigger value="tasks" className="flex-1">{t("tasks")}</TabsTrigger>
                <TabsTrigger value="pomodoro" className="flex-1">{t("pomodoro")}</TabsTrigger>
              </TabsList>
              <TabsContent value="tasks">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--primary) / 0.3)",
                        borderRadius: "8px",
                        color: "hsl(var(--foreground))",
                      }}
                    />
                    <Bar dataKey="tasks" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </TabsContent>
              <TabsContent value="pomodoro">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--primary) / 0.3)",
                        borderRadius: "8px",
                        color: "hsl(var(--foreground))",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="pomodoro"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
            </Tabs>
          </Card>

          {/* Insights Card */}
          <Card className="glass-card p-4 md:p-6 border-2 border-primary/30">
            <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6">{t("productivity_insights")}</h2>
            <div className="space-y-4 md:space-y-6">
              {/* Task Completion Rate */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs md:text-sm text-muted-foreground font-medium">{t("task_completion_rate")}</span>
                  <span className="text-sm md:text-base font-bold text-primary">{completionRate}%</span>
                </div>
                <div className="h-2.5 bg-secondary/50 rounded-full overflow-hidden border border-border/50">
                  <div
                    style={{ width: `${completionRate}%` }}
                    className="h-full bg-gradient-to-r from-primary/80 to-primary transition-all duration-1000"
                  />
                </div>
              </div>

              {/* Statistics Table */}
              <div className="border border-border/50 rounded-lg overflow-hidden bg-background/30">
                <div className="divide-y divide-border/50">
                  <div className="grid grid-cols-2 bg-primary/10 border-b border-border/50">
                    <div className="px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm font-semibold text-muted-foreground">
                      Métrica
                    </div>
                    <div className="px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm font-semibold text-muted-foreground text-right">
                      Valor
                    </div>
                  </div>
                  <div className="grid grid-cols-2 hover:bg-primary/5 transition-colors">
                    <div className="px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm">{t("average_focus_time")}</div>
                    <div className="px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm font-semibold text-primary text-right">
                      {timeRange === "day"
                        ? `${stats.totalFocusTime}h`
                        : timeRange === "week"
                          ? `${Math.round((stats.totalFocusTime / 7) * 10) / 10}h/day`
                          : `${Math.round((stats.totalFocusTime / 30) * 10) / 10}h/day`}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 hover:bg-primary/5 transition-colors border-t border-border/50">
                    <div className="px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm">{t("total_pomodoros")}</div>
                    <div className="px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm font-semibold text-secondary text-right">
                      {stats.totalPomodoro}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 hover:bg-primary/5 transition-colors border-t border-border/50">
                    <div className="px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm">{t("notes_created")}</div>
                    <div className="px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm font-semibold text-foreground text-right">
                      {stats.totalNotes}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
