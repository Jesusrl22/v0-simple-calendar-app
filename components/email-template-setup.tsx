"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { setupEmailTemplates } from "@/app/actions/setup-email-templates"
import { useState } from "react"

export function EmailTemplateSetup() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const [isLoading, setIsLoading] = useState(false)

  const handleSetup = async () => {
    setIsLoading(true)
    try {
      const result = await setupEmailTemplates()
      console.log("Email templates configured:", result)
      alert("Email template configuration verified!")
    } catch (error) {
      console.error("Failed to setup templates:", error)
      alert("Failed to setup templates. Check the console for details.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="p-6 bg-card border border-border/50">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-bold mb-2">Email Template Configuration</h3>
            <p className="text-sm text-muted-foreground">
              Configure Supabase to send multilingual email confirmations and password reset links
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-4">
          <div className="bg-muted/30 p-4 rounded-lg">
            <h4 className="font-semibold mb-3">Steps to Configure:</h4>
            <ol className="space-y-2 text-sm">
              <li className="flex gap-3">
                <span className="font-bold text-primary">1.</span>
                <span>Go to <code className="bg-muted px-2 py-1 rounded text-xs">Supabase Dashboard → Project Settings → Email Templates</code></span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary">2.</span>
                <span>Click on <strong>Confirm Signup</strong> template and set this redirect URL:</span>
              </li>
              <li className="ml-6 font-mono text-xs bg-muted p-3 rounded break-all">
                {appUrl}/auth/confirm?token={'{{ .Token }}'}&lang=es
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary">3.</span>
                <span>Click on <strong>Reset Password</strong> template and set this redirect URL:</span>
              </li>
              <li className="ml-6 font-mono text-xs bg-muted p-3 rounded break-all">
                {appUrl}/auth/reset?token={'{{ .Token }}'}&lang=es
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary">4.</span>
                <span>The <code className="bg-muted px-2 py-1 rounded text-xs">lang</code> parameter will be passed by your signup form based on user language preference</span>
              </li>
            </ol>
          </div>

          {/* Language Support */}
          <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
            <div className="flex gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <h4 className="font-semibold text-blue-900 dark:text-blue-200">Supported Languages</h4>
            </div>
            <p className="text-sm text-blue-800 dark:text-blue-300 mb-2">
              Email templates are automatically translated to:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              <div>🇬🇧 English (en)</div>
              <div>🇪🇸 Español (es)</div>
              <div>🇫🇷 Français (fr)</div>
              <div>🇮🇹 Italiano (it)</div>
              <div>🇩🇪 Deutsch (de)</div>
              <div>🇵🇹 Português (pt)</div>
              <div>🇯🇵 日本語 (ja)</div>
              <div>🇰🇷 한국어 (ko)</div>
              <div>🇨🇳 中文 (zh)</div>
            </div>
          </div>

          {/* Implementation Notes */}
          <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg">
            <h4 className="font-semibold text-green-900 dark:text-green-200 mb-2">Implementation Notes:</h4>
            <ul className="space-y-1 text-sm text-green-800 dark:text-green-300">
              <li>• User language is stored in <code className="bg-muted px-1 py-0.5 rounded text-xs">user_metadata.language</code> during signup</li>
              <li>• Email templates render in the user&apos;s saved language automatically</li>
              <li>• You can also pass language as a URL parameter: <code className="bg-muted px-1 py-0.5 rounded text-xs">?lang=es</code></li>
              <li>• All email pages are responsive and mobile-friendly</li>
            </ul>
          </div>
        </div>

        {/* Call to Action */}
        <div className="flex gap-2 pt-4 border-t border-border/50">
          <Button
            onClick={() => {
              const url = "https://app.supabase.com"
              window.open(url, "_blank")
            }}
            className="flex-1"
          >
            Open Supabase Dashboard
          </Button>
          <Button
            variant="outline"
            onClick={handleSetup}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? "Verifying..." : "Verify Configuration"}
          </Button>
        </div>
      </div>
    </Card>
  )
}
