import { supabase } from "./supabase"

export type IndiceType =
  | "GPS"
  | "RPE"
  | "PAUTAS_FUERZA"
  | "DOLOR_MUSCULAR"
  | "ESTRES"
  | "SUENO"
  | "UNIDAD_ARBITRARIA"
  | "ONDULACIONES"

export type IndiceSubtype = "CRONICO" | "AGUDO" | "PRE_SESION" | "POST_SESION"

export interface PlayerIndice {
  id: string
  player_id: string
  type: IndiceType
  subtype?: IndiceSubtype
  observations: string
  file_url?: string
  file_name?: string
  created_by: string
  created_at: string
  updated_at: string
}

export const indiceTypeLabels: Record<IndiceType, string> = {
  GPS: "GPS",
  RPE: "RPE",
  PAUTAS_FUERZA: "Pautas de fuerza",
  DOLOR_MUSCULAR: "Índice de dolor muscular",
  ESTRES: "Estrés",
  SUENO: "Sueño",
  UNIDAD_ARBITRARIA: "Unidad arbitraria",
  ONDULACIONES: "Ondulaciones",
}

export const indiceSubtypeLabels: Record<IndiceSubtype, string> = {
  CRONICO: "Índice crónico",
  AGUDO: "Índice agudo",
  PRE_SESION: "Recuperación pre-sesión",
  POST_SESION: "Carga post-sesión",
}

export async function getIndicesByPlayerId(
  playerId: string,
  type?: IndiceType,
  subtype?: IndiceSubtype,
): Promise<PlayerIndice[]> {
  try {
    let query = supabase
      .from("player_indices")
      .select("*")
      .eq("player_id", playerId)
      .order("created_at", { ascending: false })

    if (type) {
      query = query.eq("type", type)
    }

    if (subtype) {
      query = query.eq("subtype", subtype)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching player indices:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getIndicesByPlayerId:", error)
    return []
  }
}

export async function createPlayerIndice(
  playerId: string,
  type: IndiceType,
  subtype: IndiceSubtype | undefined,
  observations: string,
  file: File | null,
  userId: string,
) {
  try {
    if (!playerId) {
      return { success: false, error: "El ID del jugador es obligatorio" }
    }

    if (!type) {
      return { success: false, error: "El tipo es obligatorio" }
    }

    // Upload file if exists
    let file_url: string | null = null
    let file_name: string | null = null

    if (file) {
      const fileExt = file.name.split(".").pop()
      const filePath = `player-indices/${crypto.randomUUID()}.${fileExt}`

      const { error: uploadError } = await supabase.storage.from("indices").upload(filePath, file)

      if (uploadError) {
        console.error("Error uploading file:", uploadError)
        return { success: false, error: "Error al subir el archivo" }
      }

      const { data } = supabase.storage.from("indices").getPublicUrl(filePath)

      file_url = data.publicUrl
      file_name = file.name
    }

    // Insert into database
    const { error } = await supabase.from("player_indices").insert({
      player_id: playerId,
      type,
      subtype,
      observations,
      file_url,
      file_name,
      created_by: userId,
    })

    if (error) {
      console.error("Error creating player indice:", error)
      return { success: false, error: "Error al crear el índice del jugador" }
    }

    return { success: true }
  } catch (error) {
    console.error("Unexpected error creating player indice:", error)
    return { success: false, error: "Error inesperado" }
  }
}

export async function deletePlayerIndice(id: string, fileUrl?: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Delete file from storage if exists
    if (fileUrl) {
      const filePath = fileUrl.split("/player-indices/")[1] || fileUrl.split("/indices/")[1]
      if (filePath) {
        await supabase.storage.from("indices").remove([filePath])
      }
    }

    // Delete player indice record
    const { error } = await supabase.from("player_indices").delete().eq("id", id)

    if (error) {
      console.error("Error deleting player indice:", error)
      return { success: false, error: "Error al eliminar el índice del jugador" }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in deletePlayerIndice:", error)
    return { success: false, error: "Error inesperado" }
  }
}
