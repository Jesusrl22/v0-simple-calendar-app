import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 })
  }
  
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {
      SMTP_HOST: process.env.SMTP_HOST ? `✓ ${process.env.SMTP_HOST}` : "✗ No configurado",
      SMTP_PORT: process.env.SMTP_PORT ? `✓ ${process.env.SMTP_PORT}` : "✗ No configurado",
      SMTP_USER: process.env.SMTP_USER ? `✓ ${process.env.SMTP_USER.substring(0, 3)}***` : "✗ No configurado",
      SMTP_PASSWORD: process.env.SMTP_PASSWORD ? `✓ ${process.env.SMTP_PASSWORD.substring(0, 3)}***` : "✗ No configurado",
      SMTP_FROM: process.env.SMTP_FROM ? `✓ ${process.env.SMTP_FROM}` : "✗ No configurado (usará SMTP_USER)",
    },
    configured: false,
    testResult: null as any,
    error: null as any
  }

  // Verificar si está configurado
  diagnostics.configured = !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASSWORD
  )

  if (!diagnostics.configured) {
    console.error("[TEST-SMTP] ❌ SMTP no está configurado")
    return NextResponse.json(diagnostics, { status: 200 })
  }

  // Intentar enviar un email de prueba
  try {
    const config = {
      host: process.env.SMTP_HOST,
      port: Number.parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    }

    const transporter = nodemailer.createTransport(config)

    await transporter.verify()

    diagnostics.testResult = {
      connection: "✓ Conexión verificada exitosamente",
      message: "El servidor SMTP está configurado correctamente y accesible"
    }

  } catch (error: any) {
    diagnostics.error = {
      message: error.message,
      code: error.code,
      command: error.command,
      responseCode: error.responseCode,
      response: error.response,
    }
  }

  return NextResponse.json(diagnostics, { status: 200 })
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 })
  }

  const { to } = await request.json()
  
  if (!to) {
    return NextResponse.json({ error: "Email destinatario requerido" }, { status: 400 })
  }

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    return NextResponse.json({ 
      error: "SMTP no configurado", 
      details: {
        SMTP_HOST: !!process.env.SMTP_HOST,
        SMTP_USER: !!process.env.SMTP_USER,
        SMTP_PASSWORD: !!process.env.SMTP_PASSWORD,
      }
    }, { status: 400 })
  }

  try {
    const config = {
      host: process.env.SMTP_HOST,
      port: Number.parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    }

    const transporter = nodemailer.createTransporter(config)
    
    const result = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: to,
      subject: "Test Email desde Future Task",
      html: `
        <h1>Email de Prueba</h1>
        <p>Este es un email de prueba enviado desde Future Task.</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
        <p>Si recibes este email, significa que la configuración SMTP está funcionando correctamente.</p>
      `,
    })

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      to: to,
      message: "Email enviado exitosamente"
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      details: {
        code: error.code,
        command: error.command,
        responseCode: error.responseCode,
        response: error.response,
      }
    }, { status: 500 })
  }
}
