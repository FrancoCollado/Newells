import { supabase } from "./supabase"
import type { Division, Position } from "./players"

export type FormationType = "4-3-3" | "4-4-2" | "3-5-2" | "4-2-3-1" | "5-3-2"

export interface FormationPlayer {
  playerId: string
  position: Position
  index: number // 0-10, position in the array
}

export interface Formation {
  id: string
  name: string
  formationType: FormationType
  division?: Division
  players: FormationPlayer[]
  createdBy?: string
  createdAt?: string
}

export async function getFormations(division?: Division): Promise<Formation[]> {
  let query = supabase.from("formations").select("*").order("created_at", { ascending: false })
  
  if (division) {
    query = query.eq("division", division)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching formations:", error)
    return []
  }

  return data.map(mapDatabaseFormationToApp)
}

export async function saveFormation(formation: Omit<Formation, "id" | "createdAt">): Promise<Formation | null> {
  const { data, error } = await supabase
    .from("formations")
    .insert({
      name: formation.name,
      formation_type: formation.formationType,
      division: formation.division,
      players: formation.players, // Supabase handles JSONB array
      created_by: formation.createdBy
    })
    .select()
    .single()

  if (error) {
    console.error("Error saving formation:", error)
    return null
  }

  return mapDatabaseFormationToApp(data)
}

export async function deleteFormation(id: string): Promise<boolean> {
  const { error } = await supabase.from("formations").delete().eq("id", id)
  
  if (error) {
    console.error("Error deleting formation:", error)
    return false
  }
  return true
}

function mapDatabaseFormationToApp(dbFormation: any): Formation {
  return {
    id: dbFormation.id,
    name: dbFormation.name,
    formationType: dbFormation.formation_type,
    division: dbFormation.division,
    players: dbFormation.players,
    createdBy: dbFormation.created_by,
    createdAt: dbFormation.created_at
  }
}
