import { supabase } from "./supabase"
import type { Division } from "./players"

export interface MatchPlayer {
  playerId: string
  playerName: string
  minutesPlayed: number
  wasInjured: boolean
  goals: number // Total de goles marcados por el jugador en este partido
}

export interface Match {
  id: string
  division: Division
  date: string
  opponent: string
  result: string // ej: "3-1", "2-2"
  players: MatchPlayer[]
  createdBy: string
  videoUrl?: string
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
    })
    .select()
    .single()

  if (matchError || !insertedMatch) {
    console.error("Error saving match:", matchError)
    throw new Error("Error saving match")
  }

  const matchId = insertedMatch.id

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
    console.error("Error saving match players:", playersError)
    // In a real app, we would rollback here or use a transaction
    throw new Error("Error saving match players")
  }

  // 3. Update Player Stats (Backend Logic)
  // We do this here to ensure data consistency, rather than relying on the client
  // to make N separate requests that might be interrupted.
  
  // We use Promise.all to run them in parallel for speed
  await Promise.all(match.players.map(p => 
    supabase.rpc("increment_player_stats", {
      p_id: p.playerId,
      p_minutes: p.minutesPlayed,
      p_goals: p.goals,
      p_injured: p.wasInjured,
    })
  ))
}

export function generateMatchId(): string {
  // Supabase generates UUIDs, but we might keep this for temporary frontend keys if needed.
  // Although saveMatch ignores the ID passed in the object and uses the DB one.
  return `match_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}
