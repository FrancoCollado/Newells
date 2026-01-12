import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Este endpoint crea usuarios de prueba usando signUp normal
export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    console.log("[v0] Starting user creation...")
    console.log("[v0] Supabase URL:", supabaseUrl)

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: "Configuración de Supabase incompleta" }, { status: 500 })
    }

    const users = [
      {
        email: "admin1@newells.com",
        password: "newells123",
        name: "Administrador 1",
        role: "administrador",
      },
      {
        email: "dirigente1@newells.com",
        password: "newells123",
        name: "Dirigente 1",
        role: "dirigente",
      },
      {
        email: "entrenador1@newells.com",
        password: "newells123",
        name: "Entrenador 1",
        role: "entrenador",
      },
      {
        email: "medico1@newells.com",
        password: "newells123",
        name: "Médico 1",
        role: "medico",
      },
      {
        email: "psicologo1@newells.com",
        password: "newells123",
        name: "Psicólogo 1",
        role: "psicologo",
      },
    ]

    const results = []

    for (const user of users) {
      // Crear un cliente nuevo para cada usuario
      const supabase = createClient(supabaseUrl, supabaseAnonKey)

      console.log(`[v0] Attempting to create user: ${user.email}`)

      const { data, error } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: {
            name: user.name,
            role: user.role,
          },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard`,
        },
      })

      if (error) {
        console.log(`[v0] Error creating ${user.email}:`, error.message)
        results.push({
          email: user.email,
          status: "error",
          error: error.message,
          // Si el error es que ya existe, lo marcamos como existente
          alreadyExists: error.message.includes("already registered"),
        })
      } else {
        console.log(`[v0] Success creating ${user.email}:`, data.user?.id)
        results.push({
          email: user.email,
          status: "success",
          id: data.user?.id,
          needsConfirmation: !data.user?.email_confirmed_at,
        })
      }
    }

    console.log("[v0] User creation complete:", results)

    return NextResponse.json({ results })
  } catch (error) {
    console.error("[v0] Error creando usuarios:", error)
    return NextResponse.json(
      {
        error: "Error al crear usuarios",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
