import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    smtp_configured: false,
    smtp_vars: {
      SMTP_HOST: !!process.env.SMTP_HOST,
      SMTP_PORT: !!process.env.SMTP_PORT,
      SMTP_USER: !!process.env.SMTP_USER,
      SMTP_PASSWORD: !!process.env.SMTP_PASSWORD,
      SMTP_FROM: !!process.env.SMTP_FROM,
    },
    smtp_values: {
      host: process.env.SMTP_HOST || 'NO CONFIGURADO',
      port: process.env.SMTP_PORT || 'NO CONFIGURADO',
      user: process.env.SMTP_USER ? process.env.SMTP_USER.substring(0, 5) + '***' : 'NO CONFIGURADO',
      from: process.env.SMTP_FROM || 'NO CONFIGURADO',
      password: process.env.SMTP_PASSWORD ? '***' : 'NO CONFIGURADO',
    },
    environment: process.env.NODE_ENV,
    app_url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  }

  // Check if SMTP is configured
  diagnostics.smtp_configured = !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASSWORD
  )

  // Try to test the connection
  if (diagnostics.smtp_configured) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number.parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      })

      // Verify connection
      await transporter.verify()
      Object.assign(diagnostics, {
        smtp_connection_status: 'OK',
        smtp_connection_test: 'Conexión SMTP verificada exitosamente',
      })
    } catch (error: any) {
      Object.assign(diagnostics, {
        smtp_connection_status: 'ERROR',
        smtp_connection_error: error.message,
        smtp_error_code: error.code,
        smtp_error_details: error.command || 'N/A',
      })
    }
  }

  return NextResponse.json(diagnostics, { status: 200 })
}
