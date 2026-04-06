'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[v0] Service Worker registrado:', reg.scope)
        })
        .catch((err) => {
          console.log('[v0] Service Worker error:', err)
        })
    }
  }, [])

  return null
}
