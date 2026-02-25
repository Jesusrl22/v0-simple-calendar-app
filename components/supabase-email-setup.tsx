"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle2, ExternalLink } from "lucide-react"
import { useState } from "react"

export function SupabaseEmailSetup() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "checking" | "success" | "error">("idle")

  const handleCheckSetup = async () => {
    setIsLoading(true)
    setStatus("checking")
    try {
      const response = await fetch("/api/admin/check-email-setup")
      const data = await response.json()
      
      if (data.success) {
        setStatus("success")
      } else {
        setStatus("error")
      }
    } catch (error) {
      console.error("Error checking email setup:", error)
      setStatus("error")
    } finally {
      setIsLoading(false)
    }
  }

  const emailTemplateURLs = {
    confirmSignup: `${appUrl}/auth/confirm?token={{.ConfirmationURL}}`,
    recovery: `${appUrl}/auth/reset?token={{.RecoveryURL}}`,
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-card border border-border/50">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold mb-2">Configurar Emails en Supabase</h3>
              <p className="text-sm text-muted-foreground">
                Para que funcionen los emails de confirmación y reset de contraseña, debes configurar Supabase correctamente.
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-4">
            {/* Step 1: SMTP Configuration */}
            <div className="bg-muted/30 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
                Configurar SMTP (opcional pero recomendado)
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Supabase por defecto usa su propio servicio de emails, pero es lento. Para producción, usa un proveedor como:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>SendGrid</strong> - Recomendado (gratis hasta 100 emails/día)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>AWS SES</strong> - Para alto volumen</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>Gmail SMTP</strong> - Para testing (no recomendado para producción)</span>
                </li>
              </ul>
              <div className="mt-3 p-3 bg-blue-500/10 rounded border border-blue-500/20">
                <p className="text-sm text-blue-900 dark:text-blue-200">
                  Si no configuras SMTP, Supabase usará su servidor de emails (puede tardar más)
                </p>
              </div>
            </div>

            {/* Step 2: Email Templates */}
            <div className="bg-muted/30 p-4 rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
                Configurar Templates de Email
              </h4>
              <ol className="space-y-3 text-sm">
                <li className="flex gap-2">
                  <span className="text-primary font-bold">a)</span>
                  <span>
                    Abre tu proyecto en <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Supabase Dashboard
                    </a>
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">b)</span>
                  <span>Ve a <code className="bg-muted px-2 py-1 rounded text-xs">Authentication → Email Templates</code></span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">c)</span>
                  <span>Configura el template <strong>Confirm Signup</strong></span>
                </li>
              </ol>
            </div>

            {/* Template URLs */}
            <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 dark:text-green-200 mb-3">URLs de Redirección</h4>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-2">Confirm Signup Template - Redirect URL:</p>
                  <div className="bg-muted p-3 rounded font-mono text-xs break-all">
                    {emailTemplateURLs.confirmSignup}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">Reset Password Template - Redirect URL:</p>
                  <div className="bg-muted p-3 rounded font-mono text-xs break-all">
                    {emailTemplateURLs.recovery}
                  </div>
                </div>
              </div>

              <div className="mt-3 p-3 bg-yellow-500/10 rounded border border-yellow-500/20">
                <p className="text-sm text-yellow-900 dark:text-yellow-200">
                  <strong>Importante:</strong> Copia exactamente estas URLs en los templates de Supabase. Asegúrate de que coincidan con tu dominio.
                </p>
              </div>
            </div>

            {/* Verification */}
            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-3">Verificar Configuración</h4>
              <p className="text-sm text-blue-800 dark:text-blue-300 mb-4">
                Haz clic en el botón de abajo para verificar si los templates están configurados correctamente:
              </p>
              <Button
                onClick={handleCheckSetup}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Verificando..." : "Verificar Configuración"}
              </Button>
              
              {status === "success" && (
                <div className="mt-3 p-3 bg-green-500/20 border border-green-500/50 rounded flex gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-green-900 dark:text-green-200">
                    ¡Templates configurados correctamente! Los emails deberían llegar.
                  </span>
                </div>
              )}
              
              {status === "error" && (
                <div className="mt-3 p-3 bg-red-500/20 border border-red-500/50 rounded flex gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-900 dark:text-red-200">
                    <p>Templates no están correctamente configurados. Verifica que:</p>
                    <ul className="mt-2 space-y-1 ml-4">
                      <li>• Las URLs de redirección estén exactas</li>
                      <li>• Los templates estén habilitados</li>
                      <li>• SMTP esté configurado o Supabase tenga acceso a internet</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Troubleshooting */}
            <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-lg">
              <h4 className="font-semibold text-orange-900 dark:text-orange-200 mb-3">Si aún no llegan emails</h4>
              <ul className="space-y-2 text-sm text-orange-800 dark:text-orange-300">
                <li className="flex gap-2">
                  <span>1.</span>
                  <span>Revisa la carpeta de Spam/Basura del email</span>
                </li>
                <li className="flex gap-2">
                  <span>2.</span>
                  <span>Verifica que Supabase tenga acceso a internet (si usas self-hosted)</span>
                </li>
                <li className="flex gap-2">
                  <span>3.</span>
                  <span>En Supabase Dashboard, ve a <code className="bg-muted px-1 py-0.5 rounded text-xs">Logs</code> para ver errores de email</span>
                </li>
                <li className="flex gap-2">
                  <span>4.</span>
                  <span>Usa un proveedor SMTP externo (SendGrid, AWS SES) para mayor confiabilidad</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4 border-t border-border/50">
            <Button
              onClick={() => window.open("https://app.supabase.com", "_blank")}
              className="w-full gap-2"
            >
              Abrir Supabase Dashboard
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
