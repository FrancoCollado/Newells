"use server"

import { createAdminClient } from "@/lib/supabase"
import { getPlayerSession } from "@/lib/portal-auth"

export async function updateLastSeenAction(playerId: string) {
  // 1. Verificar autenticación del portal
  const session = await getPlayerSession()
  if (!session || session.playerId !== playerId) {
    return { success: false, error: "Unauthorized" }
  }

  // 2. Actualizar DB usando Admin Client (bypass RLS porque ya verificamos sesión)
  const supabase = createAdminClient()
  
  const { error } = await supabase
    .from("players")
    .update({ last_seen: new Date().toISOString() })
    .eq("id", playerId)

  if (error) {
    console.error("[StatusAction] Error updating last_seen:", error)
    return { success: false, error: error.message }
  }

  return { success: true }
}
