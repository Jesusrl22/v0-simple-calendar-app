"use client"

import { useEffect, useState, useCallback } from "react"
import {
  isPushNotificationSupported,
  registerServiceWorker,
  requestNotificationPermission,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
} from "@/lib/notifications"
import { useToast } from "@/hooks/use-toast"

export function usePushNotifications() {
  const { toast } = useToast()
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Check support on mount
  useEffect(() => {
    setIsSupported(isPushNotificationSupported())
  }, [])

  // Check current subscription status
  useEffect(() => {
    if (!isSupported) return

    const checkSubscription = async () => {
      try {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()
        setIsSubscribed(!!subscription)
      } catch (error) {
        console.error("[v0] Failed to check subscription:", error)
      }
    }

    checkSubscription()
  }, [isSupported])

  // Enable notifications
  const enableNotifications = useCallback(async () => {
    if (!isSupported) {
      toast({
        title: "Error",
        description: "Push notifications are not supported in your browser",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      console.log("[v0] Starting push notification setup...")

      // Request permission
      const permission = await requestNotificationPermission()
      console.log("[v0] Notification permission:", permission)

      if (permission !== "granted") {
        toast({
          title: "Error",
          description: "You denied notification permissions. Please enable notifications in your browser settings.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Register service worker
      const registration = await registerServiceWorker()
      console.log("[v0] Service Worker registration:", registration)

      if (!registration) throw new Error("Service Worker registration failed")

      // Subscribe to push notifications
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      console.log("[v0] VAPID Public Key configured:", !!publicKey)

      if (!publicKey) {
        throw new Error("Push notifications are not configured on the server. Please contact the administrator to set up VAPID keys.")
      }

      const subscription = await subscribeToPushNotifications(publicKey)
      console.log("[v0] Push subscription created:", !!subscription)

      if (!subscription) throw new Error("Failed to create subscription")

      // Send subscription to server
      const response = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      })

      console.log("[v0] Server response:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save subscription")
      }

      setIsSubscribed(true)
      
      // Register background sync for periodic notification checks (mobile)
      if (registration && "sync" in registration) {
        try {
          await registration.sync.register("check-notifications")
          console.log("[v0] Background sync registered for mobile")
        } catch (err) {
          console.log("[v0] Background sync not available:", err)
        }
      }
      
      // For iOS and PWA compatibility, also request badge permissions
      if (navigator.permissions && "badge" in navigator) {
        try {
          await navigator.permissions.query({ name: "notifications" })
          console.log("[v0] Notification permissions confirmed")
        } catch (err) {
          console.log("[v0] Badge permission query failed:", err)
        }
      }
      
      toast({
        title: "Success",
        description: "Push notifications enabled successfully",
      })
    } catch (error) {
      console.error("[v0] Enable notifications error:", error)
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to enable notifications. Check console for details.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [isSupported, toast])

  // Disable notifications
  const disableNotifications = useCallback(async () => {
    setIsLoading(true)
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        // Notify server
        await fetch("/api/notifications/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        })

        // Unsubscribe locally
        await unsubscribeFromPushNotifications()
      }

      setIsSubscribed(false)
      toast({
        title: "Success",
        description: "Push notifications disabled",
      })
    } catch (error) {
      console.error("[v0] Disable notifications error:", error)
      toast({
        title: "Error",
        description: "Failed to disable notifications",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  return {
    isSupported,
    isSubscribed,
    isLoading,
    enableNotifications,
    disableNotifications,
  }
}
