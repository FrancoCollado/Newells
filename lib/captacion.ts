import { supabase } from "./supabase"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

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

export async function updateCaptacionInforme(
  id: string,
  titulo: string,
  contenido: JugadorRow[]
) {
  const { error } = await supabase
    .from("captacion_informes")
    .update({ titulo, contenido })
    .eq("id", id)
  return { success: !error, error: error?.message }
}

export async function searchJugadorGlobal(nombre: string): Promise<CaptacionInforme[]> {
  const { data } = await supabase.from("captacion_informes").select("*");
  if (!data) return [];
  return (data as CaptacionInforme[]).filter(inf => 
    inf.contenido.some(j => j.apellido_nombre.toLowerCase().includes(nombre.toLowerCase()))
  );
}

export function downloadInformePDF(informe: CaptacionInforme) {
  const doc = new jsPDF({ orientation: "landscape" })
  
  // Título
  doc.setFontSize(18)
  doc.setTextColor(153, 27, 27) // Red 800
  doc.text(informe.titulo.toUpperCase(), 14, 20)
  
  // Metadata
  doc.setFontSize(10)
  doc.setTextColor(100)
  const dateStr = new Date(informe.created_at).toLocaleDateString()
  doc.text(`${informe.seccion} | Fecha: ${dateStr} | Subido por: ${informe.subido_por}`, 14, 28)
  
  // Tabla
  const tableColumn = ["Nombre", "Cat.", "Pos.", "Club", "Tel.", "Contacto", "Cap.", "Pens.", "Características", "Pts", "Citar"]
  const tableRows = informe.contenido.map(row => [
    row.apellido_nombre,
    row.categoria,
    row.posicion,
    row.club,
    row.telefono,
    row.contacto,
    row.captador,
    row.pension,
    row.caracteristicas,
    row.puntaje,
    row.volver_a_citar
  ])

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 35,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [31, 41, 55], textColor: [255, 255, 255], fontStyle: 'bold' }, // Slate 800
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 40 },
      8: { cellWidth: 80 } // Características wider
    }
  })

  doc.save(`${informe.titulo.replace(/\s+/g, '_')}.pdf`)
}