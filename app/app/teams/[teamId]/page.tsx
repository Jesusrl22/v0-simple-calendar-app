"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Users,
  CheckSquare,
  BarChart3,
  UserPlus,
  Trash2,
  Crown,
  Shield,
  Plus,
  Edit,
} from "@/components/icons"
import { useTranslation } from "@/hooks/useTranslation"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

export default function TeamDetailPage() {
  const { t } = useTranslation()
  const params = useParams()
  const router = useRouter()
  const teamId = params.teamId as string
  const [loading, setLoading] = useState(true)
  const [team, setTeam] = useState<any>(null)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [teamInviteLink, setTeamInviteLink] = useState<string>("")
  const [inviting, setInviting] = useState(false)
  const [showInviteLink, setShowInviteLink] = useState(false)
  const [fullInviteUrl, setFullInviteUrl] = useState<string>("")

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
  })
  const [updating, setUpdating] = useState(false)

  const [tasks, setTasks] = useState<any[]>([])
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    assigned_to: "",
    due_date: "",
  })

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editingTask, setEditingTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    assigned_to: "",
    due_date: "",
  })
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState(false)

  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    activeTasks: 0,
    memberStats: [] as any[],
  })

  const isOwner = team?.role === "owner"

  useEffect(() => {
    if (teamId) {
      fetchTeamDetails()
      fetchTeamTasks()
      fetchTeamStats()
    }
  }, [teamId])

  useEffect(() => {
    if (teamId) {
      const baseUrl =
        typeof window !== "undefined"
          ? window.location.origin
          : process.env.NEXT_PUBLIC_APP_URL || "https://future-task.com"
      setTeamInviteLink(`${baseUrl}/invite/${teamId}`)
    }
  }, [teamId])

  useEffect(() => {
    if (team?.invite_token) {
      const baseUrl = typeof window !== "undefined" 
        ? window.location.origin 
        : process.env.NEXT_PUBLIC_APP_URL || "https://future-task.com"
      setFullInviteUrl(`${baseUrl}/app/invite/${team.invite_token}`)
    }
  }, [team?.invite_token])

  const fetchTeamDetails = async () => {
    try {
      const response = await fetch(`/api/teams/${teamId}`)
      if (response.ok) {
        const data = await response.json()
        setTeam(data)
        setEditForm({
          name: data.name,
          description: data.description || "",
        })
      } else {
        router.push("/app/teams")
      }
    } catch (error) {
      console.error("Error fetching team details:", error)
      router.push("/app/teams")
    } finally {
      setLoading(false)
    }
  }

  const fetchTeamTasks = async () => {
    try {
      const response = await fetch(`/api/team-tasks?teamId=${teamId}`)
      if (response.ok) {
        const data = await response.json()
        setTasks(data.tasks || [])
      }
    } catch (error) {
      console.error("Error fetching team tasks:", error)
    }
  }

  const fetchTeamStats = async () => {
    try {
      const response = await fetch(`/api/team-tasks?teamId=${teamId}`)
      if (response.ok) {
        const data = await response.json()
        const allTasks = data.tasks || []

        const totalTasks = allTasks.length
        const completedTasks = allTasks.filter((t: any) => t.completed).length
        const activeTasks = totalTasks - completedTasks

        const memberMap = new Map()
        allTasks.forEach((task: any) => {
          const assignedTo = task.assigned_to || "unassigned"
          const userName = task.assigned_user?.name || task.assigned_user?.email || "Unassigned"

          if (!memberMap.has(assignedTo)) {
            memberMap.set(assignedTo, {
              id: assignedTo,
              name: userName,
              total: 0,
              completed: 0,
            })
          }

          const stats = memberMap.get(assignedTo)
          stats.total++
          if (task.completed) stats.completed++
        })

        setStats({
          totalTasks,
          completedTasks,
          activeTasks,
          memberStats: Array.from(memberMap.values()),
        })
      }
    } catch (error) {
      console.error("Error fetching team stats:", error)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm(t("confirmRemoveMember"))) return

    try {
      const response = await fetch(`/api/teams/members`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId, memberId }),
      })

      if (response.ok) {
        fetchTeamDetails()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to remove member")
      }
    } catch (error) {
      console.error("Error removing member:", error)
    }
  }

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) {
      alert(t("enterTaskTitle"))
      return
    }

    try {
      const response = await fetch("/api/team-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newTask,
          teamId,
          assigned_to: newTask.assigned_to || null,
          completed: false,
        }),
      })

      if (response.ok) {
        setIsTaskDialogOpen(false)
        setNewTask({
          title: "",
          description: "",
          priority: "medium",
          assigned_to: "",
          due_date: "",
        })
        fetchTeamTasks()
        fetchTeamStats()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to create task")
      }
    } catch (error) {
      console.error("Error creating task:", error)
      alert("Failed to create task")
    }
  }

  const handleEditTask = async (taskId: string) => {
    if (!editingTask.title.trim()) {
      alert(t("enterTaskTitle"))
      return
    }

    try {
      const response = await fetch(`/api/team-tasks?teamId=${teamId}&id=${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editingTask,
          assigned_to: editingTask.assigned_to || null,
        }),
      })

      if (response.ok) {
        setIsEditTaskDialogOpen(false)
        setEditingTaskId(null)
        fetchTeamTasks()
        fetchTeamStats()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to update task")
      }
    } catch (error) {
      console.error("Error updating task:", error)
      alert("Failed to update task")
    }
  }

  const openEditTaskDialog = (task: any) => {
    setEditingTaskId(task.id)
    setEditingTask({
      title: task.title,
      description: task.description,
      priority: task.priority,
      assigned_to: task.assigned_to || "",
      due_date: task.due_date || "",
    })
    setIsEditTaskDialogOpen(true)
  }

  const toggleTask = async (taskId: string, completed: boolean) => {
    try {
      await fetch("/api/team-tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, teamId, completed: !completed }),
      })
      fetchTeamTasks()
      fetchTeamStats()
    } catch (error) {
      console.error("Error toggling task:", error)
    }
  }

  const deleteTask = async (taskId: string) => {
    if (!confirm(t("deleteConfirm"))) return

    try {
      await fetch("/api/team-tasks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, teamId }),
      })
      fetchTeamTasks()
      fetchTeamStats()
    } catch (error) {
      console.error("Error deleting task:", error)
    }
  }

  const handleEditTeam = async () => {
    if (!editForm.name.trim()) {
      alert(t("enterTeamName"))
      return
    }

    setUpdating(true)
    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name.trim(),
          description: editForm.description.trim(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setEditDialogOpen(false)
        setTeam(data)
        setEditForm({
          name: data.name,
          description: data.description || "",
        })
      } else {
        alert(data.error || "Failed to update team")
      }
    } catch (error: any) {
      console.error("[v0] Error updating team:", error)
      alert("An error occurred")
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteTeam = async () => {
    if (!confirm(`${t("confirmDeleteTeam")} "${team.name}"?`)) return

    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.push("/app/teams")
      } else {
        const data = await response.json()
        alert(data.error || "Failed to delete team")
      }
    } catch (error) {
      console.error("Error deleting team:", error)
      alert("An error occurred")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert(t("copiedToClipboard") || "Copied to clipboard!")
  }

  const getRoleIcon = (role: string) => {
    if (role === "owner") return <Crown className="w-4 h-4 text-yellow-500" />
    if (role === "admin") return <Shield className="w-4 h-4 text-blue-500" />
    return null
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-500 border-red-500"
      case "medium":
        return "text-yellow-500 border-yellow-500"
      case "low":
        return "text-green-500 border-green-500"
      default:
        return "text-muted-foreground"
    }
  }

  const canManageMembers = team?.role === "owner" || team?.role === "admin"
  const canEditTeam = true // Todos los miembros pueden editar el equipo

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">{t("loading")}</p>
        </div>
      </div>
    )
  }

  if (!team) {
    return null
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <Button variant="ghost" onClick={() => router.push("/app/teams")} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        {t("back")}
      </Button>

      <Dialog open={showInviteLink} onOpenChange={setShowInviteLink}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("invitationLink")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{t("shareInvitationLink")}</p>
            <div className="flex gap-2">
              <Input type="text" value={teamInviteLink} readOnly className="flex-1" />
              <Button onClick={() => copyToClipboard(teamInviteLink)} className="shrink-0">
                Copy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold break-words">
            <span className="text-primary neon-text">{team.name}</span>
          </h1>
          <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto">
            {canEditTeam && (
              <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full xs:w-auto bg-transparent">
                    <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="text-xs sm:text-sm">{t("editTeam")}</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[90vw] max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-base sm:text-lg">{t("editTeam")}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <Label className="text-xs sm:text-sm">{t("teamName")} *</Label>
                      <Input
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        placeholder={t("teamName")}
                        className="text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs sm:text-sm">{t("teamDescription")}</Label>
                      <Textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        placeholder={t("teamDescription")}
                        rows={3}
                        className="text-xs sm:text-sm"
                      />
                    </div>
                    <Button
                      onClick={handleEditTeam}
                      disabled={updating || !editForm.name.trim()}
                      className="w-full text-xs sm:text-sm"
                    >
                      {updating ? t("updating") : t("saveChanges")}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            {canManageMembers && team.role === "owner" && (
              <Button variant="destructive" size="sm" onClick={handleDeleteTeam} className="w-full xs:w-auto">
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm">{t("deleteTeam")}</span>
              </Button>
            )}
          </div>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground break-words">{team.description}</p>
      </div>

      {isOwner && (
        <Card className="glass-card p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
            <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="truncate">{t("inviteMember")}</span>
          </h3>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-2">{t("shareInvitationLink")}</p>
              <div className="flex flex-col xs:flex-row gap-2">
                <Input type="text" value={teamInviteLink} readOnly className="flex-1 font-mono text-xs break-all" />
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(teamInviteLink)
                    alert(t("copiedToClipboard") || "Copied!")
                  }}
                  className="w-full xs:w-auto shrink-0 text-xs sm:text-sm"
                  size="sm"
                >
                  {t("copy")}
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{t("anyoneWithThisLinkCanJoinTeam")}</p>
          </div>
        </Card>
      )}

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="grid w-full grid-cols-3 gap-1 p-1 overflow-hidden rounded-lg">
          <TabsTrigger value="tasks" className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 truncate">
            <CheckSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-0 sm:mr-1 shrink-0" />
            <span className="hidden xs:inline truncate">{t("teamTasks")}</span>
            <span className="xs:hidden truncate">{t("tasks")}</span>
          </TabsTrigger>
          <TabsTrigger value="members" className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 truncate">
            <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-0 sm:mr-1 shrink-0" />
            <span className="hidden xs:inline truncate">{t("teamMembers")}</span>
            <span className="xs:hidden truncate">{t("members")}</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 truncate">
            <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-0 sm:mr-1 shrink-0" />
            <span className="hidden xs:inline truncate">{t("statistics")}</span>
            <span className="xs:hidden truncate">{t("stats")}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
          <Dialog open={isEditTaskDialogOpen} onOpenChange={setIsEditTaskDialogOpen}>
            <DialogContent className="w-[90vw] max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base sm:text-lg">{t("editTask")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <Label className="text-xs sm:text-sm">{t("title")} *</Label>
                  <Input
                    value={editingTask.title}
                    onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                    placeholder={t("title")}
                    className="text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs sm:text-sm">{t("description")}</Label>
                  <Textarea
                    value={editingTask.description}
                    onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                    placeholder={t("description")}
                    className="text-xs sm:text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                  <div>
                    <Label className="text-xs sm:text-sm">{t("priority")}</Label>
                    <Select
                      value={editingTask.priority}
                      onValueChange={(value) => setEditingTask({ ...editingTask, priority: value })}
                    >
                      <SelectTrigger className="text-xs sm:text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">{t("low")}</SelectItem>
                        <SelectItem value="medium">{t("medium")}</SelectItem>
                        <SelectItem value="high">{t("high")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm">{t("assignTo")}</Label>
                    <Select
                      value={editingTask.assigned_to}
                      onValueChange={(value) => setEditingTask({ ...editingTask, assigned_to: value })}
                    >
                      <SelectTrigger className="text-xs sm:text-sm">
                        <SelectValue placeholder={t("unassigned")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">{t("unassigned")}</SelectItem>
                        {team.members?.map((member: any) => (
                          <SelectItem key={member.user_id} value={member.user_id} className="text-xs sm:text-sm">
                            {member.users?.name || member.users?.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-xs sm:text-sm">{t("dueDate")}</Label>
                  <Input
                    type="date"
                    value={editingTask.due_date}
                    onChange={(e) => setEditingTask({ ...editingTask, due_date: e.target.value })}
                    className="text-xs sm:text-sm"
                  />
                </div>
                <Button onClick={() => handleEditTask(editingTaskId!)} className="w-full text-xs sm:text-sm">
                  {t("saveChanges")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Card className="glass-card p-3 sm:p-4 mb-4 sm:mb-6">
            <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full text-xs sm:text-sm" size="sm">
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  {t("newTask")}
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[90vw] max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-base sm:text-lg">{t("createNewTask")}</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <Label className="text-xs sm:text-sm">{t("title")} *</Label>
                    <Input
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      placeholder={t("title")}
                      className="text-xs sm:text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm">{t("description")}</Label>
                    <Textarea
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      placeholder={t("description")}
                      className="text-xs sm:text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:gap-4">
                    <div>
                      <Label className="text-xs sm:text-sm">{t("priority")}</Label>
                      <Select
                        value={newTask.priority}
                        onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
                      >
                        <SelectTrigger className="text-xs sm:text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">{t("low")}</SelectItem>
                          <SelectItem value="medium">{t("medium")}</SelectItem>
                          <SelectItem value="high">{t("high")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs sm:text-sm">{t("assignTo")}</Label>
                      <Select
                        value={newTask.assigned_to}
                        onValueChange={(value) => setNewTask({ ...newTask, assigned_to: value })}
                      >
                        <SelectTrigger className="text-xs sm:text-sm">
                          <SelectValue placeholder={t("unassigned")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">{t("unassigned")}</SelectItem>
                          {team.members?.map((member: any) => (
                            <SelectItem key={member.user_id} value={member.user_id} className="text-xs sm:text-sm">
                              {member.users?.name || member.users?.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm">{t("dueDate")}</Label>
                    <Input
                      type="date"
                      value={newTask.due_date}
                      onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                      className="text-xs sm:text-sm"
                    />
                  </div>
                  <Button onClick={handleCreateTask} className="w-full text-xs sm:text-sm">
                    {t("createTask")}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </Card>

          <div className="space-y-3 sm:space-y-4 pt-4 sm:pt-6 border-t border-border">
            {tasks.length === 0 ? (
              <Card className="glass-card p-8 sm:p-12 text-center">
                <CheckSquare className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
                <p className="text-xs sm:text-sm text-muted-foreground">{t("noTasksFound")}</p>
              </Card>
            ) : (
              tasks.map((task) => (
                <Card key={task.id} className="glass-card p-3 sm:p-4">
                  <div className="flex items-start gap-2 sm:gap-4">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => toggleTask(task.id, task.completed)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`text-xs sm:text-sm font-semibold break-words ${task.completed ? "line-through text-muted-foreground" : ""}`}
                      >
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-xs text-muted-foreground mt-1 break-words">{task.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-2">
                        <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
                          {t(task.priority)}
                        </Badge>
                        {task.assigned_user && (
                          <Badge variant="outline" className="text-xs truncate">
                            {task.assigned_user.name || task.assigned_user.email}
                          </Badge>
                        )}
                        {task.due_date && (
                          <span className="text-xs text-muted-foreground">
                            {t("due")}: {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditTaskDialog(task)}
                        className="h-8 w-8 sm:h-10 sm:w-10"
                      >
                        <Edit className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteTask(task.id)}
                        className="h-8 w-8 sm:h-10 sm:w-10"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="members" className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
          <Card className="glass-card p-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-sm sm:text-base">{t("invitationLink")}</h3>
              <div className="flex gap-2 flex-col sm:flex-row">
                <Input 
                  type="text" 
                  value={fullInviteUrl || t("loading")} 
                  readOnly 
                  className="flex-1 text-xs sm:text-sm" 
                />
                <Button 
                  onClick={() => copyToClipboard(fullInviteUrl)} 
                  size="sm"
                  className="w-full sm:w-auto"
                  disabled={!fullInviteUrl}
                >
                  {t("copy")}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">{t("shareInvitationLink")}</p>
            </div>
          </Card>

          <div className="grid gap-4">
            {team.members?.map((member: any) => (
              <Card key={member.id} className="glass-card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{member.users?.name || member.users?.email}</p>
                        {getRoleIcon(member.role)}
                      </div>
                      <p className="text-sm text-muted-foreground">{member.users?.email}</p>
                      <p className="text-xs text-muted-foreground">{t(member.role)}</p>
                    </div>
                  </div>
                  {canManageMembers && member.role !== "owner" && (
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveMember(member.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="stats" className="mt-6 space-y-4">
          <div className="grid gap-2 sm:gap-3 md:gap-4 grid-cols-3">
            <Card className="glass-card p-2 sm:p-3 md:p-6 overflow-hidden">
              <div className="text-center">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">{t("totalTasks")}</p>
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">{stats.totalTasks}</p>
              </div>
            </Card>
            <Card className="glass-card p-2 sm:p-3 md:p-6 overflow-hidden">
              <div className="text-center">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">{t("completedTasks")}</p>
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-500">{stats.completedTasks}</p>
              </div>
            </Card>
            <Card className="glass-card p-2 sm:p-3 md:p-6 overflow-hidden">
              <div className="text-center">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">{t("activeTasks")}</p>
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-500">{stats.activeTasks}</p>
              </div>
            </Card>
          </div>

          <Card className="glass-card p-2 sm:p-3 md:p-6 overflow-hidden">
            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4">{t("memberPerformance")}</h3>
            <div className="space-y-2 sm:space-y-4">
              {stats.memberStats.map((member) => (
                <div
                  key={member.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:p-3 bg-secondary/50 rounded-lg gap-2 overflow-hidden"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm sm:text-base truncate">{member.name}</p>
                    <div className="flex items-center gap-2 sm:gap-4 mt-1 overflow-x-auto">
                      <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                        {member.completed}/{member.total} {t("completed")}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="w-full bg-secondary rounded-full h-1.5 sm:h-2">
                          <div
                            className="bg-primary h-1.5 sm:h-2 rounded-full transition-all"
                            style={{ width: `${member.total > 0 ? (member.completed / member.total) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xl sm:text-2xl font-bold text-primary">
                      {member.total > 0 ? Math.round((member.completed / member.total) * 100) : 0}%
                    </p>
                  </div>
                </div>
              ))}
              {stats.memberStats.length === 0 && (
                <p className="text-center text-xs sm:text-sm text-muted-foreground py-4 sm:py-8">{t("noTasksYet")}</p>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
