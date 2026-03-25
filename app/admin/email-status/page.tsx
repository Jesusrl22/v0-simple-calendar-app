'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

interface UserStatus {
  email: string
  verified: boolean
  in_db: boolean
  created_at?: string
}

interface DiagnosticData {
  auth: {
    totalUsers: number
    verified: number
    unverified: number
    unverifiedSample: Array<{ email: string; createdAt: string; reason: string }>
  }
  database: {
    totalUsers: number
    verified: number
    sample: Array<{ email: string; email_verified: boolean; created_at: string }>
  }
  instructions: {
    problem: string
    solution: string
    steps: string[]
    testNewUser: string
  }
}

export default function EmailStatusPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DiagnosticData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/admin/check-email-setup')
        const result = await response.json()
        
        if (result.status === 'ok') {
          setData(result)
        } else {
          setError(result.message || 'Failed to fetch status')
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch diagnostic data')
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p>Loading email status...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex gap-4">
            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Email Verification Status</h1>
          <p className="text-muted-foreground">Diagnostic information about email setup and user verification</p>
        </div>

        {/* Auth Status */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Supabase Auth</h2>
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-background rounded-lg p-4">
              <div className="text-3xl font-bold">{data?.auth.totalUsers}</div>
              <div className="text-sm text-muted-foreground">Total Users</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <div className="text-3xl font-bold text-green-600">{data?.auth.verified}</div>
              <div className="text-sm text-green-700 dark:text-green-300">Verified</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
              <div className="text-3xl font-bold text-yellow-600">{data?.auth.unverified}</div>
              <div className="text-sm text-yellow-700 dark:text-yellow-300">Unverified</div>
            </div>
          </div>

          {data?.auth.unverified ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-2">⚠️ Unverified Users (Sample)</h4>
              <div className="space-y-2 text-sm">
                {data?.auth.unverifiedSample?.map((user) => (
                  <div key={user.email} className="flex justify-between">
                    <span className="text-yellow-800 dark:text-yellow-200">{user.email}</span>
                    <span className="text-yellow-700 dark:text-yellow-300">{user.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Database Status */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Database (users table)</h2>
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-background rounded-lg p-4">
              <div className="text-3xl font-bold">{data?.database.totalUsers}</div>
              <div className="text-sm text-muted-foreground">Total Users</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <div className="text-3xl font-bold text-green-600">{data?.database.verified}</div>
              <div className="text-sm text-green-700 dark:text-green-300">Verified</div>
            </div>
          </div>

          <div className="bg-background rounded-lg p-4">
            <h4 className="font-semibold mb-3">Sample Users</h4>
            <div className="space-y-2 text-sm">
              {data?.database.sample?.map((user) => (
                <div key={user.email} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span>{user.email}</span>
                  <span className={user.email_verified ? 'text-green-600 font-semibold' : 'text-yellow-600'}>
                    {user.email_verified ? '✓ Verified' : '⏳ Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 space-y-4">
          <div className="flex gap-4">
            <AlertCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-3">Required Setup</h3>
              <div className="text-sm text-blue-800 dark:text-blue-200 space-y-3">
                <div>
                  <p className="font-semibold mb-1">Problem:</p>
                  <p>{data?.instructions.problem}</p>
                </div>
                <div>
                  <p className="font-semibold mb-2">Solution: {data?.instructions.solution}</p>
                  <ol className="list-decimal list-inside space-y-1">
                    {data?.instructions.steps?.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
                <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/40 rounded border border-blue-300 dark:border-blue-700">
                  <p className="font-semibold mb-1">Test:</p>
                  <p>{data?.instructions.testNewUser}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Refresh Status
          </button>
        </div>
      </div>
    </div>
  )
}
