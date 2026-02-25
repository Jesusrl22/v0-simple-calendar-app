'use client'

import { useEffect, useRef, useCallback } from 'react'

/**
 * Hook that schedules local notifications for calendar events.
 *
 * Strategy:
 * 1. App OPEN (all browsers): Sends all future events to the Service Worker via
 *    postMessage. The SW uses setTimeout internally — notifications fire even if
 *    the user switches tabs or minimises the browser (SW keeps running).
 * 2. App CLOSED (Chrome/Edge/Android): Web Push via VAPID is handled by the
 *    server cron job which compares due_date (UTC ISO) with server UTC.
 * 3. Fallback (Firefox / Safari with no SW push support): in-page setTimeout
 *    fires while the tab is open/visible.
 *
 * Call `rescheduleWithEvents(events)` immediately after creating/editing/deleting
 * an event so the SW schedules are always up-to-date without waiting for the
 * next 5-minute refresh interval.
 */
export function useCalendarEventNotifications() {
  const fallbackTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  // ------------------------------------------------------------------
  // Request notification permission (call from a user gesture)
  // ------------------------------------------------------------------
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (typeof Notification === 'undefined') return false
    if (Notification.permission === 'granted') return true
    if (Notification.permission === 'denied') return false

    const result = await Notification.requestPermission()
    return result === 'granted'
  }, [])

  // ------------------------------------------------------------------
  // Send events to the Service Worker for scheduling
  // ------------------------------------------------------------------
  const scheduleViaSW = useCallback(async (events: any[]): Promise<boolean> => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return false

    try {
      const registration = await navigator.serviceWorker.ready
      if (!registration?.active) return false

      registration.active.postMessage({
        type: 'SCHEDULE_NOTIFICATIONS',
        events,
      })
      return true
    } catch {
      return false
    }
  }, [])

  // ------------------------------------------------------------------
  // Fallback: schedule in-page timeouts (works while tab is visible)
  // ------------------------------------------------------------------
  const scheduleViaTimeout = useCallback((events: any[]) => {
    // Clear previous timers
    fallbackTimers.current.forEach((id) => clearTimeout(id))
    fallbackTimers.current.clear()

    const now = Date.now()

    events.forEach((ev) => {
      if (!ev.due_date || ev.completed) return

      const eventTime = new Date(ev.due_date).getTime()

      const schedule = (ms: number, isNow: boolean) => {
        if (ms < -60_000) return // already more than 1 min past
        const delay = Math.max(0, ms)
        const key = `${ev.id}-${isNow ? 'now' : 'reminder'}`

        const timerId = setTimeout(() => {
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            try {
              new Notification(
                isNow ? `Evento ahora: ${ev.title}` : `Recordatorio: ${ev.title}`,
                {
                  body: isNow
                    ? `Tu evento "${ev.title}" comienza ahora`
                    : `"${ev.title}" comienza en 10 minutos`,
                  icon: '/icon-192.jpg',
                  tag: key,
                }
              )
            } catch {
              // some browsers block new Notification() outside user gesture
            }
          }
          fallbackTimers.current.delete(key)
        }, delay)

        fallbackTimers.current.set(key, timerId)
      }

      schedule(eventTime - 10 * 60 * 1000 - now, false) // 10 min before
      schedule(eventTime - now, true)                     // exactly at event time
    })
  }, [])

  // ------------------------------------------------------------------
  // Core: given a list of events, program them via SW (or fallback)
  // ------------------------------------------------------------------
  const rescheduleWithEvents = useCallback(async (events: any[]) => {
    if (typeof Notification === 'undefined') return
    if (Notification.permission !== 'granted') return

    const now = Date.now()
    const oneDayMs = 24 * 60 * 60 * 1000

    // Only schedule events in the next 24 hours
    const relevant = events.filter((ev) => {
      if (!ev.due_date || ev.completed) return false
      const t = new Date(ev.due_date).getTime()
      return t > now - 60_000 && t < now + oneDayMs
    })

    const usedSW = await scheduleViaSW(relevant)
    if (!usedSW) {
      scheduleViaTimeout(relevant)
    }
  }, [scheduleViaSW, scheduleViaTimeout])

  // ------------------------------------------------------------------
  // Fetch events from API and reschedule
  // ------------------------------------------------------------------
  const refreshSchedule = useCallback(async () => {
    if (typeof Notification === 'undefined') return
    if (Notification.permission !== 'granted') return

    try {
      const response = await fetch('/api/calendar', { cache: 'no-store' })
      if (!response.ok) return
      const data = await response.json()
      const events: any[] = Array.isArray(data.events) ? data.events : []
      await rescheduleWithEvents(events)
    } catch {
      // ignore network errors silently
    }
  }, [rescheduleWithEvents])

  // ------------------------------------------------------------------
  // Listen for SW messages (RESCHEDULE_NEEDED when sw restarts)
  // ------------------------------------------------------------------
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

    const handleSWMessage = (event: MessageEvent) => {
      if (event.data?.type === 'RESCHEDULE_NEEDED') {
        refreshSchedule()
      }
    }

    navigator.serviceWorker.addEventListener('message', handleSWMessage)
    return () => navigator.serviceWorker.removeEventListener('message', handleSWMessage)
  }, [refreshSchedule])

  // ------------------------------------------------------------------
  // Run on mount and every 5 minutes; also on tab visibility change
  // ------------------------------------------------------------------
  useEffect(() => {
    refreshSchedule()
    const intervalId = setInterval(refreshSchedule, 5 * 60 * 1000)

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') refreshSchedule()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(intervalId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      fallbackTimers.current.forEach((id) => clearTimeout(id))
      fallbackTimers.current.clear()
    }
  }, [refreshSchedule])

  return { rescheduleWithEvents, requestPermission, refreshSchedule }
}
