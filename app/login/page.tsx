"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Globe } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Eye, EyeOff } from "lucide-react"

const translations = {
  en: {
    welcome: "Welcome Back",
    subtitle: "Sign in to your account to continue",
    email: "Email",
    password: "Password",
    signIn: "Sign In",
    signingIn: "Signing in...",
    noAccount: "Don't have an account?",
    signUp: "Sign up",
    backHome: "← Back to home",
    alreadyLoggedIn: "Already Logged In",
    activeSession: "You have an active session",
    continueApp: "Continue to App",
    logoutDifferent: "Logout and Sign In with Different Account",
    forgotPassword: "Forgot password?",
    emailNotVerified: "Email not verified",
    emailNotVerifiedMsg: "Please verify your email first. Check your inbox for the verification link.",
    resendVerification: "Resend Verification Email",
    resendingEmail: "Sending...",
  },
  es: {
    welcome: "Bienvenido de Nuevo",
    subtitle: "Inicia sesión para continuar",
    email: "Correo",
    password: "Contraseña",
    signIn: "Iniciar Sesión",
    signingIn: "Iniciando sesión...",
    noAccount: "¿No tienes cuenta?",
    signUp: "Regístrate",
    backHome: "← Volver al inicio",
    alreadyLoggedIn: "Ya Has Iniciado Sesión",
    activeSession: "Tienes una sesión activa",
    continueApp: "Continuar a la App",
    logoutDifferent: "Cerrar Sesión para Iniciar con Otra Cuenta",
    forgotPassword: "¿Olvidaste tu contraseña?",
    emailNotVerified: "Email no verificado",
    emailNotVerifiedMsg: "Por favor verifica tu email primero. Revisa tu bandeja de entrada para el enlace de verificación.",
    resendVerification: "Reenviar Email de Verificación",
    resendingEmail: "Enviando...",
  },
  fr: {
    welcome: "Bienvenue",
    subtitle: "Connectez-vous pour continuer",
    email: "Email",
    password: "Mot de passe",
    signIn: "Se Connecter",
    signingIn: "Connexion...",
    noAccount: "Pas de compte?",
    signUp: "S'inscrire",
    backHome: "← Retour à l'accueil",
    alreadyLoggedIn: "Déjà Connecté",
    activeSession: "Vous avez une session active",
    continueApp: "Continuer vers l'App",
    logoutDifferent: "Déconnexion pour Changer de Compte",
    forgotPassword: "Mot de passe oublié?",
    emailNotVerified: "Email non vérifié",
    emailNotVerifiedMsg: "Veuillez d'abord vérifier votre email. Consultez votre boîte de réception pour le lien de vérification.",
    resendVerification: "Renvoyer l'Email de Vérification",
    resendingEmail: "Envoi...",
  },
  de: {
    welcome: "Willkommen Zurück",
    subtitle: "Melden Sie sich an, um fortzufahren",
    email: "E-Mail",
    password: "Passwort",
    signIn: "Anmelden",
    signingIn: "Anmeldung...",
    noAccount: "Kein Konto?",
    signUp: "Registrieren",
    backHome: "← Zurück zur Startseite",
    alreadyLoggedIn: "Bereits Angemeldet",
    activeSession: "Sie haben eine aktive Sitzung",
    continueApp: "Zur App",
    logoutDifferent: "Abmelden und mit Anderem Konto Anmelden",
    forgotPassword: "Passwort vergessen?",
    emailNotVerified: "E-Mail nicht bestätigt",
    emailNotVerifiedMsg: "Bitte bestätigen Sie zunächst Ihre E-Mail. Überprüfen Sie Ihren Posteingang auf den Bestätigungslink.",
    resendVerification: "Bestätigungsemail erneut senden",
    resendingEmail: "Wird gesendet...",
  },
  it: {
    welcome: "Bentornato",
    subtitle: "Accedi per continuare",
    email: "Email",
    password: "Password",
    signIn: "Accedi",
    signingIn: "Accesso...",
    noAccount: "Non hai un account?",
    signUp: "Registrati",
    backHome: "← Torna alla home",
    alreadyLoggedIn: "Già Connesso",
    activeSession: "Hai una sessione attiva",
    continueApp: "Continua all'App",
    logoutDifferent: "Esci per Accedere con un Altro Account",
    forgotPassword: "Password dimenticata?",
    emailNotVerified: "Email non verificata",
    emailNotVerifiedMsg: "Verifica prima la tua email. Controlla la tua casella di posta per il link di verifica.",
    resendVerification: "Rinvia Email di Verifica",
    resendingEmail: "Invio...",
  },
}

