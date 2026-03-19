"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { useState, useEffect } from "react"

const translations = {
  en: {
    title: "About Future Task",
    subtitle: "Empowering productivity through intelligent task management",
    mission: "Our Mission",
    missionDesc: "We believe that everyone deserves a tool that makes them feel productive and in control. Future Task was built to simplify your life, not complicate it.",
    vision: "Our Vision",
    visionDesc: "A world where procrastination is optional and productivity is effortless. We're creating tools that understand how you work.",
    values: "Our Values",
    value1Title: "Simplicity",
    value1Desc: "Complex features don't make you productive. Clean design and intuitive workflows do.",
    value2Title: "Innovation",
    value2Desc: "We continuously innovate with AI and modern techniques to stay ahead.",
    value3Title: "Community",
    value3Desc: "Our community drives us. Your feedback shapes our product.",
    backToHome: "Back to Home",
  },
  es: {
    title: "Acerca de Future Task",
    subtitle: "Potenciando la productividad a través de la gestión inteligente de tareas",
    mission: "Nuestra Misión",
    missionDesc: "Creemos que todos merecen una herramienta que los haga sentir productivos y en control. Future Task fue construido para simplificar tu vida, no complicarla.",
    vision: "Nuestra Visión",
    visionDesc: "Un mundo donde la procrastinación es opcional y la productividad es sin esfuerzo. Estamos creando herramientas que entienden cómo trabajas.",
    values: "Nuestros Valores",
    value1Title: "Simplicidad",
    value1Desc: "Las características complejas no te hacen productivo. El diseño limpio y los flujos intuitivos sí.",
    value2Title: "Innovación",
    value2Desc: "Continuamos innovando con IA y técnicas modernas para estar por delante.",
    value3Title: "Comunidad",
    value3Desc: "Nuestra comunidad nos impulsa. Tu retroalimentación forma nuestro producto.",
    backToHome: "Volver al Inicio",
  },
  fr: {
    title: "À Propos de Future Task",
    subtitle: "Autonomiser la productivité grâce à la gestion intelligente des tâches",
    mission: "Notre Mission",
    missionDesc: "Nous croyons que tout le monde mérite un outil qui les fait se sentir productifs et en contrôle. Future Task a été construit pour simplifier votre vie, pas la compliquer.",
    vision: "Notre Vision",
    visionDesc: "Un monde où la procrastination est optionnelle et la productivité est sans effort. Nous créons des outils qui comprennent comment vous travaillez.",
    values: "Nos Valeurs",
    value1Title: "Simplicité",
    value1Desc: "Les fonctionnalités complexes ne vous rendent pas productif. Un design propre et des flux intuitifs le font.",
    value2Title: "Innovation",
    value2Desc: "Nous innovons continuellement avec l'IA et les techniques modernes pour rester en avant.",
    value3Title: "Communauté",
    value3Desc: "Notre communauté nous pousse. Votre retour façonne notre produit.",
    backToHome: "Retour à l'Accueil",
  },
  de: {
    title: "Über Future Task",
    subtitle: "Produktivität durch intelligentes Aufgabenmanagement stärken",
    mission: "Unsere Mission",
    missionDesc: "Wir glauben, dass jeder ein Tool verdient, das ihn produktiv und in Kontrolle fühlen lässt. Future Task wurde gebaut, um Ihr Leben zu vereinfachen, nicht zu komplizieren.",
    vision: "Unsere Vision",
    visionDesc: "Eine Welt, in der Prokrastination optional ist und Produktivität mühelos. Wir erstellen Tools, die verstehen, wie Sie arbeiten.",
    values: "Unsere Werte",
    value1Title: "Einfachheit",
    value1Desc: "Komplexe Funktionen machen Sie nicht produktiv. Sauberes Design und intuitive Arbeitsabläufe tun es.",
    value2Title: "Innovation",
    value2Desc: "Wir innovieren kontinuierlich mit KI und modernen Techniken, um führend zu bleiben.",
    value3Title: "Gemeinschaft",
    value3Desc: "Unsere Gemeinschaft treibt uns an. Dein Feedback prägt unser Produkt.",
    backToHome: "Zurück zur Startseite",
  },
  it: {
    title: "Chi Siamo Future Task",
    subtitle: "Potenziare la produttività attraverso la gestione intelligente delle attività",
    mission: "La Nostra Missione",
    missionDesc: "Crediamo che chiunque meriti uno strumento che lo faccia sentire produttivo e in controllo. Future Task è stato costruito per semplificare la tua vita, non complicarla.",
    vision: "La Nostra Visione",
    visionDesc: "Un mondo in cui la procrastinazione è facoltativa e la produttività è senza sforzo. Stiamo creando strumenti che capiscono come lavori.",
    values: "I Nostri Valori",
    value1Title: "Semplicità",
    value1Desc: "Le funzionalità complesse non ti rendono produttivo. Un design pulito e i flussi intuitivi lo fanno.",
    value2Title: "Innovazione",
    value2Desc: "Continuiamo a innovare con l'IA e le tecniche moderne per stare in anticipo.",
    value3Title: "Comunità",
    value3Desc: "La nostra comunità ci spinge. Il tuo feedback forma il nostro prodotto.",
    backToHome: "Torna alla Home",
  },
}

type Language = "en" | "es" | "fr" | "de" | "it"

export default function AboutPage() {
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
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h1 className="text-5xl font-bold">{t.title}</h1>
          <p className="text-xl text-muted-foreground">{t.subtitle}</p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="container mx-auto px-4 py-16 grid md:grid-cols-2 gap-8 max-w-5xl">
        <Card className="glass-card p-8 space-y-4">
          <h2 className="text-2xl font-bold">{t.mission}</h2>
          <p className="text-muted-foreground leading-relaxed">{t.missionDesc}</p>
        </Card>
        <Card className="glass-card p-8 space-y-4">
          <h2 className="text-2xl font-bold">{t.vision}</h2>
          <p className="text-muted-foreground leading-relaxed">{t.visionDesc}</p>
        </Card>
      </section>

      {/* Values */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">{t.values}</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="glass-card p-8 space-y-4">
            <h3 className="text-xl font-bold text-primary">{t.value1Title}</h3>
            <p className="text-muted-foreground leading-relaxed">{t.value1Desc}</p>
          </Card>
          <Card className="glass-card p-8 space-y-4">
            <h3 className="text-xl font-bold text-primary">{t.value2Title}</h3>
            <p className="text-muted-foreground leading-relaxed">{t.value2Desc}</p>
          </Card>
          <Card className="glass-card p-8 space-y-4">
            <h3 className="text-xl font-bold text-primary">{t.value3Title}</h3>
            <p className="text-muted-foreground leading-relaxed">{t.value3Desc}</p>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <p className="text-muted-foreground text-lg">
            Ready to revolutionize your productivity?
          </p>
          <Link href="/signup">
            <Button size="lg">Get Started</Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
