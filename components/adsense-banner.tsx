"use client"

import { useEffect, useState } from "react"

interface AdSenseBannerProps {
  adSlot?: string
  adFormat?: "auto" | "fluid" | "rectangle" | "vertical" | "horizontal"
  className?: string
}

export function AdSenseBanner({ adSlot = "auto", adFormat = "auto", className = "" }: AdSenseBannerProps) {
  const [userTier, setUserTier] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserTier = async () => {
      try {
        const response = await fetch("/api/user/profile")
        if (response.ok) {
          const data = await response.json()
          setUserTier(data.subscription_plan || "free")
        }
      } catch (error) {
        setUserTier("free")
      } finally {
        setLoading(false)
      }
    }

    fetchUserTier()
  }, [])

  useEffect(() => {
    if (!loading && userTier === "free") {
      try {
        // @ts-ignore
        ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      } catch (err) {
        console.error("AdSense error:", err)
      }
    }
  }, [loading, userTier])

  if (loading || userTier !== "free") {
    return null
  }

  return (
    <div className={`w-full flex justify-center my-4 ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-3746054566396266"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  )
}
