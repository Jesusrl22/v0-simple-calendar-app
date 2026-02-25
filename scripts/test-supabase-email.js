import { createClient } from '@supabase/supabase-js'

// Configuración
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const TEST_EMAIL = 'jesusrayaleon1@gmail.com'

console.log('[v0] Starting Supabase email test...')
console.log('[v0] Supabase URL:', SUPABASE_URL)
console.log('[v0] Service Key available:', !!SUPABASE_SERVICE_KEY)

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('[v0] ERROR: Missing Supabase credentials in environment variables')
  console.error('[v0] NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL)
  console.error('[v0] SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_KEY ? 'SET' : 'MISSING')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function testEmail() {
  try {
    console.log(`[v0] Attempting to send test email to: ${TEST_EMAIL}`)
    
    // Intentar enviar email de verificación
    const { error } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email: TEST_EMAIL,
      options: {
        redirectTo: 'http://localhost:3000/auth/callback',
      },
    })

    if (error) {
      console.error('[v0] ERROR sending email:', error.message)
      console.error('[v0] Full error:', error)
      return false
    }

    console.log('[v0] SUCCESS! Test email command sent to Supabase')
    console.log('[v0] Check your email inbox at:', TEST_EMAIL)
    console.log('[v0] If you don\'t receive it in 5 minutes, Supabase SMTP is NOT configured')
    return true
  } catch (err) {
    console.error('[v0] Exception:', err.message)
    return false
  }
}

testEmail().then(success => {
  process.exit(success ? 0 : 1)
})
