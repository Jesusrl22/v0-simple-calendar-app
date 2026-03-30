"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { useState, useEffect } from "react"

const translations = {
  en: {
    title: "Blogs",
    subtitle: "Discover tips, strategies, and insights to boost your productivity",
    backToHome: "Back to Home",
    readMore: "Read More",
    allPosts: "All Posts",
    productivity: "Productivity",
    productivityFocus: "Productivity & Focus",
    habitsScience: "Habits & Science",
    habitsRoutines: "Habits & Routines",
    productivitySystems: "Productivity Systems",
    timeManagement: "Time Management",
    readTime: "read",
  },
  es: {
    title: "Blogs",
    subtitle: "Descubre consejos, estrategias e ideas para impulsar tu productividad",
    backToHome: "Volver al Inicio",
    readMore: "Leer Más",
    allPosts: "Todos los Artículos",
    productivity: "Productividad",
    productivityFocus: "Productividad y Enfoque",
    habitsScience: "Hábitos y Ciencia",
    habitsRoutines: "Hábitos y Rutinas",
    productivitySystems: "Sistemas de Productividad",
    timeManagement: "Gestión del Tiempo",
    readTime: "de lectura",
  },
  fr: {
    title: "Blogs",
    subtitle: "Découvrez des conseils, stratégies et idées pour booster votre productivité",
    backToHome: "Retour à l'Accueil",
    readMore: "Lire Plus",
    allPosts: "Tous les Articles",
    productivity: "Productivité",
    productivityFocus: "Productivité et Concentration",
    habitsScience: "Habitudes et Science",
    habitsRoutines: "Habitudes et Routines",
    productivitySystems: "Systèmes de Productivité",
    timeManagement: "Gestion du Temps",
    readTime: "de lecture",
  },
  de: {
    title: "Blogs",
    subtitle: "Entdecken Sie Tipps, Strategien und Erkenntnisse zur Steigerung Ihrer Produktivität",
    backToHome: "Zurück zur Startseite",
    readMore: "Mehr Lesen",
    allPosts: "Alle Beiträge",
    productivity: "Produktivität",
    productivityFocus: "Produktivität und Fokus",
    habitsScience: "Gewohnheiten und Wissenschaft",
    habitsRoutines: "Gewohnheiten und Routinen",
    productivitySystems: "Produktivitätssysteme",
    timeManagement: "Zeitmanagement",
    readTime: "Lesezeit",
  },
  it: {
    title: "Blogs",
    subtitle: "Scopri consigli, strategie e intuizioni per aumentare la tua produttività",
    backToHome: "Torna alla Home",
    readMore: "Leggi di Più",
    allPosts: "Tutti gli Articoli",
    productivity: "Produttività",
    productivityFocus: "Produttività e Concentrazione",
    habitsScience: "Abitudini e Scienza",
    habitsRoutines: "Abitudini e Routine",
    productivitySystems: "Sistemi di Produttività",
    timeManagement: "Gestione del Tempo",
    readTime: "di lettura",
  },
}

const blogPosts = [
  {
    id: "deep-work",
    titles: {
      en: "Deep Work vs Shallow Work: Protect Your Focus Time",
      es: "Trabajo Profundo vs Superficial: Protege tu Tiempo de Concentración",
      fr: "Travail en Profondeur vs Travail Superficiel: Protégez votre Temps de Concentration",
      de: "Tiefe Arbeit vs Oberflächliche Arbeit: Schütze deine Fokuszeit",
      it: "Lavoro Profondo vs Lavoro Superficiale: Proteggi il tuo Tempo di Concentrazione",
    },
    category: "productivityFocus",
    readTime: "11 min",
    image: "/blog-covers/deep-work.jpg",
  },
  {
    id: "second-brain",
    titles: {
      en: "Build a Second Brain with Task Management",
      es: "Construye un Segundo Cerebro con Apps de Gestión de Tareas",
      fr: "Construisez un Deuxième Cerveau avec la Gestion des Tâches",
      de: "Baue ein Zweites Gehirn mit Task-Management auf",
      it: "Costruisci un Secondo Cervello con la Gestione delle Attività",
    },
    category: "productivity",
    readTime: "10 min",
    image: "/blog-covers/second-brain.jpg",
  },
  {
    id: "habit-science",
    titles: {
      en: "Why 21 Days is a Myth: The Real Science of Habits",
      es: "Por Qué los 21 Días es un Mito: La Ciencia Real de los Hábitos",
      fr: "Pourquoi 21 Jours est un Mythe: La Vraie Science des Habitudes",
      de: "Warum 21 Tage ein Mythos sind: Die echte Wissenschaft der Gewohnheiten",
      it: "Perché 21 Giorni è un Mito: La Vera Scienza delle Abitudini",
    },
    category: "habitsScience",
    readTime: "9 min",
    image: "/blog-covers/habit-formation.jpg",
  },
  {
    id: "morning-routines",
    titles: {
      en: "Morning Routines of Highly Productive People",
      es: "Rutinas Matutinas de Personas Altamente Productivas",
      fr: "Routines Matinales des Personnes Très Productives",
      de: "Morgenroutinen von Hochproduktiven Menschen",
      it: "Routine Mattutine di Persone Altamente Produttive",
    },
    category: "habitsRoutines",
    readTime: "10 min",
    image: "/blog-covers/morning-routines.jpg",
  },
  {
    id: "weekly-review",
    titles: {
      en: "The Weekly Review: The Missing Piece of GTD",
      es: "La Revisión Semanal: La Pieza Faltante del GTD",
      fr: "L'Examen Hebdomadaire: La Pièce Manquante de GTD",
      de: "Die Wochenrückschau: Das fehlende Stück von GTD",
      it: "La Revisione Settimanale: Il Pezzo Mancante di GTD",
    },
    category: "productivitySystems",
    readTime: "9 min",
    image: "/blog-covers/weekly-review.jpg",
  },
  {
    id: "pomodoro-time-blocking",
    titles: {
      en: "Pomodoro vs Time Blocking: Which Works Better?",
      es: "Pomodoro vs Bloqueo de Tiempo: ¿Cuál Funciona Mejor?",
      fr: "Pomodoro vs Time Blocking: Lequel Fonctionne Mieux?",
      de: "Pomodoro vs Time Blocking: Was funktioniert besser?",
      it: "Pomodoro vs Time Blocking: Quale Funziona Meglio?",
    },
    category: "timeManagement",
    readTime: "10 min",
    image: "/blog-covers/pomodoro-time-blocking.jpg",
  },
]

type Language = "en" | "es" | "fr" | "de" | "it"

export default function BlogPage() {
  const [lang, setLang] = useState<Language>("en")
  const [mounted, setMounted] = useState(false)
  const t = translations[lang]

  useEffect(() => {
    setMounted(true)
    const savedLang = (localStorage.getItem("language") as Language) || "en"
    if (translations[savedLang]) {
      setLang(savedLang)
    }
  }, [])

  if (!mounted) {
    return null // Prevent hydration mismatch
  }

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
                    alt={post.titles[lang]}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-xs text-primary font-semibold uppercase tracking-wide">
                      {t[post.category as keyof typeof t]}
                    </div>
                    <h3 className="text-lg font-semibold mt-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {post.titles[lang]}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-muted-foreground">{post.readTime} {t.readTime}</span>
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
