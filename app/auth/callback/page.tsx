"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"

const AuthCallbackContent = dynamic(() => import("./auth-callback-content"), {
  loading: () => <AuthCallbackLoading />,
  ssr: false,
})

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<AuthCallbackLoading />}>
      <AuthCallbackContent />
    </Suspense>
  )
}

function AuthCallbackLoading() {
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

