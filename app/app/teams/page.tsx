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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80">
      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 text-balance">
              <span className="text-primary neon-text">{t("teams")}</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">{t("manageYourTeams") || t("createYourFirstTeam")}</p>
          </div>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!canCreateTeam} className="neon-glow-hover w-full sm:w-auto text-sm sm:text-base shrink-0 h-10 sm:h-11 px-6">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                {t("createTeam")}
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[90vw] max-w-md">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">{t("createTeam")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 sm:space-y-5">
                <div>
                  <Label className="text-sm font-medium">{t("teamName")}</Label>
                  <Input
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder={t("team_placeholder")}
                    className="mt-2 text-sm h-10"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">{t("teamDescription")}</Label>
                  <Textarea
                    value={newTeamDescription}
                    onChange={(e) => setNewTeamDescription(e.target.value)}
                    placeholder={t("whatIsThisTeamAbout")}
                    rows={3}
                    className="mt-2 text-sm"
                  />
                </div>
                <Button onClick={handleCreateTeam} disabled={creating || !newTeamName.trim()} className="w-full text-sm h-10">
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
          <Card className="glass-card p-12 text-center border-border/50 bg-card/40">
            <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/40" />
            <h3 className="text-xl sm:text-2xl font-semibold mb-2">{t("noTeamsFound")}</h3>
            <p className="text-muted-foreground mb-6">{t("createYourFirstTeam")}</p>
            <Button onClick={() => setCreateDialogOpen(true)} className="neon-glow-hover">
              <Plus className="w-4 h-4 mr-2" />
              {t("createTeam")}
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {teams.map((team, index) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card
                className="glass-card p-5 sm:p-6 md:p-7 transition-all group relative overflow-hidden h-full flex flex-col bg-gradient-to-br from-card/50 via-card/30 to-card/20 border-border/50 hover:border-border hover:shadow-lg hover:shadow-primary/5"
              >
                <div 
                  className="cursor-pointer flex-1 flex flex-col"
                  onClick={() => router.push(`/app/teams/${team.id}`)}
                >
                  <div className="flex items-start justify-between gap-3 mb-4 sm:mb-5">
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center flex-shrink-0 ring-2 ring-primary/20">
                        <Users className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-base sm:text-lg text-foreground truncate">{team.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs sm:text-sm text-muted-foreground font-medium uppercase tracking-wide opacity-70">{t(team.role)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-5 sm:mb-6 line-clamp-2 flex-1 leading-relaxed">
                    {team.description || t("noDescription")}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-border/30">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {team.member_count} {t("members")}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(team.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {(team.role === "owner" || team.role === "admin") && (
                  <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        openEditTeamDialog(team)
                      }}
                      className="h-9 w-9 bg-background/80 backdrop-blur-sm hover:bg-background border-border/50 text-foreground"
                      title={t("editTeam")}
                    >
                      <Edit className="w-4 h-4" />
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
            <DialogTitle className="text-lg sm:text-xl">{t("editTeam")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 sm:space-y-5">
            <div>
              <Label className="text-sm font-medium">{t("teamName")} *</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder={t("teamName")}
                className="mt-2 text-sm h-10"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">{t("teamDescription")}</Label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder={t("teamDescription")}
                rows={3}
                className="mt-2 text-sm"
              />
            </div>
            <Button 
              onClick={() => handleEditTeam(editingTeamId || "")} 
              disabled={updating || !editForm.name.trim()} 
              className="w-full text-sm h-10"
            >
              {updating ? t("updating") : t("saveChanges")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  )
}
