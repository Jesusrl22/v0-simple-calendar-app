"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"
import { useTranslation } from "@/hooks/useTranslation"
import { useRouter } from "next/navigation"

export default function ContactPageClient() {
  const router = useRouter()
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-bold">FT</span>
            </div>
            <span className="font-semibold text-lg">Future Task</span>
          </Link>
          <Button variant="outline" onClick={() => router.push("/")}>
            {t("back")}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{t("contact_us")}</h1>
          <p className="text-muted-foreground text-lg">{t("contact_description")}</p>
        </div>

        <div className="glass-card border border-primary/20 rounded-lg p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="w-8 h-8 text-primary" />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3">{t("email_support")}</h2>
            <p className="text-muted-foreground mb-4">{t("contact_email_description")}</p>
            <a
              href="mailto:support@future-task.com"
              className="inline-flex items-center gap-2 text-xl font-semibold text-primary hover:underline"
            >
              <Mail className="w-5 h-5" />
              support@future-task.com
            </a>
          </div>

          <div className="pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground">{t("response_time")}</p>
          </div>
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <div className="glass-card border border-primary/20 rounded-lg p-6">
            <h3 className="font-semibold mb-2">{t("technical_support")}</h3>
            <p className="text-sm text-muted-foreground">{t("technical_support_description")}</p>
          </div>

          <div className="glass-card border border-primary/20 rounded-lg p-6">
            <h3 className="font-semibold mb-2">{t("billing_questions")}</h3>
            <p className="text-sm text-muted-foreground">{t("billing_questions_description")}</p>
          </div>

          <div className="glass-card border border-primary/20 rounded-lg p-6">
            <h3 className="font-semibold mb-2">{t("feature_requests")}</h3>
            <p className="text-sm text-muted-foreground">{t("feature_requests_description")}</p>
          </div>

          <div className="glass-card border border-primary/20 rounded-lg p-6">
            <h3 className="font-semibold mb-2">{t("privacy_data")}</h3>
            <p className="text-sm text-muted-foreground">{t("privacy_data_description", { link: "/privacy" })}</p>
          </div>
        </div>
      </main>

      <footer className="border-t border-border/50 mt-20">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-sm text-muted-foreground">© 2025 Future Task. {t("all_rights_reserved")}</p>
        </div>
      </footer>
    </div>
  )
}
