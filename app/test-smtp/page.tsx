"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestSMTPPage() {
  const [diagnostics, setDiagnostics] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState<any>(null)

  const runDiagnostics = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/test-smtp")
      const data = await res.json()
      setDiagnostics(data)
    } catch (error) {
      console.error("Error running diagnostics:", error)
    } finally {
      setLoading(false)
    }
  }

  const sendTestEmail = async () => {
    if (!email) {
      alert("Por favor ingresa un email")
      return
    }

    setSending(true)
    setSendResult(null)
    try {
      const res = await fetch("/api/test-smtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: email }),
      })
      const data = await res.json()
      setSendResult(data)
    } catch (error: any) {
      setSendResult({ success: false, error: error.message })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Test de Configuración SMTP</h1>
      <p className="text-muted-foreground mb-8">
        Verifica que tu configuración de correo electrónico funciona correctamente
      </p>

      <div className="space-y-6">
        {/* Diagnósticos */}
        <Card>
          <CardHeader>
            <CardTitle>1. Verificar Configuración</CardTitle>
            <CardDescription>Revisa que todas las variables SMTP estén configuradas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={runDiagnostics} disabled={loading}>
              {loading ? "Verificando..." : "Ejecutar Diagnóstico"}
            </Button>

            {diagnostics && (
              <div className="space-y-4 mt-4">
                <div>
                  <h3 className="font-semibold mb-2">Variables de Entorno:</h3>
                  <div className="bg-muted p-4 rounded-lg space-y-1 font-mono text-sm">
                    {Object.entries(diagnostics.environment).map(([key, value]) => (
                      <div key={key}>
                        <span className="text-muted-foreground">{key}:</span> {String(value)}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Estado:</h3>
                  <div className={`p-4 rounded-lg ${diagnostics.configured ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}>
                    {diagnostics.configured ? "✓ SMTP Configurado" : "✗ SMTP No Configurado"}
                  </div>
                </div>

                {diagnostics.testResult && (
                  <div>
                    <h3 className="font-semibold mb-2">Resultado de Conexión:</h3>
                    <div className="bg-green-500/10 text-green-600 p-4 rounded-lg">
                      <div className="font-mono text-sm">{diagnostics.testResult.connection}</div>
                      <div className="text-sm mt-2">{diagnostics.testResult.message}</div>
                    </div>
                  </div>
                )}

                {diagnostics.error && (
                  <div>
                    <h3 className="font-semibold mb-2 text-red-600">Error:</h3>
                    <div className="bg-red-500/10 text-red-600 p-4 rounded-lg space-y-1 font-mono text-sm">
                      <div><strong>Message:</strong> {diagnostics.error.message}</div>
                      {diagnostics.error.code && <div><strong>Code:</strong> {diagnostics.error.code}</div>}
                      {diagnostics.error.command && <div><strong>Command:</strong> {diagnostics.error.command}</div>}
                      {diagnostics.error.responseCode && <div><strong>Response Code:</strong> {diagnostics.error.responseCode}</div>}
                      {diagnostics.error.response && <div><strong>Response:</strong> {diagnostics.error.response}</div>}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enviar Email de Prueba */}
        <Card>
          <CardHeader>
            <CardTitle>2. Enviar Email de Prueba</CardTitle>
            <CardDescription>Envía un email de prueba para confirmar que funciona</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button onClick={sendTestEmail} disabled={sending || !email}>
                {sending ? "Enviando..." : "Enviar Test"}
              </Button>
            </div>

            {sendResult && (
              <div className={`p-4 rounded-lg ${sendResult.success ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}>
                {sendResult.success ? (
                  <div className="space-y-1">
                    <div className="font-semibold">✓ Email enviado exitosamente</div>
                    <div className="text-sm">Message ID: {sendResult.messageId}</div>
                    <div className="text-sm">Destinatario: {sendResult.to}</div>
                    <div className="text-sm mt-2">{sendResult.message}</div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="font-semibold">✗ Error al enviar email</div>
                    <div className="text-sm">{sendResult.error}</div>
                    {sendResult.details && (
                      <div className="mt-2 text-xs font-mono">
                        {JSON.stringify(sendResult.details, null, 2)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Información */}
        <Card>
          <CardHeader>
            <CardTitle>Información</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>Paso 1:</strong> Haz clic en "Ejecutar Diagnóstico" para verificar que las variables SMTP estén configuradas.
            </p>
            <p>
              <strong>Paso 2:</strong> Si el diagnóstico es exitoso, ingresa tu email y envía un email de prueba.
            </p>
            <p>
              <strong>Paso 3:</strong> Revisa tu bandeja de entrada (y spam) para confirmar que recibiste el email.
            </p>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="font-semibold mb-2">Variables SMTP Requeridas:</p>
              <ul className="list-disc list-inside space-y-1 font-mono text-xs">
                <li>SMTP_HOST (ej: smtp.zoho.com)</li>
                <li>SMTP_PORT (ej: 587 o 465)</li>
                <li>SMTP_USER (tu email completo)</li>
                <li>SMTP_PASSWORD (contraseña de aplicación)</li>
                <li>SMTP_FROM (opcional, usa SMTP_USER si no está)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
