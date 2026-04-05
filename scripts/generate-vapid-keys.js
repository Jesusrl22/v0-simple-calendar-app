#!/usr/bin/env node

/**
 * Script para generar claves VAPID para notificaciones push
 * Ejecutar con: node scripts/generate-vapid-keys.js
 */

const webpush = require('web-push')

console.log('🔑 Generando claves VAPID para notificaciones push...\n')

const vapidKeys = webpush.generateVAPIDKeys()

console.log('✅ Claves VAPID generadas exitosamente!\n')
console.log('Agrega las siguientes variables a tu archivo .env.local:\n')
console.log('NEXT_PUBLIC_VAPID_PUBLIC_KEY=' + vapidKeys.publicKey)
console.log('VAPID_PRIVATE_KEY=' + vapidKeys.privateKey)
console.log('VAPID_SUBJECT=mailto:support@futuretask.app\n')

console.log('Luego reinicia tu servidor de desarrollo.\n')
