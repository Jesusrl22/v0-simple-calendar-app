"use client"

import { useEffect } from "react"
import { registerServiceWorker } from "@/lib/notifications"

export function useServiceWorkerInit() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      registerServiceWorker().catch(() => {
        // SW registration failed silently
      })
    }
  }, [])
}
