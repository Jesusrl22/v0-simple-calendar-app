"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Globe } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Eye, EyeOff } from "lucide-react"

const translations = {
  en: {
    createAccount: "Create Account",
    subtitle: "Sign up to get started with Future Task",
    name: "Name",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    signUp: "Sign Up",
    creatingAccount: "Creating account...",
    haveAccount: "Already have an account?",
    signIn: "Sign in",
    backHome: "← Back to home",
    passwordMismatch: "Passwords do not match",
    alreadyLoggedIn: "Already Logged In",
    activeSession: "You already have an active session",
    continueApp: "Continue to App",
    logoutCreate: "Logout to Create New Account",
  },
  es: {
    createAccount: "Crear Cuenta",
    subtitle: "Regístrate para comenzar con Future Task",
    name: "Nombre",
    email: "Correo",
    password: "Contraseña",
    confirmPassword: "Confirmar Contraseña",
    signUp: "Registrarse",
    creatingAccount: "Creando cuenta...",
    haveAccount: "¿Ya tienes cuenta?",
    signIn: "Inicia sesión",
    backHome: "← Volver al inicio",
    passwordMismatch: "Las contraseñas no coinciden",
    alreadyLoggedIn: "Ya Has Iniciado Sesión",
    activeSession: "Ya tienes una sesión activa",
    continueApp: "Continuar a la App",
    logoutCreate: "Cerrar Sesión para Crear Nueva Cuenta",
  },
  fr: {
    createAccount: "Créer un Compte",
    subtitle: "Inscrivez-vous pour commencer avec Future Task",
    name: "Nom",
    email: "Email",
    password: "Mot de passe",
    confirmPassword: "Confirmer le Mot de Passe",
    signUp: "S'inscrire",
    creatingAccount: "Création du compte...",
    haveAccount: "Vous avez déjà un compte?",
    signIn: "Se connecter",
    backHome: "← Retour à l'accueil",
    passwordMismatch: "Les mots de passe ne correspondent pas",
    alreadyLoggedIn: "Déjà Connecté",
    activeSession: "Vous avez déjà une session active",
    continueApp: "Continuer vers l'App",
    logoutCreate: "Déconnexion pour Créer un Nouveau Compte",
  },
  de: {
    createAccount: "Konto Erstellen",
    subtitle: "Registrieren Sie sich, um mit Future Task zu beginnen",
    name: "Name",
    email: "E-Mail",
    password: "Passwort",
    confirmPassword: "Passwort Bestätigen",
    signUp: "Registrieren",
    creatingAccount: "Konto wird erstellt...",
    haveAccount: "Haben Sie bereits ein Konto?",
    signIn: "Anmelden",
    backHome: "← Zurück zur Startseite",
    passwordMismatch: "Passwörter stimmen nicht überein",
    alreadyLoggedIn: "Bereits Angemeldet",
    activeSession: "Sie haben bereits eine aktive Sitzung",
    continueApp: "Zur App",
    logoutCreate: "Abmelden zum Erstellen eines Neuen Kontos",
  },
  it: {
    createAccount: "Crea Account",
    subtitle: "Registrati per iniziare con Future Task",
    name: "Nome",
    email: "Email",
    password: "Password",
    confirmPassword: "Conferma Password",
    signUp: "Registrati",
    creatingAccount: "Creazione account...",
    haveAccount: "Hai già un account?",
    signIn: "Accedi",
    backHome: "← Torna alla home",
    passwordMismatch: "Le password non corrispondono",
    alreadyLoggedIn: "Già Connesso",
    activeSession: "Hai già una sessione attiva",
    continueApp: "Continua all'App",
    logoutCreate: "Esci per Creare un Nuovo Account",
  },
}

export default function SignupPage() {
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [hasSession, setHasSession] = useState(false)
  const [language, setLanguage] = useState<keyof typeof translations>("en")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const inviteToken = searchParams.get("invite")

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

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (password !== confirmPassword) {
      setError(translations[language].passwordMismatch)
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Signup failed")
      }

      if (data.requiresConfirmation) {
        setSuccess("Account created! Please check your email to confirm your account.")
      } else {
        setSuccess("Account created successfully! Redirecting...")
        if (inviteToken) {
          setTimeout(() => {
            router.push(`/invite/${inviteToken}`)
          }, 1500)
        } else {
          setTimeout(() => {
            router.push("/app")
          }, 1500)
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred")
    } finally {
      setLoading(false)
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
                {t.logoutCreate}
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
            <h1 className="text-3xl font-bold mb-2">{t.createAccount}</h1>
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

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t.name}</Label>
              <Input id="name" name="name" type="text" placeholder="Your name" required className="bg-secondary/50" />
            </div>

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

            <Button type="submit" className="w-full neon-glow-hover" disabled={loading}>
              {loading ? t.creatingAccount : t.signUp}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">{t.haveAccount} </span>
            <Link href="/login" className="text-primary hover:underline">
              {t.signIn}
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
