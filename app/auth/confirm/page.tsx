'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

export default function ConfirmPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [countdown, setCountdown] = useState(5)
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Processing your email verification...')

  useEffect(() => {
    const processConfirmation = async () => {
      try {
        // Supabase can send params as query string OR as hash fragment
        // We need to check both
        let token = searchParams.get('token_hash')
        let type = searchParams.get('type')
        let email = searchParams.get('email')

        // Also check hash fragment (e.g. #access_token=...&type=signup)
        if (typeof window !== 'undefined' && window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1))
          if (!token) token = hashParams.get('token_hash')
          if (!type) type = hashParams.get('type')
          if (!email) email = hashParams.get('email')

          // Supabase sometimes sends access_token directly in hash after verify
          const accessToken = hashParams.get('access_token')
          const hashType = hashParams.get('type')
          console.log('[CLIENT] Hash params - accessToken:', accessToken ? 'present' : 'missing', 'type:', hashType)

          // If Supabase already verified and sent back an access_token, email is confirmed
          if (accessToken && (hashType === 'signup' || hashType === 'email_change' || !hashType)) {
            console.log('[CLIENT] Access token in hash — Supabase already confirmed email')
            try {
              const parts = accessToken.split('.')
              if (parts.length === 3) {
                const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
                const userEmail = payload.email
                console.log('[CLIENT] JWT email:', userEmail)

                if (userEmail) {
                  // Call verify-email to create the profile in users table
                  const res = await fetch('/api/auth/verify-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: userEmail, type: 'signup', token_hash: '' }),
                  })
                  const data = await res.json()
                  console.log('[CLIENT] verify-email response:', res.status, data)
                }
              }
            } catch (e) {
              console.log('[CLIENT] Could not parse access token JWT:', e)
            }
            setStatus('success')
            setMessage('Your email has been successfully verified! Redirecting to login...')
            return
          }
        }

        console.log('[CLIENT] Confirm params - token:', token ? 'present' : 'missing', 'type:', type, 'email:', email)

        if (!token && !email) {
          console.log('[CLIENT] No token or email found in URL')
          setStatus('error')
          setMessage('Invalid verification link. Please request a new verification email.')
          return
        }

        // Call our verify endpoint
        console.log('[CLIENT] Calling /api/auth/verify-email...')
        const verifyResponse = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token_hash: token || '',
            type: type || 'signup',
            email: email,
          }),
        })

        const verifyData = await verifyResponse.json()
        console.log('[CLIENT] Verify response:', verifyResponse.status, verifyData)

        if (!verifyResponse.ok) {
          setStatus('error')
          setMessage(verifyData.message || 'Failed to verify email. The link may have expired.')
          return
        }

        setStatus('success')
        setMessage('Your email has been successfully verified! Redirecting to login...')
      } catch (error) {
        console.error('[CLIENT] Error processing confirmation:', error)
        setStatus('error')
        setMessage('An error occurred while verifying your email. Please try again.')
      }
    }

    processConfirmation()
  }, [searchParams])

  useEffect(() => {
    if (status === 'success') {
      const interval = setInterval(() => {
        setCountdown((prev) => prev - 1)
      }, 1000)
      const timeout = setTimeout(() => {
        router.push('/login')
      }, 5000)
      return () => {
        clearInterval(interval)
        clearTimeout(timeout)
      }
    }
  }, [status, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-lg shadow-lg p-8 text-center space-y-6">
          <div className="flex justify-center">
            {status === 'loading' && (
              <div className="bg-primary/10 p-4 rounded-full">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
              </div>
            )}
            {status === 'success' && (
              <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full">
                <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
            )}
            {status === 'error' && (
              <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full">
                <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
              </div>
            )}
          </div>

          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {status === 'loading' && 'Verifying Email...'}
              {status === 'success' && 'Email Verified!'}
              {status === 'error' && 'Verification Failed'}
            </h1>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>

          {status === 'success' && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-300">
                Redirecting to login in <span className="font-semibold">{countdown}</span> seconds...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-sm text-muted-foreground">
              <p>You can request a new verification email from the login page.</p>
            </div>
          )}

          <button
            onClick={() => router.push('/login')}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {status === 'success' ? 'Go to Login Now' : 'Go to Login'}
          </button>
        </div>
      </div>
    </div>
  )
}
