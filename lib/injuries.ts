import { createServerClient } from "./supabase"

export type Injury = {
  id: string
  playerId: string

  // Datos del evento
  injuryDate: string
  injuryTime?: string
  context?: "entrenamiento" | "partido_oficial" | "partido_amistoso"
  gameMinute?: string
  surface?: "cesped_natural" | "cesped_sintetico" | "otra"

  // Mecanismo
  mechanismType?: "contacto" | "no_contacto" | "sobrecarga" | "trauma_indirecto"
  specificSituation?:
    | "sprint"
    | "cambio_direccion"
    | "salto_caida"
    | "golpe_choque"
    | "disparo"
    | "aceleracion_desaceleracion"

  // Localización
  anatomicalLocation?: string
  affectedSide?: "derecho" | "izquierdo" | "bilateral"

  // Tipo de lesión
  injuryType?:
    | "muscular"
    | "tendinosa"
    | "ligamentosa"
    | "meniscal_cartilago"
    | "contusion_hematoma"
    | "fractura_osea"
    | "conmocion_cerebral"
    | "otra"
  injuryTypeOther?: string
  clinicalDiagnosis?: string

  // Severidad
  severity?: "leve" | "moderada" | "severa"
  daysAbsent?: number

  // Evolución
  evolutionType?: "nueva" | "recaida" | "recidiva"
  treatment?: "conservador" | "quirurgico" | "infiltracion_prp"

  // Imágenes
  hasUltrasound: boolean
  hasMri: boolean
  hasXray: boolean
  hasCt: boolean
  imagingFindings?: string

  // RTP
  medicalDischargeDate?: string
  progressiveReturnDate?: string
  competitiveRtpDate?: string
  rtpCriteriaClinical: boolean
  rtpCriteriaFunctional: boolean
  rtpCriteriaStrength: boolean
  rtpCriteriaGps: boolean

  surgeryDate?: string
  rtrNotes?: string
  rttNotes?: string
  rtpNotes?: string

  // Observaciones
  medicalObservations?: string
  responsibleDoctor?: string

  // Alta
  isDischarged: boolean
  dischargeDate?: string

  createdAt: string
  updatedAt: string
}

export type CreateInjuryParams = {
  playerId: string
  injuryDate: string
  injuryTime?: string
  context?: "entrenamiento" | "partido_oficial" | "partido_amistoso"
  gameMinute?: string
  surface?: "cesped_natural" | "cesped_sintetico" | "otra"
  mechanismType?: "contacto" | "no_contacto" | "sobrecarga" | "trauma_indirecto"
  specificSituation?:
    | "sprint"
    | "cambio_direccion"
    | "salto_caida"
    | "golpe_choque"
    | "disparo"
    | "aceleracion_desaceleracion"
  anatomicalLocation?: string
  affectedSide?: "derecho" | "izquierdo" | "bilateral"
  injuryType?:
    | "muscular"
    | "tendinosa"
    | "ligamentosa"
    | "meniscal_cartilago"
    | "contusion_hematoma"
    | "fractura_osea"
    | "conmocion_cerebral"
    | "otra"
  injuryTypeOther?: string
  clinicalDiagnosis?: string
  severity?: "leve" | "moderada" | "severa"
  daysAbsent?: number
  evolutionType?: "nueva" | "recaida" | "recidiva"
  treatment?: "conservador" | "quirurgico" | "infiltracion_prp"
  hasUltrasound?: boolean
  hasMri?: boolean
  hasXray?: boolean
  hasCt?: boolean
  imagingFindings?: string
  medicalDischargeDate?: string
  progressiveReturnDate?: string
  competitiveRtpDate?: string
  rtpCriteriaClinical?: boolean
  rtpCriteriaFunctional?: boolean
  rtpCriteriaStrength?: boolean
  rtpCriteriaGps?: boolean
  surgeryDate?: string
  rtrNotes?: string
  rttNotes?: string
  rtpNotes?: string
  medicalObservations?: string
  responsibleDoctor?: string
}

