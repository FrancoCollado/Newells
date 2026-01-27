import { supabase } from "./supabase"

export interface JugadorRow {
  apellido_nombre: string
  categoria: string
  posicion: string
  club: string
  telefono: string
  contacto: string
  captador: string
  pension: string
  caracteristicas: string // <-- Agregada
  puntaje: string
  volver_a_citar: string
}

export interface CaptacionInforme {
  id: string
  titulo: string
  seccion: string
  subido_por: string
  created_at: string
  contenido: JugadorRow[]
  fotos?: string[] 
}

export async function getCaptacionInformes(seccion: string): Promise<CaptacionInforme[]> {
  const { data } = await supabase
    .from("captacion_informes")
    .select("*")
    .eq("seccion", seccion)
    .order("created_at", { ascending: false })
  return data || []
}

export async function createCaptacionInforme(
  titulo: string,
  seccion: string,
  subido_por: string,
  contenido: JugadorRow[],
  fotoFiles?: File[]
) {
  try {
    let fotosUrls: string[] = [];
    if (fotoFiles && fotoFiles.length > 0) {
      for (const file of fotoFiles) {
        const fileName = `${crypto.randomUUID()}.${file.name.split(".").pop()}`;
        const filePath = `${seccion.replace(/\s+/g, '_')}/${fileName}`;
        const { error: uploadError } = await supabase.storage.from("captacion_fotos").upload(filePath, file);
        if (!uploadError) {
          const { data } = supabase.storage.from("captacion_fotos").getPublicUrl(filePath);
          fotosUrls.push(data.publicUrl);
        }
      }
    }
    const { error } = await supabase.from("captacion_informes").insert({
      titulo, seccion, subido_por, contenido, fotos: fotosUrls
    })
    return { success: !error, error: error?.message }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteCaptacionInforme(id: string) {
  const { error } = await supabase.from("captacion_informes").delete().eq("id", id)
  return { success: !error }
}

export async function searchJugadorGlobal(nombre: string): Promise<CaptacionInforme[]> {
  const { data } = await supabase.from("captacion_informes").select("*");
  if (!data) return [];
  return (data as CaptacionInforme[]).filter(inf => 
    inf.contenido.some(j => j.apellido_nombre.toLowerCase().includes(nombre.toLowerCase()))
  );
}