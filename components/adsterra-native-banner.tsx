"use client"

import { useEffect, useState, useRef } from "react"
import { useMediaQuery } from "@/hooks/use-mobile"

interface AdsterraNativeBannerProps {
  adKey: string
  width: number
  height: number
  className?: string
}

export function AdsterraNativeBanner({ adKey, width, height, className = "" }: AdsterraNativeBannerProps) {
  const [userTier, setUserTier] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const adContainerRef = useRef<HTMLDivElement>(null)
  const isMobile = useMediaQuery("(max-width: 768px)")

  useEffect(() => {
    const fetchUserTier = async () => {
      try {
        const response = await fetch("/api/user/profile")
        if (response.ok) {
          const data = await response.json()
          setUserTier(data.subscription_tier || "free")
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
    if (
      !loading &&
      userTier === "free" &&
      !isMobile &&
      adContainerRef.current &&
      !adContainerRef.current.querySelector("script")
    ) {
      const script = document.createElement("script")
      script.async = true
      script.setAttribute("data-cfasync", "false")
      script.src = `//cdn.adsterra.com/js/adserving.js`
      script.setAttribute("data-ad-slot", adKey)
      adContainerRef.current.appendChild(script)
    }
  }, [loading, userTier, adKey, isMobile])

  if (loading || userTier !== "free") {
    return null
  }

  return (
    <div ref={adContainerRef} className={`flex justify-center ${className}`}>
      <div style={{ width: `${width}px`, minHeight: `${height}px` }} />
    </div>
  )
}
