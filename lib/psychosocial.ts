import { supabase } from "./supabase"
import { put } from "@vercel/blob"

export type PsychosocialCategory = "trayectoria_educativa" | "situacion_vincular" | "trayectoria_salud"

export interface PsychosocialEvolution {
  id: string
  player_id: string
  category: PsychosocialCategory
  observations: string | null
  file_url: string | null
  file_name: string | null
  created_by: string
  created_at: string
}

export const categoryLabels: Record<PsychosocialCategory, string> = {
  trayectoria_educativa: "Trayectoria Educativa",
  situacion_vincular: "Situación Vincular",
  trayectoria_salud: "Trayectoria de Salud",
}

export async function getEvolutionsByPlayerId(
  playerId: string,
  category: PsychosocialCategory,
): Promise<PsychosocialEvolution[]> {
  const { data, error } = await supabase
    .from("psychosocial_evolutions")
    .select("*")
    .eq("player_id", playerId)
    .eq("category", category)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error cargando evoluciones psicosociales:", error)
    return []
  }

  return data || []
}

export async function createEvolution(
  playerId: string,
  category: PsychosocialCategory,
  observations: string,
  file: File | null,
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("[v0] createEvolution - Iniciando, archivo:", file?.name)
    let fileUrl: string | null = null
    let fileName: string | null = null

    if (file) {
      try {
        console.log("[v0] Subiendo archivo a Blob:", file.name)
        console.log("[v0] Token disponible:", !!process.env.BLOB_READ_WRITE_TOKEN)
        
        const blob = await put(`psychosocial/${playerId}/${Date.now()}-${file.name}`, file, {
          access: "public",
          token: process.env.BLOB_READ_WRITE_TOKEN,
        })
        fileUrl = blob.url
        fileName = file.name
        console.log("[v0] Archivo subido a Blob, URL:", fileUrl)
      } catch (blobError: any) {
        console.warn("[v0] Advertencia: No se pudo subir archivo a Blob:", blobError.message)
        console.warn("[v0] Continuando sin archivo...")
        // Continuar sin el archivo - la BD se guardará con null
      }
    }

    console.log("[v0] Insertando en BD - playerId:", playerId, "category:", category, "observations:", observations.length)
    const { error } = await supabase.from("psychosocial_evolutions").insert({
      player_id: playerId,
      category,
      observations: observations || null,
      file_url: fileUrl,
      file_name: fileName,
      created_by: userId,
    })

    if (error) {
      console.error("[v0] Error de BD:", error)
      throw error
    }

    console.log("[v0] Evolución guardada exitosamente en BD")
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Error guardando evolución psicosocial:", error)
    return { success: false, error: error.message }
  }
}

export async function deleteEvolution(
  id: string,
  fileUrl: string | null,
): Promise<{ success: boolean; error?: string }> {
  try {
    // TODO: Eliminar archivo de Blob si existe (fileUrl)

    const { error } = await supabase.from("psychosocial_evolutions").delete().eq("id", id)

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error("[v0] Error eliminando evolución psicosocial:", error)
    return { success: false, error: error.message }
  }
}
