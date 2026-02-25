"use client"

import { useEffect, useState, useRef } from "react"
import { useMediaQuery } from "@/hooks/use-mobile"

interface AdsterraMobileBannerProps {
  adKey: string
  width: number
  height: number
  className?: string
}

export function AdsterraMobileBanner({ adKey, width, height, className = "" }: AdsterraMobileBannerProps) {
  const [userTier, setUserTier] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const adContainerRef = useRef<HTMLDivElement>(null)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const scriptLoadedRef = useRef(false)

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
    if (!loading && userTier === "free" && isMobile && adContainerRef.current && !scriptLoadedRef.current) {
      scriptLoadedRef.current = true

      // Set atOptions on window object
      ;(window as any).atOptions = {
        key: adKey,
        format: "iframe",
        height: height,
        width: width,
        params: {},
      }

      // Load the invoke script
      const invokeScript = document.createElement("script")
      invokeScript.type = "text/javascript"
      invokeScript.src = `//www.highperformanceformat.com/${adKey}/invoke.js`
      invokeScript.async = true
      adContainerRef.current.appendChild(invokeScript)
    }
  }, [loading, userTier, adKey, width, height, isMobile])

  if (loading || userTier !== "free" || !isMobile) {
    return null
  }

  return (
    <div className={`w-full flex justify-center my-4 ${className}`}>
      <div ref={adContainerRef} className="inline-block" style={{ minWidth: `${width}px`, minHeight: `${height}px` }} />
    </div>
  )
}
