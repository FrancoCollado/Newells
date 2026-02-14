"use server"

import { createServerClient } from "@/lib/supabase"

export async function getManagerialReportData(division: string) {
  const supabase = await createServerClient()

  // 1. Obtener todos los jugadores de la división
  const { data: players, error: playersError } = await supabase
    .from("players")
    .select("*")
    .contains("division", [division])
    .order("name")

  if (playersError) throw playersError

  // 2. Para cada jugador, obtener el último informe nutricional y la lesión activa
  const consolidatedData = await Promise.all(players.map(async (player) => {
    // Último informe nutricional
    const { data: nutrition } = await supabase
      .from("nutrition_reports")
      .select("im_o, sum_6_pliegues")
      .eq("player_id", player.id)
      .order("report_date", { ascending: false })
      .limit(1)
      .maybeSingle()

    // Lesión activa (no dada de alta)
    const { data: injury } = await supabase
      .from("injuries")
      .select("anatomical_location, treatment, clinical_diagnosis")
      .eq("player_id", player.id)
      .eq("is_discharged", false)
      .limit(1)
      .maybeSingle()

    return {
      id: player.id,
      name: player.name,
      age: player.age,
      height: player.height,
      weight: player.weight,
      minutesPlayed: player.minutes_played || 0,
      goals: player.goals || 0,
      imo: nutrition?.im_o || null,
      sum6Pliegues: nutrition?.sum_6_pliegues || null,
      isInjured: player.is_injured || false,
      injuryLocation: injury?.anatomical_location || "-",
      injuryTreatment: injury?.treatment || "-",
      injuryDiagnosis: injury?.clinical_diagnosis || "-",
      observations: player.observations || "-",
      hasEuPassport: player.has_eu_passport || false,
      isPensioned: player.is_pensioned || false
    }
  }))

  return consolidatedData
}
