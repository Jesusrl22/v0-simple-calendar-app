"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface CookieBannerProps {
  language?: string
}

const translations = {
  en: {
    title: "We value your privacy",
    description:
      "We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking 'Accept All', you consent to our use of cookies.",
    acceptAll: "Accept All",
    rejectAll: "Reject All",
    customize: "Customize",
    learnMore: "Learn More",
    necessary: "Necessary Cookies",
    necessaryDesc: "Required for the website to function properly. Cannot be disabled.",
    analytics: "Analytics Cookies",
    analyticsDesc: "Help us understand how visitors interact with our website.",
    marketing: "Marketing Cookies",
    marketingDesc: "Used to track visitors across websites to display relevant ads.",
    savePreferences: "Save Preferences",
  },
  es: {
    title: "Valoramos tu privacidad",
    description:
      "Utilizamos cookies para mejorar tu experiencia de navegación, servir contenido personalizado y analizar nuestro tráfico. Al hacer clic en 'Aceptar Todo', aceptas nuestro uso de cookies.",
    acceptAll: "Aceptar Todo",
    rejectAll: "Rechazar Todo",
    customize: "Personalizar",
    learnMore: "Más Información",
    necessary: "Cookies Necesarias",
    necessaryDesc: "Necesarias para que el sitio web funcione correctamente. No se pueden desactivar.",
    analytics: "Cookies de Análisis",
    analyticsDesc: "Nos ayudan a entender cómo los visitantes interactúan con nuestro sitio web.",
    marketing: "Cookies de Marketing",
    marketingDesc: "Se utilizan para rastrear visitantes en sitios web y mostrar anuncios relevantes.",
    savePreferences: "Guardar Preferencias",
  },
  fr: {
    title: "Nous respectons votre vie privée",
    description:
      "Nous utilisons des cookies pour améliorer votre expérience de navigation, fournir du contenu personnalisé et analyser notre trafic. En cliquant sur 'Tout Accepter', vous consentez à notre utilisation des cookies.",
    acceptAll: "Tout Accepter",
    rejectAll: "Tout Rejeter",
    customize: "Personnaliser",
    learnMore: "En Savoir Plus",
    necessary: "Cookies Nécessaires",
    necessaryDesc: "Nécessaires au bon fonctionnement du site web. Ne peuvent pas être désactivés.",
    analytics: "Cookies d'Analyse",
    analyticsDesc: "Nous aident à comprendre comment les visiteurs interagissent avec notre site web.",
    marketing: "Cookies Marketing",
    marketingDesc: "Utilisés pour suivre les visiteurs sur les sites web et afficher des publicités pertinentes.",
    savePreferences: "Enregistrer les Préférences",
  },
  de: {
    title: "Wir schätzen Ihre Privatsphäre",
    description:
      "Wir verwenden Cookies, um Ihr Surferlebnis zu verbessern, personalisierte Inhalte bereitzustellen und unseren Datenverkehr zu analysieren. Durch Klicken auf 'Alle Akzeptieren' stimmen Sie unserer Verwendung von Cookies zu.",
    acceptAll: "Alle Akzeptieren",
    rejectAll: "Alle Ablehnen",
    customize: "Anpassen",
    learnMore: "Mehr Erfahren",
    necessary: "Notwendige Cookies",
    necessaryDesc: "Erforderlich für das ordnungsgemäße Funktionieren der Website. Können nicht deaktiviert werden.",
    analytics: "Analyse-Cookies",
    analyticsDesc: "Helfen uns zu verstehen, wie Besucher mit unserer Website interagieren.",
    marketing: "Marketing-Cookies",
    marketingDesc: "Werden verwendet, um Besucher über Websites hinweg zu verfolgen und relevante Anzeigen anzuzeigen.",
    savePreferences: "Einstellungen Speichern",
  },
  it: {
    title: "Rispettiamo la tua privacy",
    description:
      "Utilizziamo i cookie per migliorare la tua esperienza di navigazione, fornire contenuti personalizzati e analizzare il nostro traffico. Cliccando su 'Accetta Tutto', acconsenti all'uso dei cookie.",
    acceptAll: "Accetta Tutto",
    rejectAll: "Rifiuta Tutto",
    customize: "Personalizza",
    learnMore: "Maggiori Informazioni",
    necessary: "Cookie Necessari",
    necessaryDesc: "Necessari per il corretto funzionamento del sito web. Non possono essere disabilitati.",
    analytics: "Cookie Analitici",
    analyticsDesc: "Ci aiutano a capire come i visitatori interagiscono con il nostro sito web.",
    marketing: "Cookie di Marketing",
    marketingDesc: "Utilizzati per tracciare i visitatori sui siti web e visualizzare annunci pertinenti.",
    savePreferences: "Salva Preferenze",
  },
}

export default function CookieBanner({ language = "en" }: CookieBannerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [showCustomize, setShowCustomize] = useState(false)
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
  })

  const t = translations[language as keyof typeof translations] || translations.en

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent")
    if (!consent) {
      setIsVisible(true)
    }
  }, [])

  const handleAcceptAll = () => {
    const consent = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    }
    localStorage.setItem("cookie-consent", JSON.stringify(consent))
    setIsVisible(false)

    // Enable Google Analytics if accepted
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: "granted",
        ad_storage: "granted",
      })
    }
  }

  const handleRejectAll = () => {
    const consent = {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    }
    localStorage.setItem("cookie-consent", JSON.stringify(consent))
    setIsVisible(false)

    // Disable Google Analytics
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: "denied",
        ad_storage: "denied",
      })
    }
  }

  const handleSavePreferences = () => {
    const consent = {
      ...preferences,
      timestamp: new Date().toISOString(),
    }
    localStorage.setItem("cookie-consent", JSON.stringify(consent))
    setIsVisible(false)

    // Update Google Analytics based on preferences
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: preferences.analytics ? "granted" : "denied",
        ad_storage: preferences.marketing ? "granted" : "denied",
      })
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 pb-4 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-lg bg-background/95 backdrop-blur-sm border border-border shadow-lg p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-2">{t.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{t.description}</p>

              {showCustomize && (
                <div className="space-y-4 mb-4">
                  <div className="flex items-start gap-3 p-3 rounded-md bg-muted/50">
                    <input type="checkbox" checked={preferences.necessary} disabled className="mt-1" />
                    <div>
                      <p className="font-medium text-sm">{t.necessary}</p>
                      <p className="text-xs text-muted-foreground">{t.necessaryDesc}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-md bg-muted/50">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium text-sm">{t.analytics}</p>
                      <p className="text-xs text-muted-foreground">{t.analyticsDesc}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-md bg-muted/50">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium text-sm">{t.marketing}</p>
                      <p className="text-xs text-muted-foreground">{t.marketingDesc}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {!showCustomize ? (
                  <>
                    <Button onClick={handleAcceptAll} size="sm">
                      {t.acceptAll}
                    </Button>
                    <Button onClick={handleRejectAll} variant="outline" size="sm">
                      {t.rejectAll}
                    </Button>
                    <Button onClick={() => setShowCustomize(true)} variant="ghost" size="sm">
                      {t.customize}
                    </Button>
                    <Button asChild variant="ghost" size="sm">
                      <a href="/privacy" target="_blank" rel="noopener noreferrer">
                        {t.learnMore}
                      </a>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={handleSavePreferences} size="sm">
                      {t.savePreferences}
                    </Button>
                    <Button onClick={() => setShowCustomize(false)} variant="outline" size="sm">
                      {t.rejectAll}
                    </Button>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={handleRejectAll}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
