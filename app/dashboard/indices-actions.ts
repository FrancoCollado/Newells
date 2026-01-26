"use server"

import { createServerClient } from "@/lib/supabase"
import type { IndiceType, IndiceSubtype, Indice } from "@/lib/indices"

export async function uploadIndiceFileAction(file: File): Promise<{ fileUrl: string; fileName: string }> {
  try {
    const supabase = await createServerClient()

    const fileExt = file.name.split(".").pop()
    const filePath = `indices/${crypto.randomUUID()}.${fileExt}`

    console.log("[v0] Server uploading file to storage:", filePath)

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await supabase.storage.from("indices").upload(filePath, buffer, {
      contentType: file.type,
    })

    if (uploadError) {
      console.error("[v0] Server upload error:", uploadError)
      throw new Error(`Error al subir el archivo: ${uploadError.message || JSON.stringify(uploadError)}`)
    }

    const { data } = supabase.storage.from("indices").getPublicUrl(filePath)

    return {
      fileUrl: data.publicUrl,
      fileName: file.name,
    }
  } catch (error) {
    console.error("[v0] Error in uploadIndiceFileAction:", error)
    throw error
  }
}

export async function getIndicesByDivisionAction(
  division: string,
  type?: IndiceType,
  subtype?: IndiceSubtype,
): Promise<Indice[]> {
  try {
    const supabase = await createServerClient()

    let query = supabase.from("indices").select("*").eq("division", division).order("created_at", { ascending: false })

    if (type) {
      query = query.eq("type", type)
    }

    if (subtype) {
      query = query.eq("subtype", subtype)
    }

    const { data, error } = await query

    if (error) {
      console.error("[v0] Error fetching indices:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("[v0] Error in getIndicesByDivisionAction:", error)
    return []
  }
}

export async function createIndiceAction(
  division: string,
  type: IndiceType,
  subtype: IndiceSubtype | undefined,
  observations: string,
  fileUrl: string | null,
  fileName: string | null,
  userName: string,
) {
  try {
    if (!division) {
      return { success: false, error: "La división es obligatoria" }
    }

    if (!type) {
      return { success: false, error: "El tipo es obligatorio" }
    }

    const supabase = await createServerClient()

    const { error } = await supabase.from("indices").insert({
      division,
      type,
      subtype,
      observations,
      file_url: fileUrl,
      file_name: fileName,
      created_by: userName,
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

export async function deleteIndiceAction(id: string, fileUrl?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient()

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
      console.error("[v0] Error deleting indice:", error)
      return { success: false, error: "Error al eliminar el índice" }
    }

    return { success: true }
  } catch (error) {
    console.error("[v0] Error in deleteIndiceAction:", error)
    return { success: false, error: "Error inesperado" }
  }
}
