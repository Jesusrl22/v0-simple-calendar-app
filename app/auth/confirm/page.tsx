import { Suspense } from 'react'
import ConfirmClient from './ConfirmClient'
import { Loader2 } from 'lucide-react'

function ConfirmLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-lg shadow-lg p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-primary/10 p-4 rounded-full">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Verifying Email...</h1>
            <p className="text-sm text-muted-foreground">Processing your email verification...</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={<ConfirmLoading />}>
      <ConfirmClient />
    </Suspense>
  )
}