export type InjuryEvolution = {
  id: string
  injuryId: string
  evolutionText: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export async function getPlayerInjuries(playerId: string): Promise<Injury[]> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("injuries")
    .select("*")
    .eq("player_id", playerId)
    .order("injury_date", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching injuries:", error)
    throw error
  }

  return (data || []).map(mapDatabaseInjuryToAppInjury)
}

export async function getInjury(injuryId: string): Promise<Injury | null> {
  const supabase = await createServerClient()

  const { data, error } = await supabase.from("injuries").select("*").eq("id", injuryId).single()

  if (error) {
    console.error("[v0] Error fetching injury:", error)
    return null
  }

  return mapDatabaseInjuryToAppInjury(data)
}

export async function createInjury(injury: CreateInjuryParams): Promise<Injury> {
  const supabase = await createServerClient()

  const dbInjury = {
    player_id: injury.playerId,
    injury_date: injury.injuryDate,
    injury_time: injury.injuryTime,
    context: injury.context,
    game_minute: injury.gameMinute,
    surface: injury.surface,
    mechanism_type: injury.mechanismType,
    specific_situation: injury.specificSituation,
    anatomical_location: injury.anatomicalLocation,
    affected_side: injury.affectedSide,
    injury_type: injury.injuryType,
    injury_type_other: injury.injuryTypeOther,
    clinical_diagnosis: injury.clinicalDiagnosis,
    severity: injury.severity,
    days_absent: injury.daysAbsent,
    evolution_type: injury.evolutionType,
    treatment: injury.treatment,
    has_ultrasound: injury.hasUltrasound,
    has_mri: injury.hasMri,
    has_xray: injury.hasXray,
    has_ct: injury.hasCt,
    imaging_findings: injury.imagingFindings,
    medical_discharge_date: injury.medicalDischargeDate,
    progressive_return_date: injury.progressiveReturnDate,
    competitive_rtp_date: injury.competitiveRtpDate,
    rtp_criteria_clinical: injury.rtpCriteriaClinical,
    rtp_criteria_functional: injury.rtpCriteriaFunctional,
    rtp_criteria_strength: injury.rtpCriteriaStrength,
    rtp_criteria_gps: injury.rtpCriteriaGps,
    surgery_date: injury.surgeryDate,
    rtr_notes: injury.rtrNotes,
    rtt_notes: injury.rtt_notes,
    rtp_notes: injury.rtp_notes,
    medical_observations: injury.medicalObservations,
    responsible_doctor: injury.responsibleDoctor,
  }

  const { data, error } = await supabase.from("injuries").insert(dbInjury).select().single()

  if (error) {
    console.error("[v0] Error creating injury:", error)
    throw error
  }

  return mapDatabaseInjuryToAppInjury(data)
}

