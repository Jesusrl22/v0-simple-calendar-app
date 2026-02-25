"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, AlertCircle, RefreshCw, Mail, Bell, Database } from "lucide-react"

export default function TestConfigPage() {
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runTest = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test-config")
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error("Error running test:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Test de Configuración</h1>
        <p className="text-muted-foreground">
          Verifica que todos los servicios estén configurados correctamente
        </p>
      </div>

      <Button onClick={runTest} disabled={loading} className="mb-6">
        {loading ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Probando configuración...
          </>
        ) : (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Ejecutar Test
          </>
        )}
      </Button>

      {results && (
        <div className="space-y-4">
          {/* Resumen */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {results.success ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    Todo Configurado Correctamente
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                    Configuración Incompleta
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Supabase
                  </span>
                  <Badge variant={results.results.supabase.configured ? "default" : "destructive"}>
                    {results.summary.supabase}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    SMTP (Correos)
                  </span>
                  <Badge variant={results.results.smtp.configured ? "default" : "destructive"}>
                    {results.summary.smtp}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    VAPID (Push Notifications)
                  </span>
                  <Badge variant={results.results.vapid.configured ? "default" : "destructive"}>
                    {results.summary.vapid}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Supabase Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Supabase
              </CardTitle>
              <CardDescription>
                Base de datos y autenticación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estado:</span>
                  <span className="font-medium">
                    {results.results.supabase.configured ? "✓ Configurado" : "✗ No configurado"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">URL:</span>
                  <span className="font-mono text-xs">{results.results.supabase.url}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Conexión:</span>
                  <span className="font-medium">
                    {results.results.supabase.canConnect ? "✓ Exitosa" : "✗ Fallo"}
                  </span>
                </div>
                {results.results.supabase.tables.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">Tablas:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {results.results.supabase.tables.map((table: string) => (
                        <Badge key={table} variant="outline" className="text-xs">
                          {table}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {results.results.supabase.error && (
                  <div className="text-red-500 mt-2">
                    <strong>Error:</strong> {results.results.supabase.error}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* SMTP Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                SMTP (Correos)
              </CardTitle>
              <CardDescription>
                Configuración para envío de emails
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estado:</span>
                  <span className="font-medium">
                    {results.results.smtp.configured ? "✓ Configurado" : "✗ No configurado"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Host:</span>
                  <span className="font-mono text-xs">{results.results.smtp.details.host}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Port:</span>
                  <span className="font-mono text-xs">{results.results.smtp.details.port}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">User:</span>
                  <span className="font-mono text-xs">{results.results.smtp.details.user}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">From:</span>
                  <span className="font-mono text-xs">{results.results.smtp.details.from}</span>
                </div>
                {results.results.smtp.error && (
                  <div className="text-red-500 mt-2">
                    <strong>Error:</strong> {results.results.smtp.error}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* VAPID Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                VAPID (Push Notifications)
              </CardTitle>
              <CardDescription>
                Claves para notificaciones push
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estado:</span>
                  <span className="font-medium">
                    {results.results.vapid.configured ? "✓ Configurado" : "✗ No configurado"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Public Key:</span>
                  <span className="font-medium">
                    {results.results.vapid.hasPublicKey ? "✓" : "✗"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Private Key:</span>
                  <span className="font-medium">
                    {results.results.vapid.hasPrivateKey ? "✓" : "✗"}
                  </span>
                </div>
                {results.results.vapid.publicKeyPreview && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Preview:</span>
                    <span className="font-mono text-xs">{results.results.vapid.publicKeyPreview}</span>
                  </div>
                )}
                {results.results.vapid.error && (
                  <div className="text-red-500 mt-2">
                    <strong>Error:</strong> {results.results.vapid.error}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          {results.results.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  Recomendaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {results.results.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="text-sm border-l-2 border-yellow-500 pl-3 py-1">
                      {rec}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Debug Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Información de Debug</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                {JSON.stringify(results, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
