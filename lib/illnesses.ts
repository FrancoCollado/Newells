import { createServerClient } from "./supabase"

export type Illness = {
  id: string
  playerId: string

  // Tipo de enfermedad
  infeccionRespiratoria: boolean
  infeccionOtrosOrganos: boolean
  fatigaMalestar: boolean
  asmaAlergias: boolean
  dolorEstomago: boolean
  dolorCabeza: boolean
  otroTipo: boolean

  // Sistema orgánico afectado
  respiratorio: boolean
  dermatologico: boolean
  neurologico: boolean
  inmunologico: boolean
  metabolico: boolean
  trastornoReumatologico: boolean
  renalUrogenital: boolean
  hematologico: boolean
  cardiovascular: boolean
  psiquiatrica: boolean
  dental: boolean
  oftalmologico: boolean
  ambiental: boolean
  otroSistema: boolean
  otroSistemaDescripcion?: string

  // Recurrencia
  nuevaLesion?: string
  diagnostico?: string
  otrosComentarios?: string
  fechaRegresoJuego?: string

  // Archivos adjuntos
  attachments: { fecha: string; descripcion: string }[]

  createdAt: string
  updatedAt: string
}

export async function getPlayerIllnesses(playerId: string): Promise<Illness[]> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("illnesses")
    .select("*")
    .eq("player_id", playerId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching illnesses:", error)
    throw error
  }

  return (data || []).map(mapDatabaseIllnessToAppIllness)
}

export async function createIllness(illness: Omit<Illness, "id" | "createdAt" | "updatedAt">): Promise<Illness> {
  const supabase = await createServerClient()

  const dbIllness = {
    player_id: illness.playerId,
    infeccion_respiratoria: illness.infeccionRespiratoria,
    infeccion_otros_organos: illness.infeccionOtrosOrganos,
    fatiga_malestar: illness.fatigaMalestar,
    asma_alergias: illness.asmaAlergias,
    dolor_estomago: illness.dolorEstomago,
    dolor_cabeza: illness.dolorCabeza,
    otro_tipo: illness.otroTipo,
    respiratorio: illness.respiratorio,
    dermatologico: illness.dermatologico,
    neurologico: illness.neurologico,
    inmunologico: illness.inmunologico,
    metabolico: illness.metabolico,
    trastorno_reumatologico: illness.trastornoReumatologico,
    renal_urogenital: illness.renalUrogenital,
    hematologico: illness.hematologico,
    cardiovascular: illness.cardiovascular,
    psiquiatrica: illness.psiquiatrica,
    dental: illness.dental,
    oftalmologico: illness.oftalmologico,
    ambiental: illness.ambiental,
    otro_sistema: illness.otroSistema,
    otro_sistema_descripcion: illness.otroSistemaDescripcion,
    nueva_lesion: illness.nuevaLesion,
    diagnostico: illness.diagnostico,
    otros_comentarios: illness.otrosComentarios,
    fecha_regreso_juego: illness.fechaRegresoJuego,
    attachments: illness.attachments,
  }

  const { data, error } = await supabase.from("illnesses").insert(dbIllness).select().single()

  if (error) {
    console.error("[v0] Error creating illness:", error)
    throw error
  }

  return mapDatabaseIllnessToAppIllness(data)
}

function mapDatabaseIllnessToAppIllness(dbIllness: any): Illness {
  return {
    id: dbIllness.id,
    playerId: dbIllness.player_id,
    infeccionRespiratoria: dbIllness.infeccion_respiratoria || false,
    infeccionOtrosOrganos: dbIllness.infeccion_otros_organos || false,
    fatigaMalestar: dbIllness.fatiga_malestar || false,
    asmaAlergias: dbIllness.asma_alergias || false,
    dolorEstomago: dbIllness.dolor_estomago || false,
    dolorCabeza: dbIllness.dolor_cabeza || false,
    otroTipo: dbIllness.otro_tipo || false,
    respiratorio: dbIllness.respiratorio || false,
    dermatologico: dbIllness.dermatologico || false,
    neurologico: dbIllness.neurologico || false,
    inmunologico: dbIllness.inmunologico || false,
    metabolico: dbIllness.metabolico || false,
    trastornoReumatologico: dbIllness.trastorno_reumatologico || false,
    renalUrogenital: dbIllness.renal_urogenital || false,
    hematologico: dbIllness.hematologico || false,
    cardiovascular: dbIllness.cardiovascular || false,
    psiquiatrica: dbIllness.psiquiatrica || false,
    dental: dbIllness.dental || false,
    oftalmologico: dbIllness.oftalmologico || false,
    ambiental: dbIllness.ambiental || false,
    otroSistema: dbIllness.otro_sistema || false,
    otroSistemaDescripcion: dbIllness.otro_sistema_descripcion,
    nuevaLesion: dbIllness.nueva_lesion,
    diagnostico: dbIllness.diagnostico,
    otrosComentarios: dbIllness.otros_comentarios,
    fechaRegresoJuego: dbIllness.fecha_regreso_juego,
    attachments: dbIllness.attachments || [],
    createdAt: dbIllness.created_at,
    updatedAt: dbIllness.updated_at,
  }
}
