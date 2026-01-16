import { supabase } from "./supabase"

export type IndiceType = "GPS" | "RPE" | "PAUTAS_FUERZA" | "WELLNESS" | "UNIDAD_ARBITRARIA" | "ONDULACIONES"

export type IndiceSubtype = "CRONICO" | "AGUDO" | "PRE_SESION" | "POST_SESION"

export interface Indice {
  id: string
  division: string
  type: IndiceType
  subtype?: IndiceSubtype
  observations: string
  file_url?: string
  file_name?: string
  created_by: string
  created_at: string
  updated_at: string
  user_id?: string // Added user_id field to Indice interface
}

export const indiceTypeLabels: Record<IndiceType, string> = {
  GPS: "GPS",
  RPE: "RPE",
  PAUTAS_FUERZA: "Pautas de fuerza",
  WELLNESS: "Wellness",
  UNIDAD_ARBITRARIA: "Unidad arbitraria",
  ONDULACIONES: "Ondulaciones",
}

export const indiceSubtypeLabels: Record<IndiceSubtype, string> = {
  CRONICO: "Índice crónico",
  AGUDO: "Índice agudo",
  PRE_SESION: "Recuperación pre-sesión",
  POST_SESION: "Carga post-sesión",
}

export async function getIndicesByDivision(
  division: string,
  type?: IndiceType,
  subtype?: IndiceSubtype,
): Promise<Indice[]> {
  try {
    let query = supabase.from("indices").select("*").eq("division", division).order("created_at", { ascending: false })

    if (type) {
      query = query.eq("type", type)
    }

    if (subtype) {
      query = query.eq("subtype", subtype)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching indices:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getIndicesByDivision:", error)
    return []
  }
}
export async function createIndice(
  division: string,
  type: IndiceType,
  subtype: IndiceSubtype | undefined,
  observations: string,
  file: File | null,
  userName: string,
  userId: string,
) {
  try {
    // 🔒 Validaciones básicas
    if (!division) {
      return { success: false, error: "La división es obligatoria" }
    }

    if (!type) {
      return { success: false, error: "El tipo es obligatorio" }
    }

    // 1️⃣ Subir archivo si existe
    let file_url: string | null = null
    let file_name: string | null = null

    if (file) {
      const fileExt = file.name.split(".").pop()
      const filePath = `indices/${crypto.randomUUID()}.${fileExt}`

      const { error: uploadError } = await supabase.storage.from("indices").upload(filePath, file)

      if (uploadError) {
        console.error("Error uploading file:", uploadError)
        return { success: false, error: "Error al subir el archivo" }
      }

      const { data } = supabase.storage.from("indices").getPublicUrl(filePath)

      file_url = data.publicUrl
      file_name = file.name
    }

    // 2️⃣ Insertar en la base
    const { error } = await supabase.from("indices").insert({
      division,
      type,
      subtype,
      observations,
      file_url,
      file_name,
      created_by: userId, // ✅ UUID del usuario autenticado
    })

    if (error) {
      console.error("Error creating indice:", error)
      return { success: false, error: "Error al crear el índice" }
    }

    return { success: true }
  } catch (error) {
    console.error("Unexpected error creating indice:", error)
    return { success: false, error: "Error inesperado" }
  }
}

export async function deleteIndice(id: string, fileUrl?: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Delete file from storage if exists
    if (fileUrl) {
      const filePath = fileUrl.split("/indices/")[1]
      if (filePath) {
        await supabase.storage.from("indices").remove([filePath])
      }
    }

    // Delete indice record
    const { error } = await supabase.from("indices").delete().eq("id", id)

    if (error) {
      console.error("Error deleting indice:", error)
      return { success: false, error: "Error al eliminar el índice" }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in deleteIndice:", error)
    return { success: false, error: "Error inesperado" }
  }
}
