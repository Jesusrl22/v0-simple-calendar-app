"use client"

import { useEffect, useState } from "react"

export function TimezoneDisplay() {
  const [time, setTime] = useState<string>("")
  const [timezone, setTimezone] = useState<string>("")

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const timeString = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })

      const timezoneName = Intl.DateTimeFormat("en-US", {
        timeZoneName: "short",
      })
        .formatToParts(now)
        .find((part) => part.type === "timeZoneName")?.value

      setTime(timeString)
      setTimezone(timezoneName || "UTC")
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [])

  if (!time) {
    return <div className="text-muted-foreground animate-pulse">Loading...</div>
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-primary">{time}</span>
      <span className="text-xs text-muted-foreground px-2 py-1 rounded bg-muted/30">{timezone}</span>
    </div>
  )
}
