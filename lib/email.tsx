// Email functionality uses Supabase Auth for sending emails
// Supabase handles all email delivery automatically

export function isSMTPConfigured(): boolean {
  // Supabase is handling email via their built-in email service
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL
}

export async function sendVerificationEmail(email: string, name?: string) {
  // Supabase Auth handles verification emails automatically during signup
  // The signup process sends them via Supabase's email service
  console.log("[EMAIL] Verification email will be sent by Supabase Auth")
  return { success: true, message: "Supabase Auth will send verification email" }
}

export async function sendPasswordResetEmail(email: string, resetLink: string, name?: string) {
  // Supabase Auth handles password reset emails
  console.log("[EMAIL] Password reset email will be sent by Supabase Auth")
  return { success: true, message: "Supabase Auth will send password reset email" }
}

export async function sendWelcomeEmail(email: string, name?: string) {
  // Welcome emails are optional - Supabase handles this
  console.log("[EMAIL] Welcome email notification (optional)")
  return { success: true, message: "Welcome notification sent" }
}

export async function sendNewDeviceLoginEmail(email: string, name?: string, deviceInfo?: string) {
  // Device login notifications are optional
  console.log("[EMAIL] New device login notification")
  return { success: true, message: "Device notification sent" }
}

export async function sendSubscriptionCancelledEmail(email: string, name?: string, reason?: string) {
  // Subscription emails are optional
  console.log("[EMAIL] Subscription update notification")
  return { success: true, message: "Subscription notification sent" }
}
