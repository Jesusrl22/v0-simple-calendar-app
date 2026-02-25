import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Terms of Service - Future Task",
  description: "Terms of Service and User Agreement for Future Task",
}

export default function TermsPage() {
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
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-8">Terms of Service</h1>
        <p className="text-sm sm:text-base text-muted-foreground mb-8">Last Updated: January 2025</p>

        <div className="space-y-6 sm:space-y-8 text-foreground">
          <section>
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">1. Acceptance of Terms</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              By accessing and using Future Task ("Service"), you accept and agree to be bound by the terms and
              provision of this agreement. If you do not agree to these Terms of Service, please do not use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">2. Description of Service</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Future Task is a productivity platform that provides task management, calendar, notes, AI assistance, and
              related features. We reserve the right to modify, suspend, or discontinue any aspect of the Service at any
              time without prior notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">3. User Accounts</h2>
            <div className="space-y-3 text-sm sm:text-base text-muted-foreground">
              <p>To use certain features, you must register for an account. You agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain the security of your password and account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
                <li>Be responsible for all activities that occur under your account</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">4. Subscription Plans</h2>
            <div className="space-y-3 text-sm sm:text-base text-muted-foreground">
              <p>Future Task offers Free, Premium, and Pro subscription plans:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Free Plan:</strong> Basic features with limited access
                </li>
                <li>
                  <strong>Premium Plan:</strong> Enhanced features and 100 monthly AI credits
                </li>
                <li>
                  <strong>Pro Plan:</strong> Full access to all features and 500 monthly AI credits
                </li>
              </ul>
              <p className="mt-3">
                Subscription fees are billed in advance on a monthly or annual basis and are non-refundable except as
                required by law.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">5. AI Credits</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              AI credits are used to access AI-powered features. Monthly credits reset at the beginning of each billing
              cycle and do not roll over. Purchased credit packs do not expire and remain available until used.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">6. Acceptable Use</h2>
            <div className="space-y-3 text-sm sm:text-base text-muted-foreground">
              <p>You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use the Service for any illegal purpose or in violation of any laws</li>
                <li>Attempt to gain unauthorized access to any portion of the Service</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Upload or transmit viruses, malware, or malicious code</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Use automated systems to access the Service without permission</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">7. Intellectual Property</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              The Service and its original content, features, and functionality are owned by Future Task and are
              protected by international copyright, trademark, and other intellectual property laws. You retain
              ownership of content you create using the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">8. Privacy</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Your use of the Service is also governed by our{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              . Please review our Privacy Policy to understand our practices.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">9. Termination</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              We may terminate or suspend your account and access to the Service immediately, without prior notice, for
              conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for
              any other reason.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">10. Disclaimer of Warranties</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              The Service is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, either express or
              implied. We do not warrant that the Service will be uninterrupted, secure, or error-free.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">11. Limitation of Liability</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              In no event shall Future Task be liable for any indirect, incidental, special, consequential, or punitive
              damages resulting from your use of or inability to use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">12. Changes to Terms</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify users of any material changes by
              posting the new Terms on this page and updating the "Last Updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">13. Contact Us</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              If you have any questions about these Terms, please contact us at:{" "}
              <a href="mailto:support@future-task.com" className="text-primary hover:underline break-all">
                support@future-task.com
              </a>
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
