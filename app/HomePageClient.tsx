"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useState, useEffect } from "react"
import CookieBanner from "@/components/cookie-banner"
import { useRouter } from "next/navigation" // Import useRouter

// Mock userReviews data - replace with actual data fetching if needed
const userReviews = [
  {
    id: 1,
    name: "Alice Smith",
    title: "Productivity Guru",
    rating: 5,
    comment: "This app changed my life!",
    created_at: "2024-01-15",
  },
  {
    id: 2,
    name: "Bob Johnson",
    title: "Team Lead",
    rating: 4,
    comment: "Great for team collaboration.",
    created_at: "2024-02-10",
  },
  {
    id: 3,
    name: "Charlie Brown",
    title: "Student",
    rating: 5,
    comment: "Helped me stay organized.",
    created_at: "2024-03-05",
  },
  {
    id: 4,
    name: "Diana Prince",
    title: "Project Manager",
    rating: 4,
    comment: "Very useful for tracking project progress.",
    created_at: "2024-04-20",
  },
  {
    id: 5,
    name: "Ethan Hunt",
    title: "Developer",
    rating: 5,
    comment: "The AI features are a game-changer!",
    created_at: "2024-05-12",
  },
  {
    id: 6,
    name: "Fiona Glenanne",
    title: "Designer",
    rating: 3,
    comment: "Good, but could use more customization options.",
    created_at: "2024-06-01",
  },
  {
    id: 7,
    name: "George Costanza",
    title: "Sales",
    rating: 5,
    comment: "Helped me close more deals!",
    created_at: "2024-07-18",
  },
]

