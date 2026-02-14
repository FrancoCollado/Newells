import { createServerClient } from "./supabase"

export interface NutritionReport {
  id: string
  playerId: string
  createdBy: string
  reportDate: string
  weight: number
  height: number
  muscleKg: number
  fatKg: number
  musclePercentage: number
  fatPercentage: number
  imO: number
  sum6Pliegues: number
  observations?: string
  createdAt: string
  profiles?: {
    name: string
  }
}

export async function getPlayerNutritionReports(playerId: string): Promise<NutritionReport[]> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("nutrition_reports")
    .select("*, profiles:created_by(name)")
    .eq("player_id", playerId)
    .order("report_date", { ascending: false })

  if (error) throw error
  return data.map(mapDbToNutritionReport)
}

export async function saveNutritionReport(report: Partial<NutritionReport>) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")

  const dbReport = {
    player_id: report.playerId,
    created_by: user.id,
    report_date: report.reportDate || new Date().toISOString().split('T')[0],
    weight: report.weight,
    height: report.height,
    muscle_kg: report.muscleKg,
    fat_kg: report.fatKg,
    muscle_percentage: report.musclePercentage,
    fat_percentage: report.fatPercentage,
    im_o: report.imO,
    sum_6_pliegues: report.sum6Pliegues,
    observations: report.observations
  }
  
  const { data, error } = await supabase
    .from("nutrition_reports")
    .insert(dbReport)
    .select()
    .single()

  if (error) throw error
  return data
}

function mapDbToNutritionReport(db: any): NutritionReport {
  return {
    id: db.id,
    playerId: db.player_id,
    createdBy: db.created_by,
    reportDate: db.report_date,
    weight: db.weight,
    height: db.height,
    muscleKg: db.muscle_kg,
    fatKg: db.fat_kg,
    musclePercentage: db.muscle_percentage,
    fatPercentage: db.fat_percentage,
    imO: db.im_o,
    sum6Pliegues: db.sum_6_pliegues,
    observations: db.observations,
    createdAt: db.created_at,
    profiles: db.profiles
  }
}
