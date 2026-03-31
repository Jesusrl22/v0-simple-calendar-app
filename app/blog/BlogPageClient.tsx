'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

type Language = 'en' | 'es' | 'fr' | 'de' | 'it'

const blogs = [
  {
    id: 'second-brain',
    category: { en: 'Productivity', es: 'Productividad', fr: 'Productivité', de: 'Produktivität', it: 'Produttività' },
    titles: {
      en: 'Build a Second Brain with Task Management',
      es: 'Construye un Segundo Cerebro con Gestión de Tareas',
      fr: 'Construisez un Deuxième Cerveau avec la Gestion des Tâches',
      de: 'Baue ein Zweites Gehirn mit Task-Management auf',
      it: 'Costruisci un Secondo Cervello con la Gestione delle Attività',
    },
    descriptions: {
      en: 'The CODE method: Capture, Organize, Distill, and Express your knowledge system',
      es: 'El método CODE: Captura, Organiza, Destila y Expresa tu sistema de conocimiento',
      fr: 'La méthode CODE: Capturez, organisez, distillez et exprimez votre système',
      de: 'Die CODE-Methode: Erfasse, organisiere, destilliere und drücke aus',
      it: 'Il metodo CODE: Cattura, organizza, distilla ed esprimi il tuo sistema',
    },
    readTime: '10',
    color: 'from-blue-500/30 to-blue-500/10',
    image: '/blog-covers/second-brain.jpg',
  },
  {
    id: 'habit-science',
    category: { en: 'Habits & Science', es: 'Hábitos y Ciencia', fr: 'Habitudes et Science', de: 'Gewohnheiten und Wissenschaft', it: 'Abitudini e Scienza' },
    titles: {
      en: 'Why 21 Days is a Myth: The Real Science of Habits',
      es: 'Por Qué los 21 Días es un Mito: La Ciencia Real de los Hábitos',
      fr: 'Pourquoi 21 Jours est un Mythe: La Vraie Science des Habitudes',
      de: 'Warum 21 Tage ein Mythos sind: Die echte Wissenschaft',
      it: 'Perché 21 Giorni è un Mito: La Vera Scienza delle Abitudini',
    },
    descriptions: {
      en: 'Research shows habits take 18-254 days. Learn the real timeline and the Cue-Routine-Reward loop',
      es: 'La investigación muestra que los hábitos tardan 18-254 días. Aprende el cronograma real',
      fr: 'La recherche montre que les habitudes prennent 18-254 jours à former',
      de: 'Forschung zeigt, dass Gewohnheiten 18-254 Tage dauern',
      it: 'La ricerca mostra che le abitudini impiegano 18-254 giorni',
    },
    readTime: '9',
    color: 'from-purple-500/30 to-purple-500/10',
    image: '/blog-covers/habit-formation.jpg',
  },
  {
    id: 'deep-work',
    category: { en: 'Productivity & Focus', es: 'Productividad y Enfoque', fr: 'Productivité et Concentration', de: 'Produktivität und Fokus', it: 'Produttività e Concentrazione' },
    titles: {
      en: 'Deep Work vs Shallow Work: Protect Your Focus Time',
      es: 'Trabajo Profundo vs Superficial: Protege tu Tiempo de Concentración',
      fr: 'Travail en Profondeur vs Superficiel: Protégez votre Temps',
      de: 'Tiefe Arbeit vs Oberflächliche Arbeit: Schütze deine Fokuszeit',
      it: 'Lavoro Profondo vs Superficiale: Proteggi il tuo Tempo di Concentrazione',
    },
    descriptions: {
      en: 'Four approaches to deep work: Monastic, Bimodal, Rhythmic, and Journalistic',
      es: 'Cuatro enfoques del trabajo profundo: Monástico, Bimodal, Rítmico y Periodístico',
      fr: 'Quatre approches du travail profond: Monastique, Bimodal, Rythmique',
      de: 'Vier Ansätze zur Tiefenarbeit: Monastisch, Bimodal, Rhythmisch',
      it: 'Quattro approcci al lavoro profondo: Monastico, Bimodale, Ritmico',
    },
    readTime: '11',
    color: 'from-orange-500/30 to-orange-500/10',
    image: '/blog-covers/deep-work.jpg',
  },
  {
    id: 'morning-routines',
    category: { en: 'Habits & Routines', es: 'Hábitos y Rutinas', fr: 'Habitudes et Routines', de: 'Gewohnheiten und Routinen', it: 'Abitudini e Routine' },
    titles: {
      en: 'Morning Routines of Highly Productive People',
      es: 'Rutinas Matutinas de Personas Altamente Productivas',
      fr: 'Routines Matinales des Personnes Très Productives',
      de: 'Morgenroutinen hochproduktiver Menschen',
      it: 'Routine Mattutine di Persone Altamente Produttive',
    },
    descriptions: {
      en: 'Protect mornings from distractions, move your body, plan before the day plans you',
      es: 'Protege tu mañana de distracciones, mueve tu cuerpo, planifica tu día',
      fr: 'Protégez vos matinées des distractions, bougez votre corps',
      de: 'Schütze deine Morgen vor Ablenkungen, bewege deinen Körper',
      it: 'Proteggi le tue mattine dalle distrazioni, muovi il tuo corpo',
    },
    readTime: '10',
    color: 'from-rose-500/30 to-rose-500/10',
    image: '/blog-covers/morning-routines.jpg',
  },
  {
    id: 'weekly-review',
    category: { en: 'Productivity Systems', es: 'Sistemas de Productividad', fr: 'Systèmes de Productivité', de: 'Produktivitätssysteme', it: 'Sistemi di Produttività' },
    titles: {
      en: 'The Weekly Review: The Missing Piece of GTD',
      es: 'La Revisión Semanal: La Pieza Faltante del GTD',
      fr: "L'Examen Hebdomadaire: La Pièce Manquante de GTD",
      de: 'Die Wochenrückschau: Das fehlende Stück von GTD',
      it: 'La Revisione Settimanale: Il Pezzo Mancante di GTD',
    },
    descriptions: {
      en: 'The 45-minute ritual that prevents productivity systems from collapsing after weeks',
      es: 'El ritual de 45 minutos que previene que los sistemas de productividad colapsen',
      fr: "Le rituel de 45 minutes qui empêche les systèmes de s'effondrer",
      de: 'Das 45-Minuten-Ritual, das Systeme vor dem Zusammenbruch bewahrt',
      it: 'Il rituale di 45 minuti che impedisce ai sistemi di crollare',
    },
    readTime: '9',
    color: 'from-cyan-500/30 to-cyan-500/10',
    image: '/blog-covers/weekly-review.jpg',
  },
  {
    id: 'pomodoro-time-blocking',
    category: { en: 'Time Management', es: 'Gestión del Tiempo', fr: 'Gestion du Temps', de: 'Zeitmanagement', it: 'Gestione del Tempo' },
    titles: {
      en: 'Pomodoro vs Time Blocking: Which Works Better?',
      es: 'Pomodoro vs Bloqueo de Tiempo: ¿Cuál Funciona Mejor?',
      fr: 'Pomodoro vs Time Blocking: Lequel Fonctionne Mieux?',
      de: 'Pomodoro vs Time Blocking: Was funktioniert besser?',
      it: 'Pomodoro vs Time Blocking: Quale Funziona Meglio?',
    },
    descriptions: {
      en: 'The guide to combining two powerful frameworks for sustainable productivity',
      es: 'La guía para combinar dos frameworks poderosos para productividad sostenible',
      fr: 'Le guide pour combiner deux frameworks puissants pour la productivité',
      de: 'Der Leitfaden zur Kombination zweier mächtiger Rahmen',
      it: 'La guida per combinare due framework potenti per la produttività',
    },
    readTime: '10',
    color: 'from-green-500/30 to-green-500/10',
    image: '/blog-covers/pomodoro-time-blocking.jpg',
  },
  {
    id: 'weekly-review',
    category: { en: 'Productivity Systems', es: 'Sistemas de Productividad', fr: 'Systèmes de Productivité', de: 'Produktivitätssysteme', it: 'Sistemi di Produttività' },
    titles: {
      en: 'The Weekly Review: The Missing Piece of GTD',
      es: 'La Revisión Semanal: La Pieza Faltante del GTD',
      fr: "L'Examen Hebdomadaire: La Pièce Manquante de GTD",
      de: 'Die Wochenrückschau: Das fehlende Stück von GTD',
      it: 'La Revisione Settimanale: Il Pezzo Mancante di GTD',
    },
    descriptions: {
      en: 'The 45-minute ritual that prevents productivity systems from collapsing after weeks',
      es: 'El ritual de 45 minutos que previene que los sistemas de productividad colapsen',
      fr: 'Le rituel de 45 minutes qui empêche les systèmes de s\'effondrer',
      de: 'Das 45-Minuten-Ritual, das Systeme vor dem Zusammenbruch bewahrt',
      it: 'Il rituale di 45 minuti che impedisce ai sistemi di crollare',
    },
    readTime: '9',
    color: 'from-cyan-500/30 to-cyan-500/10',
  },
  {
    id: 'pomodoro-time-blocking',
    category: { en: 'Time Management', es: 'Gestión del Tiempo', fr: 'Gestion du Temps', de: 'Zeitmanagement', it: 'Gestione del Tempo' },
    titles: {
      en: 'Pomodoro vs Time Blocking: Which Works Better?',
      es: 'Pomodoro vs Bloqueo de Tiempo: ¿Cuál Funciona Mejor?',
      fr: 'Pomodoro vs Time Blocking: Lequel Fonctionne Mieux?',
      de: 'Pomodoro vs Time Blocking: Was funktioniert besser?',
      it: 'Pomodoro vs Time Blocking: Quale Funziona Meglio?',
    },
    descriptions: {
      en: 'The guide to combining two powerful frameworks for sustainable productivity',
      es: 'La guía para combinar dos frameworks poderosos para productividad sostenible',
      fr: 'Le guide pour combiner deux frameworks puissants pour la productivité',
      de: 'Der Leitfaden zur Kombination zweier mächtiger Rahmen',
      it: 'La guida per combinare due framework potenti per la produttività',
    },
    readTime: '10',
    color: 'from-green-500/30 to-green-500/10',
  },
  {
    id: 'pomodoro-interruptions',
    category: { en: 'Focus Techniques', es: 'Técnicas de Concentración', fr: 'Techniques de Concentration', de: 'Konzentrationstechniken', it: 'Tecniche di Concentrazione' },
    titles: {
      en: 'Why Your Pomodoro Session Keeps Being Interrupted',
      es: 'Por Qué tu Sesión Pomodoro Sigue Siendo Interrumpida',
      fr: 'Pourquoi votre session Pomodoro continue à être interrompue',
      de: 'Warum deine Pomodoro-Sitzung ständig unterbrochen wird',
      it: 'Perché la tua Sessione Pomodoro Continua ad Essere Interrotta',
    },
    descriptions: {
      en: 'How to negotiate interruptions and handle them without breaking your focus flow',
      es: 'Cómo negociar interrupciones y manejarlas sin romper tu flujo de concentración',
      fr: 'Comment négocier les interruptions et les gérer sans casser votre flux',
      de: 'Wie man Unterbrechungen verhandelt und handhabt ohne den Fokus zu verlieren',
      it: 'Come negoziare le interruzioni e gestirle senza rompere il tuo flusso',
    },
    readTime: '8',
    color: 'from-indigo-500/30 to-indigo-500/10',
    image: '/blog-covers/focus-flow-learning.jpg',
  },
  {
    id: 'ai-productivity-prompts',
    category: { en: 'AI & Automation', es: 'IA y Automatización', fr: "L'IA et l'Automatisation", de: 'KI und Automatisierung', it: 'IA e Automazione' },
    titles: {
      en: 'AI Prompts That Actually Work: Boost Your Productivity',
      es: 'Prompts de IA Que Funcionan: Aumenta tu Productividad',
      fr: "Les Prompts d'IA qui Fonctionnent Vraiment avec la Productivité",
      de: 'KI-Prompts, die wirklich funktionieren: Steigere deine Produktivität',
      it: 'Prompt IA che Funzionano Davvero: Aumenta la tua Produttività',
    },
    descriptions: {
      en: 'Master ChatGPT prompts specifically designed for task management and productivity',
      es: 'Domina los prompts de ChatGPT diseñados específicamente para la gestión de tareas',
      fr: 'Maîtrisez les prompts ChatGPT conçus spécifiquement pour la productivité',
      de: 'Beherrsche ChatGPT-Prompts für Aufgabenverwaltung',
      it: 'Padroneggia i prompt ChatGPT progettati specificamente per la produttività',
    },
    readTime: '8',
    color: 'from-teal-500/30 to-teal-500/10',
    image: '/blog-covers/ai-productivity-prompts.jpg',
  },
  {
    id: 'future-of-work',
    category: { en: 'Trends & Future', es: 'Tendencias y Futuro', fr: 'Tendances et Avenir', de: 'Trends und Zukunft', it: 'Tendenze e Futuro' },
    titles: {
      en: 'The Future of Work: How AI Transforms Productivity',
      es: "El Futuro del Trabajo: Cómo la IA Transforma la Productividad",
      fr: "L'Avenir du Travail: Comment l'IA Transforme la Productivité",
      de: 'Die Zukunft der Arbeit: Wie KI die Produktivität verändert',
      it: 'Il Futuro del Lavoro: Come l&apos;IA Trasforma la Produttività',
    },
    descriptions: {
      en: 'Prepare for the shift toward AI-augmented workflows and hybrid intelligence systems',
      es: 'Prepárate para el cambio hacia flujos de trabajo aumentados con IA',
      fr: 'Préparez-vous au changement vers des flux de travail augmentés par l&apos;IA',
      de: 'Bereite dich auf den Wechsel zu KI-gestützten Arbeitsabläufen vor',
      it: 'Preparati al cambiamento verso flussi di lavoro potenziati da IA',
    },
    readTime: '9',
    color: 'from-yellow-500/30 to-yellow-500/10',
    image: '/blog-covers/future-of-work.jpg',
  },
  {
    id: 'remote-team-productivity',
    category: { en: 'Team Productivity', es: 'Productividad del Equipo', fr: 'Productivité de l&apos;Équipe', de: 'Team-Produktivität', it: 'Produttività del Team' },
    titles: {
      en: 'Remote Team Productivity: Building Asynchronous Culture',
      es: 'Productividad del Equipo Remoto: Construyendo Cultura Asincrónica',
      fr: "Productivité d'Équipe Distante: Construire une Culture Asynchrone",
      de: 'Remote-Team-Produktivität: Aufbau einer asynchronen Kultur',
      it: 'Produttività del Team Remoto: Costruzione della Cultura Asincrona',
    },
    descriptions: {
      en: 'Strategies for managing distributed teams across time zones efficiently',
      es: 'Estrategias para gestionar equipos distribuidos en diferentes zonas horarias',
      fr: 'Stratégies pour gérer efficacement les équipes réparties sur différents fuseaux horaires',
      de: 'Strategien zur effizienten Verwaltung verteilter Teams über Zeitzonen hinweg',
      it: 'Strategie per gestire in modo efficiente i team distribuiti su diversi fusi orari',
    },
    readTime: '10',
    color: 'from-pink-500/30 to-pink-500/10',
    image: '/blog-covers/remote-team-productivity.jpg',
  },
  {
    id: 'effective-standup',
    category: { en: 'Team Meetings', es: 'Reuniones de Equipo', fr: 'Réunions d&apos;Équipe', de: 'Team-Meetings', it: 'Riunioni del Team' },
    titles: {
      en: 'How to Run an Effective Weekly Team Standup',
      es: 'Cómo Dirigir un Standup Semanal de Equipo Efectivo',
      fr: "Comment Diriger un Standup d'Équipe Hebdomadaire Efficace",
      de: 'Wie man ein effektives wöchentliches Team-Standup durchführt',
      it: 'Come Condurre un Efficace Standup Settimanale del Team',
    },
    descriptions: {
      en: 'Structure, timing, and facilitation techniques for productive team meetings',
      es: 'Estructura, cronometraje y técnicas de facilitación para reuniones productivas',
      fr: 'Structure, calendrier et techniques de facilitation pour les réunions productives',
      de: 'Struktur, Timing und Moderationstechniken für produktive Meetings',
      it: 'Struttura, tempistica e tecniche di facilitazione per riunioni produttive',
    },
    readTime: '7',
    color: 'from-fuchsia-500/30 to-fuchsia-500/10',
    image: '/blog-covers/team-standup.jpg',
  },
  {
    id: 'procrastination-science',
    category: { en: 'Psychology & Mind', es: 'Psicología y Mente', fr: 'Psychologie et Esprit', de: 'Psychologie und Geist', it: 'Psicologia e Mente' },
    titles: {
      en: 'The Psychology of Procrastination: Why You Delay and How to Stop',
      es: 'La Psicología de la Procrastinación: Por Qué Retrasas y Cómo Parar',
      fr: 'La Psychologie de la Procrastination: Pourquoi Vous Retardez et Comment Arrêter',
      de: 'Die Psychologie des Aufschiebens: Warum du verzögerst und wie du aufhörst',
      it: 'La Psicologia della Procrastinazione: Perché Ritardi e Come Smettere',
    },
    descriptions: {
      en: 'Understanding the emotional roots of procrastination and proven strategies to overcome it',
      es: 'Comprender las raíces emocionales de la procrastinación y estrategias para superarla',
      fr: 'Comprendre les racines émotionnelles de la procrastination et des stratégies pour la surmonter',
      de: 'Die emotionalen Wurzeln des Aufschiebens verstehen und Strategien zu deren Überwindung',
      it: 'Comprendere le radici emotive della procrastinazione e strategie per superarla',
    },
    readTime: '9',
    color: 'from-lime-500/30 to-lime-500/10',
    image: '/blog-covers/procrastination-psychology.jpg',
  },
  {
    id: 'goal-setting-okr',
    category: { en: 'Goal Setting', es: 'Establecimiento de Objetivos', fr: 'Définition des Objectifs', de: 'Zielsetzen', it: 'Definizione degli Obiettivi' },
    titles: {
      en: 'Goal Setting That Actually Works: The OKR Framework',
      es: 'Establecimiento de Objetivos que Realmente Funciona: El Marco OKR',
      fr: 'Définition des Objectifs qui Fonctionne Vraiment: Le Cadre OKR',
      de: 'Zielsetzen, das wirklich funktioniert: Das OKR-Framework',
      it: 'Definizione degli Obiettivi che Funziona Davvero: Il Framework OKR',
    },
    descriptions: {
      en: 'Learn the Objectives and Key Results framework used by Google and leading organizations',
      es: 'Aprende el marco de Objetivos y Resultados Clave utilizado por Google',
      fr: 'Apprenez le cadre des Objectifs et Résultats Clés utilisé par Google',
      de: 'Lerne das OKR-Framework, das von Google und führenden Organisationen verwendet wird',
      it: 'Impara il framework degli Obiettivi e Risultati Chiave utilizzato da Google',
    },
    readTime: '10',
    color: 'from-emerald-500/30 to-emerald-500/10',
    image: '/blog-covers/goal-setting-okr.jpg',
  },
  {
    id: 'energy-management',
    category: { en: 'Wellness & Energy', es: 'Bienestar y Energía', fr: 'Bien-être et Énergie', de: 'Wohlbefinden und Energie', it: 'Benessere ed Energia' },
    titles: {
      en: 'Energy Management Over Time Management: The Real Secret',
      es: 'Gestión de Energía Sobre Gestión del Tiempo: El Verdadero Secreto',
      fr: "Gestion de l'Énergie Plutôt que Gestion du Temps: Le Vrai Secret",
      de: 'Energiemanagement statt Zeitmanagement: Das echte Geheimnis',
      it: "Gestione dell'Energia Invece della Gestione del Tempo: Il Vero Segreto",
    },
    descriptions: {
      en: 'Why managing your energy levels is more important than managing your time',
      es: 'Por qué gestionar tus niveles de energía es más importante que gestionar tu tiempo',
      fr: "Pourquoi gérer vos niveaux d'énergie est plus important que de gérer votre temps",
      de: 'Warum die Verwaltung deines Energielevels wichtiger ist als Zeitmanagement',
      it: 'Perché gestire i tuoi livelli di energia è più importante che gestire il tuo tempo',
    },
    readTime: '8',
    color: 'from-sky-500/30 to-sky-500/10',
    image: '/blog-covers/energy-management.jpg',
  },
  {
    id: 'productivity-tools-ecosystem',
    category: { en: 'Tools & Resources', es: 'Herramientas y Recursos', fr: 'Outils et Ressources', de: 'Tools und Ressourcen', it: 'Strumenti e Risorse' },
    titles: {
      en: 'The Ultimate Productivity Tools Stack for 2025',
      es: 'La Pila Definitiva de Herramientas de Productividad para 2025',
      fr: 'La Pile Ultime des Outils de Productivité pour 2025',
      de: 'Der ultimative Produktivitäts-Tool-Stack für 2025',
      it: 'Lo Stack Definitivo di Strumenti di Produttività per 2025',
    },
    descriptions: {
      en: 'Best-in-class tools for task management, planning, communication, and automation',
      es: 'Herramientas de clase mundial para gestión de tareas, planificación y comunicación',
      fr: 'Outils de classe mondiale pour la gestion des tâches, la planification et la communication',
      de: 'Weltklasse-Tools für Aufgabenverwaltung, Planung und Kommunikation',
      it: 'Strumenti di classe mondiale per la gestione delle attività, la pianificazione e la comunicazione',
    },
    readTime: '12',
    color: 'from-violet-500/30 to-violet-500/10',
    image: '/blog-covers/productivity-tools.jpg',
  },
]

