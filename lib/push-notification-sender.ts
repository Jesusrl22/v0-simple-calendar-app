// Server-side function to send push notifications
import { areVapidKeysConfigured } from "./web-push"

// Lazy load y configurar webpush solo cuando se necesite
async function getWebPush() {
  const webpush = (await import("web-push")).default
  
  // Configurar VAPID keys si están disponibles
  if (areVapidKeysConfigured()) {
    const subject = process.env.VAPID_SUBJECT || "mailto:support@futuretask.app"
    webpush.setVapidDetails(
      subject,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!,
    )
    console.log("[WEBPUSH] ✓ VAPID configurado con subject:", subject)
  } else {
    console.error("[WEBPUSH] ❌ VAPID keys no configuradas - las notificaciones push no funcionarán")
  }
  
  return webpush
}

export interface SendNotificationParams {
  title: string
  body: string
  taskId?: string
  type: "task" | "achievement" | "event" | "reminder"
  url?: string
}

export async function sendPushNotificationToUser(
  subscriptions: Array<{ endpoint: string; p256dh: string; auth: string }>,
  payload: SendNotificationParams,
) {
  if (!areVapidKeysConfigured()) {
    console.error("[WEBPUSH] ❌ No se pueden enviar notificaciones - VAPID no configurado")
    return []
  }

  if (!subscriptions || subscriptions.length === 0) {
    console.log("[WEBPUSH] ℹ No hay suscripciones para enviar")
    return []
  }

  console.log("[WEBPUSH] Enviando notificación a", subscriptions.length, "suscripciones")

  // Cargar webpush dinámicamente
  const webpush = await getWebPush()

  const promises = subscriptions.map(async (sub) => {
    const pushSubscription = {
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth,
      },
    }

    try {
      await webpush.sendNotification(
        pushSubscription,
        JSON.stringify({
          title: payload.title,
          body: payload.body,
          type: payload.type,
          taskId: payload.taskId,
          url: payload.url || "/app/tasks",
        }),
      )
      console.log("[WEBPUSH] ✓ Notificación enviada a:", sub.endpoint.substring(0, 50) + "...")
      return { success: true, endpoint: sub.endpoint }
    } catch (error: any) {
      console.error("[WEBPUSH] ❌ Error enviando a:", sub.endpoint.substring(0, 50) + "...")
      console.error("[WEBPUSH] Error:", error.message)
      return { success: false, endpoint: sub.endpoint, error: error.message }
    }
  })

  return Promise.allSettled(promises)
}
