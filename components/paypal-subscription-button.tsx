"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

interface PayPalSubscriptionButtonProps {
  planId: string
  planName: string
  onSuccess?: (subscriptionId: string) => void
}

declare global {
  interface Window {
    paypal: any
    paypalScriptLoaded?: boolean
  }
}

export function PayPalSubscriptionButton({ planId, planName, onSuccess }: PayPalSubscriptionButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const [isLoaded, setIsLoaded] = useState(false)
  const buttonRendered = useRef(false)

  useEffect(() => {
    if (window.paypal && !buttonRendered.current) {
      renderButton()
      return
    }

    if (!window.paypalScriptLoaded) {
      window.paypalScriptLoaded = true

      const script = document.createElement("script")
      script.src = `https://www.paypal.com/sdk/js?client-id=AR4AW_SOK6UqtOenw2nW_cQs5gvC-_kGRKjKI9JWYUt5ybyt-K367rZ9lUeFPbtegsncbg4LZLR-pOmw&vault=true&intent=subscription`
      script.setAttribute("data-sdk-integration-source", "button-factory")
      script.async = true

      script.onload = () => {
        setIsLoaded(true)
      }

      document.body.appendChild(script)
    } else {
      // Script is loading, wait for it
      const checkInterval = setInterval(() => {
        if (window.paypal) {
          clearInterval(checkInterval)
          setIsLoaded(true)
        }
      }, 100)

      return () => clearInterval(checkInterval)
    }
  }, [])

  useEffect(() => {
    if (isLoaded && !buttonRendered.current) {
      renderButton()
    }
  }, [isLoaded])

  const renderButton = () => {
    if (window.paypal && containerRef.current && !buttonRendered.current) {
      buttonRendered.current = true

      window.paypal
        .Buttons({
          style: {
            shape: "rect",
            color: "gold",
            layout: "vertical",
            label: "paypal",
          },
          createSubscription: (data: any, actions: any) =>
            actions.subscription.create({
              plan_id: planId,
            }),
          onApprove: async (data: any, actions: any) => {
            const subscriptionId = data.subscriptionID

            try {
              const response = await fetch("/api/paypal/subscription-success", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  subscriptionId,
                  planName: planName.toLowerCase(),
                }),
              })

              if (response.ok) {
                if (onSuccess) {
                  onSuccess(subscriptionId)
                }
                router.refresh()
              }
            } catch (error) {
              console.error("Error updating subscription:", error)
            }
          },
        })
        .render(containerRef.current)
    }
  }

  return (
    <div ref={containerRef} className="mt-4 min-h-[45px]">
      {!isLoaded && <div className="text-center text-sm text-muted-foreground">Loading PayPal...</div>}
    </div>
  )
}
