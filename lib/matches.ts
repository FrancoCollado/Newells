import { supabase } from "./supabase"
import type { Division, LeagueType } from "./players"

export interface MatchPlayer {
  playerId: string
  playerName: string
  minutesPlayed: number
  wasInjured: boolean
  goals: number
}

export interface Match {
  id: string
  division: Division
  date: string
  opponent: string
  result: string
  players: MatchPlayer[]
  createdBy: string
  videoUrl?: string
  leagueType: LeagueType
}

export async function getMatches(): Promise<Match[]> {
  const { data: matchesData, error } = await supabase
    .from("matches")
    .select(`
      *,
      match_players (*)
    `)
    .order("date", { ascending: false })

  if (error) {
    console.error("Error fetching matches:", error)
    return []
  }

  return matchesData.map(mapDatabaseMatchToAppMatch)
}

export async function getMatchesByDivision(division: Division, page = 0, limit = 5): Promise<Match[]> {
  const from = page * limit
  const to = from + limit - 1

  const { data: matchesData, error } = await supabase
    .from("matches")
    .select(`
      *,
      match_players (*)
    `)
    .eq("division", division)
    .order("date", { ascending: false })
    .range(from, to)

  if (error) {
    console.error("Error fetching matches by division:", error)
    return []
  }

  return matchesData.map(mapDatabaseMatchToAppMatch)
}

function mapDatabaseMatchToAppMatch(dbMatch: any): Match {
  return {
    id: dbMatch.id,
    division: dbMatch.division,
    date: dbMatch.date,
    opponent: dbMatch.opponent,
    result: dbMatch.result,
    createdBy: dbMatch.created_by,
    videoUrl: dbMatch.video_url,
    leagueType: dbMatch.league_type || "ROSARINA",
    players: (dbMatch.match_players || []).map((mp: any) => ({
      playerId: mp.player_id,
      playerName: mp.player_name,
      minutesPlayed: mp.minutes_played,
      wasInjured: mp.was_injured,
      goals: mp.goals,
    })),
  }
}

export async function saveMatch(match: Match): Promise<void> {
  console.log("[v0] Starting saveMatch with data:", {
    matchId: match.id,
    leagueType: match.leagueType,
    playersCount: match.players.length,
  })

  // 1. Insert Match
  const { data: insertedMatch, error: matchError } = await supabase
    .from("matches")
    .insert({
      division: match.division,
      date: match.date,
      opponent: match.opponent,
      result: match.result,
      created_by: match.createdBy,
      video_url: match.videoUrl,
      league_type: match.leagueType,
    })
    .select()
    .single()

  if (matchError || !insertedMatch) {
    console.error("[v0] Error saving match:", matchError)
    throw new Error("Error saving match")
  }

  const matchId = insertedMatch.id
  console.log("[v0] Match inserted successfully with ID:", matchId)

  // 2. Insert Match Players
  const matchPlayersToInsert = match.players.map((p) => ({
    match_id: matchId,
    player_id: p.playerId,
    player_name: p.playerName,
    minutes_played: p.minutesPlayed,
    was_injured: p.wasInjured,
    goals: p.goals,
  }))

  const { error: playersError } = await supabase.from("match_players").insert(matchPlayersToInsert)

  if (playersError) {
    console.error("[v0] Error saving match players:", playersError)
    throw new Error("Error saving match players")
  }

  console.log("[v0] Match players inserted successfully")

  console.log("[v0] Starting player stats update...")

  const statsUpdatePromises = match.players.map(async (p) => {
    console.log("[v0] Updating stats for player:", {
      playerId: p.playerId,
      leagueType: match.leagueType,
      minutes: p.minutesPlayed,
      goals: p.goals,
    })

    const { data, error } = await supabase.rpc("increment_player_league_stats", {
      p_id: p.playerId,
      p_league_type: match.leagueType,
      p_minutes: p.minutesPlayed,
      p_goals: p.goals,
    })

    if (error) {
      console.error("[v0] Error updating stats for player", p.playerId, ":", error)
      throw error
    }

    console.log("[v0] Stats updated successfully for player:", p.playerId)
    return data
  })

  try {
    await Promise.all(statsUpdatePromises)
    console.log("[v0] All player stats updated successfully")
  } catch (error) {
    console.error("[v0] Error updating player stats:", error)
    throw new Error("Error updating player stats")
  }

  // También actualizar estado de lesión si es necesario
  const injuredPlayers = match.players.filter((p) => p.wasInjured)
  if (injuredPlayers.length > 0) {
    console.log("[v0] Updating injury status for", injuredPlayers.length, "players")
    await Promise.all(
      injuredPlayers.map(async (p) => {
        const { error } = await supabase.from("players").update({ is_injured: true }).eq("id", p.playerId)
        if (error) {
          console.error("[v0] Error updating injury status for player", p.playerId, ":", error)
        }
      }),
    )
  }

  console.log("[v0] Match save completed successfully")
}

export function generateMatchId(): string {
  return `match_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}
