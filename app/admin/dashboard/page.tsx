"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface User {
  id: string
  email: string
  name: string | null
  subscription_plan: string | null
  subscription_expires_at: string | null
  created_at: string
  stats?: {
    tasks: number
    notes: number
    pomodoros: number
    creditsUsed: number
    creditsRemaining: number
  }
}

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [expirationDate, setExpirationDate] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkAdminAccess()
  }, [])

  const checkAdminAccess = async () => {
    try {
      const isAuthenticated = sessionStorage.getItem("admin_authenticated") === "true"

      console.log("[v0] Admin check:", isAuthenticated)

      if (!isAuthenticated) {
        router.push("/admin")
        return
      }

      setIsAdmin(true)
      fetchUsers()
    } catch (error) {
      console.error("Admin access check error:", error)
      router.push("/admin")
    }
  }

  const fetchUsers = async () => {
    try {
      console.log("[v0] Fetching users via API...")
      const response = await fetch("/api/admin/users")
      const data = await response.json()

      console.log("[v0] Users API response:", data)

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch users")
      }

      setUsers(data.users || [])
      setFilteredUsers(data.users || [])
    } catch (error) {
      // Silently handle error
    } finally {
      setLoading(false)
    }
  }

  const updateUserTier = async (userId: string, newTier: string, expiresAt?: string | null) => {
    try {
      const updates: any = { subscription_tier: newTier }
      if (expiresAt !== undefined) {
        updates.subscription_expires_at = expiresAt
      }

      console.log("[v0] Updating user plan:", { userId, newTier, updates })

      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          updates,
        }),
      })

      const data = await response.json()
      console.log("[v0] Update response:", data)

      if (!response.ok) {
        throw new Error(data.error || "Failed to update user")
      }

      await fetchUsers()

      const creditsInfo = {
        free: "0 AI credits",
        premium: "100 AI credits",
        pro: "500 AI credits",
      }
      const credits = creditsInfo[newTier as keyof typeof creditsInfo] || "AI credits"
      alert(`User updated successfully!\nPlan: ${newTier.toUpperCase()}\nCredits assigned: ${credits}`)
      // Stay in admin, don't redirect
    } catch (error) {
      console.error("[v0] Error updating user:", error)
      alert("Error updating user. Please try again.")
    }
  }

  const deleteUser = async (userId: string) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete user")
      }

      setUsers(users.filter((u) => u.id !== userId))
      setFilteredUsers(filteredUsers.filter((u) => u.id !== userId))

      alert("User deleted successfully!")
      setDeleteDialogOpen(false)
      setUserToDelete(null)
      // Stay in admin dashboard, don't redirect
    } catch (error) {
      alert("Error deleting user. Please try again.")
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem("admin_authenticated")
    router.push("/admin")
  }

  const handleSetExpiration = () => {
    if (selectedUser) {
      const expiresAt = expirationDate ? new Date(expirationDate).toISOString() : null
      updateUserTier(selectedUser.id, selectedUser.subscription_plan || "free", expiresAt)
      setSelectedUser(null)
      setExpirationDate("")
    }
  }

  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredUsers(filtered)
  }, [searchTerm, users])

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-8 text-center">
          <div className="text-4xl mb-4">🛡️</div>
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </Card>
      </div>
    )
  }

  const getTierBadge = (tier: string | null) => {
    const tierLower = tier?.toLowerCase() || "free"
    const colors = {
      free: "bg-gray-500/20 text-gray-500",
      premium: "bg-purple-500/20 text-purple-500",
      pro: "bg-yellow-500/20 text-yellow-500",
    }
    return colors[tierLower as keyof typeof colors] || colors.free
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="text-4xl">🛡️</div>
              <h1 className="text-4xl font-bold">Admin Dashboard</h1>
            </div>
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
              {users.filter((u) => u.subscription_plan === "premium").length}
            </div>
          </Card>
          <Card className="p-6 bg-card/50 backdrop-blur">
            <div className="text-sm text-muted-foreground mb-2">Pro Users</div>
            <div className="text-3xl font-bold text-yellow-500">
              {users.filter((u) => u.subscription_plan === "pro").length}
            </div>
          </Card>
        </div>

        <Card className="p-6 mb-6 bg-card/50 backdrop-blur">
          <Input
            placeholder="🔍 Search users by email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Card>

        <Card className="overflow-hidden bg-card/50 backdrop-blur">
          <div className="w-full">
            <table className="w-full text-sm">
              <thead className="border-b border-border/50">
                <tr className="bg-secondary/50">
                  <th className="text-left p-2 font-semibold">User</th>
                  <th className="text-left p-2 font-semibold">Email</th>
                  <th className="text-left p-2 font-semibold">Tier</th>
                  <th className="text-center p-2 font-semibold text-xs">Tasks</th>
                  <th className="text-center p-2 font-semibold text-xs">Notes</th>
                  <th className="text-center p-2 font-semibold text-xs">Pomodoros</th>
                  <th className="text-center p-2 font-semibold text-xs">AI Credits</th>
                  <th className="text-left p-2 font-semibold text-xs">Expires</th>
                  <th className="text-left p-2 font-semibold">Change</th>
                  <th className="text-center p-2 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-muted-foreground">
                      Loading users...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-muted-foreground">
                      {searchTerm ? "No users found matching your search" : "No users in database"}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                      <td className="p-2">
                        <div className="font-medium text-xs">{user.name || "No name"}</div>
                        <div className="text-[10px] text-muted-foreground">{formatDate(user.created_at)}</div>
                      </td>
                      <td className="p-2 text-xs max-w-[150px] truncate" title={user.email}>
                        {user.email}
                      </td>
                      <td className="p-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${getTierBadge(
                            user.subscription_plan,
                          )}`}
                        >
                          {user.subscription_plan?.toUpperCase() || "FREE"}
                        </span>
                      </td>
                      <td className="p-2 text-center">
                        <span className="font-semibold text-blue-500 text-xs">{user.stats?.tasks || 0}</span>
                      </td>
                      <td className="p-2 text-center">
                        <span className="font-semibold text-green-500 text-xs">{user.stats?.notes || 0}</span>
                      </td>
                      <td className="p-2 text-center">
                        <span className="font-semibold text-purple-500 text-xs">{user.stats?.pomodoros || 0}</span>
                      </td>
                      <td className="p-2 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-semibold text-orange-500">
                            {user.stats?.creditsRemaining || 0}
                          </span>
                          <span className="text-[9px] text-muted-foreground">/{user.stats?.creditsUsed || 0}</span>
                        </div>
                      </td>
                      <td className="p-2 text-[10px]">
                        {user.subscription_expires_at ? (
                          <span className="text-muted-foreground">{formatDate(user.subscription_expires_at)}</span>
                        ) : (
                          <span className="text-muted-foreground italic">Never</span>
                        )}
                      </td>
                      <td className="p-2">
                        <Select
                          value={user.subscription_plan || "free"}
                          onValueChange={(value) => updateUserTier(user.id, value)}
                        >
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
                        <div className="flex gap-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-[10px] px-2 bg-transparent"
                                onClick={() => {
                                  setSelectedUser(user)
                                  setExpirationDate(user.subscription_expires_at?.split("T")[0] || "")
                                }}
                              >
                                Expires
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Set Plan Expiration</DialogTitle>
                                <DialogDescription>
                                  Set an expiration date for {user.name || user.email}'s subscription plan. Leave empty
                                  for no expiration (until user cancels).
                                </DialogDescription>
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
                                  <p className="text-xs text-muted-foreground">Leave empty to remove expiration date</p>
                                </div>
                                <div className="flex gap-2">
                                  <Button onClick={handleSetExpiration} className="flex-1">
                                    Save
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setExpirationDate("")
                                      updateUserTier(user.id, user.subscription_plan || "free", null)
                                      setSelectedUser(null)
                                    }}
                                  >
                                    Remove Expiration
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-7 text-[10px] px-2"
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
                Are you sure you want to delete {userToDelete?.name || userToDelete?.email}? This action cannot be
                undone and will permanently remove all user data including tasks, notes, and pomodoro sessions.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => userToDelete && deleteUser(userToDelete.id)}>
                Delete User
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
