"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, CheckCircle, XCircle } from "@/components/icons"
import { useTranslation } from "@/hooks/useTranslation"

export default function TeamInvitationPage() {
  const { t } = useTranslation()
  const params = useParams()
  const router = useRouter()
  const token = params.token as string
  const [loading, setLoading] = useState(true)
  const [invitation, setInvitation] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [accepting, setAccepting] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    checkAuthAndFetchInvitation()
  }, [token])

  const checkAuthAndFetchInvitation = async () => {
    try {
      // First get invitation details
      const inviteResponse = await fetch(`/api/teams/invitations/${token}`)
      if (inviteResponse.ok) {
        const data = await inviteResponse.json()
        setInvitation(data.invitation)
        console.log("[v0] Invitation data loaded:", data.invitation)

        // Try to auto-accept if already authenticated
        setTimeout(() => {
          acceptInvitationDirectly(token)
        }, 300)
      } else {
        const errorData = await inviteResponse.json()
        setError(errorData.error || "Invalid invitation")
      }
    } catch (err) {
      console.error("[v0] Error fetching invitation:", err)
      setError("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const acceptInvitationDirectly = async (inviteToken: string) => {
    try {
      console.log("[v0] Attempting to accept invitation with token:", inviteToken)

      const response = await fetch(`/api/teams/invitations/${inviteToken}`, {
        method: "POST",
      })

      console.log("[v0] Accept response status:", response.status)
      const data = await response.json()
      console.log("[v0] Accept response:", data)

      if (response.status === 401) {
        // Not authenticated, show button
        console.log("[v0] User not authenticated, showing signup/login")
        setIsAuthenticated(false)
      } else if (response.ok) {
        console.log("[v0] Successfully accepted, redirecting to teams")
        router.push(`/app/teams`)
      } else {
        console.log("[v0] Accept failed:", data.error)
        setError(data.error || "Failed to accept invitation")
      }
    } catch (err) {
      console.error("[v0] Error accepting invitation:", err)
    }
  }

  const handleAcceptInvitation = async () => {
    if (!isAuthenticated) {
      // Redirect to signup with invitation token
      router.push(`/signup?invite=${token}`)
      return
    }

    setAccepting(true)
    try {
      console.log("[v0] Starting to accept invitation for token:", token)

      const response = await fetch(`/api/teams/invitations/${token}`, {
        method: "POST",
      })

      console.log("[v0] Invitation response status:", response.status)

      const data = await response.json()
      console.log("[v0] Invitation response data:", data)

      if (response.ok) {
        console.log("[v0] Successfully accepted invitation, redirecting to teams")
        router.push(`/app/teams`)
      } else {
        console.log("[v0] Invitation failed with error:", data.error)
        setError(data.error || "Failed to accept invitation")
      }
    } catch (err) {
      console.error("[v0] Error accepting invitation:", err)
      setError("An error occurred")
    } finally {
      setAccepting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="glass-card p-8 max-w-md w-full text-center">
          <p className="text-muted-foreground">{t("loading")}</p>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="glass-card p-8 max-w-md w-full text-center">
          <XCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
          <h1 className="text-2xl font-bold mb-2">{t("invitationError")}</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => router.push("/app/teams")}>{t("backToTeams")}</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="glass-card p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-primary neon-text">{t("teamInvitation")}</span>
          </h1>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{t("teamName")}</p>
            <p className="text-lg font-semibold">{invitation?.teams?.name}</p>
          </div>

          {invitation?.teams?.description && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">{t("description")}</p>
              <p className="text-sm">{invitation.teams.description}</p>
            </div>
          )}

          <div>
            <p className="text-sm text-muted-foreground mb-1">{t("invitedBy")}</p>
            <p className="text-sm">{invitation?.users?.name || invitation?.users?.email}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">{t("yourRole")}</p>
            <p className="text-sm font-semibold capitalize">{t(invitation?.role || "member")}</p>
          </div>
        </div>

        <div className="space-y-3">
          <Button onClick={handleAcceptInvitation} disabled={accepting} className="w-full">
            <CheckCircle className="w-4 h-4 mr-2" />
            {isAuthenticated ? t("acceptAndJoin") : t("signUpAndJoin")}
          </Button>

          {!isAuthenticated && (
            <Button variant="outline" onClick={() => router.push(`/login?invite=${token}`)} className="w-full">
              {t("alreadyHaveAccount")}
            </Button>
          )}
        </div>

        <p className="text-xs text-center text-muted-foreground mt-6">{t("invitationExpiresIn7Days")}</p>
      </Card>
    </div>
  )
}
