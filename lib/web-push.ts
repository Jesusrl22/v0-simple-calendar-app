// Web Push configuration and utilities

// Verificar si las VAPID keys están configuradas
export function areVapidKeysConfigured(): boolean {
  const hasPublic = !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const hasPrivate = !!process.env.VAPID_PRIVATE_KEY
  
  if (!hasPublic || !hasPrivate) {
    console.error("[WEBPUSH] ❌ VAPID keys no configuradas:")
    console.error("[WEBPUSH] NEXT_PUBLIC_VAPID_PUBLIC_KEY:", hasPublic ? "✓" : "✗")
    console.error("[WEBPUSH] VAPID_PRIVATE_KEY:", hasPrivate ? "✓" : "✗")
    console.error("[WEBPUSH] Para generar keys: npx web-push generate-vapid-keys")
  }
  
  return hasPublic && hasPrivate
}

// NUNCA usar valores por defecto - deben ser configurados
export const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
export const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY

export interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
