"use client"

import { useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = searchParams.get("code")
  const error = searchParams.get("error")
  const errorDescription = searchParams.get("error_description")

  const handleCallback = useCallback(async () => {
    console.log("[v0] Auth callback started")

    if (error) {
      console.error("[v0] Auth error:", error, errorDescription)
      router.push(`/login?error=${encodeURIComponent(errorDescription || error)}`)
      return
    }

    if (!code) {
      console.error("[v0] No code in callback")
      router.push("/login?error=Invalid callback")
      return
    }

    try {
      const supabase = createClient()

      console.log("[v0] Exchanging code for session:", code)
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error("[v0] Code exchange error:", exchangeError)
        throw exchangeError
      }

      if (data?.session) {
        console.log("[v0] Session established successfully")
        
        // Wait a moment for session to be fully set
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Redirect to dashboard
        router.push("/app")
      } else {
        console.error("[v0] No session in callback response")
        throw new Error("No session returned")
      }
    } catch (err: any) {
      console.error("[v0] Callback error:", err)
      router.push(`/login?error=${encodeURIComponent(err.message || "Authentication failed")}`)
    }
  }, [code, error, errorDescription, router])

  useEffect(() => {
    handleCallback()
  }, [handleCallback])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 animate-spin">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Verificando tu identidad...</h2>
          <p className="text-sm text-muted-foreground mt-2">Por favor espera mientras completamos la autenticación.</p>
        </div>
      </div>
    </div>
  )
}
