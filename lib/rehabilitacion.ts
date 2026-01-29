import { createServerClient } from "./supabase"
import { getActiveInjuries, updateInjury } from "./injuries"

export type RehabilitacionData = {
  id: string
  nombre: string
  lesionFecha: string
  gravedad: string
  cx: string
  fechaCx: string
  estudios: string
  piernaLesionada: string
  piernaHabil: string
  recidiva: string
  puesto: string
  // Campos editables
  rtr: string
  rtt: string
  rtp: string
}

export async function getRehabilitacionPlanilla(): Promise<RehabilitacionData[]> {
  try {
    const activeInjuries = await getActiveInjuries()
    
    return activeInjuries.map(injury => {
      // Determinar si hubo cirugía
      const cx = injury.treatment === 'quirurgico' ? 'Si' : 'No'
      
      // Formatear estudios
      const estudios = [
        injury.hasUltrasound ? 'Rx' : '',
        injury.hasMri ? 'Resonancia' : '',
        injury.hasXray ? 'Rx' : '',
        injury.hasCt ? 'TAC' : ''
      ].filter(Boolean).join(', ')

      // Mapear el tipo de lesión y diagnóstico para "lesionFecha"
      const lesionFecha = `${injury.injuryDate} ${injury.clinicalDiagnosis || injury.injuryType || ''}`

      return {
        id: injury.id,
        nombre: injury.playerName,
        lesionFecha: lesionFecha,
        gravedad: injury.severity || 'N/A',
        cx: cx,
        fechaCx: injury.surgeryDate || '-',
        estudios: estudios || '-',
        piernaLesionada: injury.affectedSide || 'N/A',
        piernaHabil: injury.dominantFoot || '-',
        recidiva: injury.evolutionType === 'recidiva' ? 'Si' : 'No',
        puesto: injury.playerPosition || 'N/A',
        rtr: injury.rtrNotes || '',
        rtt: injury.rttNotes || '',
        rtp: injury.rtpNotes || ''
      }
    })
  } catch (error) {
    console.error("Error en getRehabilitacionPlanilla:", error)
    return []
  }
}

export async function saveRehabilitacionFields(id: string, fields: { rtr?: string, rtt?: string, rtp?: string }) {
  return await updateInjury(id, {
    rtrNotes: fields.rtr,
    rttNotes: fields.rtt,
    rtpNotes: fields.rtp
  })
}
