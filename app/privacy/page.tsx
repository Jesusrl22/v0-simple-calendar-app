import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Privacy Policy - Future Task",
  description: "Privacy Policy and Data Protection information for Future Task",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-2 sm:gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-bold text-sm">FT</span>
            </div>
            <span className="font-semibold text-base sm:text-lg truncate">Future Task</span>
          </Link>
          <Link href="/">
            <Button variant="outline" size="sm" className="text-sm bg-transparent">
              Back
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-4xl">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-8">Privacy Policy</h1>
        <p className="text-sm sm:text-base text-muted-foreground mb-8">Last Updated: January 2025</p>

        <div className="space-y-6 sm:space-y-8 text-foreground">
          <section>
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">1. Introduction</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Future Task ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains
              how we collect, use, disclose, and safeguard your information when you use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">2. Information We Collect</h2>
            <div className="space-y-4 text-sm sm:text-base text-muted-foreground">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Personal Information</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Name and email address</li>
                  <li>Account credentials (encrypted passwords)</li>
                  <li>Profile preferences (theme, language, timezone)</li>
                  <li>Subscription and payment information (processed securely through PayPal)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Content You Create</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Tasks, events, and calendar entries</li>
                  <li>Notes and wishlist items</li>
                  <li>AI chat conversations</li>
                  <li>Pomodoro session data</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Usage Information</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Device information and browser type</li>
                  <li>IP address and location data</li>
                  <li>Usage statistics and analytics</li>
                  <li>Cookies and similar technologies</li>
                </ul>
              </div>
            </div>
          </section>

          {/* ... rest of sections remain the same ... */}
          <section>
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">3. How We Use Your Information</h2>
            <div className="space-y-3 text-sm sm:text-base text-muted-foreground">
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide, operate, and maintain our Service</li>
                <li>Process your transactions and manage subscriptions</li>
                <li>Send you notifications and updates</li>
                <li>Respond to your comments and questions</li>
                <li>Analyze usage patterns to improve the Service</li>
                <li>Detect and prevent fraud and abuse</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">4. AI Features and Data Processing</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              When you use AI-powered features, your prompts and content may be processed by third-party AI providers
              (OpenAI). We do not train AI models on your personal data. AI conversations are stored securely and
              associated with your account for your reference.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">5. Data Storage and Security</h2>
            <div className="space-y-3 text-sm sm:text-base text-muted-foreground">
              <p>We implement industry-standard security measures to protect your data:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Data encryption in transit (HTTPS/TLS) and at rest</li>
                <li>Secure authentication with password hashing (bcrypt)</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and monitoring</li>
                <li>Data hosted on secure infrastructure (Supabase/Vercel)</li>
              </ul>
              <p className="mt-3">
                However, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute
                security.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">6. Data Sharing and Disclosure</h2>
            <div className="space-y-3 text-sm sm:text-base text-muted-foreground">
              <p>We do not sell your personal information. We may share your data with:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Service Providers:</strong> Supabase (database), Vercel (hosting), PayPal (payments), OpenAI
                  (AI features)
                </li>
                <li>
                  <strong>Legal Requirements:</strong> When required by law or to protect our rights
                </li>
                <li>
                  <strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">7. Your Rights and Choices</h2>
            <div className="space-y-3 text-sm sm:text-base text-muted-foreground">
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access and download your personal data</li>
                <li>Correct inaccurate or incomplete information</li>
                <li>Delete your account and associated data</li>
                <li>Opt-out of marketing communications</li>
                <li>Disable notifications in your settings</li>
                <li>Request data portability</li>
              </ul>
              <p className="mt-3">
                To exercise these rights, contact us at{" "}
                <a href="mailto:support@future-task.com" className="text-primary hover:underline break-all">
                  support@future-task.com
                </a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">8. Cookies and Tracking</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              We use cookies and similar technologies to maintain sessions, remember preferences, and analyze usage. You
              can control cookies through your browser settings. We use Google Analytics for usage statistics and Google
              AdSense for advertising.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">9. Children's Privacy</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Our Service is not intended for children under 13 years of age. We do not knowingly collect personal
              information from children under 13. If you believe we have collected such information, please contact us
              immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">10. International Data Transfers</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Your information may be transferred to and processed in countries other than your own. We ensure
              appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">11. Data Retention</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              We retain your personal information for as long as necessary to provide the Service and fulfill the
              purposes outlined in this Privacy Policy. When you delete your account, we will delete your personal data
              within 30 days, except where required by law to retain it longer.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">12. Changes to This Privacy Policy</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new
              Privacy Policy on this page and updating the "Last Updated" date. Your continued use of the Service after
              changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">13. Contact Us</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              If you have questions about this Privacy Policy or our data practices, please contact us at:{" "}
              <a href="mailto:support@future-task.com" className="text-primary hover:underline break-all">
                support@future-task.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">14. GDPR Compliance (EU Users)</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              If you are in the European Union, you have additional rights under GDPR including the right to lodge a
              complaint with a supervisory authority. We process your data based on consent, contractual necessity, and
              legitimate interests.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-border/50 mt-12 sm:mt-20">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <p className="text-center text-xs sm:text-sm text-muted-foreground">
            © 2025 Future Task. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
