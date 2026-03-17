'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface User {
  id: string
  email: string
  name: string | null
  subscription_plan: string | null
  subscription_expires_at: string | null
  created_at: string
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [expirationDate, setExpirationDate] = useState('')
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [viewUserDialogOpen, setViewUserDialogOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [userPassword, setUserPassword] = useState<string | null>(null)
  const [authPassword, setAuthPassword] = useState('')
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [settingPassword, setSettingPassword] = useState(false)

  useEffect(() => {
    checkAdmin()
  }, [])

  useEffect(() => {
    const filtered = users.filter(
      (u) =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredUsers(filtered)
  }, [searchTerm, users])

  const checkAdmin = async () => {
    try {
      const isAuthenticated = sessionStorage.getItem('admin_authenticated') === 'true'
      if (!isAuthenticated) {
        window.location.href = '/admin'
        return
      }
      setIsAdmin(true)
      fetchUsers()
    } catch (error) {
      console.error('Admin check error:', error)
      window.location.href = '/admin'
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      const data = await response.json()
      if (data.users) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTierBadge = (tier: string | null) => {
    const baseClasses = 'bg-opacity-20 text-white'
    switch (tier) {
      case 'pro':
        return `${baseClasses} bg-yellow-500`
      case 'premium':
        return `${baseClasses} bg-purple-500`
      default:
        return `${baseClasses} bg-gray-500`
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    } catch {
      return dateString
    }
  }

  const handleViewPassword = () => {
    if (!showPassword) {
      setAuthPassword('')
      setAuthError('')
      setAuthDialogOpen(true)
    } else {
      setShowPassword(false)
      setUserPassword(null)
    }
  }

  const handleAuthConfirm = async () => {
    setAuthLoading(true)
    setAuthError('')
    try {
      const response = await fetch('/api/auth/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: authPassword }),
      })

      if (!response.ok) {
        setAuthError('Contraseña incorrecta')
        setAuthLoading(false)
        return
      }

      // Now fetch the user password from database
      if (selectedUser) {
        const passwordResponse = await fetch(`/api/admin/user-password?userId=${selectedUser.id}`, {
          method: 'GET',
        })

        if (passwordResponse.ok) {
          const { password } = await passwordResponse.json()
          setUserPassword(password)
        } else {
          setUserPassword('No password found')
        }
      }

      setShowPassword(true)
      setAuthDialogOpen(false)
    } catch (error) {
      setAuthError('Error verificando contraseña')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSetPassword = async () => {
    if (!selectedUser || !newPassword) return
    setSettingPassword(true)
    try {
      const response = await fetch('/api/admin/set-user-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          password: newPassword,
        }),
      })

      if (response.ok) {
        setUserPassword(newPassword)
        setNewPassword('')
        alert('Contraseña guardada exitosamente')
      } else {
        alert('Error al guardar la contraseña')
      }
    } catch (error) {
      console.error('Error setting password:', error)
      alert('Error al guardar la contraseña')
    } finally {
      setSettingPassword(false)
    }
  }

  const updateUserTier = async (userId: string, newTier: string) => {
    try {
      await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, subscription_plan: newTier }),
      })
      fetchUsers()
    } catch (error) {
      console.error('Error updating user tier:', error)
    }
  }

  const handleSetExpiration = async () => {
    if (!selectedUser) return
    try {
      await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          subscription_expires_at: expirationDate || null,
        }),
      })
      setSelectedUser(null)
      setExpirationDate('')
      fetchUsers()
    } catch (error) {
      console.error('Error setting expiration:', error)
    }
  }

  const deleteUser = async (userId: string) => {
    try {
      await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      setDeleteDialogOpen(false)
      setUserToDelete(null)
      fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authenticated')
    window.location.href = '/admin'
  }

  if (!isAdmin || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage user subscriptions and access</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <Card className="p-6 bg-card/50 backdrop-blur">
            <div className="text-sm text-muted-foreground mb-2">Total Users</div>
            <div className="text-3xl font-bold">{users.length}</div>
          </Card>
          <Card className="p-6 bg-card/50 backdrop-blur">
            <div className="text-sm text-muted-foreground mb-2">Premium Users</div>
            <div className="text-3xl font-bold text-purple-500">
              {users.filter((u) => u.subscription_plan === 'premium').length}
            </div>
          </Card>
          <Card className="p-6 bg-card/50 backdrop-blur">
            <div className="text-sm text-muted-foreground mb-2">Pro Users</div>
            <div className="text-3xl font-bold text-yellow-500">
              {users.filter((u) => u.subscription_plan === 'pro').length}
            </div>
          </Card>
        </div>

        <Card className="p-6 mb-6 bg-card/50 backdrop-blur">
          <Input
            placeholder="Search users by email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Card>

        <Card className="overflow-hidden bg-card/50 backdrop-blur">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border/50">
                <tr className="bg-secondary/50">
                  <th className="text-left p-2 font-semibold">Name</th>
                  <th className="text-left p-2 font-semibold">Email</th>
                  <th className="text-left p-2 font-semibold">Plan</th>
                  <th className="text-left p-2 font-semibold">Expires</th>
                  <th className="text-left p-2 font-semibold">Change</th>
                  <th className="text-center p-2 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      Loading users...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                      <td className="p-2 text-xs font-medium">{user.name || 'No name'}</td>
                      <td className="p-2 text-xs max-w-[150px] truncate">{user.email}</td>
                      <td className="p-2">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getTierBadge(user.subscription_plan)}`}>
                          {user.subscription_plan?.toUpperCase() || 'FREE'}
                        </span>
                      </td>
                      <td className="p-2 text-xs">{user.subscription_expires_at ? formatDate(user.subscription_expires_at) : 'Never'}</td>
                      <td className="p-2">
                        <Select value={user.subscription_plan || 'free'} onValueChange={(value) => updateUserTier(user.id, value)}>
                          <SelectTrigger className="w-[90px] h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="free">Free</SelectItem>
                            <SelectItem value="premium">Premium</SelectItem>
                            <SelectItem value="pro">Pro</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-1 justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs px-2"
                            onClick={() => {
                              setSelectedUser(user)
                              setViewUserDialogOpen(true)
                            }}
                          >
                            View
                          </Button>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs px-2"
                                onClick={() => setExpirationDate(user.subscription_expires_at?.split('T')[0] || '')}
                              >
                                Expires
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Set Expiration</DialogTitle>
                                <DialogDescription>Set an expiration date for {user.name || user.email}'s subscription</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="expiration">Expiration Date</Label>
                                  <Input
                                    id="expiration"
                                    type="date"
                                    value={expirationDate}
                                    onChange={(e) => setExpirationDate(e.target.value)}
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button onClick={handleSetExpiration} className="flex-1">
                                    Save
                                  </Button>
                                  <Button variant="outline" onClick={() => setExpirationDate('')}>
                                    Clear
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-7 text-xs px-2"
                            onClick={() => {
                              setUserToDelete(user)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {userToDelete?.name || userToDelete?.email}? This cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => userToDelete && deleteUser(userToDelete.id)}>
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={viewUserDialogOpen} onOpenChange={setViewUserDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Name</Label>
                    <p className="text-sm font-medium">{selectedUser.name || 'No name set'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Email</Label>
                    <p className="text-sm font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Plan</Label>
                    <p className="text-sm font-medium capitalize">{selectedUser.subscription_plan || 'Free'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Expires</Label>
                    <p className="text-sm font-medium">
                      {selectedUser.subscription_expires_at ? formatDate(selectedUser.subscription_expires_at) : 'Never'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Created At</Label>
                    <p className="text-sm font-medium">{formatDate(selectedUser.created_at)}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">User ID</Label>
                    <p className="text-sm font-medium font-mono text-xs truncate">{selectedUser.id}</p>
                  </div>
                </div>

                {/* Password Field */}
                <div className="border-t pt-4 mt-4">
                  <Label className="text-xs text-muted-foreground mb-2 block">Password</Label>
                  {userPassword === 'No password found' ? (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3">
                      <p className="text-sm text-yellow-700 dark:text-yellow-400">
                        No password stored for this user. This usually means they registered before the password storage system was added. Please set a new password below.
                      </p>
                    </div>
                  ) : (
                    <div className="flex gap-2 items-center">
                      <div className="flex-1 flex items-center bg-secondary/50 px-3 py-2 rounded border border-input">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={userPassword || '••••••••'}
                          readOnly
                          className="bg-transparent outline-none flex-1 text-sm"
                        />
                        <button
                          onClick={handleViewPassword}
                          className="ml-2 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          {showPassword ? '👁️' : '👁️‍🗨️'}
                        </button>
                      </div>
                      {showPassword && userPassword && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            navigator.clipboard.writeText(userPassword)
                          }}
                        >
                          Copy
                        </Button>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {showPassword ? 'Password visible' : 'Click eye to view password (requires admin authentication)'}
                  </p>
                </div>

                {/* Set New Password Section */}
                <div className="border-t pt-4 mt-4">
                  <Label className="text-xs text-muted-foreground mb-2 block">Set New Password</Label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password for user"
                      className="flex-1 px-3 py-2 border border-input rounded bg-background text-foreground text-sm"
                    />
                    <Button
                      size="sm"
                      onClick={handleSetPassword}
                      disabled={!newPassword || settingPassword}
                    >
                      {settingPassword ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Set a new password for this user (e.g., they lost access)
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Authentication Dialog */}
        <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Admin Authentication Required</DialogTitle>
              <DialogDescription>
                Please enter your admin password to view the user password.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="authPassword">Admin Password</Label>
                <input
                  id="authPassword"
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAuthConfirm()}
                  className="w-full mt-1 px-3 py-2 border border-input rounded bg-background text-foreground"
                  placeholder="Enter your admin password"
                />
              </div>
              {authError && <p className="text-sm text-destructive">{authError}</p>}
              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setAuthDialogOpen(false)} disabled={authLoading}>
                  Cancel
                </Button>
                <Button onClick={handleAuthConfirm} disabled={authLoading}>
                  {authLoading ? 'Verifying...' : 'Verify'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