const translations = {
  en: {
    features: "Features",
    dashboard: "Dashboard",
    pricing: "Pricing",
    about: "About",
    login: "Login",
    signup: "Sign Up",
    hero: "Smart Systems, Collaborate Seamlessly, Succeed Efficiently",
    heroDesc: "Empower your productivity with intelligent task management, AI assistance, and seamless collaboration",
    startNow: "Start now",
    learnMore: "Learn more",
    secure: "Secure & Reliable",
    secureDesc: "Enterprise-grade security for your data",
    growth: "Growth Analytics",
    growthDesc: "Real-time insights and metrics",
    team: "Team Collaboration",
    teamDesc: "Work together seamlessly",
    global: "Global Scale",
    globalDesc: "Deploy anywhere in the world",
    ai: "AI-Powered",
    aiDesc: "Intelligent automation built-in",
    fast: "Lightning Fast",
    fastDesc: "Optimized for performance",
    powerfulDashboard: "Powerful Dashboard",
    dashboardDesc:
      "Monitor your metrics, track performance, and make data-driven decisions with our intuitive interface.",
    tasksCompleted: "Tasks Completed",
    productivity: "Productivity",
    timeSaved: "Time Saved",
    pricingTitle: "Choose Your Plan",
    pricingDesc: "Select the perfect plan for your needs",
    monthly: "Monthly",
    annually: "Annually",
    saveAnnually: "Save 20% with annual billing",
    free: "Free",
    freeDesc: "Perfect for getting started",
    freeCalendar: "Full calendar access",
    freeTasks: "Unlimited tasks",
    freePomodoro: "Basic Pomodoro timer",
    freeThemes: "5 Free themes",
    freeAchievements: "Free achievements",
    freeNoTeams: "No team collaboration",
    aiCredits: "50 AI credits/month",
    basicTasks: "Basic task management",
    basicNotes: "Notes & wishlist",
    basicPomodoro: "Pomodoro timer",
    pro: "Pro",
    proDesc: "For power users",
    proAiCredits: "500 AI credits/month",
    proStatistics: "Statistics & analytics",
    proCustomTheme: "Custom theme creator",
    proAllThemes: "All 15 themes + custom",
    proAchievements: "All achievements",
    proUnlimitedTeams: "Unlimited team collaboration",
    proTeamStats: "Team analytics",
    premium: "Premium",
    premiumDesc: "For productivity enthusiasts",
    premiumAiCredits: "100 AI credits/month",
    premiumPomodoro: "Advanced Pomodoro settings",
    premiumNotes: "Notes & Wishlist",
    premiumThemes: "10 themes (Free + Premium)",
    premiumAchievements: "Premium achievements",
    premiumTeams: "Team collaboration",
    premiumSharedTasks: "Shared tasks",
    teamFeatures: "Team collaboration",
    prioritySupport: "Priority support",
    customIntegrations: "Custom integrations",
    chooseFreePlan: "Current Plan",
    chooseProPlan: "Upgrade to Pro",
    choosePremiumPlan: "Upgrade to Premium",
    month: "/month",
    year: "/year",
    blogTitle: "Blog & Resources",
    blogDesc: "Discover tips, strategies, and insights to boost your productivity",
    blogPost1Title: "Master the Pomodoro Technique",
    blogPost1Desc:
      "Learn how to break your work into focused intervals to maximize productivity and avoid burnout. Discover the science behind this time management method.",
    blogPost1ReadTime: "5 min read",
    blogPost2Title: "Effective Study Methods for Students",
    blogPost2Desc:
      "Discover proven study techniques including spaced repetition, active recall, and mind mapping to improve retention and ace your exams.",
    blogPost2ReadTime: "7 min read",
    blogPost3Title: "Boost Productivity with AI Assistants",
    blogPost3Desc:
      "Explore how AI tools can help you automate tasks, generate ideas, and streamline your workflow to achieve more in less time.",
    blogPost3ReadTime: "6 min read",
    howItWorksTitle: "How It Works",
    howItWorksDesc: "Get started in minutes with our simple and intuitive platform.",
    step1Title: "Sign Up",
    step1Desc: "Create your free account in seconds.",
    step2Title: "Organize",
    step2Desc: "Add your tasks and projects.",
    step3Title: "Collaborate",
    step3Desc: "Invite your team to work together.",
    step4Title: "Achieve",
    step4Desc: "Boost your productivity and reach your goals.",
    productivityTipsTitle: "Boost Your Productivity",
    productivityTipsDesc: "Discover actionable tips and strategies to get more done.",
    tip1Title: "Set Clear Goals",
    tip1Desc: "Define what you want to achieve to stay focused and motivated.",
    tip2Title: "Use the Pomodoro Technique",
    tip2Desc: "Work in focused intervals with short breaks to maintain concentration.",
    tip3Title: "Track Your Progress",
    tip3Desc: "Monitor your achievements and identify areas for improvement.",
    tip4Title: "Leverage AI Assistance",
    tip4Desc: "Let AI help you automate tasks and optimize your workflow.",
    testimonialsTitle: "What Our Users Say",
    testimonialsDesc: "See how Future Task is helping people achieve their goals.",
    testimonial1Role: "CEO at Tech Solutions",
    testimonial1Text:
      "Future Task has revolutionized our team's workflow. The collaboration features are seamless, and the AI assistance has boosted our efficiency significantly.",
    testimonial2Role: "Student at University X",
    testimonial2Text:
      "As a student, staying organized is crucial. Future Task helps me manage my studies, assignments, and personal projects all in one place. The Pomodoro timer is a game-changer!",
    testimonial3Role: "Freelance Developer",
    testimonial3Text:
      "I love how intuitive and powerful Future Task is. It helps me manage multiple client projects and deadlines with ease. The insights it provides are invaluable.",
    faqTitle: "Frequently Asked Questions",
    faqDesc: "Find answers to common questions about Future Task.",
    faq1Question: "What is Future Task?",
    faq1Answer:
      "Future Task is a smart productivity platform designed to help individuals and teams manage tasks, collaborate, and achieve their goals more efficiently with AI-powered assistance.",
    faq2Question: "Is there a free plan?",
    faq2Answer:
      "Yes, we offer a free plan with essential features perfect for getting started. You can upgrade to our Pro or Premium plans for more advanced capabilities.",
    faq3Question: "How does the AI assistance work?",
    faq3Answer:
      "Our AI assistant can help you with task automation, idea generation, content summarization, and workflow optimization. The capabilities vary based on your plan.",
    faq4Question: "Can I collaborate with my team?",
    faq4Answer:
      "Absolutely! Future Task is built for seamless team collaboration, allowing you to share projects, assign tasks, and communicate effectively.",
    faq5Question: "What are the billing options?",
    faq5Answer:
      "We offer both monthly and annual billing options. Annual billing provides a significant discount compared to monthly billing.",
    share_your_review: "Share Your Review",
    write_review_description: "Help others by sharing your experience with Future Task.",
    write_review_button: "Write a Review",
    name: "Name",
    email: "Email",
    rating: "Rating",
    enterName: "Enter your name",
    enterEmail: "Enter your email",
    yourReview: "Your Review",
    enterReview: "Enter your review here...",
    submitReview: "Submit Review",
    nextGenerationPlatform: "Next Generation Platform",
    user_reviews_title: "User Reviews",
    reviews_from_community: "Reviews from our amazing community",
    view_all_reviews: "View All Reviews",
    write_review: "Write a Review",
    your_name: "Your Name",
    review_title: "Review Title",
    submit_review: "Submit Review",
    all_reviews: "All Reviews",
    addReview: "Add Review", // Added for the new button
    seeAndWriteReviews: "View & Write Reviews",
    footer_description: "Smart task management with AI-powered assistance for enhanced productivity.",
    footer_product: "Product",
    footer_legal: "Legal",
    footer_terms: "Terms of Service",
    footer_privacy: "Privacy Policy",
    footer_support: "Support",
    footer_contact: "Contact Us",
    footer_copyright: "© 2025 Future Task. All rights reserved.",
    footer_terms_short: "Terms",
    footer_privacy_short: "Privacy",
    footer_contact_short: "Contact",
  },
  es: {
    features: "Características",
    dashboard: "Panel",
    pricing: "Precios",
    about: "Acerca de",
    login: "Iniciar sesión",
    signup: "Registrarse",
    hero: "Sistemas Inteligentes, Colabora Sin Problemas, Triunfa Eficientemente",
    heroDesc: "Potencia tu productividad con gestión inteligente de tareas, asistencia IA y colaboración perfecta",
    startNow: "Comenzar ahora",
    learnMore: "Saber más",
    secure: "Seguro y Confiable",
    secureDesc: "Seguridad de nivel empresarial para tus datos",
    growth: "Analíticas de Crecimiento",
    growthDesc: "Información y métricas en tiempo real",
    team: "Colaboración en Equipo",
    teamDesc: "Trabaja junto sin problemas",
    global: "Escala Global",
    globalDesc: "Despliega en cualquier parte del mundo",
    ai: "Impulsado por IA",
    aiDesc: "Automatización inteligente incorporada",
    fast: "Rapidísimo",
    fastDesc: "Optimizado para rendimiento",
    powerfulDashboard: "Panel Potente",
    dashboardDesc:
      "Monitorea tus métricas, rastrea el rendimiento y toma decisiones basadas en datos con nuestra interfaz intuitiva.",
    tasksCompleted: "Tareas Completadas",
    productivity: "Productividad",
    timeSaved: "Tiempo Ahorrado",
    pricingTitle: "Elige Tu Plan",
    pricingDesc: "Selecciona el plan perfecto para tus necesidades",
    monthly: "Mensual",
    annually: "Anual",
    saveAnnually: "Ahorra 20% con facturación anual",
    free: "Gratis",
    freeDesc: "Perfecto para empezar",
    freeCalendar: "Acceso completo al calendario",
    freeTasks: "Tareas ilimitadas",
    freePomodoro: "Temporizador Pomodoro básico",
    freeThemes: "5 temas gratuitos",
    freeAchievements: "Logros gratuitos",
    freeNoTeams: "Sin colaboración en equipo",
    aiCredits: "50 créditos IA/mes",
    basicTasks: "Gestión básica de tareas",
    basicNotes: "Notas y lista de deseos",
    basicPomodoro: "Temporizador Pomodoro",
    pro: "Pro",
    proDesc: "Para usuarios avanzados",
    proAiCredits: "500 créditos IA/mes",
    proStatistics: "Estadísticas y análisis",
    proCustomTheme: "Creador de temas personalizados",
    proAllThemes: "Todos los 15 temas + personalizados",
    proAchievements: "Todos los logros",
    proUnlimitedTeams: "Colaboración ilimitada en equipo",
    proTeamStats: "Estadísticas de equipo",
    premium: "Premium",
    premiumDesc: "Para entusiastas de la productividad",
    premiumAiCredits: "100 créditos IA/mes",
    premiumPomodoro: "Configuración avanzada de Pomodoro",
    premiumNotes: "Notas y lista de deseos",
    premiumThemes: "10 temas (Gratuitos + Premium)",
    premiumAchievements: "Logros Premium",
    premiumTeams: "Colaboración en equipo",
    premiumSharedTasks: "Tareas compartidas",
    teamFeatures: "Colaboración en equipo",
    prioritySupport: "Soporte prioritario",
    customIntegrations: "Integraciones personalizadas",
    chooseFreePlan: "Plan Actual",
    chooseProPlan: "Actualizar a Pro",
    choosePremiumPlan: "Actualizar a Premium",
    month: "/mes",
    year: "/año",
    blogTitle: "Blog y Recursos",
    blogDesc: "Descubre consejos, estrategias e ideas para impulsar tu productividad",
    blogPost1Title: "Domina la Técnica Pomodoro",
    blogPost1Desc:
      "Aprende a dividir tu trabajo en intervalos enfocados para maximizar la productividad y evitar el agotamiento. Descubre la ciencia detrás de este método de gestión del tiempo.",
    blogPost1ReadTime: "5 min read",
    blogPost2Title: "Métodos de Estudio Eficaces para Estudiantes",
    blogPost2Desc:
      "Descubre técnicas de estudio probadas como la repetición espaciada, el recuerdo activo y los mapas mentales para mejorar la retención y destacar en tus exámenes.",
    blogPost2ReadTime: "7 min read",
    blogPost3Title: "Impulsa la Productividad con Asistentes IA",
    blogPost3Desc:
      "Explora cómo las herramientas de IA pueden ayudarte a automatizar tareas, generar ideas y optimizar tu flujo de trabajo para lograr más en menos tiempo.",
    blogPost3ReadTime: "6 min read",
    howItWorksTitle: "Cómo Funciona",
    howItWorksDesc: "Empieza en minutos con nuestra plataforma sencilla e intuitiva.",
    step1Title: "Regístrate",
    step1Desc: "Crea tu cuenta gratuita en segundos.",
    step2Title: "Organiza",
    step2Desc: "Añade tus tareas y proyectos.",
    step3Title: "Colabora",
    step3Desc: "Invita a tu equipo a trabajar juntos.",
    step4Title: "Logra",
    step4Desc: "Aumenta tu productividad y alcanza tus objetivos.",
    productivityTipsTitle: "Mejora Tu Productividad",
    productivityTipsDesc: "Descubre consejos y estrategias prácticas para hacer más.",
    tip1Title: "Establece Metas Claras",
    tip1Desc: "Define lo que quieres lograr para mantenerte enfocado y motivado.",
    tip2Title: "Usa la Técnica Pomodoro",
    tip2Desc: "Trabaja en intervalos enfocados con descansos cortos para mantener la concentración.",
    tip3Title: "Sigue Tu Progreso",
    tip3Desc: "Monitorea tus logros e identifica áreas de mejora.",
    tip4Title: "Aprovecha la Asistencia IA",
    tip4Desc: "Deja que la IA te ayude a automatizar tareas y optimizar tu flujo de trabajo.",
    testimonialsTitle: "Lo Que Dicen Nuestros Usuarios",
    testimonialsDesc: "Mira cómo Future Task está ayudando a las personas a alcanzar sus objetivos.",
    testimonial1Role: "CEO en Tech Solutions",
    testimonial1Text:
      "Future Task ha revolucionado el flujo de trabajo de nuestro equipo. Las funciones de colaboración son perfectas y la asistencia IA ha aumentado significativamente nuestra eficiencia.",
    testimonial2Role: "Estudiante en University X",
    testimonial2Text:
      "Como estudiante, mantenerme organizado es crucial. Future Task me ayuda a gestionar mis estudios, tareas y proyectos personales en un solo lugar. ¡El temporizador Pomodoro es un punto de inflexión!",
    testimonial3Role: "Desarrollador Freelance",
    testimonial3Text:
      "Me encanta lo intuitivo y potente que es Future Task. Me ayuda a gestionar múltiples proyectos de clientes y plazos con facilidad. Los insights que proporciona son invaluables.",
    faqTitle: "Preguntas Frecuentes",
    faqDesc: "Encuentra respuestas a preguntas comunes sobre Future Task.",
    faq1Question: "¿Qué es Future Task?",
    faq1Answer:
      "Future Task es una plataforma de productividad inteligente diseñada para ayudar a individuos y equipos a gestionar tareas, colaborar y alcanzar sus objetivos de manera más eficiente con asistencia impulsada por IA.",
    faq2Question: "¿Hay un plan gratuito?",
    faq2Answer:
      "Sí, ofrecemos un plan gratuito con funciones esenciales perfectas para empezar. Puedes actualizar a nuestros planes Pro o Premium para capacidades más avanzadas.",
    faq3Question: "¿Cómo funciona la asistencia IA?",
    faq3Answer:
      "Nuestro asistente de IA puede ayudarte con la automatización de tareas, generación de ideas, resumen de contenido y optimización del flujo de trabajo. Las capacidades varían según tu plan.",
    faq4Question: "¿Puedo colaborar con mi equipo?",
    faq4Answer:
      "¡Absolutamente! Future Task está diseñado para una colaboración en equipo fluida, permitiéndote compartir proyectos, asignar tareas y comunicarte de manera efectiva.",
    faq5Question: "¿Cuáles son las opciones de facturación?",
    faq5Answer:
      "Ofrecemos opciones de facturación mensual y anual. La facturación anual proporciona un descuento significativo en comparación con la facturación mensual.",
    share_your_review: "Comparte tu reseña",
    write_review_description: "Ayuda a otros compartiendo tu experiencia con Future Task.",
    write_review_button: "Escribe una reseña",
    name: "Nombre",
    email: "Correo electrónico",
    rating: "Calificación",
    enterName: "Introduce tu nombre",
    enterEmail: "Introduce tu correo electrónico",
    yourReview: "Tu Reseña",
    enterReview: "Introduce tu reseña aquí...",
    submitReview: "Enviar Reseña",
    nextGenerationPlatform: "Next Generation Platform",
    user_reviews_title: "Reseñas de Usuarios",
    reviews_from_community: "Reseñas de nuestra increíble comunidad",
    view_all_reviews: "Ver Todas las Reseñas",
    write_review: "Escribe una reseña",
    your_name: "Tu Nombre",
    review_title: "Título de la reseña",
    submit_review: "Enviar reseña",
    all_reviews: "Todas las reseñas",
    addReview: "Agregar Reseña", // Added for the new button
    seeAndWriteReviews: "Ver y Escribir Reseñas",
    footer_description: "Gestión inteligente de tareas con asistencia impulsada por IA para una mayor productividad.",
    footer_product: "Producto",
    footer_legal: "Legal",
    footer_terms: "Términos de Servicio",
    footer_privacy: "Política de Privacidad",
    footer_support: "Soporte",
    footer_contact: "Contáctanos",
    footer_copyright: "© 2025 Future Task. Todos los derechos reservados.",
    footer_terms_short: "Términos",
    footer_privacy_short: "Privacidad",
    footer_contact_short: "Contacto",
  },
  fr: {
    features: "Fonctionnalités",
    dashboard: "Tableau de bord",
    pricing: "Tarifs",
    about: "À propos",
    login: "Connexion",
    signup: "S'inscrire",
    hero: "Systèmes Intelligents, Collaborez Sans Effort, Réussissez Efficacement",
    heroDesc:
      "Boostez votre productivité avec une gestion intelligente des tâches, une assistance IA et une collaboration fluide",
    startNow: "Commencer maintenant",
    learnMore: "En savoir plus",
    secure: "Sécurisé et Fiable",
    secureDesc: "Sécurité de niveau entreprise pour vos données",
    growth: "Analyses de Croissance",
    growthDesc: "Informations et métriques en temps réel",
    team: "Collaboration d'Équipe",
    teamDesc: "Travaillez ensemble sans effort",
    global: "Échelle Mondiale",
    globalDesc: "Déployez n'importe où dans le monde",
    ai: "Propulsé par l'IA",
    aiDesc: "Automatisation intelligente intégrée",
    fast: "Ultra Rapide",
    fastDesc: "Optimisé pour les performances",
    powerfulDashboard: "Tableau de Bord Puissant",
    dashboardDesc:
      "Surveillez vos métriques, suivez les performances et prenez des décisions basées sur les données avec notre interface intuitive.",
    tasksCompleted: "Tâches Terminées",
    productivity: "Productivité",
    timeSaved: "Temps Économisé",
    pricingTitle: "Choisissez Votre Plan",
    pricingDesc: "Sélectionnez le plan parfait pour vos besoins",
    monthly: "Mensuel",
    annually: "Annuel",
    saveAnnually: "Économisez 20% avec la facturation annuelle",
    free: "Gratuit",
    freeDesc: "Parfait pour commencer",
    freeCalendar: "Accès complet au calendrier",
    freeTasks: "Tâches illimitées",
    freePomodoro: "Minuteur Pomodoro basique",
    freeThemes: "5 thèmes gratuits",
    freeAchievements: "Logros gratuitos",
    freeNoTeams: "Pas de collaboration d'équipe",
    aiCredits: "50 crédits IA/mois",
    basicTasks: "Gestion de tâches basique",
    basicNotes: "Notes et liste de souhaits",
    basicPomodoro: "Minuteur Pomodoro",
    pro: "Pro",
    proDesc: "Pour les utilisateurs avancés",
    proAiCredits: "500 crédits IA/mois",
    proStatistics: "Statistiques et analyses",
    proCustomTheme: "Créateur de thèmes personnalisés",
    proAllThemes: "Tous les 15 thèmes + personnalisés",
    proAchievements: "Tous les achievements",
    proUnlimitedTeams: "Collaboration d'équipe illimitée",
    proTeamStats: "Statistiques d'équipe",
    premium: "Premium",
    premiumDesc: "Pour les entusiastes de la productivité",
    premiumAiCredits: "100 crédits IA/mois",
    premiumPomodoro: "Paramètres Pomodoro avancés",
    premiumNotes: "Notes et liste de souhaits",
    premiumThemes: "10 thèmes (Gratuits + Premium)",
    premiumAchievements: "Logros Premium",
    premiumTeams: "Collaboration d'équipe",
    premiumSharedTasks: "Tâches partagées",
    teamFeatures: "Collaboration d'équipe",
    prioritySupport: "Support prioritaire",
    customIntegrations: "Intégrations personnalisées",
    chooseFreePlan: "Plan Actuel",
    chooseProPlan: "Passer à Pro",
    choosePremiumPlan: "Passer à Premium",
    month: "/mois",
    year: "/an",
    blogTitle: "Blog et Ressources",
    blogDesc: "Découvrez des conseils, stratégies et idées pour booster votre productivité",
    blogPost1Title: "Maîtrisez la Technique Pomodoro",
    blogPost1Desc:
      "Apprenez à diviser votre travail en intervalles concentrés pour maximiser la productivité et éviter l'épuisement. Découvrez la science derrière cette méthode de gestion du temps.",
    blogPost1ReadTime: "5 min read",
    blogPost2Title: "Méthodes d'Étude Efficaces pour les Étudiants",
    blogPost2Desc:
      "Découvrez des techniques d'étude éprouvées, notamment la répétition espacée, le rappel actif et les cartes mentales pour améliorer la rétention et réussir vos examens.",
    blogPost2ReadTime: "7 min read",
    blogPost3Title: "Boostez la Productivité avec les Assistants IA",
    blogPost3Desc:
      "Explorez comment les outils d'IA peuvent vous aider à automatiser les tâches, générer des idées et rationaliser votre flux de travail pour accomplir plus en moins de temps.",
    blogPost3ReadTime: "6 min read",
    howItWorksTitle: "Comment ça marche",
    howItWorksDesc: "Commencez en quelques minutes avec notre plateforme simple et intuitive.",
    step1Title: "Inscription",
    step1Desc: "Créez votre compte gratuit en quelques secondes.",
    step2Title: "Organiser",
    step2Desc: "Ajoutez vos tâches et projets.",
    step3Title: "Collaborer",
    step3Desc: "Invitez votre équipe à travailler ensemble.",
    step4Title: "Réaliser",
    step4Desc: "Augmentez votre productivité et atteignez vos objectifs.",
    productivityTipsTitle: "Améliorez Votre Productivité",
    productivityTipsDesc: "Découvrez des astuces et stratégies concrètes pour en faire plus.",
    tip1Title: "Fixez des Objectifs Clairs",
    tip1Desc: "Définissez ce que vous voulez accomplir pour rester concentré et motivé.",
    tip2Title: "Utilisez la Technique Pomodoro",
    tip2Desc: "Travaillez par intervalles concentrés avec de courtes pauses pour maintenir votre concentration.",
    tip3Title: "Suivez Vos Progrès",
    tip3Desc: "Surveillez vos réalisations et identifiez les domaines à améliorer.",
    tip4Title: "Tirez Parti de l'Assistance IA",
    tip4Desc: "Laissez l'IA vous aider à automatiser les tâches et à optimiser votre flux de travail.",
    testimonialsTitle: "Ce Que Disent Nos Utilisateurs",
    testimonialsDesc: "Découvrez comment Future Task aide les gens à atteindre leurs objectifs.",
    testimonial1Role: "PDG chez Tech Solutions",
    testimonial1Text:
      "Future Task a révolutionné le flux de travail de notre équipe. Les fonctionnalités de collaboration sont fluides et l'assistance IA a considérablement augmenté notre efficacité.",
    testimonial2Role: "Étudiant à l'Université X",
    testimonial2Text:
      "En tant qu'étudiant, rester organisé est crucial. Future Task m'aide à gérer mes études, mes devoirs et mes projets personnels en un seul endroit. Le minuteur Pomodoro change la donne !",
    testimonial3Role: "Développeur Freelance",
    testimonial3Text:
      "J'adore la simplicité et la puissance de Future Task. Il m'aide à gérer plusieurs projets clients et échéances avec facilité. Les informations qu'il fournit sont inestimables.",
    faqTitle: "Questions Fréquemment Posées",
    faqDesc: "Trouvez des réponses aux questions courantes sur Future Task.",
    faq1Question: "Qu'est-ce que Future Task ?",
    faq1Answer:
      "Future Task est une plateforme de productivité intelligente conçue pour aider les individus et les équipes à gérer leurs tâches, à collaborer et à atteindre leurs objectifs plus efficacement grâce à une assistance IA.",
    faq2Question: "Existe-t-il un plan gratuit ?",
    faq2Answer:
      "Oui, nous proposons un plan gratuit avec des fonctionnalités essentielles, parfaites pour commencer. Vous pouvez passer à nos plans Pro ou Premium pour des capacités plus avancées.",
    faq3Question: "Comment fonctionne l'assistance IA ?",
    faq3Answer:
      "Notre assistant IA peut vous aider à automatiser les tâches, générer des idées, résumer du contenu et optimiser votre flux de travail. Les capacités varient en fonction de votre plan.",
    faq4Question: "Puis-je collaborer avec mon équipe ?",
    faq4Answer:
      "Absolument ! Future Task est conçu pour une collaboration d'équipe fluide, vous permettant de partager des projets, d'attribuer des tâches et de communiquer efficacement.",
    faq5Question: "Quelles sont les options de facturation ?",
    faq5Answer:
      "Nous proposons des options de facturation mensuelle et annuelle. La facturation annuelle offre une réduction significative par rapport à la facturation mensuelle.",
    share_your_review: "Partagez votre avis",
    write_review_description: "Aidez les autres en partageant votre expérience avec Future Task.",
    write_review_button: "Rédiger un avis",
    name: "Nom",
    email: "E-mail",
    rating: "Évaluation",
    enterName: "Entrez votre nom",
    enterEmail: "Entrez votre e-mail",
    yourReview: "Votre Avis",
    enterReview: "Entrez votre avis ici...",
    submitReview: "Soumettre l'Avis",
    nextGenerationPlatform: "Next Generation Platform",
    user_reviews_title: "Avis des Utilisateurs",
    reviews_from_community: "Avis de notre incroyable communauté",
    view_all_reviews: "Voir tous les avis",
    write_review: "Rédiger un avis",
    your_name: "Votre Nom",
    review_title: "Titre de l'avis",
    submit_review: "Soumettre l'avis",
    all_reviews: "Tous les avis",
    addReview: "Ajouter un Avis", // Added for the new button
    seeAndWriteReviews: "Voir et Écrire des Avis",
    footer_description: "Gestion intelligente des tâches avec assistance IA pour une productivité accrue.",
    footer_product: "Produit",
    footer_legal: "Légal",
    footer_terms: "Conditions d'Utilisation",
    footer_privacy: "Politique de Confidentialité",
    footer_support: "Support",
    footer_contact: "Contactez-nous",
    footer_copyright: "© 2025 Future Task. Tous droits réservés.",
    footer_terms_short: "Termes",
    footer_privacy_short: "Confidentialité",
    footer_contact_short: "Contact",
  },
  de: {
    features: "Funktionen",
    dashboard: "Dashboard",
    pricing: "Preise",
    about: "Über uns",
    login: "Anmelden",
    signup: "Registrieren",
    hero: "Intelligente Systeme, Nahtlos Zusammenarbeiten, Effizient Erfolgreich Sein",
    heroDesc:
      "Steigern Sie Ihre Produktivität mit intelligentem Aufgabenmanagement, KI-Unterstützung und nahtloser Zusammenarbeit",
    startNow: "Jetzt starten",
    learnMore: "Mehr erfahren",
    secure: "Sicher & Zuverlässig",
    secureDesc: "Unternehmenssicherheit für Ihre Daten",
    growth: "Wachstumsanalysen",
    growthDesc: "Echtzeit-Einblicke und Metriken",
    team: "Team-Zusammenarbeit",
    teamDesc: "Arbeiten Sie nahtlos zusammen",
    global: "Globale Reichweite",
    globalDesc: "Überall auf der Welt bereitstellen",
    ai: "KI-Gestützt",
    aiDesc: "Intelligente Automatisierung integriert",
    fast: "Blitzschnell",
    fastDesc: "Für Leistung optimiert",
    powerfulDashboard: "Leistungsstarkes Dashboard",
    dashboardDesc:
      "Überwachen Sie Ihre Metriken, verfolgen Sie die Leistung und treffen Sie datengestützte Entscheidungen mit unserer intuitiven Oberfläche.",
    tasksCompleted: "Erledigte Aufgaben",
    productivity: "Produktivität",
    timeSaved: "Zeit Gespart",
    pricingTitle: "Wählen Sie Ihren Plan",
    pricingDesc: "Wählen Sie den perfekten Plan für Ihre Bedürfnisse",
    monthly: "Monatlich",
    annually: "Jährlich",
    saveAnnually: "Sparen Sie 20% mit jährlicher Abrechnung",
    free: "Kostenlos",
    freeDesc: "Perfekt für den Einstieg",
    freeCalendar: "Voller Kalenderzugang",
    freeTasks: "Unbegrenzte Aufgaben",
    freePomodoro: "Grundlegender Pomodoro-Timer",
    freeThemes: "5 kostenlose Themen",
    freeAchievements: "Kostenlose Erfolge",
    freeNoTeams: "Keine Teamzusammenarbeit",
    aiCredits: "50 KI-Credits/Monat",
    basicTasks: "Basis-Aufgabenverwaltung",
    basicNotes: "Notizen & Wunschliste",
    basicPomodoro: "Pomodoro-Timer",
    pro: "Pro",
    proDesc: "Für Power-User",
    proAiCredits: "500 KI-Credits/Monat",
    proStatistics: "Statistiken & Analysen",
    proCustomTheme: "Benutzerdefinierte Themen-Creator",
    proAllThemes: "Alle 15 Themen + benutzerdefiniert",
    proAchievements: "Alle Erfolge",
    proUnlimitedTeams: "Unbegrenzte Teamzusammenarbeit",
    proTeamStats: "Team-Statistiken",
    premium: "Premium",
    premiumDesc: "Für Produktivitätsbegeisterte",
    premiumAiCredits: "100 KI-Credits/Monat",
    premiumPomodoro: "Erweiterte Pomodoro-Einstellungen",
    premiumNotes: "Notizen & Wunschliste",
    premiumThemes: "10 Themen (Kostenlos + Premium)",
    premiumAchievements: "Premium-Erfolge",
    premiumTeams: "Teamzusammenarbeit",
    premiumSharedTasks: "Gemeinsame Aufgaben",
    teamFeatures: "Team-Zusammenarbeit",
    prioritySupport: "Prioritäts-Support",
    customIntegrations: "Benutzerdefinierte Integrationen",
    chooseFreePlan: "Aktueller Plan",
    chooseProPlan: "Auf Pro upgraden",
    choosePremiumPlan: "Auf Premium upgraden",
    month: "/Monat",
    year: "/Jahr",
    blogTitle: "Blog & Ressourcen",
    blogDesc: "Entdecken Sie Tipps, Strategien und Erkenntnisse zur Steigerung Ihrer Produktivität",
    blogPost1Title: "Meistern Sie die Pomodoro-Technik",
    blogPost1Desc:
      "Lernen Sie, Ihre Arbeit in fokussierte Intervalle aufzuteilen, um die Produktivität zu maximieren und Burnout zu vermeiden. Entdecken Sie die Wissenschaft hinter dieser Zeitmanagement-Methode.",
    blogPost1ReadTime: "5 min read",
    blogPost2Title: "Effektive Lernmethoden für Studenten",
    blogPost2Desc:
      "Entdecken Sie bewährte Lerntechniken wie verteiltes Lernen, aktives Abrufen und Mind Mapping, um die Merkfähigkeit zu verbessern und Ihre Prüfungen zu bestehen.",
    blogPost2ReadTime: "7 min read",
    blogPost3Title: "Steigern Sie die Produktivität mit KI-Assistenten",
    blogPost3Desc:
      "Erkunden Sie, wie KI-Tools Ihnen helfen können, Aufgaben zu automatisieren, Ideen zu generieren und Ihren Arbeitsablauf zu optimieren, um in kürzerer Zeit mehr zu erreichen.",
    blogPost3ReadTime: "6 min read",
    howItWorksTitle: "So funktioniert's",
    howItWorksDesc: "Beginnen Sie in wenigen Minuten mit unserer einfachen und intuitiven Plattform.",
    step1Title: "Anmelden",
    step1Desc: "Erstellen Sie Ihr kostenloses Konto in Sekunden.",
    step2Title: "Organisieren",
    step2Desc: "Fügen Sie Ihre Aufgaben und Projekte hinzu.",
    step3Title: "Zusammenarbeiten",
    step3Desc: "Laden Sie Ihr Team zur Zusammenarbeit ein.",
    step4Title: "Erreichen",
    step4Desc: "Steigern Sie Ihre Produktivität und erreichen Sie Ihre Ziele.",
    productivityTipsTitle: "Steigern Sie Ihre Produktivität",
    productivityTipsDesc: "Entdecken Sie umsetzbare Tipps und Strategien, um mehr zu erledigen.",
    tip1Title: "Setzen Sie klare Ziele",
    tip1Desc: "Definieren Sie, was Sie erreichen möchten, um fokussiert und motiviert zu bleiben.",
    tip2Title: "Nutzen Sie die Pomodoro-Technik",
    tip2Desc: "Arbeiten Sie in fokussierten Intervallen mit kurzen Pausen, um die Konzentration aufrechtzuerhalten.",
    tip3Title: "Verfolgen Sie Ihren Fortschritt",
    tip3Desc: "Überwachen Sie Ihre Erfolge und identifizieren Sie Verbesserungsmöglichkeiten.",
    tip4Title: "Nutzen Sie KI-Unterstützung",
    tip4Desc:
      "Lassen Sie sich von KI bei der Automatisierung von Aufgaben und der Optimierung Ihres Arbeitsablaufs helfen.",
    testimonialsTitle: "Was unsere Benutzer sagen",
    testimonialsDesc: "Sehen Sie, wie Future Task Menschen hilft, ihre Ziele zu erreichen.",
    testimonial1Role: "CEO bei Tech Solutions",
    testimonial1Text:
      "Future Task hat den Workflow unseres Teams revolutioniert. Die Kollaborationsfunktionen sind nahtlos und die KI-Unterstützung hat unsere Effizienz erheblich gesteigert.",
    testimonial2Role: "Student an der Universität X",
    testimonial2Text:
      "Als Student ist es entscheidend, organisiert zu bleiben. Future Task hilft mir, mein Studium, meine Aufgaben und meine persönlichen Projekte an einem Ort zu verwalten. Der Pomodoro-Timer ist ein Game-Changer!",
    testimonial3Role: "Freiberuflicher Entwickler",
    testimonial3Text:
      "Ich liebe, wie intuitiv und leistungsstark Future Task ist. Es hilft mir, mehrere Kundenprojekte und Fristen mühelos zu verwalten. Die Einblicke, die es liefert, sind unbezahlbar.",
    faqTitle: "Häufig gestellte Fragen",
    faqDesc: "Finden Sie Antworten auf häufige Fragen zu Future Task.",
    faq1Question: "Was ist Future Task?",
    faq1Answer:
      "Future Task ist eine intelligente Produktivitätsplattform, die Einzelpersonen und Teams hilft, Aufgaben zu verwalten, zusammenzuarbeiten und ihre Ziele mit KI-gestützter Unterstützung effizienter zu erreichen.",
    faq2Question: "Gibt es einen kostenlosen Plan?",
    faq2Answer:
      "Ja, wir bieten einen kostenlosen Plan mit wesentlichen Funktionen, der sich perfekt für den Einstieg eignet. Sie können auf unsere Pro- oder Premium-Pläne für erweiterte Funktionen upgraden.",
    faq3Question: "Wie funktioniert die KI-Unterstützung?",
    faq3Answer:
      "Unser KI-Assistent kann Ihnen bei der Automatisierung von Aufgaben, der Ideenfindung, der Zusammenfassung von Inhalten und der Optimierung des Arbeitsablaufs helfen. Die Fähigkeiten variieren je nach Plan.",
    faq4Question: "Kann ich mit meinem Team zusammenarbeiten?",
    faq4Answer:
      "Absolut! Future Task ist für nahtlose Teamzusammenarbeit konzipiert, sodass Sie Projekte teilen, Aufgaben zuweisen und effektiv kommunizieren können.",
    faq5Question: "Welche Abrechnungsoptionen gibt es?",
    faq5Answer:
      "Wir bieten sowohl monatliche als auch jährliche Abrechnungsoptionen. Die jährliche Abrechnung bietet im Vergleich zur monatlichen Abrechnung einen erheblichen Rabatt.",
    share_your_review: "Teilen Sie Ihre Bewertung",
    write_review_description: "Helfen Sie anderen, indem Sie Ihre Erfahrungen mit Future Task teilen.",
    write_review_button: "Bewertung schreiben",
    name: "Name",
    email: "E-Mail",
    rating: "Bewertung",
    enterName: "Geben Sie Ihren Namen ein",
    enterEmail: "Geben Sie Ihre E-Mail ein",
    yourReview: "Ihre Bewertung",
    enterReview: "Geben Sie Ihre Bewertung hier ein...",
    submitReview: "Bewertung senden",
    nextGenerationPlatform: "Next Generation Platform",
    user_reviews_title: "Benutzerbewertungen",
    reviews_from_community: "Bewertungen aus unserer großartigen Community",
    view_all_reviews: "Alle Bewertungen anzeigen",
    write_review: "Bewertung schreiben",
    your_name: "Ihr Name",
    review_title: "Titel der Bewertung",
    submit_review: "Bewertung absenden",
    all_reviews: "Alle Bewertungen",
    addReview: "Bewertung Hinzufügen", // Added for the new button
    seeAndWriteReviews: "Bewertungen Ansehen & Schreiben",
    footer_description:
      "Intelligentes Aufgabenmanagement mit KI-gestützter Unterstützung für verbesserte Produktivität.",
    footer_product: "Produkt",
    footer_legal: "Rechtliches",
    footer_terms: "Nutzungsbedingungen",
    footer_privacy: "Datenschutzrichtlinie",
    footer_support: "Support",
    footer_contact: "Kontaktieren Sie uns",
    footer_copyright: "© 2025 Future Task. Alle Rechte vorbehalten.",
    footer_terms_short: "Bedingungen",
    footer_privacy_short: "Datenschutz",
    footer_contact_short: "Kontakt",
  },
  it: {
    features: "Funzionalità",
    dashboard: "Dashboard",
    pricing: "Prezzi",
    about: "Chi siamo",
    login: "Accedi",
    signup: "Registrati",
    hero: "Sistemi Intelligenti, Collabora Senza Sforzo, Raggiungi il Successo Efficacemente",
    heroDesc:
      "Potenzia la tua produttività con gestione intelligente delle attività, assistenza IA e collaborazione fluida",
    startNow: "Inizia ora",
    learnMore: "Scopri di più",
    secure: "Sicuro e Affidabile",
    secureDesc: "Sicurezza di livello aziendale per i tuoi dati",
    growth: "Analisi di Crescita",
    growthDesc: "Informazioni e metriche in tempo reale",
    team: "Collaborazione di Team",
    teamDesc: "Lavora insieme senza sforzo",
    global: "Scala Globale",
    globalDesc: "Distribuisci ovunque nel mondo",
    ai: "Alimentato da IA",
    aiDesc: "Automazione intelligente integrata",
    fast: "Velocissimo",
    fastDesc: "Ottimizzato per le prestazioni",
    powerfulDashboard: "Dashboard Potente",
    dashboardDesc:
      "Monitora le tue metriche, traccia le prestazioni e prendi decisioni basate sui dati con la nostra interfaccia intuitiva.",
    tasksCompleted: "Attività Completate",
    productivity: "Produttività",
    timeSaved: "Tempo Risparmiato",
    pricingTitle: "Scegli il Tuo Piano",
    pricingDesc: "Seleziona il piano perfetto per le tue esigenze",
    monthly: "Mensile",
    annually: "Annuale",
    saveAnnually: "Risparmia il 20% con fatturazione annuale",
    free: "Gratuito",
    freeDesc: "Perfetto per iniziare",
    freeCalendar: "Accesso completo al calendario",
    freeTasks: "Attività illimitate",
    freePomodoro: "Timer Pomodoro di base",
    freeThemes: "5 temi gratuiti",
    freeAchievements: "Erogazioni gratuite",
    freeNoTeams: "Nessuna collaborazione di team",
    aiCredits: "50 crediti IA/mese",
    basicTasks: "Gestione attività base",
    basicNotes: "Note e lista desideri",
    basicPomodoro: "Timer Pomodoro",
    pro: "Pro",
    proDesc: "Per utenti esperti",
    proAiCredits: "500 crediti IA/mes",
    proStatistics: "Statistiche & Analisi",
    proCustomTheme: "Creatore di temi personalizzato",
    proAllThemes: "Tutti i 15 temi + personalizzato",
    proAchievements: "Tutte le erogazioni",
    proUnlimitedTeams: "Collaborazione illimitata di team",
    proTeamStats: "Statistiche di team",
    premium: "Premium",
    premiumDesc: "Per entusiasti della produttività",
    premiumAiCredits: "100 crediti IA/mese",
    premiumPomodoro: "Impostazioni Pomodoro avanzate",
    premiumNotes: "Note e lista desideri",
    premiumThemes: "10 temi ( gratuiti + Premium)",
    premiumAchievements: "Erogazioni Premium",
    premiumTeams: "Collaborazione di team",
    premiumSharedTasks: "Attività condivise",
    teamFeatures: "Collaborazione di team",
    prioritySupport: "Supporto prioritario",
    customIntegrations: "Integrazioni personalizzate",
    chooseFreePlan: "Piano Attuale",
    chooseProPlan: "Passa a Pro",
    choosePremiumPlan: "Passa a Premium",
    month: "/mese",
    year: "/anno",
    blogTitle: "Blog e Risorse",
    blogDesc: "Scopri consigli, strategie e intuizioni per aumentare la tua produttività",
    blogPost1Title: "Padroneggia la Tecnica Pomodoro",
    blogPost1Desc:
      "Impara a dividere il tuo lavoro in intervalli concentrati per massimizzare la produttività ed evitare il burnout. Scopri la scienza dietro questo metodo di gestione del tempo.",
    blogPost1ReadTime: "5 min read",
    blogPost2Title: "Metodi di Studio Efficaci per Studenti",
    blogPost2Desc:
      "Scopri tecniche di studio comprovate tra cui ripetizione spaziata, richiamo attivo e mappe mentali per migliorare la ritenzione e superare gli esami.",
    blogPost2ReadTime: "7 min read",
    blogPost3Title: "Aumenta la Produttività con Assistenti IA",
    blogPost3Desc:
      "Esplora come gli strumenti di IA possono aiutarti ad automatizzare le attività, generare idee e ottimizzare il tuo flusso di lavoro per ottenere di più in meno tempo.",
    blogPost3ReadTime: "6 min read",
    howItWorksTitle: "Come Funziona",
    howItWorksDesc: "Inizia in pochi minuti con la nostra piattaforma semplice e intuitiva.",
    step1Title: "Registrati",
    step1Desc: "Crea il tuo account gratuito in pochi secondi.",
    step2Title: "Organizza",
    step2Desc: "Aggiungi le tue attività e progetti.",
    step3Title: "Collabora",
    step3Desc: "Invita il tuo team a lavorare insieme.",
    step4Title: "Realizza",
    step4Desc: "Aumenta la tua produttività e raggiungi i tuoi obiettivi.",
    productivityTipsTitle: "Aumenta la Tua Produttività",
    productivityTipsDesc: "Scopri consigli e strategie attuabili per fare di più.",
    tip1Title: "Stabilisci Obiettivi Chiari",
    tip1Desc: "Definisci cosa vuoi realizzare per rimanere concentrato e motivato.",
    tip2Title: "Usa la Tecnica Pomodoro",
    tip2Desc: "Lavora in intervalli concentrati con brevi pause per mantenere la concentrazione.",
    tip3Title: "Tieni Traccia dei Tuoi Progressi",
    tip3Desc: "Monitora i tuoi successi e identifica le aree di miglioramento.",
    tip4Title: "Sfrutta l'Assistenza IA",
    tip4Desc: "Lascia che l'IA ti aiuti ad automatizzare le attività e a ottimizzare il tuo flusso di lavoro.",
    testimonialsTitle: "Cosa Dicono i Nostri Utenti",
    testimonialsDesc: "Scopri come Future Task sta aiutando le persone a raggiungere i propri obiettivi.",
    testimonial1Role: "CEO presso Tech Solutions",
    testimonial1Text:
      "Future Task ha rivoluzionato il flusso di lavoro del nostro team. Le funzionalità di collaborazione sono impeccabili e l'assistenza IA ha notevolmente aumentato la nostra efficienza.",
    testimonial2Role: "Studente presso University X",
    testimonial2Text:
      "Come studente, rimanere organizzato è fondamentale. Future Task mi aiuta a gestire i miei studi, i compiti e i progetti personali in un unico posto. Il timer Pomodoro è un punto di svolta!",
    testimonial3Role: "Sviluppatore Freelance",
    testimonial3Text:
      "Adoro quanto sia intuitivo e potente Future Task. Mi aiuta a gestire facilmente più progetti cliente e scadenze. Le informazioni che fornisce sono inestimabili.",
    faqTitle: "Domande Frequenti",
    faqDesc: "Trova risposte alle domande comuni su Future Task.",
    faq1Question: "Cos'è Future Task?",
    faq1Answer:
      "Future Task è una piattaforma di produttività intelligente progettata per aiutare individui e team a gestire attività, collaborare e raggiungere i propri obiettivi in modo più efficiente con assistenza basata sull'IA.",
    faq2Question: "Esiste un plan gratuito?",
    faq2Answer:
      "Sì, offriamo un piano gratuito con funzionalità essenziali perfette per iniziare. Puoi passare ai nostri piani Pro o Premium per capacità più avanzate.",
    faq3Question: "Come funziona l'assistenza IA?",
    faq3Answer:
      "Il nostro assistente IA può aiutarti con l'automazione delle attività, la generazione di idee, il riassunto di contenuti e l'ottimizzazione del flusso di lavoro. Le capacità variano in base al tuo piano.",
    faq4Question: "Posso collaborare con il mio team?",
    faq4Answer:
      "Assolutamente! Future Task è costruito per una collaborazione di team fluida, permettendoti di condividere progetti, assegnare attività e comunicare in modo efficace.",
    faq5Question: "Quali sono le opzioni di fatturazione?",
    faq5Answer:
      "Offriamo opzioni di fatturazione mensile e annuale. La fatturazione annuale offre uno sconto significativo rispetto alla fatturazione mensile.",
    share_your_review: "Condividi la tua recensione",
    write_review_description: "Aiuta gli altri condividendo la tua esperienza con Future Task.",
    write_review_button: "Scrivi una recensione",
    name: "Nome",
    email: "Email",
    rating: "Valutazione",
    enterName: "Inserisci il tuo nome",
    enterEmail: "Inserisci la tua email",
    yourReview: "La tua recensione",
    enterReview: "Inserisci la tua recensione qui...",
    submitReview: "Invia Recensione",
    nextGenerationPlatform: "Next Generation Platform",
    user_reviews_title: "Recensioni Utenti",
    reviews_from_community: "Recensioni dalla nostra fantastica community",
    view_all_reviews: "Visualizza Tutte le Recensioni",
    write_review: "Scrivi una recensione",
    your_name: "Il tuo nome",
    review_title: "Titolo della recensione",
    submit_review: "Invia recensione",
    all_reviews: "Tutte le recensioni",
    addReview: "Aggiungi Recensione", // Added for the new button
    seeAndWriteReviews: "Visualizza e Scrivi Recensioni",
    footer_description: "Gestione attività intelligente con assistenza AI per una maggiore produttività.",
    footer_product: "Prodotto",
    footer_legal: "Legale",
    footer_terms: "Termini di Servizio",
    footer_privacy: "Informativa sulla Privacy",
    footer_support: "Supporto",
    footer_contact: "Contattaci",
    footer_copyright: "© 2025 Future Task. Tutti i diritti riservati.",
    footer_terms_short: "Termini",
    footer_privacy_short: "Privacy",
    footer_contact_short: "Contatto",
  },
  nextGenerationPlatform: "Next Generation Platform",
}

