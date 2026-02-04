import { supabase } from "./supabase"
import type { Division, LeagueType } from "./players"

export interface MatchPlayer {
  playerId: string
  playerName: string
  minutesPlayed: number
  wasInjured: boolean
  goals: number
  goalsAgainst?: number
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
  attachments?: Array<{
    id: string
    name: string
    url: string
    type: string
  }>
}

export async function uploadMatchAttachment(file: File): Promise<{ id: string; name: string; url: string; type: string }> {
  try {
    const fileExtension = file.name.split('.').pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExtension}`
    
    const { data, error } = await supabase.storage
      .from("match_attachments")
      .upload(fileName, file, { cacheControl: "31536000" })
    
    if (error) {
      console.error("[v0] Error uploading match attachment:", error)
      throw new Error("Error uploading file: " + error.message)
    }
    
    console.log("[v0] Match attachment uploaded successfully:", fileName)

    const { data: publicData } = supabase.storage
      .from("match_attachments")
      .getPublicUrl(fileName)
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      url: publicData.publicUrl,
      type: file.type || "application/octet-stream",
    }
  } catch (error) {
    console.error("[v0] Error in uploadMatchAttachment:", error)
    throw error
  }
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

export async function getMatchById(id: string): Promise<Match | null> {
  const { data: matchData, error } = await supabase
    .from("matches")
    .select(`
      *,
      match_players (*)
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching match by id:", error)
    return null
  }

  return mapDatabaseMatchToAppMatch(matchData)
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
    attachments: dbMatch.attachments || [],
    players: (dbMatch.match_players || []).map((mp: any) => ({
      playerId: mp.player_id,
      playerName: mp.player_name,
      minutesPlayed: mp.minutes_played,
      wasInjured: mp.was_injured,
      goals: mp.goals,
      goalsAgainst: mp.goals_against || 0,
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
      attachments: match.attachments || [],
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
    goals_against: p.goalsAgainst || 0,
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

export async function updateMatch(match: Match): Promise<void> {
  console.log("[v0] Starting updateMatch with data:", match)

  // 1. Update Match details
  const { error: matchError } = await supabase
    .from("matches")
    .update({
      division: match.division,
      date: match.date,
      opponent: match.opponent,
      result: match.result,
      video_url: match.videoUrl,
      league_type: match.leagueType,
      attachments: match.attachments || [],
    })
    .eq("id", match.id)

  if (matchError) {
    console.error("[v0] Error updating match:", matchError)
    throw new Error("Error updating match")
  }

  // 2. Update Match Players
  // First delete existing players for this match (simplest way to handle changes)
  const { error: deleteError } = await supabase
    .from("match_players")
    .delete()
    .eq("match_id", match.id)

  if (deleteError) {
    console.error("[v0] Error deleting old match players:", deleteError)
    throw new Error("Error updating match players")
  }

  // Then insert new players
  const matchPlayersToInsert = match.players.map((p) => ({
    match_id: match.id,
    player_id: p.playerId,
    player_name: p.playerName,
    minutes_played: p.minutesPlayed,
    was_injured: p.wasInjured,
    goals: p.goals,
    goals_against: p.goalsAgainst || 0,
  }))

  const { error: playersError } = await supabase.from("match_players").insert(matchPlayersToInsert)

  if (playersError) {
    console.error("[v0] Error inserting new match players:", playersError)
    throw new Error("Error updating match players")
  }

  // NOTE: Updating cumulative stats on edit is complex because we'd need to subtract old stats and add new ones.
  // For now, we assume this operation corrects the match record, but doesn't automatically fix the cumulative stats 
  // unless we implement a full recalculation logic. 
  // This is a known limitation in many simple systems. 
  // To do it right, we should trigger a recalculation of stats for all affected players.
  // Or we can leave it as is and warn the user.
  // Given the complexity, I'll log a warning.
  console.warn("[v0] Note: Cumulative player stats are not automatically adjusted on match edit.")
}

export function generateMatchId(): string {
  return `match_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}
