"use server"

import { createAdminClient } from "@/lib/supabase"
import { createPlayerSession } from "@/lib/portal-auth"
import { redirect } from "next/navigation"

export async function loginPlayer(formData: FormData) {
  const name = formData.get("name") as string
  const password = formData.get("password") as string

  if (!name || name.trim().length < 3) {
    return { error: "Ingresa tu nombre completo." }
  }

  if (!password) {
    return { error: "Ingresa tu contraseña." }
  }

  const supabase = createAdminClient()
  
  // Buscar coincidencia por nombre (insensible a mayúsculas/minúsculas)
  const { data: players, error } = await supabase
    .from("players")
    .select("id, name, division")
    .ilike("name", name.trim())

  if (error) {
    console.error("Error en login:", error)
    return { error: "Error de conexión. Intenta nuevamente." }
  }

  if (!players || players.length === 0) {
    return { error: "Jugador no encontrado." }
  }

  if (players.length > 1) {
    return { 
      error: "Hay más de un jugador con este nombre. Contacta a tu Coordinador." 
    }
  }

  const player = players[0]

  // Validar contraseña: nombre todo junto y en minúsculas
  // Normalizamos el nombre real de la DB para generar la contraseña esperada
  const expectedPassword = player.name.toLowerCase().replace(/\s+/g, '')
  
  // Normalizamos el input del usuario también para ser amigables
  const inputPassword = password.trim().toLowerCase().replace(/\s+/g, '')

  if (inputPassword !== expectedPassword) {
    return { error: "Contraseña incorrecta." }
  }

  // Actualizar última actividad
  await supabase
    .from("players")
    .update({ last_active_at: new Date().toISOString() })
    .eq("id", player.id)

  // Crear sesión
  await createPlayerSession({
    playerId: player.id,
    name: player.name,
    division: player.division,
  })

  redirect("/portal/dashboard")
}
