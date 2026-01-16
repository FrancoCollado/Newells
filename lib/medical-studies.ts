import { createServerClient } from "./supabase"

export type MedicalStudy = {
  id: string
  player_id: string
  uploaded_by: string
  uploaded_by_name: string
  observations: string
  attachments: Array<{ id: string; name: string; type: string; url: string }>
  created_at: string
  updated_at: string
}

export async function createMedicalStudy(data: {
  playerId: string
  uploadedBy: string
  uploadedByName: string
  observations: string
  attachments: Array<{ id: string; name: string; type: string; url: string }>
}): Promise<MedicalStudy> {
  const supabase = await createServerClient()

  const { data: study, error } = await supabase
    .from("medical_studies")
    .insert({
      player_id: data.playerId,
      uploaded_by: data.uploadedBy,
      uploaded_by_name: data.uploadedByName,
      observations: data.observations,
      attachments: data.attachments,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating medical study:", error)
    throw new Error(`Error creating medical study: ${error.message}`)
  }

  return study
}

export async function getMedicalStudiesByPlayer(playerId: string): Promise<MedicalStudy[]> {
  const supabase = await createServerClient()

  const { data: studies, error } = await supabase
    .from("medical_studies")
    .select("*")
    .eq("player_id", playerId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching medical studies:", error)
    throw new Error(`Error fetching medical studies: ${error.message}`)
  }

  return studies || []
}
