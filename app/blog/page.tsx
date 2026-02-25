"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { useState, useEffect } from "react"

const translations = {
  en: {
    title: "Blog & Resources",
    subtitle: "Discover tips, strategies, and insights to boost your productivity",
    backToHome: "Back to Home",
    readMore: "Read More",
    allPosts: "All Posts",
    productivity: "Productivity",
    studyTips: "Study Tips",
    aiAutomation: "AI & Automation",
  },
  es: {
    title: "Blog y Recursos",
    subtitle: "Descubre consejos, estrategias e ideas para impulsar tu productividad",
    backToHome: "Volver al Inicio",
    readMore: "Leer Más",
    allPosts: "Todos los Artículos",
    productivity: "Productividad",
    studyTips: "Consejos de Estudio",
    aiAutomation: "IA y Automatización",
  },
  fr: {
    title: "Blog et Ressources",
    subtitle: "Découvrez des conseils, stratégies et idées pour booster votre productivité",
    backToHome: "Retour à l'Accueil",
    readMore: "Lire Plus",
    allPosts: "Tous les Articles",
    productivity: "Productivité",
    studyTips: "Conseils d'Étude",
    aiAutomation: "IA et Automatisation",
  },
  de: {
    title: "Blog & Ressourcen",
    subtitle: "Entdecken Sie Tipps, Strategien und Erkenntnisse zur Steigerung Ihrer Produktivität",
    backToHome: "Zurück zur Startseite",
    readMore: "Mehr Lesen",
    allPosts: "Alle Beiträge",
    productivity: "Produktivität",
    studyTips: "Lerntipps",
    aiAutomation: "KI & Automatisierung",
  },
  it: {
    title: "Blog e Risorse",
    subtitle: "Scopri consigli, strategie e intuizioni per aumentare la tua produttività",
    backToHome: "Torna alla Home",
    readMore: "Leggi di Più",
    allPosts: "Tutti gli Articoli",
    productivity: "Produttività",
    studyTips: "Consigli di Studio",
    aiAutomation: "IA e Automazione",
  },
}

const blogPosts = [
  {
    id: "pomodoro-technique",
    emoji: "🍅",
    gradient: "from-primary/30 to-primary/10",
    category: "productivity",
    readTime: "5 min",
  },
  {
    id: "study-methods",
    emoji: "📚",
    gradient: "from-blue-500/30 to-blue-500/10",
    category: "studyTips",
    readTime: "7 min",
  },
  {
    id: "ai-productivity",
    emoji: "🤖",
    gradient: "from-purple-500/30 to-purple-500/10",
    category: "aiAutomation",
    readTime: "6 min",
  },
]

type Language = "en" | "es" | "fr" | "de" | "it"

export default function BlogPage() {
  const [lang, setLang] = useState<Language>("en")
  const t = translations[lang]

  useEffect(() => {
    const savedLang = (localStorage.getItem("language") as Language) || "en"
    if (translations[savedLang]) {
      setLang(savedLang)
    }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              ← {t.backToHome}
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h1 className="text-5xl font-bold">{t.title}</h1>
          <p className="text-xl text-muted-foreground">{t.subtitle}</p>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {blogPosts.map((post) => (
            <Link key={post.id} href={`/blog/${post.id}`}>
              <Card className="glass-card overflow-hidden neon-glow-hover transition-all duration-300 cursor-pointer group h-full">
                <div className={`h-48 bg-gradient-to-br ${post.gradient} relative overflow-hidden`}>
                  <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-40">
                    {post.emoji}
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <div className="text-xs text-primary font-semibold uppercase tracking-wide">
                    {t[post.category as keyof typeof t]}
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-muted-foreground">{post.readTime} read</span>
                    <Button variant="ghost" size="sm" className="group-hover:translate-x-1 transition-transform">
                      {t.readMore} →
                    </Button>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
