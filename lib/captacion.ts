import { supabase } from "./supabase"

export interface CaptacionDoc {
  id: string
  titulo: string
  categoria: string
  archivo_nombre: string
  archivo_url: string
  subido_por: string
  created_at: string
}

/**
 * Obtiene los documentos de una categoría específica
 */
export async function getCaptacionDocsByCategory(categoria: string): Promise<CaptacionDoc[]> {
  try {
    const { data, error } = await supabase
      .from("captacion_documentos")
      .select("*")
      .eq("categoria", categoria)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching captacion docs:", error)
    return []
  }
}

/**
 * Sube un archivo y crea el registro en la base de datos
 */
export async function createCaptacionDoc(
  titulo: string,
  categoria: string,
  file: File,
  userName: string
) {
  try {
    // 1. Subir archivo al Storage (usaremos el bucket 'captacion' o puedes reusar 'indices')
    const fileExt = file.name.split(".").pop()
    const filePath = `docs/${crypto.randomUUID()}.${fileExt}`

    // Nota: Asegúrate de tener creado el bucket "captacion" en Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("captacion") 
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage.from("captacion").getPublicUrl(filePath)

    // 2. Insertar registro en la tabla
    const { error: dbError } = await supabase.from("captacion_documentos").insert({
      titulo,
      categoria,
      archivo_nombre: file.name,
      archivo_url: urlData.publicUrl,
      subido_por: userName,
    })

    if (dbError) throw dbError

    return { success: true }
  } catch (error: any) {
    console.error("Error en createCaptacionDoc:", error)
    return { success: false, error: error.message || "Error al subir documento" }
  }
}

/**
 * Elimina un documento y su archivo físico
 */
export async function deleteCaptacionDoc(id: string, fileUrl: string) {
  try {
    const filePath = fileUrl.split("/captacion/")[1]
    if (filePath) {
      await supabase.storage.from("captacion").remove([filePath])
    }

    const { error } = await supabase.from("captacion_documentos").delete().eq("id", id)
    if (error) throw error

    return { success: true }
  } catch (error) {
    return { success: false, error: "No se pudo eliminar" }
  }
}