type Language = "en" | "es" | "fr" | "de" | "it"

export default function HomePageClient() {
  const router = useRouter() // Initialize useRouter
  const [lang, setLang] = useState<Language>("en")
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annually">("monthly")

  const [language, setLanguage] = useState<Language>("en")
  const [theme, setTheme] = useState<"light" | "dark">("light") // Assuming a theme state

  // State for review modal
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [newReview, setNewReview] = useState({ name: "", title: "", rating: 5, comment: "" }) // State for new review input
  const [isAllReviewsModalOpen, setIsAllReviewsModalOpen] = useState(false) // State for all reviews modal
  const [isWriteReviewModalOpen, setIsWriteReviewModalOpen] = useState(false) // State for write review modal
  const [currentReviewPage, setCurrentReviewPage] = useState(0) // State for current review page
  const [showReviewModal, setShowReviewModal] = useState(false) // New state for review modal visibility

  // Mock function to submit a review
  const handleSubmitReview = () => {
    console.log("Submitting review:", newReview)
    // In a real app, you would send this data to an API
    setIsReviewModalOpen(false)
    setNewReview({ name: "", title: "", rating: 5, comment: "" }) // Reset form
    setShowReviewModal(false) // Close the modal after submission
  }

  useEffect(() => {
    // Load language from localStorage or user profile
    const savedLanguage = localStorage.getItem("userLanguage") as Language | null
    if (savedLanguage) {
      setLanguage(savedLanguage)
    } else {
      // Try to detect from browser language
      const browserLang = navigator.language.split("-")[0] as Language
      if (["en", "es", "fr", "de", "it"].includes(browserLang)) {
        setLanguage(browserLang)
      }
    }
  }, [])

  const t = (
    key:
      | keyof typeof translations.en
      | "nextGenerationPlatform"
      | "share_your_review"
      | "write_review_description"
      | "write_review_button"
      | "name"
      | "email"
      | "rating"
      | "enterName"
      | "enterEmail"
      | "yourReview"
      | "enterReview"
      | "submitReview"
      | "user_reviews_title"
      | "reviews_from_community"
      | "view_all_reviews"
      | "write_review"
      | "your_name"
      | "review_title"
      | "submit_review"
      | "all_reviews"
      | "addReview"
      | "footer_description" // Added
      | "footer_product" // Added
      | "footer_legal" // Added
      | "footer_terms" // Added
      | "footer_privacy" // Added
      | "footer_support" // Added
      | "footer_contact" // Added
      | "footer_copyright" // Added
      | "footer_terms_short" // Added
      | "footer_privacy_short" // Added
      | "footer_contact_short", // Added
  ): string => {
    // Cast key to be compatible with translations[language] and translations.en
    const typedKey = key as
      | keyof typeof translations.en
      | "share_your_review"
      | "write_review_description"
      | "write_review_button"
      | "name"
      | "email"
      | "rating"
      | "enterName"
      | "enterEmail"
      | "yourReview"
      | "enterReview"
      | "submitReview"
      | "user_reviews_title"
      | "reviews_from_community"
      | "view_all_reviews"
      | "write_review"
      | "your_name"
      | "review_title"
      | "submit_review"
      | "all_reviews"
      | "addReview"
      | "footer_description" // Added
      | "footer_product" // Added
      | "footer_legal" // Added
      | "footer_terms" // Added
      | "footer_privacy" // Added
      | "footer_support" // Added
      | "footer_contact" // Added
      | "footer_copyright" // Added
      | "footer_terms_short" // Added
      | "footer_privacy_short" // Added
      | "footer_contact_short" // Added
    return translations[language]?.[typedKey] || translations.en[typedKey] || key
  }

  const prices = {
    free: { monthly: 0, annually: 0 },
    pro: { monthly: 6.49, annually: 64.9 },
    premium: { monthly: 2.49, annually: 24.99 },
  }

  return (
    <div className={theme === "dark" ? "bg-gray-900" : "bg-background text-foreground"}>
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-bold">FT</span>
            </div>
            <span className="text-xl font-bold">Future Task</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm hover:text-foreground transition-colors">
              {t("features")}
            </a>
            <a href="#dashboard" className="text-sm hover:text-foreground transition-colors">
              {t("dashboard")}
            </a>
            <a href="#pricing" className="text-sm hover:text-foreground transition-colors">
              {t("pricing")}
            </a>
            <a href="#about" className="text-sm hover:text-foreground transition-colors">
              {t("about")}
            </a>
            <Link href="/blog" className="text-sm hover:text-foreground transition-colors">
              {t("blogTitle")}
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Select
              value={language}
              onValueChange={(v) => {
                const newLang = v as Language
                setLanguage(newLang)
                localStorage.setItem("userLanguage", newLang)
              }}
            >
              <SelectTrigger className="w-[70px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">EN</SelectItem>
                <SelectItem value="es">ES</SelectItem>
                <SelectItem value="fr">FR</SelectItem>
                <SelectItem value="de">DE</SelectItem>
                <SelectItem value="it">IT</SelectItem>
              </SelectContent>
            </Select>
            <Link href="/login">
              <Button variant="ghost" size="sm">
                {t("login")}
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="neon-glow-hover">
                {t("signup")}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32 relative">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-block px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-sm mb-4">
            <span className="text-primary">✨ {t("nextGenerationPlatform")}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
            <span className="text-balance block">
              {t("hero")
                .split(" ")
                .map((word, idx) => {
                  // Make "Collaborate" appear in primary color with neon effect
                  const heroWords = t("hero").split(" ")
                  const collaborateWordIndex = heroWords.findIndex(
                    (w) => w.toLowerCase().includes("collabor") || w.toLowerCase().includes("colabor"),
                  )

                  return (
                    <span key={idx}>
                      {idx === collaborateWordIndex ? <span className="text-primary neon-text">{word}</span> : word}
                      {idx < t("hero").split(" ").length - 1 ? " " : ""}
                    </span>
                  )
                })}
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">{t("heroDesc")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/signup">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg shadow-primary/50 hover:shadow-xl hover:shadow-primary/60 transition-all duration-300 group font-semibold text-lg px-8">
                {t("startNow")}
                <svg
                  className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="border-2 border-primary/60 text-primary hover:bg-primary/10 rounded-xl shadow-md hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 font-semibold text-lg px-8">
                {t("learnMore")}
              </Button>
            </Link>
          </div>
        </div>

        {/* Glow Effect */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -z-10" />
      </section>

      {/* Features Grid */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: "🛡️", title: t("secure"), desc: t("secureDesc") },
            { icon: "📈", title: t("growth"), desc: t("growthDesc") },
            { icon: "👥", title: t("team"), desc: t("teamDesc") },
            { icon: "🌍", title: t("global"), desc: t("globalDesc") },
            { icon: "✨", title: t("ai"), desc: t("aiDesc") },
            { icon: "⚡", title: t("fast"), desc: t("fastDesc") },
          ].map((feature, i) => (
            <Card
              key={i}
              className="bg-card border border-border hover:border-primary/60 p-6 rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 cursor-pointer group h-full"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform drop-shadow-lg">{feature.icon}</div>
              <h3 className="text-lg font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Dashboard Preview */}
      <section id="dashboard" className="container mx-auto px-4 py-20">
        <Card className="bg-card border border-border p-8 rounded-2xl shadow-xl">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-foreground">{t("powerfulDashboard")}</h2>
              <p className="text-muted-foreground text-lg">{t("dashboardDesc")}</p>
              <div className="space-y-3 pt-4">
                {[
                  { label: t("tasksCompleted"), value: "156", change: "+12.5%" },
                  { label: t("productivity"), value: "94%", change: "+8.3%" },
                  { label: t("timeSaved"), value: "24h", change: "+15.2%" },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-primary/10 border border-primary/30 hover:border-primary/60 hover:shadow-md hover:shadow-primary/20 transition-all duration-300">
                    <span className="text-sm font-medium text-foreground">{stat.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg">{stat.value}</span>
                      <span className="text-sm font-semibold text-primary bg-primary/20 px-2 py-1 rounded-md">{stat.change}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative h-[300px] rounded-xl bg-gradient-to-br from-primary/20 via-secondary/10 to-transparent border-2 border-primary/40 flex items-center justify-center overflow-hidden">
              <div className="text-8xl opacity-40">📊</div>
              <div
                className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiHEhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGg``ZD0iTSAxMC






                    0IEwgMCA0MC
                    0IDEwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMTg0LDI1NSw3OCwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAl"
              />
            </div>
          </div>
        </Card>
      </section>

      {/* How It Works Section - Adding educational content for AdSense */}
      <section id="how-it-works" className="container mx-auto px-4 py-20 bg-secondary/10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">{t("howItWorksTitle")}</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">{t("howItWorksDesc")}</p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          <Card className="glass-card p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">1️⃣</span>
            </div>
            <h3 className="text-lg font-bold mb-3">{t("step1Title")}</h3>
            <p className="text-sm text-muted-foreground">{t("step1Desc")}</p>
          </Card>

          <Card className="glass-card p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">2️⃣</span>
            </div>
            <h3 className="text-lg font-bold mb-3">{t("step2Title")}</h3>
            <p className="text-sm text-muted-foreground">{t("step2Desc")}</p>
          </Card>

          <Card className="glass-card p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">3️⃣</span>
            </div>
            <h3 className="text-lg font-bold mb-3">{t("step3Title")}</h3>
            <p className="text-sm text-muted-foreground">{t("step3Desc")}</p>
          </Card>

          <Card className="glass-card p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">4️⃣</span>
            </div>
            <h3 className="text-lg font-bold mb-3">{t("step4Title")}</h3>
            <p className="text-sm text-muted-foreground">{t("step4Desc")}</p>
          </Card>
        </div>
      </section>

      <section id="pricing" className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">{t("pricingTitle")}</h2>
          <p className="text-muted-foreground mb-6">{t("pricingDesc")}</p>

          {/* Billing Period Toggle */}
          <div className="inline-flex items-center gap-3 p-1 rounded-lg bg-secondary/50 border border-border/50">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                billingPeriod === "monthly"
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("monthly")}
            </button>
            <button
              onClick={() => setBillingPeriod("annually")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                billingPeriod === "annually"
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("annually")}
            </button>
          </div>
          {billingPeriod === "annually" && <p className="text-sm text-primary mt-3 font-medium">{t("saveAnnually")}</p>}
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Free Plan */}
          <Card className="glass-card p-6 neon-glow-hover transition-all duration-300">
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold mb-2">{t("free")}</h3>
                <p className="text-sm text-muted-foreground mb-4">{t("freeDesc")}</p>
                <div className="text-4xl font-bold mb-1">€{prices.free[billingPeriod]}</div>
                <div className="text-sm text-muted-foreground">
                  {billingPeriod === "monthly" ? t("month") : t("year")}
                </div>
              </div>
              <ul className="space-y-3 pt-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span className="text-sm">{t("freeCalendar")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span className="text-sm">{t("freeTasks")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span className="text-sm">{t("freePomodoro")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span className="text-sm">{t("freeThemes")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span className="text-sm">{t("freeAchievements")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-1">✗</span>
                  <span className="text-sm text-muted-foreground">{t("freeNoTeams")}</span>
                </li>
              </ul>
              <Link href="/signup">
                <Button className="w-full mt-6 bg-transparent" variant="outline">
                  {t("chooseFreePlan")}
                </Button>
              </Link>
            </div>
          </Card>

          {/* Premium Plan */}
          <Card className="glass-card p-6 neon-glow border-primary/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
              POPULAR
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold mb-2">{t("premium")}</h3>
                <p className="text-sm text-muted-foreground mb-4">{t("premiumDesc")}</p>
                <div className="text-4xl font-bold mb-1">€{prices.premium[billingPeriod]}</div>
                <div className="text-sm text-muted-foreground">
                  {billingPeriod === "monthly" ? t("month") : t("year")}
                </div>
              </div>
              <ul className="space-y-3 pt-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span className="text-sm">{t("premiumAiCredits")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span className="text-sm">{t("premiumPomodoro")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span className="text-sm">{t("premiumNotes")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span className="text-sm">{t("premiumThemes")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span className="text-sm">{t("premiumAchievements")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span className="text-sm">{t("premiumTeams")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span className="text-sm">{t("premiumSharedTasks")}</span>
                </li>
              </ul>
              <Link href="/signup">
                <Button className="w-full mt-6 neon-glow-hover">{t("choosePremiumPlan")}</Button>
              </Link>
            </div>
          </Card>

          {/* Pro Plan */}
          <Card className="glass-card p-6 neon-glow-hover transition-all duration-300">
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold mb-2">{t("pro")}</h3>
                <p className="text-sm text-muted-foreground mb-4">{t("proDesc")}</p>
                <div className="text-4xl font-bold mb-1">€{prices.pro[billingPeriod]}</div>
                <div className="text-sm text-muted-foreground">
                  {billingPeriod === "monthly" ? t("month") : t("year")}
                </div>
              </div>
              <ul className="space-y-3 pt-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span className="text-sm">{t("proAiCredits")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span className="text-sm">{t("proStatistics")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span className="text-sm">{t("proCustomTheme")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span className="text-sm">{t("proAllThemes")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span className="text-sm">{t("proAchievements")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span className="text-sm">{t("proUnlimitedTeams")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span className="text-sm">{t("proTeamStats")}</span>
                </li>
              </ul>
              <Link href="/signup">
                <Button className="w-full mt-6 bg-transparent" variant="outline">
                  {t("chooseProPlan")}
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* Productivity Tips Section - Adding educational content */}
      <section id="tips" className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-6 text-center">{t("productivityTipsTitle")}</h2>
          <p className="text-muted-foreground text-center mb-12 text-lg">{t("productivityTipsDesc")}</p>

          <div className="space-y-6">
            <Card className="glass-card p-6">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="text-primary">🎯</span>
                {t("tip1Title")}
              </h3>
              <p className="text-muted-foreground leading-relaxed">{t("tip1Desc")}</p>
            </Card>

            <Card className="glass-card p-6">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="text-primary">🍅</span>
                {t("tip2Title")}
              </h3>
              <p className="text-muted-foreground leading-relaxed">{t("tip2Desc")}</p>
            </Card>

            <Card className="glass-card p-6">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="text-primary">📊</span>
                {t("tip3Title")}
              </h3>
              <p className="text-muted-foreground leading-relaxed">{t("tip3Desc")}</p>
            </Card>

            <Card className="glass-card p-6">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span className="text-primary">🤖</span>
                {t("tip4Title")}
              </h3>
              <p className="text-muted-foreground leading-relaxed">{t("tip4Desc")}</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Adding social proof content */}
      <section id="testimonials" className="container mx-auto px-4 py-20 bg-secondary/10">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">{t("testimonialsTitle")}</h2>
          <p className="text-muted-foreground">{t("testimonialsDesc")}</p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Testimonials Carousel - 3 fake testimonials */}
          <div className="flex flex-col gap-8">
            <div
              id="testimonials-carousel"
              className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory flex-1 scroll-smooth scrollbar-hide justify-center"
            >
              {/* Testimonial 1 */}
              <Card className="glass-card p-6 flex-shrink-0 w-80 snap-center">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-xl">👨‍💼</span>
                  </div>
                  <div>
                    <div className="font-semibold">John D.</div>
                    <div className="text-sm text-muted-foreground">{t("testimonial1Role")}</div>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-primary">
                      ⭐
                    </span>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground italic">"{t("testimonial1Text")}"</p>
              </Card>

              {/* Testimonial 2 */}
              <Card className="glass-card p-6 flex-shrink-0 w-80 snap-center">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-xl">👩‍💻</span>
                  </div>
                  <div>
                    <div className="font-semibold">Sarah M.</div>
                    <div className="text-sm text-muted-foreground">{t("testimonial2Role")}</div>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-primary">
                      ⭐
                    </span>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground italic">"{t("testimonial2Text")}"</p>
              </Card>

              {/* Testimonial 3 */}
              <Card className="glass-card p-6 flex-shrink-0 w-80 snap-center">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-xl">👨‍💻</span>
                  </div>
                  <div>
                    <div className="font-semibold">Emma K.</div>
                    <div className="text-sm text-muted-foreground">{t("testimonial3Role")}</div>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-primary">
                      ⭐
                    </span>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground italic">"{t("testimonial3Text")}"</p>
              </Card>
            </div>

            <div className="flex justify-center">
              <a
                href={`https://${language === "es" ? "es" : language === "fr" ? "fr" : language === "de" ? "de" : language === "it" ? "it" : "www"}.trustpilot.com/review/future-task.com`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground px-8 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 neon-glow-hover"
              >
                {t("seeAndWriteReviews")}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section - Adding FAQ content for SEO */}
      <section id="faq" className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-4 text-center">{t("faqTitle")}</h2>
          <p className="text-muted-foreground text-center mb-12">{t("faqDesc")}</p>

          <div className="space-y-4">
            <Card className="glass-card p-6">
              <h3 className="text-lg font-bold mb-2">{t("faq1Question")}</h3>
              <p className="text-muted-foreground">{t("faq1Answer")}</p>
            </Card>

            <Card className="glass-card p-6">
              <h3 className="text-lg font-bold mb-2">{t("faq2Question")}</h3>
              <p className="text-muted-foreground">{t("faq2Answer")}</p>
            </Card>

            <Card className="glass-card p-6">
              <h3 className="text-lg font-bold mb-2">{t("faq3Question")}</h3>
              <p className="text-muted-foreground">{t("faq3Answer")}</p>
            </Card>

            <Card className="glass-card p-6">
              <h3 className="text-lg font-bold mb-2">{t("faq4Question")}</h3>
              <p className="text-muted-foreground">{t("faq4Answer")}</p>
            </Card>

            <Card className="glass-card p-6">
              <h3 className="text-lg font-bold mb-2">{t("faq5Question")}</h3>
              <p className="text-muted-foreground">{t("faq5Answer")}</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section id="blog" className="container mx-auto px-4 py-12 md:py-20 bg-secondary/20">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-4xl font-bold mb-4">{t("blogTitle")}</h2>
          <p className="text-sm md:text-base text-muted-foreground">{t("blogDesc")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Blog Post 1 - Pomodoro Technique */}
          <Link href="/blog/pomodoro-technique">
            <Card className="glass-card overflow-hidden neon-glow-hover transition-all duration-300 cursor-pointer group">
              <div className="h-48 bg-gradient-to-br from-primary/30 to-primary/10 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-40">🍅</div>
              </div>
              <div className="p-6 space-y-3">
                <div className="text-xs text-primary font-semibold uppercase tracking-wide">
                  {lang === "en" && "Productivity"}
                  {lang === "es" && "Productividad"}
                  {lang === "fr" && "Productivité"}
                  {lang === "de" && "Produktivität"}
                  {lang === "it" && "Produttività"}
                </div>
                <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{t("blogPost1Title")}</h3>
                <p className="text-sm text-muted-foreground line-clamp-3">{t("blogPost1Desc")}</p>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-muted-foreground">{t("blogPost1ReadTime")}</span>
                  <span className="text-primary text-sm font-medium group-hover:translate-x-1 transition-transform inline-block">
                    →
                  </span>
                </div>
              </div>
            </Card>
          </Link>

          {/* Blog Post 2 - Study Techniques */}
          <Link href="/blog/study-methods">
            <Card className="glass-card overflow-hidden neon-glow-hover transition-all duration-300 cursor-pointer group">
              <div className="h-48 bg-gradient-to-br from-blue-500/30 to-blue-500/10 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-40">📚</div>
              </div>
              <div className="p-6 space-y-3">
                <div className="text-xs text-blue-400 font-semibold uppercase tracking-wide">
                  {lang === "en" && "Study Tips"}
                  {lang === "es" && "Consejos de Estudio"}
                  {lang === "fr" && "Conseils d'Étude"}
                  {lang === "de" && "Lerntipps"}
                  {lang === "it" && "Consigli di Studio"}
                </div>
                <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{t("blogPost2Title")}</h3>
                <p className="text-sm text-muted-foreground line-clamp-3">{t("blogPost2Desc")}</p>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-muted-foreground">{t("blogPost2ReadTime")}</span>
                  <span className="text-primary text-sm font-medium group-hover:translate-x-1 transition-transform inline-block">
                    →
                  </span>
                </div>
              </div>
            </Card>
          </Link>

          {/* Blog Post 3 - AI Productivity */}
          <Link href="/blog/ai-productivity">
            <Card className="glass-card overflow-hidden neon-glow-hover transition-all duration-300 cursor-pointer group">
              <div className="h-48 bg-gradient-to-br from-purple-500/30 to-purple-500/10 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-40">🤖</div>
              </div>
              <div className="p-6 space-y-3">
                <div className="text-xs text-purple-400 font-semibold uppercase tracking-wide">
                  {lang === "en" && "AI & Automation"}
                  {lang === "es" && "IA y Automatización"}
                  {lang === "fr" && "IA et Automatisation"}
                  {lang === "de" && "KI & Automatisierung"}
                  {lang === "it" && "IA e Automazione"}
                </div>
                <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{t("blogPost3Title")}</h3>
                <p className="text-sm text-muted-foreground line-clamp-3">{t("blogPost3Desc")}</p>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-muted-foreground">{t("blogPost3ReadTime")}</span>
                  <span className="text-primary text-sm font-medium group-hover:translate-x-1 transition-transform inline-block">
                    →
                  </span>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-12 md:mt-20">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">FT</span>
                </div>
                <span className="font-semibold">Future Task</span>
              </div>
              <p className="text-sm text-muted-foreground">{t("footer_description")}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">{t("footer_product")}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#features" className="hover:text-foreground transition-colors">
                    {t("features")}
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-foreground transition-colors">
                    {t("pricing")}
                  </a>
                </li>
                <li>
                  <Link href="/app" className="hover:text-foreground transition-colors">
                    {t("dashboard")}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">{t("footer_legal")}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/terms" className="hover:text-foreground transition-colors">
                    {t("footer_terms")}
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-foreground transition-colors">
                    {t("footer_privacy")}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">{t("footer_support")}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/contact" className="hover:text-foreground transition-colors">
                    {t("footer_contact")}
                  </Link>
                </li>
                <li>
                  <a href="mailto:support@future-task.com" className="hover:text-foreground transition-colors">
                    support@future-task.com
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/50 pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs md:text-sm text-muted-foreground text-center md:text-left">{t("footer_copyright")}</p>
            <div className="flex gap-4 md:gap-6 text-xs md:text-sm text-muted-foreground">
              <Link href="/terms" className="hover:text-foreground transition-colors">
                {t("footer_terms_short")}
              </Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                {t("footer_privacy_short")}
              </Link>
              <Link href="/contact" className="hover:text-foreground transition-colors">
                {t("footer_contact_short")}
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Cookie Banner */}
      <CookieBanner language={language} />

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="glass-card w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">{t("write_review")}</h2>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-2xl"
              >
                ✕
              </button>
            </div>
            <input
              type="text"
              placeholder={t("your_name")}
              value={newReview.name}
              onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
              className="w-full px-4 py-2 bg-secondary/20 border border-primary/20 rounded-lg focus:outline-none focus:border-primary"
            />
            <input
              type="text"
              placeholder={t("review_title")}
              value={newReview.title}
              onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
              className="w-full px-4 py-2 bg-secondary/20 border border-primary/20 rounded-lg focus:outline-none focus:border-primary"
            />
            <textarea
              placeholder={t("your_review")}
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              className="w-full px-4 py-2 bg-secondary/20 border border-primary/20 rounded-lg focus:outline-none focus:border-primary min-h-32"
            />
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setNewReview({ ...newReview, rating: star })}
                  className={`text-3xl cursor-pointer ${newReview.rating >= star ? "text-primary" : "text-muted-foreground"}`}
                >
                  ⭐
                </button>
              ))}
            </div>
            <Button onClick={handleSubmitReview} className="w-full bg-primary hover:bg-primary/90">
              {t("submit_review")}
            </Button>
          </Card>
        </div>
      )}

      {/* Write Review Modal */}
      {isWriteReviewModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="glass-card w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">{t("write_review")}</h2>
              <button
                onClick={() => setIsWriteReviewModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-2xl"
              >
                ✕
              </button>
            </div>
            <input
              type="text"
              placeholder={t("your_name")}
              value={newReview.name}
              onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
              className="w-full px-4 py-2 bg-secondary/20 border border-primary/20 rounded-lg focus:outline-none focus:border-primary"
            />
            <input
              type="text"
              placeholder={t("review_title")}
              value={newReview.title}
              onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
              className="w-full px-4 py-2 bg-secondary/20 border border-primary/20 rounded-lg focus:outline-none focus:border-primary"
            />
            <textarea
              placeholder={t("your_review")}
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              className="w-full px-4 py-2 bg-secondary/20 border border-primary/20 rounded-lg focus:outline-none focus:border-primary min-h-32"
            />
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setNewReview({ ...newReview, rating: star })}
                  className={`text-3xl cursor-pointer ${newReview.rating >= star ? "text-primary" : "text-muted-foreground"}`}
                >
                  ⭐
                </button>
              ))}
            </div>
            <Button onClick={handleSubmitReview} className="w-full bg-primary hover:bg-primary/90">
              {t("submit_review")}
            </Button>
          </Card>
        </div>
      )}

      {/* All Reviews Modal */}
      {isAllReviewsModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="glass-card w-full max-w-2xl p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center sticky top-0 bg-background/80 pb-4">
              <h2 className="text-2xl font-bold">
                {t("all_reviews")} ({userReviews.length})
              </h2>
              <button
                onClick={() => setIsAllReviewsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {userReviews.map((review) => (
                <Card key={review.id} className="glass-card p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-lg">{review.name.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{review.name}</div>
                      <div className="text-xs text-muted-foreground">{review.title}</div>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-2">
                    {[...Array(review.rating)].map((_, i) => (
                      <span key={i} className="text-primary text-sm">
                        ⭐
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                </Card>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* "Add Review" Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="glass-card w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">{t("addReview")}</h2>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-muted-foreground hover:text-foreground text-2xl"
              >
                ✕
              </button>
            </div>
            <input
              type="text"
              placeholder={t("your_name")}
              value={newReview.name}
              onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
              className="w-full px-4 py-2 bg-secondary/20 border border-primary/20 rounded-lg focus:outline-none focus:border-primary"
            />
            <input
              type="text"
              placeholder={t("review_title")}
              value={newReview.title}
              onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
              className="w-full px-4 py-2 bg-secondary/20 border border-primary/20 rounded-lg focus:outline-none focus:border-primary"
            />
            <textarea
              placeholder={t("your_review")}
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              className="w-full px-4 py-2 bg-secondary/20 border border-primary/20 rounded-lg focus:outline-none focus:border-primary min-h-32"
            />
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setNewReview({ ...newReview, rating: star })}
                  className={`text-3xl cursor-pointer ${newReview.rating >= star ? "text-primary" : "text-muted-foreground"}`}
                >
                  ⭐
                </button>
              ))}
            </div>
            <Button onClick={handleSubmitReview} className="w-full bg-primary hover:bg-primary/90">
              {t("submit_review")}
            </Button>
          </Card>
        </div>
      )}
    </div>
  )
}
