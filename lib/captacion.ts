import { supabase } from "./supabase"

export interface JugadorRow {
  apellido_nombre: string
  categoria: string
  posicion: string
  contacto: string
  telefono: string
  club: string
  captador: string
  pension: string
  puntaje: string
  volver_a_citar: string
}

export interface CaptacionInforme {
  id: string
  titulo: string
  seccion: string
  subido_por: string
  created_at: string
  contenido: JugadorRow[] // Array con las filas del excel
}

export async function getCaptacionInformes(seccion: string): Promise<CaptacionInforme[]> {
  try {
    const { data, error } = await supabase
      .from("captacion_informes")
      .select("*")
      .eq("seccion", seccion)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching captacion informes:", error)
    return []
  }
}

export async function createCaptacionInforme(
  titulo: string,
  seccion: string,
  subido_por: string,
  contenido: JugadorRow[]
) {
  try {
    const { error } = await supabase
      .from("captacion_informes")
      .insert({
        titulo,
        seccion,
        subido_por,
        contenido // Supabase convierte esto a JSONB automáticamente
      })

    if (error) throw error
    return { success: true }
  } catch (error: any) {
    console.error("Error creating captacion informe:", error)
    return { success: false, error: error.message }
  }
}

export async function deleteCaptacionInforme(id: string) {
  try {
    const { error } = await supabase
      .from("captacion_informes")
      .delete()
      .eq("id", id)

    if (error) throw error
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Agregar esto a tu archivo lib/captacion.ts

/**
 * Busca un jugador por nombre en todos los informes de todas las secciones
 */
export async function searchJugadorGlobal(nombre: string): Promise<CaptacionInforme[]> {
  try {
    // Traemos todos los informes para filtrar localmente (es más preciso con JSONB)
    const { data, error } = await supabase
      .from("captacion_informes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Filtramos los informes donde al menos un jugador coincida con el nombre
    const resultados = (data as CaptacionInforme[]).filter(informe => 
      informe.contenido.some(jugador => 
        jugador.apellido_nombre.toLowerCase().includes(nombre.toLowerCase())
      )
    );

    return resultados;
  } catch (error) {
    console.error("Error en searchJugadorGlobal:", error);
    return [];
  }
}