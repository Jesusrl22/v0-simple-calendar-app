"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react"

export default function SystemTestPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  const runSystemTest = async () => {
    setLoading(true)
    setResults(null)

    try {
      const response = await fetch("/api/test-system")
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error("Test failed:", error)
      setResults({
        summary: {
          overallStatus: "❌ TEST FAILED",
          failed: 1,
          passed: 0,
        },
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    if (status?.includes("✅")) return <CheckCircle2 className="h-4 w-4 text-green-500" />
    if (status?.includes("❌")) return <XCircle className="h-4 w-4 text-red-500" />
    if (status?.includes("⚠️")) return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    return null
  }

  const getStatusBadge = (status: string) => {
    if (status?.includes("✅")) return <Badge variant="default" className="bg-green-500">Pass</Badge>
    if (status?.includes("❌")) return <Badge variant="destructive">Fail</Badge>
    if (status?.includes("⚠️")) return <Badge variant="secondary" className="bg-yellow-500">Warning</Badge>
    return <Badge variant="outline">Unknown</Badge>
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">System Test</h1>
        <p className="text-muted-foreground">
          Verifica que todos los sistemas (correos, notificaciones, base de datos) estén configurados correctamente.
        </p>
      </div>

      <div className="mb-6">
        <Button onClick={runSystemTest} disabled={loading} size="lg">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? "Ejecutando tests..." : "Ejecutar System Test"}
        </Button>
      </div>

      {results && (
        <div className="space-y-6">
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {results.summary.overallStatus}
              </CardTitle>
              <CardDescription>
                Ejecutado: {new Date(results.timestamp).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <div className="text-2xl font-bold">{results.summary.total}</div>
                  <div className="text-sm text-muted-foreground">Total Tests</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-500">{results.summary.passed}</div>
                  <div className="text-sm text-muted-foreground">Passed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-500">{results.summary.failed}</div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-500">{results.summary.warnings || 0}</div>
                  <div className="text-sm text-muted-foreground">Warnings</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Individual Checks */}
          {Object.entries(results.checks).map(([key, check]: [string, any]) => (
            <Card key={key}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(check.status)}
                  {check.name}
                </CardTitle>
                {check.message && (
                  <CardDescription>{check.message}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {check.tests ? (
                  <div className="space-y-3">
                    {Object.entries(check.tests).map(([testKey, test]: [string, any]) => (
                      <div key={testKey} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(test.status)}
                          <div>
                            <div className="font-medium">{testKey}</div>
                            {test.message && (
                              <div className="text-sm text-muted-foreground">{test.message}</div>
                            )}
                            {test.value && (
                              <div className="text-sm text-muted-foreground mt-1">
                                <code className="bg-background px-2 py-1 rounded">{test.value}</code>
                              </div>
                            )}
                          </div>
                        </div>
                        {getStatusBadge(test.status)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(check.status)}
                      <div>
                        {check.message && <div className="text-sm">{check.message}</div>}
                        {check.config && (
                          <div className="text-sm text-muted-foreground mt-2">
                            <pre className="bg-background p-2 rounded text-xs">
                              {JSON.stringify(check.config, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(check.status)}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {results.error && (
            <Card className="border-red-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-500">
                  <XCircle className="h-5 w-5" />
                  Error
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded text-sm overflow-auto">{results.error}</pre>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!results && !loading && (
        <Card>
          <CardHeader>
            <CardTitle>Instrucciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Este test verificará:</p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>Variables de entorno (SMTP, Supabase, VAPID keys)</li>
              <li>Conexión a Supabase</li>
              <li>Estructura de tablas en la base de datos</li>
              <li>Configuración de SMTP para correos</li>
              <li>Configuración de VAPID keys para notificaciones push</li>
              <li>Estructura de la tabla users</li>
            </ul>
            <p className="text-sm text-muted-foreground">
              Haz clic en el botón para ejecutar el test completo.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
