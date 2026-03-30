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
  },
  {
    id: 'weekly-review',
    category: { en: 'Productivity Systems', es: 'Sistemas de Productividad', fr: 'Systèmes de Productivité', de: 'Produktivitätssysteme', it: 'Sistemi di Produttività' },
    titles: {
      en: 'The Weekly Review: The Missing Piece of GTD',
      es: 'La Revisión Semanal: La Pieza Faltante del GTD',
      fr: 'L'Examen Hebdomadaire: La Pièce Manquante de GTD',
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
  },
  {
    id: 'focus-techniques',
    category: { en: 'Focus Techniques', es: 'Técnicas de Concentración', fr: 'Techniques de Concentration', de: 'Konzentrationstechniken', it: 'Tecniche di Concentrazione' },
    titles: {
      en: 'The 5 Best Focus Techniques Beyond Pomodoro',
      es: 'Las 5 Mejores Técnicas de Concentración más allá de Pomodoro',
      fr: 'Les 5 Meilleures Techniques de Concentration au-delà de Pomodoro',
      de: 'Die 5 besten Konzentrationstechniken jenseits von Pomodoro',
      it: 'Le 5 Migliori Tecniche di Concentrazione oltre Pomodoro',
    },
    descriptions: {
      en: 'Flow state, elaboration, active recovery, and interleaving practice explained',
      es: 'Estado de flujo, elaboración, recuperación activa e interleaving explicados',
      fr: 'L\'état de flux, l\'élaboration, la récupération active et l\'interleaving',
      de: 'Flow-State, Elaboration, Active Recovery und Interleaving erklärt',
      it: 'Lo stato di flusso, l\'elaborazione, il recupero attivo e l\'interleaving spiegati',
    },
    readTime: '11',
    color: 'from-teal-500/30 to-teal-500/10',
  },
  {
    id: 'ai-weekly-planning',
    category: { en: 'AI & Productivity', es: 'IA y Productividad', fr: 'IA et Productivité', de: 'KI und Produktivität', it: 'IA e Produttività' },
    titles: {
      en: 'How to Use AI to Plan Your Week in Minutes',
      es: 'Cómo Usar IA para Planificar tu Semana en Minutos',
      fr: 'Comment Utiliser l\'IA pour Planifier votre Semaine en Minutes',
      de: 'Wie man KI nutzt um die Woche in Minuten zu planen',
      it: 'Come Usare l\'IA per Pianificare la Tua Settimana in Minuti',
    },
    descriptions: {
      en: 'Templates and workflows to leverage AI for strategic planning and execution',
      es: 'Plantillas y flujos de trabajo para aprovechar la IA en la planificación estratégica',
      fr: 'Modèles et flux de travail pour exploiter l\'IA dans la planification',
      de: 'Vorlagen und Workflows um KI für strategische Planung zu nutzen',
      it: 'Template e workflow per sfruttare l\'IA nella pianificazione strategica',
    },
    readTime: '12',
    color: 'from-violet-500/30 to-violet-500/10',
  },
  {
    id: 'ai-prompts',
    category: { en: 'AI & Productivity', es: 'IA y Productividad', fr: 'IA et Productivité', de: 'KI und Produktivität', it: 'IA e Produttività' },
    titles: {
      en: 'AI Prompts That Actually Help with Productivity',
      es: 'Prompts de IA que Realmente te Ayudan con tu Productividad',
      fr: 'Les Prompts d\'IA qui Vous Aident Vraiment avec la Productivité',
      de: 'KI-Prompts die wirklich bei der Produktivität helfen',
      it: 'Prompt di IA che Realmente Ti Aiutano con la Produttività',
    },
    descriptions: {
      en: 'Practical prompts for task prioritization, goal setting, and execution',
      es: 'Prompts prácticos para priorización de tareas, establecimiento de objetivos',
      fr: 'Des prompts pratiques pour la priorisation des tâches et les objectifs',
      de: 'Praktische Prompts für Aufgabenpriorisierung und Zielentwicklung',
      it: 'Prompt pratici per la prioritizzazione delle attività e la definizione degli obiettivi',
    },
    readTime: '13',
    color: 'from-pink-500/30 to-pink-500/10',
  },
  {
    id: 'ai-future-work',
    category: { en: 'The Future of Work', es: 'El Futuro del Trabajo', fr: 'L\'Avenir du Travail', de: 'Die Zukunft der Arbeit', it: 'Il Futuro del Lavoro' },
    titles: {
      en: 'The Future of Work: How AI Is Transforming Productivity',
      es: 'El Futuro del Trabajo: Cómo la IA está Transformando la Productividad',
      fr: 'L\'Avenir du Travail: Comment l\'IA Transforme la Productivité',
      de: 'Die Zukunft der Arbeit: Wie KI die Produktivität verändert',
      it: 'Il Futuro del Lavoro: Come l\'IA sta Trasformando la Produttività',
    },
    descriptions: {
      en: 'Emerging trends and how to prepare your workflow for an AI-augmented future',
      es: 'Tendencias emergentes y cómo preparar tu flujo de trabajo para el futuro',
      fr: 'Les tendances émergentes et comment préparer votre flux de travail',
      de: 'Emerging Trends und wie man seinen Workflow für die Zukunft vorbereitet',
      it: 'Le tendenze emergenti e come preparare il tuo flusso di lavoro',
    },
    readTime: '10',
    color: 'from-amber-500/30 to-amber-500/10',
  },
  {
    id: 'remote-team-productivity',
    category: { en: 'Team Productivity', es: 'Productividad de Equipos', fr: 'Productivité d\'Équipe', de: 'Team-Produktivität', it: 'Produttività del Team' },
    titles: {
      en: 'Remote Team Productivity: Building a Async-First Culture',
      es: 'Productividad de Equipos Remotos: Construyendo una Cultura Asincrónica',
      fr: 'Productivité d\'Équipe Distante: Construire une Culture Asynchrone',
      de: 'Remote Team Produktivität: Aufbau einer Async-First Kultur',
      it: 'Produttività dei Team Remoti: Costruire una Cultura Asincrona',
    },
    descriptions: {
      en: 'Async communication, radical documentation, and visibility without micromanagement',
      es: 'Comunicación asincrónica, documentación radical y visibilidad sin micromanagment',
      fr: 'Communication asynchrone, documentation radicale et visibilité',
      de: 'Asynchrone Kommunikation, radikale Dokumentation und Sichtbarkeit',
      it: 'Comunicazione asincrona, documentazione radicale e visibilità',
    },
    readTime: '11',
    color: 'from-emerald-500/30 to-emerald-500/10',
  },
  {
    id: 'standup-meetings',
    category: { en: 'Team Productivity', es: 'Productividad de Equipos', fr: 'Productivité d\'Équipe', de: 'Team-Produktivität', it: 'Produttività del Team' },
    titles: {
      en: 'How to Run an Effective Weekly Team Standup',
      es: 'Cómo Llevar un Standup Semanal de Equipo Efectivo',
      fr: 'Comment Diriger un Standup d\'Équipe Hebdomadaire Efficace',
      de: 'Wie man ein effektives Weekly Team Standup durchführt',
      it: 'Come Condurre un Standup Settimanale del Team Efficace',
    },
    descriptions: {
      en: 'Structure, timing, and the one question that makes standups actually valuable',
      es: 'Estructura, cronometraje y la pregunta que hace que los standups sean valiosos',
      fr: 'Structure, timing et la question qui rend les standups valables',
      de: 'Struktur, Timing und die Frage die Standups wertvoll macht',
      it: 'Struttura, tempistica e la domanda che rende gli standup preziosi',
    },
    readTime: '8',
    color: 'from-lime-500/30 to-lime-500/10',
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
    en: { title: 'Blogs', subtitle: 'Master productivity with in-depth guides and strategies' },
    es: { title: 'Blogs', subtitle: 'Domina la productividad con guías y estrategias en profundidad' },
    fr: { title: 'Blogs', subtitle: 'Maîtrisez la productivité avec des guides et stratégies approfondis' },
    de: { title: 'Blogs', subtitle: 'Beherrsche Produktivität mit umfassenden Leitfäden und Strategien' },
    it: { title: 'Blogs', subtitle: 'Padroneggia la produttività con guide e strategie approfondite' },
  }

  const t = translations[language]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative py-20 px-4 sm:px-6 lg:px-8 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">{t.title}</h1>
            <p className="text-lg text-muted-foreground mb-8">{t.subtitle}</p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder={language === 'en' ? 'Search articles...' : language === 'es' ? 'Buscar artículos...' : language === 'fr' ? 'Rechercher des articles...' : language === 'de' ? 'Artikel durchsuchen...' : 'Ricerca articoli...'}
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
                          {blog.readTime} min {language === 'en' ? 'read' : language === 'es' ? 'de lectura' : language === 'fr' ? 'de lecture' : language === 'de' ? 'Lesezeit' : 'di lettura'}
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
                {language === 'en' ? 'No articles found matching your search.' : language === 'es' ? 'No hay artículos que coincidan con tu búsqueda.' : language === 'fr' ? 'Aucun article ne correspond à votre recherche.' : language === 'de' ? 'Keine Artikel gefunden, die Ihrer Suche entsprechen.' : 'Nessun articolo trovato che corrisponde alla tua ricerca.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