export async function updateInjury(injuryId: string, injury: Partial<Injury>): Promise<Injury> {
  const supabase = await createServerClient()

  const dbInjury: any = {}

  if (injury.injuryDate !== undefined) dbInjury.injury_date = injury.injuryDate
  if (injury.injuryTime !== undefined) dbInjury.injury_time = injury.injuryTime
  if (injury.context !== undefined) dbInjury.context = injury.context
  if (injury.gameMinute !== undefined) dbInjury.game_minute = injury.gameMinute
  if (injury.surface !== undefined) dbInjury.surface = injury.surface
  if (injury.mechanismType !== undefined) dbInjury.mechanism_type = injury.mechanismType
  if (injury.specificSituation !== undefined) dbInjury.specific_situation = injury.specificSituation
  if (injury.anatomicalLocation !== undefined) dbInjury.anatomical_location = injury.anatomicalLocation
  if (injury.affectedSide !== undefined) dbInjury.affected_side = injury.affectedSide
  if (injury.injuryType !== undefined) dbInjury.injury_type = injury.injuryType
  if (injury.injuryTypeOther !== undefined) dbInjury.injury_type_other = injury.injuryTypeOther
  if (injury.clinicalDiagnosis !== undefined) dbInjury.clinical_diagnosis = injury.clinicalDiagnosis
  if (injury.severity !== undefined) dbInjury.severity = injury.severity
  if (injury.daysAbsent !== undefined) dbInjury.days_absent = injury.daysAbsent
  if (injury.evolutionType !== undefined) dbInjury.evolution_type = injury.evolutionType
  if (injury.treatment !== undefined) dbInjury.treatment = injury.treatment
  if (injury.hasUltrasound !== undefined) dbInjury.has_ultrasound = injury.hasUltrasound
  if (injury.hasMri !== undefined) dbInjury.has_mri = injury.hasMri
  if (injury.hasXray !== undefined) dbInjury.has_xray = injury.hasXray
  if (injury.hasCt !== undefined) dbInjury.has_ct = injury.hasCt
  if (injury.imagingFindings !== undefined) dbInjury.imaging_findings = injury.imagingFindings
  if (injury.medicalDischargeDate !== undefined) dbInjury.medical_discharge_date = injury.medicalDischargeDate
  if (injury.progressiveReturnDate !== undefined) dbInjury.progressive_return_date = injury.progressiveReturnDate
  if (injury.competitiveRtpDate !== undefined) dbInjury.competitive_rtp_date = injury.competitiveRtpDate
  if (injury.rtpCriteriaClinical !== undefined) dbInjury.rtp_criteria_clinical = injury.rtpCriteriaClinical
  if (injury.rtpCriteriaFunctional !== undefined) dbInjury.rtp_criteria_functional = injury.rtpCriteriaFunctional
  if (injury.rtpCriteriaStrength !== undefined) dbInjury.rtp_criteria_strength = injury.rtpCriteriaStrength
  if (injury.rtpCriteriaGps !== undefined) dbInjury.rtp_criteria_gps = injury.rtpCriteriaGps
  if (injury.surgeryDate !== undefined) dbInjury.surgery_date = injury.surgeryDate
  if (injury.rtrNotes !== undefined) dbInjury.rtr_notes = injury.rtrNotes
  if (injury.rttNotes !== undefined) dbInjury.rtt_notes = injury.rttNotes
  if (injury.rtpNotes !== undefined) dbInjury.rtp_notes = injury.rtpNotes
  if (injury.medicalObservations !== undefined) dbInjury.medical_observations = injury.medicalObservations
  if (injury.responsibleDoctor !== undefined) dbInjury.responsible_doctor = injury.responsibleDoctor
  if (injury.isDischarged !== undefined) dbInjury.is_discharged = injury.isDischarged
  if (injury.dischargeDate !== undefined) dbInjury.discharge_date = injury.dischargeDate

  const { data, error } = await supabase.from("injuries").update(dbInjury).eq("id", injuryId).select().single()

  if (error) {
    console.error("[v0] Error updating injury:", error)
    throw error
  }

  return mapDatabaseInjuryToAppInjury(data)
}

export async function deleteInjury(injuryId: string): Promise<void> {
  const supabase = await createServerClient()

  const { error } = await supabase.from("injuries").delete().eq("id", injuryId)

  if (error) {
    console.error("[v0] Error deleting injury:", error)
    throw error
  }
}

export async function getInjuryEvolutions(injuryId: string): Promise<InjuryEvolution[]> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("injury_evolutions")
    .select(`
      *,
      profiles:created_by (name)
    `)
    .eq("injury_id", injuryId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching injury evolutions:", error)
    throw error
  }

  return (data || []).map((item: any) => ({
    id: item.id,
    injuryId: item.injury_id,
    evolutionText: item.evolution_text,
    createdBy: item.profiles?.name || "Desconocido",
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }))
}

