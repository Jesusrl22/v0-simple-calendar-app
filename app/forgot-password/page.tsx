"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Globe, ArrowLeft } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const translations = {
  en: {
    title: "Forgot Password",
    subtitle: "Enter your email to reset your password",
    email: "Email",
    sendReset: "Send Reset Link",
    sending: "Sending...",
    backToLogin: "Back to Login",
    success: "Check your email for reset instructions",
  },
  es: {
    title: "Olvidé mi Contraseña",
    subtitle: "Ingresa tu correo para restablecer tu contraseña",
    email: "Correo",
    sendReset: "Enviar Enlace",
    sending: "Enviando...",
    backToLogin: "Volver al Inicio de Sesión",
    success: "Revisa tu correo para las instrucciones",
  },
  fr: {
    title: "Mot de Passe Oublié",
    subtitle: "Entrez votre email pour réinitialiser votre mot de passe",
    email: "Email",
    sendReset: "Envoyer le Lien",
    sending: "Envoi...",
    backToLogin: "Retour à la Connexion",
    success: "Vérifiez votre email pour les instructions",
  },
  de: {
    title: "Passwort Vergessen",
    subtitle: "Geben Sie Ihre E-Mail ein, um Ihr Passwort zurückzusetzen",
    email: "E-Mail",
    sendReset: "Link Senden",
    sending: "Senden...",
    backToLogin: "Zurück zur Anmeldung",
    success: "Überprüfen Sie Ihre E-Mail für Anweisungen",
  },
  it: {
    title: "Password Dimenticata",
    subtitle: "Inserisci la tua email per reimpostare la password",
    email: "Email",
    sendReset: "Invia Link",
    sending: "Invio...",
    backToLogin: "Torna al Login",
    success: "Controlla la tua email per le istruzioni",
  },
}

export default function ForgotPasswordPage() {
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [language, setLanguage] = useState<keyof typeof translations>("en")

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
      const email = formData.get("email") as string

      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset email")
      }

      setSuccess(t.success)
    } catch (err: any) {
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
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.backToLogin}
          </Link>

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

            {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{error}</div>}
            {success && <div className="text-sm text-green-600 bg-green-600/10 p-3 rounded-lg">{success}</div>}

            <Button type="submit" className="w-full neon-glow-hover" disabled={loading}>
              {loading ? t.sending : t.sendReset}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
