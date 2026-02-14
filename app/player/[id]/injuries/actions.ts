"use server"

import { createServerClient } from "@/lib/supabase"
import { getPlayerInjuries } from "@/lib/injuries"
import { getPlayerIllnesses } from "@/lib/illnesses"
import { createIllness, type CreateIllnessParams } from "@/lib/illnesses"
import { updatePlayerInjuryStatus } from "@/lib/players"
import { createMedicalStudy, getMedicalStudiesByPlayer } from "@/lib/medical-studies" // Added medical studies imports

export async function saveInjuryAction(injuryData: any) {
  try {
    console.log("[v0] Guardando lesión para jugador:", injuryData.playerId)

    const supabase = await createServerClient()

    const dbInjury = {
      player_id: injuryData.playerId,
      injury_date: injuryData.injuryDate,
      injury_time: injuryData.injuryTime || null,
      context: injuryData.context || null,
      game_minute: injuryData.gameMinute || null,
      surface: injuryData.surface || null,
      mechanism_type: injuryData.mechanismType || null,
      specific_situation: injuryData.specificSituation || null,
      anatomical_location: injuryData.anatomicalLocation || null,
      affected_side: injuryData.affectedSide || null,
      injury_type: injuryData.injuryType || null,
      injury_type_other: injuryData.injuryTypeOther || null,
      clinical_diagnosis: injuryData.clinicalDiagnosis || null,
      severity: injuryData.severity || null,
      days_absent: injuryData.daysAbsent || null,
      evolution_type: injuryData.evolutionType || null,
      treatment: injuryData.treatment || null,
      has_ultrasound: injuryData.hasUltrasound || false,
      has_mri: injuryData.hasMri || false,
      has_xray: injuryData.hasXray || false,
      has_ct: injuryData.hasCt || false,
      imaging_findings: injuryData.imagingFindings || null,
      medical_discharge_date: injuryData.medicalDischargeDate || null,
      progressive_return_date: injuryData.progressiveReturnDate || null,
      competitive_rtp_date: injuryData.competitiveRtpDate || null,
      rtp_criteria_clinical: injuryData.rtpCriteriaClinical || false,
      rtp_criteria_functional: injuryData.rtpCriteriaFunctional || false,
      rtp_criteria_strength: injuryData.rtpCriteriaStrength || false,
      rtp_criteria_gps: injuryData.rtpCriteriaGps || false,
      medical_observations: injuryData.medicalObservations || null,
      responsible_doctor: injuryData.responsibleDoctor || null,
    }

    let data, error

    if (injuryData.id) {
      // Update existing injury
      console.log("[v0] Actualizando lesión:", injuryData.id)
      const result = await supabase.from("injuries").update(dbInjury).eq("id", injuryData.id).select().single()
      data = result.data
      error = result.error
    } else {
      // Create new injury
      console.log("[v0] Creando nueva lesión")
      const result = await supabase.from("injuries").insert(dbInjury).select().single()
      data = result.data
      error = result.error

      if (!error) {
        console.log("[v0] Actualizando estado del jugador a lesionado")
        await updatePlayerInjuryStatus(injuryData.playerId, true)
      }
    }

    if (error) {
      console.error("[v0] Error al guardar/actualizar lesión:", error)
      throw error
    }

    console.log("[v0] Lesión guardada exitosamente")

    return { success: true, data }
  } catch (error: any) {
    console.error("[v0] Error en saveInjuryAction:", error.message)
    return { success: false, error: error.message }
  }
}

export async function saveIllnessAction(params: CreateIllnessParams) {
  try {
    const illness = await createIllness(params)
    return { success: true, data: illness }
  } catch (error) {
    console.error("[v0] Error en saveIllnessAction:", error)
    return { success: false, error: String(error) }
  }
}

export async function getPlayerInjuriesAction(playerId: string) {
  try {
    const injuries = await getPlayerInjuries(playerId)
    return { success: true, data: injuries }
  } catch (error) {
    console.error("[v0] Error en getPlayerInjuriesAction:", error)
    return { success: false, error: String(error), data: [] }
  }
}

export async function getPlayerIllnessesAction(playerId: string) {
  try {
    const illnesses = await getPlayerIllnesses(playerId)
    return { success: true, data: illnesses }
  } catch (error) {
    console.error("[v0] Error en getPlayerIllnessesAction:", error)
    return { success: false, error: String(error), data: [] }
  }
}

export async function updatePlayerInjuryStatusAction(playerId: string, isInjured: boolean) {
  try {
    console.log("[v0] Actualizando estado de lesión del jugador:", playerId, "a:", isInjured)
    await updatePlayerInjuryStatus(playerId, isInjured)
    return { success: true }
  } catch (error) {
    console.error("[v0] Error en updatePlayerInjuryStatusAction:", error)
    return { success: false, error: String(error) }
  }
}

export async function getPlayerStudiesAction(playerId: string) {
  try {
    console.log("[v0] Obteniendo estudios complementarios del jugador:", playerId)
    const studies = await getMedicalStudiesByPlayer(playerId)
    console.log("[v0] Estudios obtenidos:", studies.length)
    return studies
  } catch (error) {
    console.error("[v0] Error en getPlayerStudiesAction:", error)
    return []
  }
}

export async function saveStudyAction(
  playerId: string,
  uploadedBy: string,
  uploadedByName: string,
  observations: string,
  attachments: Array<{ id: string; name: string; type: string; url: string }>,
) {
  try {
    console.log("[v0] Guardando estudio complementario para jugador:", playerId)
    const study = await createMedicalStudy({
      playerId,
      uploadedBy,
      uploadedByName,
      observations,
      attachments,
    })
    console.log("[v0] Estudio guardado exitosamente:", study.id)
    return { success: true, data: study }
  } catch (error) {
    console.error("[v0] Error en saveStudyAction:", error)
    return { success: false, error: String(error) }
  }
}
