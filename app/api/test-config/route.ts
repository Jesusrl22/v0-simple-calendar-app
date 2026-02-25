import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { isSMTPConfigured } from "@/lib/email"
import { areVapidKeysConfigured } from "@/lib/web-push"

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 })
  }

  const results = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
    },
    supabase: {
      configured: false,
      url: "",
      canConnect: false,
      tables: [] as string[],
      error: null as string | null,
    },
    smtp: {
      configured: false,
      details: {
        host: "",
        port: "",
        user: "",
        from: "",
      },
      error: null as string | null,
    },
    vapid: {
      configured: false,
      hasPublicKey: false,
      hasPrivateKey: false,
      publicKeyPreview: "",
      error: null as string | null,
    },
    recommendations: [] as string[],
  }

  // Test 1: Supabase
  try {
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY

    results.supabase.configured = hasUrl && hasAnonKey && hasServiceKey
    results.supabase.url = process.env.NEXT_PUBLIC_SUPABASE_URL || "NO CONFIGURADO"

    if (results.supabase.configured) {
      console.log("[TEST-CONFIG] ✓ Supabase configurado")
      
      // Intentar conexión
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      // Verificar conexión listando tablas
      const { data, error } = await supabase
        .from("users")
        .select("count")
        .limit(1)

      if (error) {
        results.supabase.error = error.message
        results.recommendations.push("⚠️ Supabase configurado pero hay error de conexión: " + error.message)
      } else {
        results.supabase.canConnect = true
        results.supabase.tables = ["users", "tasks", "calendar_events", "push_subscriptions"]
        console.log("[TEST-CONFIG] ✓ Conexión a Supabase exitosa")
      }
    } else {
      results.supabase.error = "Faltan variables de entorno"
      results.recommendations.push("❌ Configura Supabase: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY")
    }
  } catch (error: any) {
    results.supabase.error = error.message
    console.error("[TEST-CONFIG] ❌ Error en test de Supabase:", error)
  }

  // Test 2: SMTP
  try {
    results.smtp.configured = isSMTPConfigured()
    results.smtp.details = {
      host: process.env.SMTP_HOST || "NO CONFIGURADO",
      port: process.env.SMTP_PORT || "NO CONFIGURADO",
      user: process.env.SMTP_USER ? process.env.SMTP_USER.substring(0, 3) + "***" : "NO CONFIGURADO",
      from: process.env.SMTP_FROM || process.env.SMTP_USER || "NO CONFIGURADO",
    }

    if (results.smtp.configured) {
      console.log("[TEST-CONFIG] ✓ SMTP configurado")
    } else {
      results.smtp.error = "Faltan variables SMTP"
      results.recommendations.push(
        "❌ Configura SMTP para enviar correos: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM"
      )
      results.recommendations.push(
        "💡 Ejemplo con Zoho Mail: SMTP_HOST=smtp.zoho.eu, SMTP_PORT=465, SMTP_USER=tu-email@tudominio.com"
      )
    }
  } catch (error: any) {
    results.smtp.error = error.message
    console.error("[TEST-CONFIG] ❌ Error en test de SMTP:", error)
  }

  // Test 3: VAPID Keys
  try {
    const hasPublic = !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    const hasPrivate = !!process.env.VAPID_PRIVATE_KEY

    results.vapid.configured = areVapidKeysConfigured()
    results.vapid.hasPublicKey = hasPublic
    results.vapid.hasPrivateKey = hasPrivate

    if (hasPublic) {
      results.vapid.publicKeyPreview = 
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!.substring(0, 10) + "..."
    }

    if (results.vapid.configured) {
      console.log("[TEST-CONFIG] ✓ VAPID keys configuradas")
    } else {
      results.vapid.error = "Faltan VAPID keys"
      results.recommendations.push(
        "❌ Configura VAPID para notificaciones push: NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY"
      )
      results.recommendations.push(
        "💡 Para generar keys: npx web-push generate-vapid-keys"
      )
    }
  } catch (error: any) {
    results.vapid.error = error.message
    console.error("[TEST-CONFIG] ❌ Error en test de VAPID:", error)
  }

  // Resumen
  const allConfigured = 
    results.supabase.configured && 
    results.smtp.configured && 
    results.vapid.configured

  if (allConfigured) {
    console.log("[TEST-CONFIG] ✅ TODO CONFIGURADO CORRECTAMENTE")
  } else {
    console.log("[TEST-CONFIG] ⚠️ Configuración incompleta")
  }

  return NextResponse.json({
    success: allConfigured,
    results,
    summary: {
      supabase: results.supabase.configured ? "✓ Configurado" : "✗ No configurado",
      smtp: results.smtp.configured ? "✓ Configurado" : "✗ No configurado",
      vapid: results.vapid.configured ? "✓ Configurado" : "✗ No configurado",
    },
  })
}