export default function BlogPageClient({ initialLanguage = 'en' }: { initialLanguage?: Language }) {
  const [language, setLanguage] = useState<Language>(initialLanguage as Language)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredBlogs = blogs.filter(
    (blog) =>
      blog.titles[language].toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.category[language].toLowerCase().includes(searchQuery.toLowerCase())
  )

  const translations = {
    en: { 
      title: 'Blogs', 
      subtitle: 'Master productivity with in-depth guides and strategies',
      backToHome: 'Back to Home',
      searchPlaceholder: 'Search articles...',
      readTime: 'read',
      noResults: 'No articles found matching your search.',
    },
    es: { 
      title: 'Blogs', 
      subtitle: 'Domina la productividad con guías y estrategias en profundidad',
      backToHome: 'Volver al Inicio',
      searchPlaceholder: 'Buscar artículos...',
      readTime: 'de lectura',
      noResults: 'No hay artículos que coincidan con tu búsqueda.',
    },
    fr: { 
      title: 'Blogs', 
      subtitle: 'Maîtrisez la productivité avec des guides et stratégies approfondis',
      backToHome: "Retour à l'Accueil",
      searchPlaceholder: 'Rechercher des articles...',
      readTime: 'de lecture',
      noResults: 'Aucun article ne correspond à votre recherche.',
    },
    de: { 
      title: 'Blogs', 
      subtitle: 'Beherrsche Produktivität mit umfassenden Leitfäden und Strategien',
      backToHome: 'Zurück zur Startseite',
      searchPlaceholder: 'Artikel durchsuchen...',
      readTime: 'Lesezeit',
      noResults: 'Keine Artikel gefunden, die Ihrer Suche entsprechen.',
    },
    it: { 
      title: 'Blogs', 
      subtitle: 'Padroneggia la produttività con guide e strategie approfondite',
      backToHome: 'Torna alla Home',
      searchPlaceholder: 'Ricerca articoli...',
      readTime: 'di lettura',
      noResults: 'Nessun articolo trovato che corrisponde alla tua ricerca.',
    },
  }

  const t = translations[language]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative py-20 px-4 sm:px-6 lg:px-8 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-8 font-medium text-sm">
            <span>←</span>
            {t.backToHome}
          </Link>
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">{t.title}</h1>
            <p className="text-lg text-muted-foreground mb-8">{t.subtitle}</p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 rounded-lg border border-border bg-card text-foreground"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Blogs Grid */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {filteredBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBlogs.map((blog) => (
                <Link key={blog.id} href={`/blog/${blog.id}`}>
                  <Card className="glass-card overflow-hidden neon-glow-hover transition-all duration-300 cursor-pointer group h-full">
                    <div className={`h-40 bg-gradient-to-br ${blog.color} relative overflow-hidden`}>
                      {blog.image && (
                        <img
                          src={blog.image}
                          alt={blog.titles[language]}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                      <div className="absolute inset-0 group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div className="p-6 space-y-4 flex flex-col h-full">
                      <div>
                        <p className="text-xs text-primary font-semibold uppercase tracking-wide mb-2">{blog.category[language]}</p>
                        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-3">
                          {blog.titles[language]}
                        </h3>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2 flex-grow">{blog.descriptions[language]}</p>

                      <div className="flex items-center justify-between pt-2 mt-auto">
                        <span className="text-xs text-muted-foreground">
                          {blog.readTime} min {t.readTime}
                        </span>
                        <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground">
                {t.noResults}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
