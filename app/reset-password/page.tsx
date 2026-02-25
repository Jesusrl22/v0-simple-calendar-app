"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Globe, Eye, EyeOff } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const translations = {
  en: {
    title: "Reset Password",
    subtitle: "Enter your new password",
    newPassword: "New Password",
    confirmPassword: "Confirm Password",
    resetPassword: "Reset Password",
    resetting: "Resetting...",
    backToLogin: "Back to Login",
    passwordMismatch: "Passwords do not match",
    success: "Password reset successfully! Redirecting to login...",
  },
  es: {
    title: "Restablecer Contraseña",
    subtitle: "Ingresa tu nueva contraseña",
    newPassword: "Nueva Contraseña",
    confirmPassword: "Confirmar Contraseña",
    resetPassword: "Restablecer Contraseña",
    resetting: "Restableciendo...",
    backToLogin: "Volver al Inicio de Sesión",
    passwordMismatch: "Las contraseñas no coinciden",
    success: "¡Contraseña restablecida! Redirigiendo al inicio de sesión...",
  },
  fr: {
    title: "Réinitialiser le Mot de Passe",
    subtitle: "Entrez votre nouveau mot de passe",
    newPassword: "Nouveau Mot de Passe",
    confirmPassword: "Confirmer le Mot de Passe",
    resetPassword: "Réinitialiser le Mot de Passe",
    resetting: "Réinitialisation...",
    backToLogin: "Retour à la Connexion",
    passwordMismatch: "Les mots de passe ne correspondent pas",
    success: "Mot de passe réinitialisé! Redirection vers la connexion...",
  },
  de: {
    title: "Passwort Zurücksetzen",
    subtitle: "Geben Sie Ihr neues Passwort ein",
    newPassword: "Neues Passwort",
    confirmPassword: "Passwort Bestätigen",
    resetPassword: "Passwort Zurücksetzen",
    resetting: "Zurücksetzen...",
    backToLogin: "Zurück zur Anmeldung",
    passwordMismatch: "Passwörter stimmen nicht überein",
    success: "Passwort zurückgesetzt! Weiterleitung zur Anmeldung...",
  },
  it: {
    title: "Reimposta Password",
    subtitle: "Inserisci la tua nuova password",
    newPassword: "Nuova Password",
    confirmPassword: "Conferma Password",
    resetPassword: "Reimposta Password",
    resetting: "Reimpostazione...",
    backToLogin: "Torna al Login",
    passwordMismatch: "Le password non corrispondono",
    success: "Password reimpostata! Reindirizzamento al login...",
  },
}

function ResetPasswordContent() {
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [language, setLanguage] = useState<keyof typeof translations>("en")
  const [hasValidToken, setHasValidToken] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const savedLang = localStorage.getItem("language") as keyof typeof translations
    const browserLang = navigator.language.split("-")[0] as keyof typeof translations
    const lang = savedLang || (translations[browserLang] ? browserLang : "en")
    setLanguage(lang)

    const root = document.documentElement
    root.style.setProperty("--primary", "84 100% 65%")
    root.style.setProperty("--secondary", "84 50% 25%")
    root.style.setProperty("--background", "0 0% 15%")
    root.style.setProperty("--foreground", "0 0% 98%")
    root.style.setProperty("--card", "0 0% 20%")
    root.style.setProperty("--card-foreground", "0 0% 98%")

    // Check if we have a valid recovery token in the URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get("access_token")
    const tokenType = hashParams.get("type")

    if (accessToken && tokenType === "recovery") {
      setHasValidToken(true)
      console.log("[v0] Valid recovery token found in URL")
    } else {
      setError("Invalid or expired reset link")
      console.log("[v0] No valid recovery token found")
    }
  }, [])

  const handleLanguageChange = (lang: keyof typeof translations) => {
    setLanguage(lang)
    localStorage.setItem("language", lang)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const password = formData.get("password") as string
      const confirmPassword = formData.get("confirmPassword") as string

      if (password !== confirmPassword) {
        setError(t.passwordMismatch)
        setLoading(false)
        return
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters")
        setLoading(false)
        return
      }

      // Get the session token from URL hash
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get("access_token")
      const tokenType = hashParams.get("type")

      if (!accessToken || tokenType !== "recovery") {
        setError("Invalid or expired reset link")
        setLoading(false)
        return
      }

      // Import Supabase client
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()

      console.log("[v0] Updating password with access token")

      // Update password using the access token from Supabase
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      })

      if (updateError) {
        console.error("[v0] Password update error:", updateError)
        setError(updateError.message || "Failed to update password")
        setLoading(false)
        return
      }

      setSuccess(t.success)
      console.log("[v0] Password updated successfully")
      
      // Wait before redirecting
      setTimeout(() => {
        // Clear the hash to remove tokens from URL
        window.history.replaceState({}, document.title, window.location.pathname)
        // Redirect to login
        router.push("/login")
      }, 2000)
    } catch (err: any) {
      console.error("[v0] Reset password error:", err)
      setError(err.message || "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const t = translations[language]

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -z-10" />

      <div className="w-full max-w-md">
        <Card className="glass-card p-8 neon-glow">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-4">
              <span className="text-3xl font-bold text-primary">FT</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
            <p className="text-muted-foreground">{t.subtitle}</p>
          </div>

          <div className="mb-6 flex justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="bg-secondary/50 gap-2">
                  <Globe className="h-4 w-4" />
                  {language === "en"
                    ? "English"
                    : language === "es"
                      ? "Español"
                      : language === "fr"
                        ? "Français"
                        : language === "de"
                          ? "Deutsch"
                          : "Italiano"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center">
                <DropdownMenuItem onClick={() => handleLanguageChange("en")}>English</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange("es")}>Español</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange("fr")}>Français</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange("de")}>Deutsch</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange("it")}>Italiano</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">{t.newPassword}</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="bg-secondary/50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t.confirmPassword}</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="bg-secondary/50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{error}</div>}
            {success && <div className="text-sm text-green-600 bg-green-600/10 p-3 rounded-lg">{success}</div>}

            <Button type="submit" className="w-full neon-glow-hover" disabled={loading || !hasValidToken}>
              {loading ? t.resetting : t.resetPassword}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              {t.backToLogin}
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}
