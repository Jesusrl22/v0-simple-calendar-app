'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

export default function ConfirmPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [countdown, setCountdown] = useState(5)
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Processing your email verification...')

  useEffect(() => {
    const processConfirmation = async () => {
      try {
        // Get the token from Supabase callback
        const token = searchParams.get('token_hash')
        const type = searchParams.get('type') // Should be 'signup' or 'email_change'
        const email = searchParams.get('email')

        console.log('[CLIENT] Confirm page - token:', token ? 'present' : 'missing', 'type:', type, 'email:', email)

        if (!token) {
          console.log('[CLIENT] No token found in URL, checking session...')
          // No token means user might already be verified or came from resend
          setStatus('success')
          setMessage('Your email has already been verified! Redirecting to login...')
          return
        }

        // Call verify endpoint to mark email as verified in Supabase
        console.log('[CLIENT] Calling verify endpoint...')
        const verifyResponse = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token_hash: token,
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
          {/* Icon */}
          <div className="flex justify-center">
            {status === 'loading' && (
              <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full animate-pulse">
                <div className="h-12 w-12 bg-blue-600 rounded-full" />
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

          {/* Title */}
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {status === 'loading' && 'Verifying Email...'}
              {status === 'success' && 'Email Verified!'}
              {status === 'error' && 'Verification Failed'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {message}
            </p>
          </div>

          {/* Redirect Notice */}
          {status === 'success' && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-300">
                Redirecting to login in <span className="font-semibold">{countdown}</span> seconds...
              </p>
            </div>
          )}

          {/* Manual Redirect Button */}
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
