import webpush from 'web-push'

// Generate valid VAPID keys
const vapidKeys = webpush.generateVAPIDKeys()

console.log('🔑 Claves VAPID generadas correctamente:\n')
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`)
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`)
console.log(`VAPID_SUBJECT=mailto:support@futuretask.app`)

// Verify the keys are valid
try {
  webpush.setVapidDetails(
    'mailto:support@futuretask.app',
    vapidKeys.publicKey,
    vapidKeys.privateKey
  )
  console.log('\n✅ Las claves VAPID son válidas y funcionarán correctamente.')
} catch (error) {
  console.error('❌ Error validando las claves:', error)
}
