import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email es requerido" }, { status: 400 })
    }

    console.log("[v0] Solicitud de cambio de contraseña para:", email)

    // Usar SERVICE_ROLE_KEY para evitar RLS recursion
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Usar Supabase Auth para password reset - ellos manejan el email
    const { error: resetError } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email: email.toLowerCase(),
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password`,
      },
    })

    // Siempre retornar éxito por seguridad (no revelar si el email existe)
    if (resetError) {
      console.error("[v0] Error en Supabase reset link:", resetError.message)
    } else {
      console.log("[v0] Reset link generado por Supabase Auth")
    }

    return NextResponse.json({
      success: true,
      message: "Si existe una cuenta con ese correo, recibirás instrucciones para restablecer tu contraseña.",
    })
  } catch (error: any) {
    console.error("[v0] Error en forgot password:", error.message)
    return NextResponse.json({
      success: true,
      message: "Si existe una cuenta con ese correo, recibirás instrucciones para restablecer tu contraseña.",
    })
  }
}
