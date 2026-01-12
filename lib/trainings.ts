import { supabase } from "./supabase"
import type { Division } from "./players"

export interface Training {
  id: string
  division: Division
  date: string
  description: string
  createdBy: string
}

export async function getTrainings(): Promise<Training[]> {
  const { data, error } = await supabase
    .from("trainings")
    .select("*")
    .order("date", { ascending: false })

  if (error) {
    console.error("Error fetching trainings:", error)
    return []
  }

  return data.map(mapDatabaseTrainingToAppTraining)
}

export async function getTrainingsByDivision(division: Division, page = 0, limit = 5): Promise<Training[]> {
  const from = page * limit
  const to = from + limit - 1

  const { data, error } = await supabase
    .from("trainings")
    .select("*")
    .eq("division", division)
    .order("date", { ascending: false })
    .range(from, to)

  if (error) {
    console.error("Error fetching trainings by division:", error)
    return []
  }

  return data.map(mapDatabaseTrainingToAppTraining)
}

export async function saveTraining(training: Training): Promise<void> {
  const { error } = await supabase
    .from("trainings")
    .insert({
      division: training.division,
      date: training.date,
      description: training.description,
      created_by: training.createdBy,
    })

  if (error) {
    console.error("Error saving training:", error)
    throw new Error("Error saving training")
  }
}

export function generateTrainingId(): string {
  // Not strictly needed if using UUIDs, but keeping for compatibility if any frontend logic relies on generating ID before save
  // Though saveTraining above ignores the ID in the object and lets DB generate it.
  return `training_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

function mapDatabaseTrainingToAppTraining(dbTraining: any): Training {
  return {
    id: dbTraining.id,
    division: dbTraining.division,
    date: dbTraining.date,
    description: dbTraining.description,
    createdBy: dbTraining.created_by,
  }
}