export async function addInjuryEvolution(injuryId: string, evolutionText: string): Promise<InjuryEvolution> {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Usuario no autenticado")
  }

  const { data, error } = await supabase
    .from("injury_evolutions")
    .insert({
      injury_id: injuryId,
      evolution_text: evolutionText,
      created_by: user.id,
    })
    .select(`
      *,
      profiles:created_by (name)
    `)
    .single()

  if (error) {
    console.error("[v0] Error adding injury evolution:", error)
    throw error
  }

  return {
    id: data.id,
    injuryId: data.injury_id,
    evolutionText: data.evolution_text,
    createdBy: data.profiles?.name || "Desconocido",
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

export async function getActiveInjuries(): Promise<Array<Injury & { playerName: string; playerDivision: string; playerPosition: string; dominantFoot: string }>> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("injuries")
    .select(`
      *,
      players:player_id (
        name,
        division,
        position,
        is_injured,
        dominant_foot
      )
    `)
    .eq("is_discharged", false)
    .order("injury_date", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching active injuries:", error)
    throw error
  }

  // Filtrar solo jugadores que estén marcados como lesionados
  const activeInjuries = (data || [])
    .filter((item: any) => item.players?.is_injured === true)
    .map((item: any) => ({
      ...mapDatabaseInjuryToAppInjury(item),
      playerName: item.players?.name || "Desconocido",
      playerDivision: item.players?.division || "N/A",
      playerPosition: item.players?.position || "N/A",
      dominantFoot: item.players?.dominant_foot || "-",
    }))

  return activeInjuries
}

export async function getAllInjuries(): Promise<Array<Injury & { playerName: string; playerDivision: string; playerPosition: string; dominantFoot: string }>> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("injuries")
    .select(`
      *,
      players:player_id (
        name,
        division,
        position,
        is_injured,
        dominant_foot
      )
    `)
    .order("injury_date", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching all injuries:", error)
    throw error
  }

  // Devolver todas las lesiones (activas y descargadas)
  const allInjuries = (data || []).map((item: any) => ({
    ...mapDatabaseInjuryToAppInjury(item),
    playerName: item.players?.name || "Desconocido",
    playerDivision: item.players?.division || "N/A",
    playerPosition: item.players?.position || "N/A",
    dominantFoot: item.players?.dominant_foot || "-",
  }))

  return allInjuries
}

function mapDatabaseInjuryToAppInjury(dbInjury: any): Injury {
  return {
    id: dbInjury.id,
    playerId: dbInjury.player_id,
    injuryDate: dbInjury.injury_date,
    injuryTime: dbInjury.injury_time,
    context: dbInjury.context,
    gameMinute: dbInjury.game_minute,
    surface: dbInjury.surface,
    mechanismType: dbInjury.mechanism_type,
    specificSituation: dbInjury.specific_situation,
    anatomicalLocation: dbInjury.anatomical_location,
    affectedSide: dbInjury.affected_side,
    injuryType: dbInjury.injury_type,
    injuryTypeOther: dbInjury.injury_type_other,
    clinicalDiagnosis: dbInjury.clinical_diagnosis,
    severity: dbInjury.severity,
    daysAbsent: dbInjury.days_absent,
    evolutionType: dbInjury.evolution_type,
    treatment: dbInjury.treatment,
    hasUltrasound: dbInjury.has_ultrasound || false,
    hasMri: dbInjury.has_mri || false,
    hasXray: dbInjury.has_xray || false,
    hasCt: dbInjury.has_ct || false,
    imagingFindings: dbInjury.imaging_findings,
    medicalDischargeDate: dbInjury.medical_discharge_date,
    progressiveReturnDate: dbInjury.progressive_return_date,
    competitiveRtpDate: dbInjury.competitive_rtp_date,
    rtpCriteriaClinical: dbInjury.rtp_criteria_clinical || false,
    rtpCriteriaFunctional: dbInjury.rtp_criteria_functional || false,
    rtpCriteriaStrength: dbInjury.rtp_criteria_strength || false,
    rtpCriteriaGps: dbInjury.rtp_criteria_gps || false,
    surgeryDate: dbInjury.surgery_date,
    rtrNotes: dbInjury.rtr_notes,
    rttNotes: dbInjury.rtt_notes,
    rtpNotes: dbInjury.rtp_notes,
    medicalObservations: dbInjury.medical_observations,
    responsibleDoctor: dbInjury.responsible_doctor,
    isDischarged: dbInjury.is_discharged || false,
    dischargeDate: dbInjury.discharge_date,
    createdAt: dbInjury.created_at,
    updatedAt: dbInjury.updated_at,
  }
}
