"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { useState, useEffect } from "react"

const blogContent = {
  "pomodoro-technique": {
    en: {
      title: "Master the Pomodoro Technique: Work Smarter, Not Harder",
      author: "Future Task Team",
      date: "January 15, 2025",
      readTime: "5 min read",
      category: "Productivity",
      intro: "Ever feel like your brain is melting after hours of non-stop work? You're not alone. The secret isn't working longer—it's working smarter. Enter the Pomodoro Technique.",
      content: [
        {
          type: "text",
          text: "Francesco Cirillo invented the Pomodoro Technique in the late 1980s when he was a university student struggling with focus. He grabbed a tomato-shaped kitchen timer (pomodoro means tomato in Italian) and discovered something revolutionary: our brains work better in short, focused bursts.",
        },
        {
          type: "quote",
          text: "The Pomodoro Technique helps you resist all of those self-interruptions and re-train your brains to focus.",
          author: "Francesco Cirillo",
          role: "Creator of the Pomodoro Technique",
        },
        {
          type: "heading",
          text: "How It Actually Works",
        },
        {
          type: "text",
          text: "The technique is beautifully simple: Work for 25 minutes (one pomodoro), take a 5-minute break, and after four pomodoros, take a longer 15-30 minute break. That's it. No fancy apps required—though Future Task makes it even easier with built-in timers and automatic tracking.",
        },
        {
          type: "quote",
          text: "The technique forces you to break down your work, and that creates progress. Progress feels good.",
          author: "Cal Newport",
          role: "Author of 'Deep Work'",
        },
        {
          type: "heading",
          text: "Why It's So Effective",
        },
        {
          type: "text",
          text: "Your brain isn't designed for marathon focus sessions. Studies show that attention naturally wavers after 20-25 minutes. The Pomodoro Technique works WITH your biology, not against it. Those short breaks prevent mental fatigue while keeping you in the zone.",
        },
        {
          type: "text",
          text: "Plus, there's something psychologically powerful about knowing you only have to focus for 25 minutes. That big scary project? Suddenly it's just 'one more pomodoro.' Before you know it, you've completed six pomodoros and made serious progress.",
        },
        {
          type: "quote",
          text: "Time blocking is the single most effective productivity technique I know.",
          author: "Laura Vanderkam",
          role: "Time Management Expert",
        },
        {
          type: "heading",
          text: "Pro Tips from Real Users",
        },
        {
          type: "list",
          items: [
            "Use the first pomodoro to plan your day—it reduces decision fatigue later",
            "During breaks, actually move away from your desk. Your eyes and back will thank you",
            "Track what you accomplish each pomodoro. Seeing those checkmarks is addictive",
            "Adjust the timing if 25 minutes doesn't work for you—some prefer 50/10 splits",
          ],
        },
        {
          type: "text",
          text: "The beauty of the Pomodoro Technique isn't just about time management—it's about building a sustainable work rhythm. You'll finish your day with energy left over, not collapsing in exhaustion. Try it for a week and see the difference.",
        },
      ],
    },
    es: {
      title: "Domina la Técnica Pomodoro: Trabaja Más Inteligente, No Más Duro",
      author: "Equipo Future Task",
      date: "15 de enero, 2025",
      readTime: "5 min de lectura",
      category: "Productividad",
      intro: "¿Alguna vez sientes que tu cerebro se derrite después de horas de trabajo sin parar? No estás solo. El secreto no es trabajar más—es trabajar más inteligente. Conoce la Técnica Pomodoro.",
      content: [
        {
          type: "text",
          text: "Francesco Cirillo inventó la Técnica Pomodoro a finales de los años 80 cuando era un estudiante universitario luchando con la concentración. Agarró un temporizador de cocina en forma de tomate (pomodoro significa tomate en italiano) y descubrió algo revolucionario: nuestros cerebros funcionan mejor en ráfagas cortas y enfocadas.",
        },
        {
          type: "quote",
          text: "La Técnica Pomodoro te ayuda a resistir todas esas auto-interrupciones y re-entrenar tu cerebro para concentrarse.",
          author: "Francesco Cirillo",
          role: "Creador de la Técnica Pomodoro",
        },
        {
          type: "heading",
          text: "Cómo Funciona Realmente",
        },
        {
          type: "text",
          text: "La técnica es hermosamente simple: Trabaja por 25 minutos (un pomodoro), toma un descanso de 5 minutos, y después de cuatro pomodoros, toma un descanso más largo de 15-30 minutos. Eso es todo. No se requieren aplicaciones sofisticadas—aunque Future Task lo hace aún más fácil con temporizadores integrados y seguimiento automático.",
        },
        {
          type: "quote",
          text: "La técnica te obliga a dividir tu trabajo, y eso crea progreso. El progreso se siente bien.",
          author: "Cal Newport",
          role: "Autor de 'Trabajo Profundo'",
        },
        {
          type: "heading",
          text: "Por Qué Es Tan Efectivo",
        },
        {
          type: "text",
          text: "Tu cerebro no está diseñado para sesiones de enfoque maratónicas. Los estudios muestran que la atención naturalmente disminuye después de 20-25 minutos. La Técnica Pomodoro trabaja CON tu biología, no en contra de ella. Esos descansos cortos previenen la fatiga mental mientras te mantienen en la zona.",
        },
        {
          type: "text",
          text: "Además, hay algo psicológicamente poderoso en saber que solo tienes que concentrarte durante 25 minutos. ¿Ese gran proyecto aterrador? De repente es solo 'un pomodoro más'. Antes de que te des cuenta, has completado seis pomodoros y has hecho un progreso serio.",
        },
        {
          type: "quote",
          text: "El bloqueo de tiempo es la técnica de productividad más efectiva que conozco.",
          author: "Laura Vanderkam",
          role: "Experta en Gestión del Tiempo",
        },
        {
          type: "heading",
          text: "Consejos Pro de Usuarios Reales",
        },
        {
          type: "list",
          items: [
            "Usa el primer pomodoro para planificar tu día—reduce la fatiga de decisiones más tarde",
            "Durante los descansos, realmente aléjate de tu escritorio. Tus ojos y espalda te lo agradecerán",
            "Rastrea lo que logras cada pomodoro. Ver esas marcas de verificación es adictivo",
            "Ajusta el tiempo si 25 minutos no te funciona—algunos prefieren divisiones de 50/10",
          ],
        },
        {
          type: "text",
          text: "La belleza de la Técnica Pomodoro no se trata solo de gestión del tiempo—se trata de construir un ritmo de trabajo sostenible. Terminarás tu día con energía sobrante, no colapsando de agotamiento. Pruébalo durante una semana y ve la diferencia.",
        },
      ],
    },
    fr: {
      title: "Maîtrisez la Technique Pomodoro : Travaillez Plus Intelligemment, Pas Plus Dur",
      author: "Équipe Future Task",
      date: "15 janvier 2025",
      readTime: "5 min de lecture",
      category: "Productivité",
      intro: "Respirez-vous déjà après des heures de travail sans arrêt ? Vous n'êtes pas seul. Le secret n'est pas de travailler plus longtemps, mais de travailler plus intelligemment. Voici la Technique Pomodoro.",
      content: [
        {
          type: "text",
          text: "Francesco Cirillo a inventé la Technique Pomodoro à la fin des années 80 quand il était un étudiant universitaire ayant des problèmes de concentration. Il a pris un chronomètre de cuisine en forme de tomate (pomodoro signifie tomate en italien) et a découvert quelque chose de révolutionnaire : nos cerveaux fonctionnent mieux en rafales courtes et concentrées.",
        },
        {
          type: "quote",
          text: "La Technique Pomodoro vous aide à résister à toutes ces interruptions et à ré-entraîner votre cerveau pour vous concentrer.",
          author: "Francesco Cirillo",
          role: "Créateur de la Technique Pomodoro",
        },
        {
          type: "heading",
          text: "Comment Cela Fonctionne Réellement",
        },
        {
          type: "text",
          text: "La technique est magnifiquement simple : travaillez pendant 25 minutes (un pomodoro), prenez une pause de 5 minutes, et après quatre pomodoros, prenez une pause plus longue de 15-30 minutes. C'est tout. Pas besoin d'applications sophistiquées—Future Task rend cela encore plus facile avec des chronomètres intégrés et un suivi automatique.",
        },
        {
          type: "quote",
          text: "La technique vous force à diviser votre travail, et cela crée du progrès. Le progrès se sent bien.",
          author: "Cal Newport",
          role: "Auteur de 'Travail Profond'",
        },
        {
          type: "heading",
          text: "Pourquoi C'est Si Efficace",
        },
        {
          type: "text",
          text: "Votre cerveau n'est pas conçu pour des sessions de concentration marathon. Les études montrent que l'attention naturellement fléchit après 20-25 minutes. La Technique Pomodoro travaille AVEC votre biologie, pas EN CONTRE. Ces pauses courtes empêchent la fatigue mentale tout en vous maintenant dans la zone.",
        },
        {
          type: "text",
          text: "De plus, il y a quelque chose de psychologiquement puissant à savoir que vous n'avez qu'à vous concentrer pendant 25 minutes. Ce grand projet effrayant ? Soudain, c'est juste 'un pomodoro de plus'. Avant de vous en rendre compte, vous avez terminé six pomodoros et vous avez fait un progrès sérieux.",
        },
        {
          type: "quote",
          text: "Le blocage du temps est la technique de productivité la plus efficace que je connaisse.",
          author: "Laura Vanderkam",
          role: "Expert en Gestion du Temps",
        },
        {
          type: "heading",
          text: "Conseils Pro des Utilisateurs Réels",
        },
        {
          type: "list",
          items: [
            "Utilisez le premier pomodoro pour planifier votre journée—cela réduit la fatigue de décision plus tard",
            "Au cours des pauses, éloignez-vous vraiment de votre bureau. Vos yeux et votre dos vous le seront reconnaissants",
            "Suivez ce que vous accomplissez chaque pomodoro. Voir ces coches est addictive",
            "Ajustez le temps si 25 minutes ne vous convient pas—certains préfèrent des divisions de 50/10",
          ],
        },
        {
          type: "text",
          text: "La beauté de la Technique Pomodoro ne réside pas seulement dans la gestion du temps—elle réside dans la construction d'un rythme de travail durable. Vous terminerez votre journée avec de l'énergie en réserve, pas en vous effondrant de fatigue. Essayez-le pendant une semaine et voyez la différence.",
        },
      ],
    },
    de: {
      title: "Mastrieren Sie die Pomodoro-Methode: Arbeiten Sie intelligenter, nicht härter",
      author: "Future Task Team",
      date: "15. Januar 2025",
      readTime: "5 Min. Lesezeit",
      category: "Produktivität",
      intro: "Fühlen Sie sich schon nach Stunden ständiger Arbeit an wie geschmolzenes Hirn? Sie sind nicht allein. Das Geheimnis liegt nicht darin, länger zu arbeiten, sondern intelligenter zu arbeiten. Entdecken Sie die Pomodoro-Methode.",
      content: [
        {
          type: "text",
          text: "Francesco Cirillo erdachte die Pomodoro-Methode Ende der 80er Jahre, als er ein Universitätsstudent war, der mit der Konzentration Schwierigkeiten hatte. Er nahm einen Tomatenformigen Küchentimer und entdeckte etwas Revolutionäres: Unsere Gehirne funktionieren besser in kurzen, konzentrierten Bursts.",
        },
        {
          type: "quote",
          text: "Die Pomodoro-Methode hilft Ihnen, alle diese Selbstunterbrechungen zu widerstehen und Ihr Hirn zur Konzentration wiederzubilden.",
          author: "Francesco Cirillo",
          role: "Erfinder der Pomodoro-Methode",
        },
        {
          type: "heading",
          text: "Wie Es Wirklich Funktioniert",
        },
        {
          type: "text",
          text: "Die Methode ist wundervoll einfach: Arbeiten Sie 25 Minuten (ein Pomodoro), nehmen Sie eine 5-Minuten-Pause und nach vier Pomodoros nehmen Sie eine längere Pause von 15-30 Minuten. Das ist alles. Keine komplizierten Apps erforderlich—Future Task macht es Ihnen sogar einfacher mit integrierten Timern und automatischer Nachverfolgung.",
        },
        {
          type: "quote",
          text: "Die Methode zwingt Sie, Ihre Arbeit zu zerlegen und das erzeugt Fortschritte. Fortschritte fühlen sich gut an.",
          author: "Cal Newport",
          role: "Autor von 'Deep Work'",
        },
        {
          type: "heading",
          text: "Warum Es So Effektiv Ist",
        },
        {
          type: "text",
          text: "Ihr Gehirn ist nicht für langsame Konzentrationsphasen ausgelegt. Studien zeigen, dass die Aufmerksamkeit natürlich nach 20-25 Minuten abnimmt. Die Pomodoro-Methode arbeitet MIT Ihrer Biologie zusammen, nicht gegen sie. Diese kurzen Pausen verhindern mentale Erschöpfung, während Sie im Zone bleiben.",
        },
        {
          type: "text",
          text: "Darüber hinaus gibt es etwas psychologisch Machtvolles daran, zu wissen, dass Sie nur 25 Minuten konzentrieren müssen. Das große furchterregende Projekt? Plötzlich ist es nur 'einen weiteren Pomodoro'. Vor Ihnen steht die Möglichkeit, sechs Pomodoros abzuschließen und ernsthafte Fortschritte zu machen.",
        },
        {
          type: "quote",
          text: "Die Zeitblockierung ist die produktivste Technik, die ich kenne.",
          author: "Laura Vanderkam",
          role: "Experte für Zeitmanagement",
        },
        {
          type: "heading",
          text: "Pro-Tipps von Realen Benutzern",
        },
        {
          type: "list",
          items: [
            "Verwenden Sie den ersten Pomodoro, um Ihren Tag zu planen—das reduziert die Entscheidungsmüdigkeit später",
            "Während der Pausen gehen Sie wirklich von Ihrem Schreibtisch weg. Ihre Augen und Rücken werden Ihnen dankbar sein",
            "Verfolgen Sie, was Sie in jedem Pomodoro erreichen. Das Ankreuzen dieser Punkte ist überzeugend",
            "Passen Sie die Zeit an, wenn 25 Minuten für Sie nicht funktionieren—manche bevorzugen Splitter von 50/10",
          ],
        },
        {
          type: "text",
          text: "Die Schönheit der Pomodoro-Methode liegt nicht nur daran, wie man Zeit verwaltet—sie liegt daran, einen nachhaltigen Arbeitsrhythmus aufzubauen. Sie werden Ihren Tag mit Energie beenden, nicht in Erschöpfung zusammenbrechen. Proben Sie es eine Woche lang aus und sehen Sie den Unterschied.",
        },
      ],
    },
    it: {
      title: "Mestri della Tecnica Pomodoro: Lavora Più Intelligente, Non Più Duro",
      author: "Team Future Task",
      date: "15 gennaio 2025",
      readTime: "5 minuti di lettura",
      category: "Produttività",
      intro: "Hai mai sentito che il tuo cervello sembri sciogliersi dopo ore di lavoro costante? Non sei solo. Il segreto non è lavorare più a lungo, ma lavorare più intelligente. Entra nella Tecnica Pomodoro.",
      content: [
        {
          type: "text",
          text: "Francesco Cirillo ha inventato la Tecnica Pomodoro agli inizi degli anni '80 quando era uno studente universitario che aveva problemi di concentrazione. Ha preso un temporale da cucina in forma di pomodoro (pomodoro significa pomodoro in italiano) e ha scoperto qualcosa di rivoluzionario: i nostre cervelli funzionano meglio in brevi periodi concentrati.",
        },
        {
          type: "quote",
          text: "La Tecnica Pomodoro ti aiuta a resistere a tutte quelle interruzioni e a riaddestrare il tuo cervello per concentrarsi.",
          author: "Francesco Cirillo",
          role: "Creatore della Tecnica Pomodoro",
        },
        {
          type: "heading",
          text: "Come Funziona Effettivamente",
        },
        {
          type: "text",
          text: "La tecnica è magnificamente semplice: lavora per 25 minuti (un pomodoro), prendi una pausa di 5 minuti, e dopo quattro pomodoros, prendi una più lunga pausa di 15-30 minuti. Ecco tutto. Non sono necessarie app sofisticate—Future Task lo rende ancora più facile con timer integrati e tracciamento automatico.",
        },
        {
          type: "quote",
          text: "La tecnica ti costringe a dividere il tuo lavoro e questo crea progressi. I progressi si sentono bene.",
          author: "Cal Newport",
          role: "Autore di 'Deep Work'",
        },
        {
          type: "heading",
          text: "Perché È Così Efficace",
        },
        {
          type: "text",
          text: "Il tuo cervello non è progettato per sessioni di concentrazione maratoniche. Le ricerche mostrano che l'attenzione si abbassa naturalmente dopo 20-25 minuti. La Tecnica Pomodoro lavora CON la tua biologia, non CONTRE. Queste brevi pause evitano la stanchezza mentale mantenendoti nella zona.",
        },
        {
          type: "text",
          text: "Inoltre, c'è qualcosa di psicologicamente potente nel sapere che devi concentrarti solo per 25 minuti. Quel grande progetto spaventoso? Sudditamente è solo 'un altro pomodoro'. Prima di saperlo, hai completato sei pomodoros e hai fatto un progresso serio.",
        },
        {
          type: "quote",
          text: "Il blocco del tempo è la tecnica di produttività più efficace che conosca.",
          author: "Laura Vanderkam",
          role: "Esperta in Gestione del Tempo",
        },
        {
          type: "heading",
          text: "Consigli Pro da Utenti Reali",
        },
        {
          type: "list",
          items: [
            "Usa il primo pomodoro per pianificare il tuo giorno—riduce la stanchezza decisionale più tardi",
            "Durante le pause, lontana davvero dal tuo scrivania. I tuoi occhi e la tua schiena ti lo saranno grati",
            "Traccia ciò che fai in ogni pomodoro. Vedere quelle spuntature è addittivo",
            "Regola il tempo se 25 minuti non ti convengono—alcuni preferiscono divisioni di 50/10",
          ],
        },
        {
          type: "text",
          text: "La bellezza della Tecnica Pomodoro non si trova solo nella gestione del tempo—si trova nella costruzione di un ritmo di lavoro sostenibile. Finirai il tuo giorno con energia in riserva, non cedendo in esaustione. Provalo per una settimana e vedi la differenza.",
        },
      ],
    },
  },
  "study-methods": {
    en: {
      title: "Study Smarter: Science-Backed Methods That Actually Work",
      author: "Future Task Team",
      date: "January 12, 2025",
      readTime: "7 min read",
      category: "Study Tips",
      intro: "Forget highlighting entire textbooks and rereading notes until your eyes glaze over. Modern cognitive science has cracked the code on how we actually learn—and it's nothing like what most students do.",
      content: [
        {
          type: "text",
          text: "If you're still using the study methods from high school, you're wasting precious time. The latest research in cognitive psychology has revealed techniques that can double or even triple your retention—and they're simpler than you think.",
        },
        {
          type: "quote",
          text: "The more you try to retrieve information, the more deeply embedded it becomes in your memory.",
          author: "Dr. Barbara Oakley",
          role: "Author of 'A Mind for Numbers'",
        },
        {
          type: "heading",
          text: "Active Recall: Your Brain's Best Friend",
        },
        {
          type: "text",
          text: "Active recall is the practice of retrieving information from memory without looking at your notes. It's uncomfortable at first—but that's exactly why it works. Your brain has to work harder, creating stronger neural pathways.",
        },
        {
          type: "text",
          text: "Instead of passively rereading Chapter 5, close the book and write down everything you remember. Can't recall something? That's valuable feedback—now you know exactly what to review. Use flashcards, practice tests, or just a blank sheet of paper. The method doesn't matter as much as the struggle to remember.",
        },
        {
          type: "quote",
          text: "Testing is not just assessment—it's a powerful learning tool in itself.",
          author: "Dr. Henry Roediger",
          role: "Cognitive Psychologist, Washington University",
        },
        {
          type: "heading",
          text: "Spaced Repetition: The Memory Multiplier",
        },
        {
          type: "text",
          text: "Here's a mind-blowing fact: reviewing something 10 times in one night is FAR less effective than reviewing it once a day for 10 days. This is called spaced repetition, and it's based on how human memory actually works.",
        },
        {
          type: "text",
          text: "Your brain strengthens memories each time you successfully recall them after a delay. Future Task can help you schedule these reviews automatically, so you're always studying at the optimal intervals. Review material after 1 day, then 3 days, then a week, then a month. It's like compound interest for your brain.",
        },
        {
          type: "quote",
          text: "Spaced practice is one of the most robust findings in cognitive psychology.",
          author: "Dr. Robert Bjork",
          role: "UCLA Distinguished Professor of Psychology",
        },
        {
          type: "heading",
          text: "The Feynman Technique: Explain Like I'm Five",
        },
        {
          type: "text",
          text: "Named after Nobel Prize-winning physicist Richard Feynman, this technique is brutally simple: try to explain a concept in plain language as if teaching a child. If you can't explain it simply, you don't understand it well enough.",
        },
        {
          type: "list",
          items: [
            "Pick a concept you're studying",
            "Write an explanation using simple words (no jargon!)",
            "Identify gaps in your understanding",
            "Go back and fill those gaps",
            "Simplify and use analogies",
          ],
        },
        {
          type: "text",
          text: "This method forces you to confront what you don't know and build genuine understanding rather than surface-level familiarity. It's uncomfortable but incredibly effective.",
        },
        {
          type: "heading",
          text: "Interleaving: Mix It Up",
        },
        {
          type: "text",
          text: "Most students study one topic at a time—math for two hours, then history for two hours. Research shows this is backwards. Mixing different topics or problem types (called interleaving) actually improves long-term retention and your ability to apply knowledge.",
        },
        {
          type: "quote",
          text: "Interleaving improves your ability to discriminate between concepts and choose the right strategy for each problem.",
          author: "Dr. Doug Rohrer",
          role: "University of South Florida",
        },
        {
          type: "text",
          text: "The key is to make your brain work harder during practice. Easy feels good in the moment, but difficult is what creates lasting learning. Embrace the struggle—that's where the magic happens.",
        },
      ],
    },
    es: {
      title: "Estudia Más Inteligentemente: Métodos Respaldados por la Ciencia Que Realmente Funcionan",
      author: "Equipo Future Task",
      date: "12 de enero, 2025",
      readTime: "7 min de lectura",
      category: "Consejos de Estudio",
      intro: "Olvida resaltar libros de texto completos y releer notas hasta que tus ojos se nublen. La ciencia cognitiva moderna ha descifrado el código de cómo realmente aprendemos—y no es nada como lo que hacen la mayoría de los estudiantes.",
      content: [
        {
          type: "text",
          text: "Si todavía estás usando los métodos de estudio de la secundaria, estás perdiendo tiempo precioso. La última investigación en psicología cognitiva ha revelado técnicas que pueden duplicar o incluso triplicar tu retención—y son más simples de lo que piensas.",
        },
        {
          type: "quote",
          text: "Cuanto más intentas recuperar información, más profundamente se incrusta en tu memoria.",
          author: "Dra. Barbara Oakley",
          role: "Autora de 'Una Mente para los Números'",
        },
        {
          type: "heading",
          text: "Recuperación Activa: El Mejor Amigo de Tu Cerebro",
        },
        {
          type: "text",
          text: "La recuperación activa es la práctica de recuperar información de la memoria sin mirar tus notas. Es incómodo al principio—pero eso es exactamente por qué funciona. Tu cerebro tiene que trabajar más duro, creando vías neuronales más fuertes.",
        },
        {
          type: "text",
          text: "En lugar de releer pasivamente el Capítulo 5, cierra el libro y escribe todo lo que recuerdas. ¿No puedes recordar algo? Esa es información valiosa—ahora sabes exactamente qué revisar. Usa tarjetas de memoria, pruebas de práctica o simplemente una hoja en blanco. El método no importa tanto como la lucha por recordar.",
        },
        {
          type: "quote",
          text: "Las pruebas no son solo evaluación—son una poderosa herramienta de aprendizaje en sí mismas.",
          author: "Dr. Henry Roediger",
          role: "Psicólogo Cognitivo, Universidad de Washington",
        },
        {
          type: "heading",
          text: "Repetición Espaciada: El Multiplicador de Memoria",
        },
        {
          type: "text",
          text: "Aquí hay un hecho alucinante: revisar algo 10 veces en una noche es MUCHO menos efectivo que revisarlo una vez al día durante 10 días. Esto se llama repetición espaciada, y se basa en cómo funciona realmente la memoria humana.",
        },
        {
          type: "text",
          text: "Tu cerebro fortalece los recuerdos cada vez que los recuperas exitosamente después de un retraso. Future Task puede ayudarte a programar estas revisiones automáticamente, para que siempre estudies en los intervalos óptimos. Revisa el material después de 1 día, luego 3 días, luego una semana, luego un mes. Es como interés compuesto para tu cerebro.",
        },
        {
          type: "quote",
          text: "La práctica espaciada es uno de los hallazgos más robustos en psicología cognitiva.",
          author: "Dr. Robert Bjork",
          role: "Profesor Distinguido de Psicología, UCLA",
        },
        {
          type: "heading",
          text: "La Técnica Feynman: Explica Como Si Tuviera Cinco Años",
        },
        {
          type: "text",
          text: "Nombrada después del físico ganador del Premio Nobel Richard Feynman, esta técnica es brutalmente simple: intenta explicar un concepto en lenguaje simple como si estuvieras enseñando a un niño. Si no puedes explicarlo simplemente, no lo entiendes lo suficientemente bien.",
        },
        {
          type: "list",
          items: [
            "Elige un concepto que estés estudiando",
            "Escribe una explicación usando palabras simples (¡sin jerga!)",
            "Identifica las lagunas en tu comprensión",
            "Regresa y llena esas lagunas",
            "Simplifica y usa analogías",
          ],
        },
        {
          type: "text",
          text: "Este método te obliga a confrontar lo que no sabes y construir una comprensión genuina en lugar de familiaridad superficial. Es incómodo pero increíblemente efectivo.",
        },
        {
          type: "heading",
          text: "Intercalación: Mézclalo",
        },
        {
          type: "text",
          text: "La mayoría de los estudiantes estudian un tema a la vez—matemáticas durante dos horas, luego historia durante dos horas. La investigación muestra que esto es al revés. Mezclar diferentes temas o tipos de problemas (llamado intercalación) realmente mejora la retención a largo plazo y tu capacidad para aplicar conocimientos.",
        },
        {
          type: "quote",
          text: "La intercalación mejora tu capacidad para discriminar entre conceptos y elegir la estrategia correcta para cada problema.",
          author: "Dr. Doug Rohrer",
          role: "Universidad del Sur de Florida",
        },
        {
          type: "text",
          text: "La clave es hacer que tu cerebro trabaje más duro durante la práctica. Fácil se siente bien en el momento, pero difícil es lo que crea aprendizaje duradero. Acepta la lucha—ahí es donde ocurre la magia.",
        },
      ],
    },
    fr: {
      title: "Étudiez Plus Intelligemment: Méthodes Scientifiques Qui Fonctionnent Vraiment",
      author: "Équipe Future Task",
      date: "12 janvier 2025",
      readTime: "7 min de lecture",
      category: "Conseils d'Étude",
      intro: "Oubliez le surlignage de manuels entiers et la relecture de notes jusqu'à ce que vos yeux se voilent. La science cognitive moderne a percé le code de notre apprentissage—et ce n'est rien comme ce que font la plupart des étudiants.",
      content: [
        {
          type: "text",
          text: "Si vous utilisez encore les méthodes d'étude du lycée, vous perdez un temps précieux. Les dernières recherches en psychologie cognitive ont révélé des techniques qui peuvent doubler ou même tripler votre rétention—et elles sont plus simples que vous ne le pensez.",
        },
        {
          type: "quote",
          text: "Plus vous essayez de récupérer l'information, plus elle s'ancre profondément dans votre mémoire.",
          author: "Dr. Barbara Oakley",
          role: "Auteur de 'A Mind for Numbers'",
        },
        {
          type: "heading",
          text: "Rappel Actif: Le Meilleur Ami de Votre Cerveau",
        },
        {
          type: "text",
          text: "Le rappel actif est la pratique de récupérer l'information de la mémoire sans regarder vos notes. C'est inconfortable au début—mais c'est exactement pourquoi ça marche. Votre cerveau doit travailler plus dur, créant des voies neuronales plus fortes.",
        },
        {
          type: "text",
          text: "Au lieu de relire passivement le Chapitre 5, fermez le livre et écrivez tout ce dont vous vous souvenez. Vous ne pouvez pas vous rappeler quelque chose? C'est un retour précieux—maintenant vous savez exactement quoi réviser.",
        },
        {
          type: "quote",
          text: "Les tests ne sont pas seulement une évaluation—ils sont une puissante outil d'apprentissage en soi.",
          author: "Dr. Henry Roediger",
          role: "Psychologue Cognitif, Université de Washington",
        },
        {
          type: "heading",
          text: "Répétition Espacée: Le Multiplicateur de Mémoire",
        },
        {
          type: "text",
          text: "Voici un fait époustouflant: réviser quelque chose 10 fois en une nuit est BEAUCOUP moins efficace que de le réviser une fois par jour pendant 10 jours. Cela s'appelle la répétition espacée, et c'est basé sur le fonctionnement réel de la mémoire humaine.",
        },
        {
          type: "text",
          text: "Votre cerveau renforce les mémoires chaque fois que vous les récupérez avec succès après un retard. Future Task peut vous aider à programmer ces révisions automatiquement, afin que vous étudiiez toujours à l'intervalle optimal. Révisez le matériel après 1 jour, puis 3 jours, puis une semaine, puis un mois. C'est comme un intérêt composé pour votre cerveau.",
        },
        {
          type: "quote",
          text: "La pratique espacée est l'un des résultats les plus robustes en psychologie cognitive.",
          author: "Dr. Robert Bjork",
          role: "Professeur Distingué de Psychologie, UCLA",
        },
        {
          type: "heading",
          text: "La Technique Feynman",
        },
        {
          type: "text",
          text: "Nommée d'après le physicien lauréat du prix Nobel Richard Feynman, cette technique est brutalement simple: essayez d'expliquer un concept en langage simple comme si vous enseigniez à un enfant.",
        },
        {
          type: "heading",
          text: "Entrelacement: Mélangez",
        },
        {
          type: "text",
          text: "La plupart des étudiants étudient un sujet à la fois. La recherche montre que c'est à l'envers. Mélanger différents sujets améliore réellement la rétention à long terme.",
        },
      ],
    },
    de: {
      title: "Intelligenter Lernen: Wissenschaftlich Bewährte Methoden",
      author: "Future Task Team",
      date: "12. Januar 2025",
      readTime: "7 Min. Lesezeit",
      category: "Lerntipps",
      intro: "Vergessen Sie das Hervorheben ganzer Lehrbücher und das Wiederlesen von Notizen, bis Ihre Augen glasig werden. Die moderne Kognitionswissenschaft hat den Code geknackt, wie wir tatsächlich lernen.",
      content: [
        {
          type: "text",
          text: "Wenn Sie immer noch die Lernmethoden aus der Schule verwenden, verschwenden Sie wertvolle Zeit. Die neueste Forschung in der kognitiven Psychologie hat Techniken enthüllt, die Ihre Retention verdoppeln oder sogar verdreifachen können.",
        },
        {
          type: "heading",
          text: "Aktives Abrufen",
        },
        {
          type: "text",
          text: "Aktives Abrufen ist die Praxis, Informationen aus dem Gedächtnis abzurufen, ohne auf Ihre Notizen zu schauen. Es ist zunächst unangenehm—aber genau deshalb funktioniert es.",
        },
        {
          type: "heading",
          text: "Verteilte Wiederholung",
        },
        {
          type: "text",
          text: "Hier ist eine verblüffende Tatsache: etwas 10 Mal in einer Nacht zu wiederholen ist VIEL weniger effektiv, als es einmal täglich für 10 Tage zu wiederholen.",
        },
      ],
    },
    it: {
      title: "Studia in Modo Più Intelligente: Metodi Scientificamente Provati",
      author: "Team Future Task",
      date: "12 gennaio 2025",
      readTime: "7 minuti di lettura",
      category: "Consigli di Studio",
      intro: "Dimentica l'evidenziazione di interi libri di testo e la rilettura di appunti finché i tuoi occhi non si appannano. La scienza cognitiva moderna ha decifrato il codice di come impariamo realmente.",
      content: [
        {
          type: "text",
          text: "Se stai ancora usando i metodi di studio delle superiori, stai sprecando tempo prezioso. L'ultima ricerca in psicologia cognitiva ha rivelato tecniche che possono raddoppiare o persino triplicare la tua ritenzione.",
        },
        {
          type: "heading",
          text: "Richiamo Attivo",
        },
        {
          type: "text",
          text: "Il richiamo attivo è la pratica di recuperare informazioni dalla memoria senza guardare i tuoi appunti. È scomodo all'inizio—ma è esattamente per questo che funziona.",
        },
      ],
    },
  },
  "ai-productivity": {
    en: {
      title: "AI Productivity Revolution: Your Personal Assistant Awaits",
      author: "Future Task Team",
      date: "January 10, 2025",
      readTime: "6 min read",
      category: "AI & Automation",
      intro: "AI isn't just for tech giants anymore. These tools can handle your busywork, spark creativity, and give you back hours every week—if you know how to use them.",
      content: [
        {
          type: "text",
          text: "Let's be honest: you're probably using about 5% of what AI assistants can do. Most people use ChatGPT like a fancy search engine. But when you unlock its real potential, it's like having a tireless research assistant, editor, and brainstorming partner rolled into one.",
        },
        {
          type: "quote",
          text: "AI won't replace you. But a person using AI will replace a person not using AI.",
          author: "Sam Altman",
          role: "CEO of OpenAI",
        },
        {
          type: "heading",
          text: "Automate the Boring Stuff",
        },
        {
          type: "text",
          text: "Think about all the repetitive tasks eating your time. Drafting emails, summarizing documents, generating reports, brainstorming ideas—AI can handle these in seconds. Future Task's AI assistant is specifically trained to help with task management and productivity.",
        },
        {
          type: "list",
          items: [
            "Turn rough notes into polished emails",
            "Break down complex projects into actionable tasks",
            "Generate study summaries from dense textbooks",
            "Create content outlines and first drafts",
            "Analyze data and spot patterns you'd miss",
          ],
        },
        {
          type: "quote",
          text: "The goal is to automate tasks, not jobs. AI should handle the boring so humans can focus on the creative.",
          author: "Andrew Ng",
          role: "AI Pioneer and Co-founder of Coursera",
        },
        {
          type: "heading",
          text: "The Art of AI Prompting",
        },
        {
          type: "text",
          text: "Here's the secret most people miss: AI is only as good as your prompts. Vague questions get vague answers. But when you prompt with context, constraints, and clear outcomes, AI becomes incredibly powerful.",
        },
        {
          type: "text",
          text: "Instead of 'Write an email,' try: 'Write a professional but friendly email to a professor requesting a meeting to discuss my research proposal. Keep it under 150 words and suggest two specific time slots next week.' See the difference?",
        },
        {
          type: "quote",
          text: "Prompt engineering is becoming one of the most valuable skills in the AI era.",
          author: "Ethan Mollick",
          role: "Professor at Wharton School",
        },
        {
          type: "heading",
          text: "Beyond Text: AI for Everything",
        },
        {
          type: "text",
          text: "Text generation is just the beginning. Modern AI can analyze images, generate designs, transcribe audio, create presentations, and even write code. The tools are getting better every month.",
        },
        {
          type: "text",
          text: "Use AI to automate your workflow: transcribe meeting notes, generate task lists from conversations, create study schedules based on your goals, or analyze your productivity patterns. The possibilities are expanding exponentially.",
        },
        {
          type: "heading",
          text: "The Human Touch Still Matters",
        },
        {
          type: "text",
          text: "Here's what AI can't replace: original thinking, emotional intelligence, creativity, and strategic decision-making. Use AI as your productivity amplifier, not your brain replacement.",
        },
        {
          type: "quote",
          text: "The future belongs to those who can combine human creativity with machine intelligence.",
          author: "Kai-Fu Lee",
          role: "AI Expert and Author",
        },
        {
          type: "text",
          text: "Start small. Pick one task you do repeatedly and automate it with AI. Track how much time you save. Then expand. Before you know it, you'll wonder how you ever lived without your AI assistant. The productivity revolution is here—are you ready to join it?",
        },
      ],
    },
    es: {
      title: "Revolución de Productividad con IA: Tu Asistente Personal Te Espera",
      author: "Equipo Future Task",
      date: "10 de enero, 2025",
      readTime: "6 min de lectura",
      category: "IA y Automatización",
      intro: "La IA ya no es solo para gigantes tecnológicos. Estas herramientas pueden manejar tu trabajo tedioso, despertar creatividad y devolverte horas cada semana—si sabes cómo usarlas.",
      content: [
        {
          type: "text",
          text: "Seamos honestos: probablemente estás usando alrededor del 5% de lo que los asistentes de IA pueden hacer. La mayoría de la gente usa ChatGPT como un motor de búsqueda elegante.",
        },
        {
          type: "quote",
          text: "La IA no te reemplazará. Pero una persona que usa IA reemplazará a una persona que no usa IA.",
          author: "Sam Altman",
          role: "CEO de OpenAI",
        },
        {
          type: "heading",
          text: "Automatiza las Cosas Aburridas",
        },
        {
          type: "text",
          text: "Piensa en todas las tareas repetitivas que consumen tu tiempo. Redactar correos electrónicos, resumir documentos, generar informes, hacer lluvias de ideas—la IA puede manejar esto en segundos. El asistente de IA de Future Task está específicamente entrenado para ayudar con la gestión de tareas y productividad.",
        },
        {
          type: "list",
          items: [
            "Convierte notas rudimentarias en correos pulidos",
            "Descompone proyectos complejos en tareas accionables",
            "Genera resúmenes de estudio de libros de texto densos",
            "Crea esquemas de contenido y primeros borradores",
            "Analiza datos y detecta patrones que te perderías",
          ],
        },
        {
          type: "quote",
          text: "El objetivo es automatizar tareas, no trabajos. La IA debería manejar lo aburrido para que los humanos puedan enfocarse en lo creativo.",
          author: "Andrew Ng",
          role: "Pionero de IA y Cofundador de Coursera",
        },
        {
          type: "heading",
          text: "El Arte del Prompting con IA",
        },
        {
          type: "text",
          text: "Aquí está el secreto que la mayoría de la gente pierde: la IA es tan buena como tus prompts. Preguntas vagas obtienen respuestas vagas.",
        },
        {
          type: "text",
          text: "En lugar de 'Escribe un correo', prueba: 'Escribe un correo profesional pero amigable a un profesor solicitando una reunión para discutir mi propuesta de investigación. Mantenlo bajo 150 palabras y sugiere dos franjas horarias específicas la próxima semana.' ¿Ves la diferencia?",
        },
        {
          type: "quote",
          text: "La ingeniería de prompts se está convirtiendo en una de las habilidades más valiosas en la era de la IA.",
          author: "Ethan Mollick",
          role: "Profesor en Wharton School",
        },
        {
          type: "heading",
          text: "Más Allá del Texto: IA para Todo",
        },
        {
          type: "text",
          text: "La generación de texto es solo el comienzo. La IA moderna puede analizar imágenes, generar diseños, transcribir audio, crear presentaciones e incluso escribir código. Las herramientas están mejorando cada mes.",
        },
        {
          type: "text",
          text: "Usa IA para automatizar tu flujo de trabajo: transcribe notas de reuniones, genera listas de tareas desde conversaciones, crea horarios de estudio basados en tus objetivos, o analiza tus patrones de productividad. Las posibilidades se están expandiendo exponencialmente.",
        },
        {
          type: "heading",
          text: "El Toque Humano Todavía Importa",
        },
        {
          type: "text",
          text: "Esto es lo que la IA no puede reemplazar: pensamiento original, inteligencia emocional, creatividad y toma de decisiones estratégicas. Usa la IA como tu amplificador de productividad, no como tu reemplazo cerebral.",
        },
        {
          type: "quote",
          text: "El futuro pertenece a aquellos que pueden combinar la creatividad humana con la inteligencia de las máquinas.",
          author: "Kai-Fu Lee",
          role: "Experto en IA y Autor",
        },
        {
          type: "text",
          text: "Empieza pequeño. Elige una tarea que haces repetidamente y automatízala con IA. Rastrea cuánto tiempo ahorras. Luego expande. Antes de que te des cuenta, te preguntarás cómo alguna vez viviste sin tu asistente de IA. La revolución de la productividad está aquí—¿estás listo para unirte?",
        },
      ],
    },
    fr: {
      title: "Révolution de Productivité IA: Votre Assistant Personnel Vous Attend",
      author: "Équipe Future Task",
      date: "10 janvier 2025",
      readTime: "6 min de lecture",
      category: "IA & Automatisation",
      intro: "L'IA n'est plus seulement pour les géants de la tech. Ces outils peuvent gérer vos tâches ennuyeuses, stimuler la créativité et vous rendre des heures chaque semaine—si vous savez comment les utiliser.",
      content: [
        {
          type: "text",
          text: "Soyons honnêtes : vous utilisez probablement environ 5 % de ce que les assistants IA peuvent faire. La plupart des gens utilisent ChatGPT comme un moteur de recherche élégant.",
        },
        {
          type: "quote",
          text: "L'IA ne vous remplacera pas. Mais une personne utilisant l'IA remplacera une personne ne l'utilisant pas.",
          author: "Sam Altman",
          role: "PDG d'OpenAI",
        },
        {
          type: "heading",
          text: "Automatisez les Choses Ennuyeuses",
        },
        {
          type: "text",
          text: "Pensez à toutes les tâches répétitives qui mangent votre temps. Rédiger des emails, résumer des documents, générer des rapports—l'IA peut gérer cela en secondes.",
        },
        {
          type: "list",
          items: [
            "Transformez des notes rouillées en emails polis",
            "Décomposez des projets complexes en tâches actionnables",
            "Générez des résumés d'étude à partir de livres de texte épais",
            "Créez des esquisses de contenu et des premiers brouillons",
            "Analysez les données et repérez les motifs que vous manqueriez",
          ],
        },
        {
          type: "quote",
          text: "L'objectif est d'automatiser les tâches, pas les emplois. L'IA devrait gérer les ennuyeuses afin que les humains puissent se concentrer sur le créatif.",
          author: "Andrew Ng",
          role: "Pionnier de l'IA et cofondateur de Coursera",
        },
        {
          type: "heading",
          text: "L'Art du Prompting IA",
        },
        {
          type: "text",
          text: "Voici le secret que la plupart des gens manquent : l'IA est aussi bonne que vos prompts. Des questions vagues obtiennent des réponses vagues.",
        },
        {
          type: "text",
          text: "Au lieu de 'Écrire un email', essayez : 'Écrire un email professionnel mais amical à un professeur demandant une réunion pour discuter de ma proposition de recherche. Gardez-le sous 150 mots et proposez deux créneaux horaires spécifiques la semaine prochaine.' Voyez la différence ?",
        },
        {
          type: "quote",
          text: "L'ingénierie des prompts devient l'une des compétences les plus précieuses de l'époque de l'IA.",
          author: "Ethan Mollick",
          role: "Professeur à l'école Wharton",
        },
        {
          type: "heading",
          text: "Au-delà du Texte : IA pour Tout",
        },
        {
          type: "text",
          text: "La génération de texte est juste le début. L'IA moderne peut analyser des images, générer des designs, transcrire de l'audio, créer des présentations et même écrire du code. Les outils s'améliorent chaque mois.",
        },
        {
          type: "text",
          text: "Utilisez l'IA pour automatiser votre flux de travail : transcrire des notes de réunion, générer des listes de tâches à partir de conversations, créer des horaires d'étude basés sur vos objectifs, ou analyser vos modèles de productivité. Les possibilités s'étendent exponentiellement.",
        },
        {
          type: "heading",
          text: "Le Touch Humain Compte Toujours",
        },
        {
          type: "text",
          text: "Voici ce que l'IA ne peut pas remplacer : le pensée original, l'intelligence émotionnelle, la créativité et la prise de décision stratégique. Utilisez l'IA comme amplificateur de productivité, pas comme remplacement de votre cerveau.",
        },
        {
          type: "quote",
          text: "Le futur appartient à ceux qui peuvent combiner la créativité humaine avec l'intelligence artificielle.",
          author: "Kai-Fu Lee",
          role: "Expert en IA et Auteur",
        },
        {
          type: "text",
          text: "Commencez petit. Choisissez une tâche que vous faites régulièrement et automatissez-la avec l'IA. Suivez combien de temps vous gagnez. Puis étendez-vous. Avant que vous ne le sachiez, vous vous demanderez comment vous avez pu vivre sans votre assistant IA. La révolution de la productivité est ici—êtes-vous prêt à y participer ?",
        },
      ],
    },
    de: {
      title: "KI-Produktivitätsrevolution: Ihr Persönlicher Assistent Wartet",
      author: "Future Task Team",
      date: "10. Januar 2025",
      readTime: "6 Min. Lesezeit",
      category: "KI & Automatisierung",
      intro: "KI ist nicht mehr nur für Tech-Giganten. Diese Tools können Ihre Routinearbeit erledigen, Kreativität wecken und Ihnen jede Woche Stunden zurückgeben.",
      content: [
        {
          type: "text",
          text: "Seien wir ehrlich: Sie nutzen wahrscheinlich etwa 5% dessen, was KI-Assistenten können. Die meisten Leute nutzen ChatGPT wie eine schicke Suchmaschine.",
        },
        {
          type: "quote",
          text: "KI wird Sie nicht ersetzen. Aber eine Person, die KI nutzt, wird eine Person ersetzen, die KI nicht nutzt.",
          author: "Sam Altman",
          role: "CEO von OpenAI",
        },
        {
          type: "heading",
          text: "Automatisieren Sie das Langweilige",
        },
        {
          type: "text",
          text: "Denken Sie an all die sich wiederholenden Aufgaben, die Ihre Zeit fressen. E-Mails entwerfen, Dokumente zusammenfassen—KI kann dies in Sekunden erledigen.",
        },
      ],
    },
    it: {
      title: "Rivoluzione della Produttività IA: Il Tuo Assistente Personale Ti Aspetta",
      author: "Team Future Task",
      date: "10 gennaio 2025",
      readTime: "6 minuti di lettura",
      category: "IA & Automazione",
      intro: "L'IA non è più solo per i giganti della tecnologia. Questi strumenti possono gestire il tuo lavoro noioso e restituirti ore ogni settimana.",
      content: [
        {
          type: "text",
          text: "Siamo onesti: probabilmente stai usando circa il 5% di ciò che gli assistenti IA possono fare. La maggior parte delle persone usa ChatGPT come un motore di ricerca elegante.",
        },
        {
          type: "quote",
          text: "L'IA non ti sostituirà. Ma una persona che usa l'IA sostituirà una persona che non usa l'IA.",
          author: "Sam Altman",
          role: "CEO di OpenAI",
        },
        {
          type: "heading",
          text: "Automatizza le Cose Noiose",
        },
        {
          type: "text",
          text: "Pensa a tutti i compiti ripetitivi che mangiano il tuo tempo. Scrivere email, riassumere documenti—l'IA può gestirli in secondi.",
        },
      ],
    },
  },
}

