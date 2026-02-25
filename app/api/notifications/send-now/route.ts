import { sendPushNotificationToUser } from "@/lib/push-notification-sender"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { title, body, taskId, type = "reminder" } = await request.json()

    const cookieStore = await cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    })

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      // Si no hay usuario autenticado en servidor, es una llamada desde cliente
      // En este caso solo enviamos notificación del navegador
      console.log("[v0] No authenticated user, notification will be sent from browser")
      return Response.json({
        success: true,
        message: "Notification will be sent from browser",
      })
    }

    // Obtener suscripciones push del usuario
    const { data: subscriptions, error } = await supabase
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .eq("user_id", user.id)

    if (error) {
      console.error("[v0] Error fetching subscriptions:", error)
    }

    if (subscriptions && subscriptions.length > 0) {
      console.log(`[v0] Sending push notification to ${subscriptions.length} device(s)`)
      try {
        await sendPushNotificationToUser(subscriptions, {
          title,
          body,
          type,
          taskId,
          url: "/app/calendar",
          timestamp: new Date().toISOString(),
        })
        console.log("[v0] Push notification sent successfully")
      } catch (pushError) {
        console.error("[v0] Error sending push notification:", pushError)
      }
    } else {
      console.log("[v0] No push subscriptions found for user - user may not have enabled notifications")
    }

    return Response.json({
      success: true,
      message: "Notification sent successfully",
      subscriptionCount: subscriptions?.length || 0,
    })
  } catch (error) {
    console.error("[v0] Error sending notification:", error)
    return Response.json({ error: "Failed to send notification" }, { status: 500 })
  }
}
