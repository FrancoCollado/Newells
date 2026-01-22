// lib/readaptacion.ts
import { supabase } from "./supabase" // Ajusta la importación según tu cliente de DB
import type { AreaReport } from "./areas"

/**
 * Obtiene los informes de readaptación con paginación
 */
// lib/readaptacion.ts

export async function getReadaptacionReports(page = 0, limit = 10): Promise<AreaReport[]> {
  const from = page * limit
  const to = from + limit - 1

  const { data, error } = await supabase
    .from("readaptacion_reports")
    .select("*")
    .order("created_at", { ascending: false })
    .range(from, to)

  if (error) return []

  return data.map((report) => ({
    ...report,
    // AQUÍ ESTÁ EL CAMBIO: 
    // Mapeamos lo que viene de la DB al nombre que usa el componente
    createdBy: report.created_by, 
    date: new Date(report.created_at),
  }))
}

/**
 * Guarda o actualiza un informe de readaptación
 */
export async function saveReadaptacionReport(reportData: Partial<AreaReport>) {
  const { id, title, content, createdBy, hyperlink, attachments } = reportData

  // Armamos el objeto exactamente como lo espera la base de datos (SQL)
  const payload: any = {
    title,
    content,
    created_by: createdBy, // Aquí se soluciona lo del usuario
    hyperlink,
    attachments: attachments || [],
    area: "readaptacion",   // Agregamos el área
    updated_at: new Date().toISOString(),
  }

  if (id) {
    // Si hay ID, editamos el existente
    const { data, error } = await supabase
      .from("readaptacion_reports")
      .update(payload)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  } else {
    // Si no hay ID, creamos uno nuevo
    const { data, error } = await supabase
      .from("readaptacion_reports")
      .insert([payload])
      .select()
      .single()

    if (error) throw error
    return data
  }
}

/**
 * Elimina un informe de readaptación
 */
export async function deleteReadaptacionReport(id: string) {
  const { error } = await supabase
    .from("readaptacion_reports")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error deleting report:", error)
    return false
  }
  return true
}