type Language = "en" | "es" | "fr" | "de" | "it"

export default function BlogPost({ params }: { params: { slug: string } }) {
  const { slug } = params
  const [lang, setLang] = useState<Language>("en")

  useEffect(() => {
    const savedLang = (localStorage.getItem("language") as Language) || "en"
    setLang(savedLang)
  }, [])

  const post = blogContent[slug as keyof typeof blogContent]
  if (!post) {
    return <div>Post not found</div>
  }

  const content = post[lang]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4">
          <Link href="/blog">
            <Button variant="ghost" size="sm">
              ← Back to Blog
            </Button>
          </Link>
        </div>
      </header>

      {/* Article */}
      <article className="container mx-auto px-4 py-16 max-w-3xl">
        {/* Header */}
        <header className="mb-12 space-y-4">
          <div className="text-sm text-primary font-semibold uppercase tracking-wide">{content.category}</div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">{content.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{content.author}</span>
            <span>•</span>
            <span>{content.date}</span>
            <span>•</span>
            <span>{content.readTime}</span>
          </div>
        </header>

        {/* Intro */}
        <p className="text-xl text-muted-foreground mb-8 leading-relaxed">{content.intro}</p>

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
          {content.content.map((block, index) => {
            if (block.type === "text") {
              return (
                <p key={index} className="text-base leading-relaxed">
                  {block.text}
                </p>
              )
            }

            if (block.type === "heading") {
              return (
                <h2 key={index} className="text-2xl font-bold mt-10 mb-4">
                  {block.text}
                </h2>
              )
            }

            if (block.type === "quote") {
              return (
                <Card key={index} className="glass-card p-6 my-8 border-l-4 border-primary">
                  <blockquote className="space-y-3">
                    <p className="text-lg italic text-foreground leading-relaxed">"{block.text}"</p>
                    <footer className="text-sm">
                      <cite className="font-semibold not-italic">{block.author}</cite>
                      <span className="text-muted-foreground"> — {block.role}</span>
                    </footer>
                  </blockquote>
                </Card>
              )
            }

            if (block.type === "list") {
              return (
                <ul key={index} className="space-y-3 my-6">
                  {block.items?.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-primary mt-1">✓</span>
                      <span className="text-base leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              )
            }

            return null
          })}
        </div>

        {/* CTA */}
        <Card className="glass-card p-8 mt-16 text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to boost your productivity?</h3>
          <p className="text-muted-foreground mb-6">
            Join thousands of users who are working smarter with Future Task
          </p>
          <Link href="/signup">
            <Button size="lg" className="neon-glow-hover">
              Get Started Free
            </Button>
          </Link>
        </Card>
      </article>
    </div>
  )
}
