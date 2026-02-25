#!/usr/bin/env node

/**
 * Script para probar la conexión con Zoho SMTP
 * Uso: node test-email-zoho.js
 */

import nodemailer from 'nodemailer'

const smtpConfig = {
  host: process.env.SMTP_HOST || 'smtp.zoho.eu',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
}

console.log('[TEST] Configuración SMTP:')
console.log(`  Host: ${smtpConfig.host}`)
console.log(`  Port: ${smtpConfig.port}`)
console.log(`  Secure: ${smtpConfig.secure}`)
console.log(`  User: ${smtpConfig.auth.user}`)
console.log(`  Password: ${smtpConfig.auth.pass ? '[CONFIGURADO]' : '[NO CONFIGURADO]'}`)
console.log()

if (!smtpConfig.auth.user || !smtpConfig.auth.pass) {
  console.error('[ERROR] Faltan variables de entorno SMTP_USER o SMTP_PASSWORD')
  console.error('Por favor, configura las siguientes variables en Vercel:')
  console.error('  - SMTP_USER: tu email de Zoho')
  console.error('  - SMTP_PASSWORD: tu contraseña de Zoho (app-specific password)')
  process.exit(1)
}

async function testEmailConnection() {
  try {
    console.log('[INFO] Probando conexión con servidor SMTP...')
    
    const transporter = nodemailer.createTransport(smtpConfig)
    
    // Verificar conexión
    await transporter.verify()
    console.log('[SUCCESS] Conexión SMTP verificada correctamente ✓')
    console.log()
    
    // Enviar email de prueba
    console.log('[INFO] Enviando email de prueba...')
    
    const testEmail = process.env.TEST_EMAIL || smtpConfig.auth.user
    
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || smtpConfig.auth.user,
      to: testEmail,
      subject: 'Prueba de conexión SMTP Zoho - Futuristic Calendar',
      html: `
        <h2>Prueba de Conexión Exitosa</h2>
        <p>Este es un email de prueba para verificar que la conexión SMTP con Zoho está funcionando correctamente.</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <hr>
        <p>Si recibes este email, todo está configurado correctamente.</p>
      `,
      text: `Prueba de conexión SMTP - ${new Date().toISOString()}`,
    })
    
    console.log('[SUCCESS] Email enviado exitosamente ✓')
    console.log(`  Message ID: ${info.messageId}`)
    console.log(`  Destinatario: ${testEmail}`)
    console.log()
    console.log('[INFO] Por favor, verifica tu bandeja de entrada en los próximos minutos.')
    
  } catch (error) {
    console.error('[ERROR] Fallo en la prueba:')
    console.error(`  ${error.message}`)
    console.error()
    
    if (error.code === 'EAUTH') {
      console.error('[HINT] Error de autenticación. Verifica:')
      console.error('  1. El email (SMTP_USER) es correcto')
      console.error('  2. La contraseña es una "app-specific password" de Zoho, no tu contraseña regular')
      console.error('  3. Acceso desde aplicaciones externas está habilitado en Zoho')
    } else if (error.code === 'ECONNREFUSED') {
      console.error('[HINT] No se puede conectar al servidor. Verifica:')
      console.error('  1. El host SMTP es correcto: smtp.zoho.eu')
      console.error('  2. El puerto es correcto: 465')
      console.error('  3. Tu conexión a internet está activa')
    }
    
    process.exit(1)
  }
}

testEmailConnection()
