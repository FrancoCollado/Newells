"use server"

import { createMedicalStudy, getMedicalStudiesByPlayer } from "@/lib/medical-studies"

export async function getPlayerStudiesAction(playerId: string) {
  try {
    const studies = await getMedicalStudiesByPlayer(playerId)
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
    const study = await createMedicalStudy({
      playerId,
      uploadedBy,
      uploadedByName,
      observations,
      attachments,
    })
    return { success: true, data: study }
  } catch (error) {
    console.error("[v0] Error en saveStudyAction:", error)
    return { success: false, error: String(error) }
  }
}
