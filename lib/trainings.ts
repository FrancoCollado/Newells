import { supabase } from "./supabase"
import type { Division } from "./players"

export interface Training {
  id: string
  division: Division
  date: string
  description: string
  createdBy: string
  link?: string
  attachments?: Array<{
    id: string
    name: string
    url: string
    type: string
  }>
}

export async function getTrainings(): Promise<Training[]> {
  const { data, error } = await supabase.from("trainings").select("*").order("date", { ascending: false })

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

export async function saveTraining(training: Omit<Training, 'id'>): Promise<Training> {
  const { data, error } = await supabase.from("trainings").insert({
    division: training.division,
    date: training.date,
    description: training.description,
    created_by: training.createdBy,
    link: training.link,
    attachments: training.attachments || [],
  }).select().single()

  if (error || !data) {
    console.error("Error saving training:", error)
    throw new Error("Error saving training")
  }

  return mapDatabaseTrainingToAppTraining(data)
}

export async function updateTraining(training: Training): Promise<void> {
  const { error } = await supabase
    .from("trainings")
    .update({
      division: training.division,
      date: training.date,
      description: training.description,
      link: training.link,
      attachments: training.attachments || [],
    })
    .eq("id", training.id)

  if (error) {
    console.error("Error updating training:", error)
    throw new Error("Error updating training")
  }
}

export async function deleteTraining(trainingId: string): Promise<void> {
  const { error } = await supabase.from("trainings").delete().eq("id", trainingId)

  if (error) {
    console.error("Error deleting training:", error)
    throw new Error("Error deleting training")
  }
}

function mapDatabaseTrainingToAppTraining(dbTraining: any): Training {
  return {
    id: dbTraining.id,
    division: dbTraining.division,
    date: dbTraining.date,
    description: dbTraining.description,
    createdBy: dbTraining.created_by,
    link: dbTraining.link,
    attachments: dbTraining.attachments || [],
  }
}

export function generateTrainingId(): string {
  return `training_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}
