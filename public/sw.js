// =========================================================
// SERVICE WORKER - Futuristic Calendar Notifications
// Handles scheduled notifications even when app is closed
// =========================================================

const CACHE_NAME = "fcal-sw-v2"

// Store scheduled notification timers
const scheduledTimers = new Map()

// -------------------------------------------------------
// INSTALL & ACTIVATE
// -------------------------------------------------------
self.addEventListener("install", (event) => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim())
})

// -------------------------------------------------------
// MESSAGES FROM CLIENT (schedule / cancel notifications)
// -------------------------------------------------------
self.addEventListener("message", (event) => {
  const { type, events, eventId } = event.data || {}

  if (type === "SCHEDULE_NOTIFICATIONS") {
    // Cancel all existing scheduled timers first
    scheduledTimers.forEach((timerId) => clearTimeout(timerId))
    scheduledTimers.clear()

    if (!Array.isArray(events)) return

    const now = Date.now()

    events.forEach((ev) => {
      if (!ev.due_date || ev.completed) return

      const eventTime = new Date(ev.due_date).getTime()

      // Notify 10 minutes before
      const tenMinBefore = eventTime - 10 * 60 * 1000
      const msUntilTenMin = tenMinBefore - now

      // Notify exactly at event time
      const msUntilEvent = eventTime - now

      const scheduleFor = (ms, label) => {
        if (ms < -60 * 1000) return // already passed more than 1 min ago, skip
        // If ms is negative but within -60s, show immediately
        const delay = Math.max(0, ms)

        const timerId = setTimeout(() => {
          showLocalNotification({
            title: label === "now" ? `Evento ahora: ${ev.title}` : `Recordatorio: ${ev.title}`,
            body:
              label === "now"
                ? `Tu evento "${ev.title}" comienza ahora`
                : `"${ev.title}" comienza en 10 minutos`,
            eventId: ev.id,
            url: "/app/calendar",
          })
          scheduledTimers.delete(`${ev.id}-${label}`)
        }, delay)

        scheduledTimers.set(`${ev.id}-${label}`, timerId)
      }

      scheduleFor(msUntilTenMin, "reminder")
      scheduleFor(msUntilEvent, "now")
    })

  } else if (type === "CANCEL_NOTIFICATION") {
    // Cancel a specific event's timers
    const reminderTimer = scheduledTimers.get(`${eventId}-reminder`)
    const nowTimer = scheduledTimers.get(`${eventId}-now`)
    if (reminderTimer) { clearTimeout(reminderTimer); scheduledTimers.delete(`${eventId}-reminder`) }
    if (nowTimer) { clearTimeout(nowTimer); scheduledTimers.delete(`${eventId}-now`) }

  } else if (type === "NOTIFICATION_CLICK") {
    // Handled below in notificationclick
  }
})

// -------------------------------------------------------
// SHOW NOTIFICATION (local, from SW context)
// -------------------------------------------------------
function showLocalNotification({ title, body, eventId, url }) {
  if (!self.registration) return

  const tag = `event-${eventId}-${Date.now()}`

  self.registration.showNotification(title, {
    body,
    icon: "/icon-192.jpg",
    badge: "/icon-192.jpg",
    vibrate: [200, 100, 200],
    tag,
    requireInteraction: true,
    actions: [
      { action: "open", title: "Abrir" },
      { action: "close", title: "Cerrar" },
    ],
    data: {
      eventId,
      url: url || "/app/calendar",
      timestamp: new Date().toISOString(),
    },
  }).catch((err) => {
    // Some browsers don't allow showNotification without user gesture
    // In that case we post a message to the client to show it in-app
    notifyClients({ type: "SHOW_IN_APP_NOTIFICATION", title, body, eventId })
  })
}

// -------------------------------------------------------
// PUSH NOTIFICATIONS (from server via VAPID)
// -------------------------------------------------------
self.addEventListener("push", (event) => {
  if (!event.data) return

  try {
    const data = event.data.json()

    const options = {
      body: data.body || "Tienes un nuevo evento",
      icon: "/icon-192.jpg",
      badge: "/icon-192.jpg",
      vibrate: [200, 100, 200],
      tag: "event-" + (data.eventId || Date.now()),
      requireInteraction: true,
      actions: [
        { action: "open", title: "Abrir" },
        { action: "close", title: "Cerrar" },
      ],
      data: {
        eventId: data.eventId,
        type: data.type || "reminder",
        url: data.url || "/app/calendar",
        timestamp: new Date().toISOString(),
      },
    }

    event.waitUntil(
      self.registration
        .showNotification(data.title || "Recordatorio", options)
        .catch((err) => notifyClients({ type: "SHOW_IN_APP_NOTIFICATION", ...data }))
    )
  } catch (err) {
    // ignore
  }
})

// -------------------------------------------------------
// NOTIFICATION CLICK
// -------------------------------------------------------
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  const urlToOpen = (event.notification.data && event.notification.data.url) || "/app/calendar"

  if (event.action === "close") return

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes("/app") && "focus" in client) {
            client.postMessage({
              type: "NOTIFICATION_CLICK",
              eventId: event.notification.data && event.notification.data.eventId,
            })
            return client.focus()
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
  )
})

self.addEventListener("notificationclose", () => {})

// -------------------------------------------------------
// BACKGROUND SYNC (for when app comes back online)
// -------------------------------------------------------
self.addEventListener("sync", (event) => {
  if (event.tag === "reschedule-notifications") {
    // Client will re-send SCHEDULE_NOTIFICATIONS when it wakes up
    event.waitUntil(notifyClients({ type: "RESCHEDULE_NEEDED" }))
  }
})

// -------------------------------------------------------
// HELPER: broadcast to all clients
// -------------------------------------------------------
async function notifyClients(message) {
  const allClients = await clients.matchAll({ includeUncontrolled: true })
  allClients.forEach((client) => client.postMessage(message))
}
