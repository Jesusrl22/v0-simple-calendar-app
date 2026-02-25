import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ error: "Token y contraseña requeridos" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Verificar que el token existe y es válido
    const { data: users, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("reset_token", token)
      .single()

    if (fetchError || !users) {
      console.error("[v0] Token de reset inválido:", token)
      return NextResponse.json({ error: "Token de reset inválido o expirado" }, { status: 400 })
    }

    // Verificar si el token ha expirado
    if (users.reset_token_expires && new Date(users.reset_token_expires) < new Date()) {
      console.error("[v0] Token de reset expirado")
      return NextResponse.json({ error: "El token de reset ha expirado" }, { status: 400 })
    }

    // Actualizar contraseña usando Supabase Admin API
    const { error: updateError } = await supabase.auth.admin.updateUserById(users.id, {
      password: password,
    })

    if (updateError) {
      console.error("[v0] Error al actualizar contraseña:", updateError.message)
      return NextResponse.json({ error: "Error al actualizar la contraseña" }, { status: 500 })
    }

    // Limpiar token de reset
    await supabase
      .from("users")
      .update({ reset_token: null, reset_token_expires: null })
      .eq("id", users.id)

    console.log("[v0] Contraseña restablecida exitosamente para:", users.email)

    return NextResponse.json({
      success: true,
      message: "Contraseña restablecida exitosamente",
    })
  } catch (error: any) {
    console.error("[v0] Error en reset de contraseña:", error.message)
    return NextResponse.json({ error: "Error al restablecer la contraseña" }, { status: 500 })
  }
}
