import { createServerClient } from "./supabase"

export interface Odontograma {
  id: string
  playerId: string
  fileName: string
  fileUrl: string
  uploadedBy: string
  uploadedAt: string
  createdAt: string
  updatedAt: string
}

export async function getOdontogramaByPlayerId(playerId: string): Promise<Odontograma | null> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("odontogramas")
    .select("*")
    .eq("player_id", playerId)
    .order("uploaded_at", { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned
      return null
    }
    console.error("[v0] Error fetching odontograma:", error)
    throw error
  }

  return {
    id: data.id,
    playerId: data.player_id,
    fileName: data.file_name,
    fileUrl: data.file_url,
    uploadedBy: data.uploaded_by,
    uploadedAt: data.uploaded_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

export async function deleteOdontograma(odontogramaId: string): Promise<void> {
  const supabase = await createServerClient()

  const { error } = await supabase.from("odontogramas").delete().eq("id", odontogramaId)

  if (error) {
    console.error("[v0] Error deleting odontograma:", error)
    throw error
  }
}
