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
  const [newPassword, setNewPassword] = useState('')
  const [settingPassword, setSettingPassword] = useState(false)
  const [passwordExpiresIn5Days, setPasswordExpiresIn5Days] = useState(false)
  const [editingName, setEditingName] = useState('')
  const [savingName, setSavingName] = useState(false)

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
          expiresIn5Days: passwordExpiresIn5Days,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setNewPassword('')
        setPasswordExpiresIn5Days(false)
        alert(result.message || 'Contraseña guardada exitosamente')
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

  const handleSaveName = async () => {
    if (!selectedUser || !editingName.trim()) return
    setSavingName(true)
    try {
      const response = await fetch('/api/admin/update-user-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          name: editingName.trim(),
        }),
      })

      if (response.ok) {
        // Update the user in the local state
        const updatedUser = { ...selectedUser, name: editingName.trim() }
        setSelectedUser(updatedUser)
        
        // Update the users list
        setUsers(users.map(u => u.id === selectedUser.id ? updatedUser : u))
        
        alert('Nombre actualizado exitosamente')
      } else {
        alert('Error al actualizar el nombre')
      }
    } catch (error) {
      console.error('Error updating name:', error)
      alert('Error al actualizar el nombre')
    } finally {
      setSavingName(false)
    }
  }

  const handleSetExpiration = async () => {
    if (!selectedUser || !expirationDate) return

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          subscription_expires_at: new Date(expirationDate).toISOString(),
        }),
      })

      if (response.ok) {
        setExpirationDate('')
        fetchUsers()
      }
    } catch (error) {
      console.error('Error updating expiration:', error)
    }
  }

  const updateUserTier = async (userId: string, tier: string) => {
    try {
      await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          subscription_plan: tier,
        }),
      })
      fetchUsers()
    } catch (error) {
      console.error('Error updating tier:', error)
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
                  <th className="text-left p-2 font-semibold">Verified</th>
                  <th className="text-left p-2 font-semibold">Plan</th>
                  <th className="text-left p-2 font-semibold">Expires</th>
                  <th className="text-left p-2 font-semibold">Change</th>
                  <th className="text-center p-2 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      Loading users...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                      <td className="p-2 text-xs font-medium">{user.name || 'No name'}</td>
                      <td className="p-2 text-xs max-w-[150px] truncate">{user.email}</td>
                      <td className="p-2 text-xs">
                        {user.email_verified ? (
                          <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-600 dark:text-green-400">
                            ✓ Verified
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-amber-500/20 text-amber-600 dark:text-amber-400">
                            ✗ Pending
                          </span>
                        )}
                      </td>
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
                              setEditingName(user.name || '')
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
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Name</Label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        placeholder="Enter user name"
                        className="flex-1 px-3 py-2 border border-input rounded bg-background text-foreground text-sm"
                      />
                      <Button
                        size="sm"
                        onClick={handleSaveName}
                        disabled={!editingName.trim() || savingName}
                        className="whitespace-nowrap"
                      >
                        {savingName ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">Email</Label>
                      <p className="text-sm font-medium break-all">{selectedUser.email}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">Verified</Label>
                      <p className="text-sm font-medium">
                        {selectedUser.email_verified ? (
                          <span className="text-green-600 dark:text-green-400">✓ Verified</span>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400">✗ Pending</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">Plan</Label>
                      <p className="text-sm font-medium capitalize">{selectedUser.subscription_plan || 'Free'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">Expires</Label>
                      <p className="text-sm font-medium">
                        {selectedUser.subscription_expires_at ? formatDate(selectedUser.subscription_expires_at) : 'Never'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">Created At</Label>
                      <p className="text-sm font-medium">{formatDate(selectedUser.created_at)}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">User ID</Label>
                      <p className="text-sm font-medium font-mono text-xs truncate">{selectedUser.id}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <Label className="text-xs text-muted-foreground mb-3 block">Set New Password</Label>
                  <div className="space-y-3">
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

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="passwordExpires"
                        checked={passwordExpiresIn5Days}
                        onChange={(e) => setPasswordExpiresIn5Days(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="passwordExpires" className="text-xs cursor-pointer">
                        Password expires in 5 days (user must change it)
                      </Label>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Use this when the user has lost access or you need to reset their password.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
