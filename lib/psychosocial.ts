import { supabase } from "./supabase"

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
    let fileUrl: string | null = null
    let fileName: string | null = null

    console.log("[v0] createEvolution - Iniciando con archivo:", file?.name || "sin archivo")

    if (file) {
      try {
        console.log("[v0] Subiendo archivo:", file.name, "Size:", file.size, "Type:", file.type)
        const fileExtension = file.name.split('.').pop()
        const fileName_storage = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExtension}`
        console.log("[v0] Nombre en storage:", fileName_storage)
        
        const { data, error } = await supabase.storage
          .from("psychosocial_attachments")
          .upload(fileName_storage, file, { cacheControl: "31536000" })
        
        console.log("[v0] Upload response data:", data)
        console.log("[v0] Upload response error:", error)
        
        if (error) {
          console.error("[v0] Error uploading psychosocial attachment:", error)
          throw error
        }
        
        const { data: publicData } = supabase.storage
          .from("psychosocial_attachments")
          .getPublicUrl(fileName_storage)
        
        console.log("[v0] Public URL data:", publicData)
        fileUrl = publicData.publicUrl
        fileName = file.name
        console.log("[v0] Archivo subido exitosamente - URL:", fileUrl)
      } catch (storageError: any) {
        console.error("[v0] ERROR subiendo archivo - Message:", storageError.message)
        console.error("[v0] ERROR subiendo archivo - Full:", JSON.stringify(storageError, null, 2))
        console.warn("[v0] Continuando sin archivo...")
      }
    }

    console.log("[v0] Guardando evolución con fileUrl:", fileUrl, "fileName:", fileName)
    const { data, error } = await supabase.from("psychosocial_evolutions").insert({
      player_id: playerId,
      category,
      observations: observations || null,
      file_url: fileUrl,
      file_name: fileName,
      created_by: userId,
    }).select()

    if (error) {
      console.error("[v0] Error de BD:", error)
      throw error
    }

    console.log("[v0] Evolución guardada en BD:", data)
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
    const { error } = await supabase.from("psychosocial_evolutions").delete().eq("id", id)

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error("[v0] Error eliminando evolución psicosocial:", error)
    return { success: false, error: error.message }
  }
}

export async function updateEvolution(
  id: string,
  observations: string,
  file: File | null,
): Promise<{ success: boolean; error?: string }> {
  try {
    const updateData: any = {
      observations: observations || null,
    }

    if (file) {
      try {
        console.log("[v0] Subiendo nuevo archivo:", file.name)
        const fileExtension = file.name.split('.').pop()
        const fileName_storage = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExtension}`
        
        const { error } = await supabase.storage
          .from("psychosocial_attachments")
          .upload(fileName_storage, file, { cacheControl: "31536000" })
        
        if (error) throw error
        
        const { data: publicData } = supabase.storage
          .from("psychosocial_attachments")
          .getPublicUrl(fileName_storage)
        
        updateData.file_url = publicData.publicUrl
        updateData.file_name = file.name
      } catch (storageError: any) {
        console.error("[v0] Error subiendo nuevo archivo:", storageError)
        // No interrumpimos la actualización del texto si falla el archivo
      }
    }

    const { error } = await supabase.from("psychosocial_evolutions").update(updateData).eq("id", id)

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error("[v0] Error actualizando evolución psicosocial:", error)
    return { success: false, error: error.message }
  }
}
