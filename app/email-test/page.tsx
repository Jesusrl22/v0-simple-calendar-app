'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

export default function EmailTestPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [testType, setTestType] = useState('diagnosis')
  // Trigger rebuild

  const testDiagnosis = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/diagnose-smtp')
      const data = await response.json()
      setResult(data)
    } catch (error: any) {
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const testEmail = async () => {
    if (!email) {
      alert('Por favor ingresa un email')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await response.json()
      setResult(data)
    } catch (error: any) {
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-slate-800 border-slate-700 p-6">
          <h1 className="text-3xl font-bold mb-6 text-white">Prueba de Correos</h1>
          
          <div className="space-y-4 mb-6">
            <div className="flex gap-2">
              <Button
                onClick={testDiagnosis}
                disabled={loading}
                className={testType === 'diagnosis' ? 'bg-green-500 hover:bg-green-600' : ''}
              >
                {loading && testType === 'diagnosis' ? 'Probando...' : 'Diagnosticar SMTP'}
              </Button>
              <Button
                onClick={() => setTestType('email')}
                variant="outline"
                className={testType === 'email' ? 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500' : ''}
              >
                Enviar Email
              </Button>
            </div>

            {testType === 'email' && (
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <Button
                  onClick={testEmail}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? 'Enviando...' : 'Enviar'}
                </Button>
              </div>
            )}
          </div>

          {result && (
            <div className="bg-slate-700 border border-slate-600 rounded-lg p-4 overflow-auto max-h-96">
              <pre className="text-sm text-white font-mono">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-900 border border-blue-700 rounded-lg text-blue-100 text-sm">
            <p className="font-semibold mb-2">Instrucciones:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Haz clic en "Diagnosticar SMTP" para ver la configuración</li>
              <li>Si dice "OK", la conexión funciona correctamente</li>
              <li>Si hay error, revisa tus variables de entorno SMTP</li>
              <li>Luego prueba enviando un email de prueba</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  )
}