export default function LoginPage() {
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [hasSession, setHasSession] = useState(false)
  const [language, setLanguage] = useState<keyof typeof translations>("en")
  const [showPassword, setShowPassword] = useState(false)
  const [emailNotVerified, setEmailNotVerified] = useState(false)
  const [pendingEmail, setPendingEmail] = useState("")
  const [resendingEmail, setResendingEmail] = useState(false)
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

    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/check-session")
        if (response.ok) {
          const data = await response.json()
          setHasSession(data.hasSession && data.user)
        } else {
          setHasSession(false)
        }
      } catch (err) {
        setHasSession(false)
      }
    }
    checkSession()
  }, [])

  const handleLanguageChange = (lang: keyof typeof translations) => {
    setLanguage(lang)
    localStorage.setItem("language", lang)
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setHasSession(false)
      window.location.reload()
    } catch (err) {
      console.error("Logout failed:", err)
    }
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setEmailNotVerified(false)
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const email = formData.get("email") as string
      const password = formData.get("password") as string

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Check if it's an email verification error
        if (data.error === "email_not_verified") {
          setEmailNotVerified(true)
          setPendingEmail(email)
          setError(data.message || "Email not verified")
        } else {
          throw new Error(data.message || data.error || "Login failed")
        }
      } else {
        window.location.href = "/app"
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials")
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (!pendingEmail) return
    setResendingEmail(true)
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail }),
      })

      if (response.ok) {
        alert(translations[language].resendVerification + " sent!")
      } else {
        const data = await response.json()
        throw new Error(data.error || "Failed to resend email")
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setResendingEmail(false)
    }
  }

  const t = translations[language]

  if (hasSession) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -z-10" />

        <div className="w-full max-w-md">
          <Card className="glass-card p-8 neon-glow">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-4">
                <span className="text-3xl font-bold text-primary">FT</span>
              </div>
              <h1 className="text-3xl font-bold mb-2">{t.alreadyLoggedIn}</h1>
              <p className="text-muted-foreground">{t.activeSession}</p>
            </div>

            <div className="space-y-4">
              <Button onClick={() => (window.location.href = "/app")} className="w-full neon-glow-hover">
                {t.continueApp}
              </Button>

              <Button onClick={handleLogout} variant="outline" className="w-full bg-transparent">
                {t.logoutDifferent}
              </Button>
            </div>

            <div className="mt-6 text-center">
              <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {t.backHome}
              </Link>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -z-10" />

      <div className="w-full max-w-md">
        <Card className="glass-card p-8 neon-glow">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-4">
              <span className="text-3xl font-bold text-primary">FT</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">{t.welcome}</h1>
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

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t.email}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="bg-secondary/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t.password}</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
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
              <div className="text-right">
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  {t.forgotPassword}
                </Link>
              </div>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                {error}
              </div>
            )}

            {emailNotVerified && (
              <div className="text-sm bg-yellow-500/20 border border-yellow-500/50 p-3 rounded-lg space-y-3">
                <p className="text-yellow-600 dark:text-yellow-400 font-medium">{t.emailNotVerified}</p>
                <p className="text-yellow-600 dark:text-yellow-400 text-xs">{t.emailNotVerifiedMsg}</p>
                <Button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendingEmail}
                  className="w-full text-xs"
                  variant="outline"
                >
                  {resendingEmail ? t.resendingEmail : t.resendVerification}
                </Button>
              </div>
            )}

            <Button type="submit" className="w-full neon-glow-hover" disabled={loading}>
              {loading ? t.signingIn : t.signIn}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">{t.noAccount} </span>
            <Link href="/signup" className="text-primary hover:underline">
              {t.signUp}
            </Link>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              {t.backHome}
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
