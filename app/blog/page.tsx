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
    id: "second-brain",
    title: "How to Build a Second Brain with Task Management Apps",
    category: "productivity",
    readTime: "12 min",
    image: "/blog-covers/second-brain.jpg",
  },
  {
    id: "habit-formation",
    title: "The Science Behind Habit Formation: Why 21 Days Is a Myth",
    category: "productivity",
    readTime: "10 min",
    image: "/blog-covers/habit-formation.jpg",
  },
  {
    id: "deep-work",
    title: "Deep Work vs Shallow Work: How to Protect Your Focus Time",
    category: "productivity",
    readTime: "8 min",
    image: "/blog-covers/deep-work.jpg",
  },
  {
    id: "morning-routine",
    title: "Morning Routines of Highly Productive People",
    category: "productivity",
    readTime: "9 min",
    image: "/blog-covers/morning-routine.jpg",
  },
  {
    id: "weekly-review",
    title: "How to Do a Weekly Review and Why It Changes Everything",
    category: "productivity",
    readTime: "7 min",
    image: "/blog-covers/weekly-review.jpg",
  },
  {
    id: "pomodoro-technique",
    title: "Pomodoro vs Time Blocking: Which Method Is Right for You?",
    category: "productivity",
    readTime: "8 min",
    image: "/blog-covers/pomodoro-blocking.jpg",
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {blogPosts.map((post) => (
            <Link key={post.id} href={`/blog/${post.id}`}>
              <Card className="glass-card overflow-hidden neon-glow-hover transition-all duration-300 cursor-pointer group h-full flex flex-col">
                <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/5 relative overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-xs text-primary font-semibold uppercase tracking-wide">
                      {t[post.category as keyof typeof t]}
                    </div>
                    <h3 className="text-lg font-semibold mt-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
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
