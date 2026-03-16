'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ArrowLeft, Copy, Eye, EyeOff } from 'lucide-react'

interface User {
  id: string
  email: string
  name: string | null
  subscription_plan: string | null
  subscription_expires_at: string | null
  created_at: string
}

interface UserStats {
  tasks: number
  notes: number
  habits: number
  pomodoros: number
}

export default function UserDetailPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.userId as string

  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    checkAdminAndFetchUser()
  }, [userId])

  const checkAdminAndFetchUser = async () => {
    try {
      const isAuthenticated = sessionStorage.getItem('admin_authenticated') === 'true'
      if (!isAuthenticated) {
        router.push('/admin')
        return
      }
      setIsAdmin(true)
      await fetchUser()
      await fetchUserStats()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`)
      const data = await response.json()
      if (response.ok) {
        setUser(data.user)
        setNewEmail(data.user.email)
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    }
  }

  const fetchUserStats = async () => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/stats`)
      const data = await response.json()
      if (response.ok) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleChangePassword = async () => {
    if (!newPassword) return
    setActionLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      })
      if (response.ok) {
        setShowPasswordDialog(false)
        setNewPassword('')
        alert('Contraseña actualizada correctamente')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      alert('Error al cambiar la contraseña')
    } finally {
      setActionLoading(false)
    }
  }

  const handleChangeEmail = async () => {
    if (!newEmail || newEmail === user?.email) return
    setActionLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}/change-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail }),
      })
      if (response.ok) {
        setShowEmailDialog(false)
        await fetchUser()
        alert('Correo actualizado correctamente')
      }
    } catch (error) {
      console.error('Error changing email:', error)
      alert('Error al cambiar el correo')
    } finally {
      setActionLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isAdmin || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Usuario no encontrado</p>
      </div>
    )
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('es-ES')
  }

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{user.name || user.email}</h1>
          <p className="text-muted-foreground text-sm">ID: {user.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info */}
        <Card className="lg:col-span-2 p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Información del Usuario</h2>
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Nombre</Label>
                <p className="text-foreground font-medium">{user.name || '—'}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Correo Electrónico</Label>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-foreground font-medium">{user.email}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(user.email)}
                    className="h-8 w-8 p-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Plan</Label>
                <p className="text-foreground font-medium capitalize">{user.subscription_plan || 'free'}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Fecha de Registro</Label>
                <p className="text-foreground font-medium">{formatDate(user.created_at)}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Suscripción Expira</Label>
                <p className="text-foreground font-medium">{formatDate(user.subscription_expires_at)}</p>
              </div>
            </div>
          </div>

          {/* Admin Actions */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">Acciones de Administrador</h3>
            <div className="flex gap-2 flex-wrap">
              <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                <Button onClick={() => setShowPasswordDialog(true)} variant="outline">
                  Cambiar Contraseña
                </Button>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cambiar Contraseña</DialogTitle>
                    <DialogDescription>
                      Ingresa la nueva contraseña para {user.name || user.email}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="password">Nueva Contraseña</Label>
                      <div className="relative mt-1">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Mínimo 8 caracteres"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleChangePassword} disabled={actionLoading || !newPassword}>
                        {actionLoading ? 'Cambiando...' : 'Cambiar'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
                <Button onClick={() => setShowEmailDialog(true)} variant="outline">
                  Cambiar Correo
                </Button>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cambiar Correo Electrónico</DialogTitle>
                    <DialogDescription>
                      Ingresa el nuevo correo para {user.name || user.email}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email">Nuevo Correo</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleChangeEmail}
                        disabled={actionLoading || !newEmail || newEmail === user.email}
                      >
                        {actionLoading ? 'Cambiando...' : 'Cambiar'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Estadísticas</h2>
          {stats ? (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Tareas</p>
                <p className="text-2xl font-bold">{stats.tasks}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Notas</p>
                <p className="text-2xl font-bold">{stats.notes}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Hábitos</p>
                <p className="text-2xl font-bold">{stats.habits}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Pomodoros</p>
                <p className="text-2xl font-bold">{stats.pomodoros}</p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Cargando estadísticas...</p>
          )}
        </Card>
      </div>
    </div>
  )
}
