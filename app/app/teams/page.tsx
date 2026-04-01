"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Users, Plus, UserPlus, Crown, Edit, Trash2 } from "@/components/icons"
import { useTranslation } from "@/hooks/useTranslation"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

interface Team {
  id: string
  name: string
  description: string
  role: string
  member_count: number
  created_at: string
}

export default function TeamsPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newTeamName, setNewTeamName] = useState("")
  const [newTeamDescription, setNewTeamDescription] = useState("")
  const [creating, setCreating] = useState(false)
  const [userPlan, setUserPlan] = useState("free")
  
  // Edit team state
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: "", description: "" })
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchTeams()
    fetchUserPlan()
  }, [])

  const fetchUserPlan = async () => {
    try {
      const response = await fetch("/api/user/profile")
      if (response.ok) {
        const data = await response.json()
        setUserPlan(data.subscription_tier || "free")
      } else if (response.status === 429) {
        console.warn("Rate limited, retrying in 5 seconds...")
        setTimeout(() => fetchUserPlan(), 5000)
      } else {
        console.error("Error fetching user plan:", response.status)
      }
    } catch (error) {
      console.error("Error fetching user plan:", error)
    }
  }

  const fetchTeams = async () => {
    try {
      const response = await fetch("/api/teams")
      if (response.ok) {
        const data = await response.json()
        setTeams(data.teams || [])
      }
    } catch (error) {
      console.error("Error fetching teams:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return

    setCreating(true)
    try {
      console.log("[v0] Creating team with name:", newTeamName)
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTeamName,
          description: newTeamDescription,
        }),
      })

      console.log("[v0] Team creation response status:", response.status)
      const data = await response.json()
      console.log("[v0] Team creation response:", data)

      if (response.ok) {
        setCreateDialogOpen(false)
        setNewTeamName("")
        setNewTeamDescription("")
        await fetchTeams()
      } else {
        alert(data.error || "Failed to create team")
      }
    } catch (error) {
      console.error("[v0] Error creating team:", error)
      alert("An error occurred while creating the team")
    } finally {
      setCreating(false)
    }
  }

  const handleEditTeam = async (teamId: string) => {
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

      if (response.ok) {
        setEditDialogOpen(false)
        setEditingTeamId(null)
        await fetchTeams()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to update team")
      }
    } catch (error) {
      console.error("Error updating team:", error)
      alert("An error occurred")
    } finally {
      setUpdating(false)
    }
  }

  const openEditTeamDialog = (team: Team) => {
    setEditingTeamId(team.id)
    setEditForm({
      name: team.name,
      description: team.description || "",
    })
    setEditDialogOpen(true)
  }

  const getTeamLimit = () => {
    return Number.POSITIVE_INFINITY
  }

  const canCreateTeam = teams.length < getTeamLimit()

  return (
    <div className="p-3 sm:p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 truncate">
            <span className="text-primary neon-text">{t("teams")}</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">{t("manageYourTeams") || t("createYourFirstTeam")}</p>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!canCreateTeam} className="neon-glow-hover w-full sm:w-auto text-xs sm:text-sm shrink-0">
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              {t("createTeam")}
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[90vw] max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">{t("createTeam")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <Label className="text-xs sm:text-sm">{t("teamName")}</Label>
                <Input
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder={t("team_placeholder")}
                  className="text-xs sm:text-sm"
                />
              </div>
              <div>
                <Label className="text-xs sm:text-sm">{t("teamDescription")}</Label>
                <Textarea
                  value={newTeamDescription}
                  onChange={(e) => setNewTeamDescription(e.target.value)}
                  placeholder={t("whatIsThisTeamAbout")}
                  rows={3}
                  className="text-xs sm:text-sm"
                />
              </div>
              <Button onClick={handleCreateTeam} disabled={creating || !newTeamName.trim()} className="w-full text-xs sm:text-sm">
                {creating ? t("creating") : t("createTeam")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {false && !canCreateTeam && (
        <Card className="glass-card p-4 mb-6 border-primary/50">
          <div className="flex items-start gap-3">
            <Crown className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">{t("teamLimitReached")}</p>
              <p className="text-sm text-muted-foreground mb-2">
                {userPlan === "free" ? t("freePlanTeamLimit") : t("premiumPlanTeamLimit")}
              </p>
              <Button size="sm" onClick={() => router.push("/app/subscription")}>
                {userPlan === "free" ? t("upgradeToPremium") : t("upgradeToProForUnlimited")}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">{t("loading")}</p>
        </div>
      ) : teams.length === 0 ? (
        <Card className="glass-card p-12 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">{t("noTeamsFound")}</h3>
          <p className="text-muted-foreground mb-4">{t("createYourFirstTeam")}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {teams.map((team, index) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card
                className="glass-card p-4 sm:p-6 neon-glow-hover transition-all group relative overflow-hidden h-full flex flex-col"
              >
                <div 
                  className="cursor-pointer flex-1 flex flex-col"
                  onClick={() => router.push(`/app/teams/${team.id}`)}
                >
                  <div className="flex items-start justify-between gap-2 mb-3 sm:mb-4">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm sm:text-lg truncate">{team.name}</h3>
                        <p className="text-xs text-muted-foreground">{t(team.role)}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2 flex-1">
                    {team.description || t("noDescription")}
                  </p>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <UserPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>
                        {team.member_count} {t("members")}
                      </span>
                    </div>
                  </div>
                </div>

                {(team.role === "owner" || team.role === "admin") && (
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        openEditTeamDialog(team)
                      }}
                      className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background text-xs"
                      title={t("editTeam")}
                    >
                      <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit Team Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="w-[90vw] max-w-md">
          <DialogHeader>
            <DialogTitle>{t("editTeam")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t("teamName")} *</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder={t("teamName")}
              />
            </div>
            <div>
              <Label>{t("teamDescription")}</Label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder={t("teamDescription")}
                rows={3}
              />
            </div>
            <Button 
              onClick={() => handleEditTeam(editingTeamId || "")} 
              disabled={updating || !editForm.name.trim()} 
              className="w-full"
            >
              {updating ? t("updating") : t("saveChanges")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
