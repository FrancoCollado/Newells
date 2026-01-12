import { supabase } from "./supabase"

export type Division =
  | "4ta"
  | "1eralocal"
  | "reserva"
  | "5ta"
  | "6ta"
  | "7ma"
  | "8va"
  | "9na"
  | "10ma"
  | "11"
  | "12"
  | "13"
  | "arqueros"
export type Position = "Arquero" | "Defensor" | "Mediocampista" | "Delantero"

export interface Player {
  id: string
  name: string
  division: Division
  age: number
  position: Position
  height: number // en cm
  weight: number // en kg
  photo?: string
  minutesPlayed: number // Total de minutos jugados
  matchesPlayed: number // Total de partidos jugados
  isInjured: boolean // Estado de lesión
  technicalReport?: string // Informe técnico del jugador (editable por dirigente/técnicos)
  goals: number // Total de goles marcados
}

export const MOCK_PLAYERS: Player[] = [
  // 4ta División
  {
    id: "1",
    name: "Lucas Martínez",
    division: "4ta",
    age: 19,
    position: "Defensor",
    height: 182,
    weight: 79,
    minutesPlayed: 0,
    matchesPlayed: 0,
    isInjured: false,
    goals: 0,
  },
  {
    id: "2",
    name: "Franco Gómez",
    division: "4ta",
    age: 20,
    position: "Delantero",
    height: 177,
    weight: 74,
    minutesPlayed: 0,
    matchesPlayed: 0,
    isInjured: false,
    goals: 0,
  },

  // Reserva
  {
    id: "5",
    name: "Julián Fernández",
    division: "reserva",
    age: 18,
    position: "Defensor",
    height: 182,
    weight: 79,
    minutesPlayed: 0,
    matchesPlayed: 0,
    isInjured: false,
    goals: 0,
  },
  {
    id: "6",
    name: "Matías González",
    division: "reserva",
    age: 19,
    position: "Mediocampista",
    height: 176,
    weight: 72,
    minutesPlayed: 0,
    matchesPlayed: 0,
    isInjured: false,
    goals: 0,
  },

  // 5ta División
  {
    id: "7",
    name: "Santiago López",
    division: "5ta",
    age: 17,
    position: "Delantero",
    height: 177,
    weight: 74,
    minutesPlayed: 0,
    matchesPlayed: 0,
    isInjured: false,
    goals: 0,
  },
  {
    id: "8",
    name: "Tomás Pérez",
    division: "5ta",
    age: 17,
    position: "Mediocampista",
    height: 174,
    weight: 70,
    minutesPlayed: 0,
    matchesPlayed: 0,
    isInjured: false,
    goals: 0,
  },

  // 7ma División
  {
    id: "9",
    name: "Nicolás Romero",
    division: "7ma",
    age: 15,
    position: "Defensor",
    height: 179,
    weight: 76,
    minutesPlayed: 0,
    matchesPlayed: 0,
    isInjured: false,
    goals: 0,
  },
  {
    id: "10",
    name: "Agustín Silva",
    division: "7ma",
    age: 15,
    position: "Mediocampista",
    height: 174,
    weight: 70,
    minutesPlayed: 0,
    matchesPlayed: 0,
    isInjured: false,
    goals: 0,
  },

  // 9na División
  {
    id: "11",
    name: "Valentín Castro",
    division: "9na",
    age: 13,
    position: "Defensor",
    height: 175,
    weight: 68,
    minutesPlayed: 0,
    matchesPlayed: 0,
    isInjured: false,
    goals: 0,
  },
  {
    id: "12",
    name: "Lautaro Ruiz",
    division: "9na",
    age: 13,
    position: "Delantero",
    height: 172,
    weight: 65,
    minutesPlayed: 0,
    matchesPlayed: 0,
    isInjured: false,
    goals: 0,
  },

  // Arqueros
  {
    id: "13",
    name: "Benjamín Morales",
    division: "arqueros",
    age: 16,
    position: "Arquero",
    height: 184,
    weight: 78,
    minutesPlayed: 0,
    matchesPlayed: 0,
    isInjured: false,
    goals: 0,
  },
  {
    id: "14",
    name: "Felipe Gutiérrez",
    division: "arqueros",
    age: 17,
    position: "Arquero",
    height: 186,
    weight: 80,
    minutesPlayed: 0,
    matchesPlayed: 0,
    isInjured: false,
    goals: 0,
  },
]

export function getDivisionLabel(division: Division): string {
  const labels: Record<Division, string> = {
    "4ta": "4ta División",
    "1eralocal": "1era Local",
    reserva: "Reserva",
    "5ta": "5ta División",
    "6ta": "6ta División",
    "7ma": "7ma División",
    "8va": "8va División",
    "9na": "9na División",
    "10ma": "10ma División",
    "11": "11va División",
    "12": "12va División",
    "13": "13va División",
    arqueros: "Arqueros",
  }
  return labels[division]
}

// Helper para mapear DB -> App
function mapDatabasePlayerToAppPlayer(dbPlayer: any): Player {
  return {
    id: dbPlayer.id,
    name: dbPlayer.name,
    division: dbPlayer.division,
    age: dbPlayer.age,
    position: dbPlayer.position,
    height: dbPlayer.height,
    weight: dbPlayer.weight,
    minutesPlayed: dbPlayer.minutes_played,
    matchesPlayed: dbPlayer.matches_played,
    isInjured: dbPlayer.is_injured,
    technicalReport: dbPlayer.technical_report,
    goals: dbPlayer.goals,
    photo: dbPlayer.photo,
  }
}

// Optimized seeding check
async function checkAndSeedPlayers() {
    const { count, error } = await supabase.from("players").select("*", { count: "exact", head: true })
    
    if (!error && count === 0) {
        console.log("Database empty, seeding players...")
        const { error: insertError } = await supabase.from("players").insert(
          MOCK_PLAYERS.map((p) => ({
            name: p.name,
            division: p.division,
            age: p.age,
            position: p.position,
            height: p.height,
            weight: p.weight,
            minutes_played: p.minutesPlayed,
            matches_played: p.matchesPlayed,
            is_injured: p.isInjured,
            technical_report: p.technicalReport,
            goals: p.goals,
          })),
        )
        if (insertError) console.error("Error seeding players:", insertError)
    }
}

// Main getPlayers function (Fixed duplication)
export async function getPlayers(): Promise<Player[]> {
  // Check seed in background
  await checkAndSeedPlayers()

  const { data, error } = await supabase.from("players").select("*")

  if (error) {
    console.error("Error fetching players:", error)
    return []
  }

  return data.map(mapDatabasePlayerToAppPlayer)
}

export async function getPlayersByDivision(division?: Division | "todas", page = 0, limit = 20, searchTerm?: string): Promise<Player[]> {
  const from = page * limit
  const to = from + limit - 1

  let query = supabase.from("players").select("*").range(from, to)

  if (division && division !== "todas") {
    query = query.eq("division", division)
  }

  if (searchTerm) {
    query = query.ilike("name", `%${searchTerm}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching players:", error)
    return []
  }
  
  if (!data || data.length === 0) {
     if (page === 0 && !division && !searchTerm) {
         const allPlayers = await getPlayers() 
         return allPlayers.slice(0, limit)
     }
     return []
  }

  return data.map(mapDatabasePlayerToAppPlayer)
}

export async function getPlayerById(id: string): Promise<Player | undefined> {
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !data) return undefined
  return mapDatabasePlayerToAppPlayer(data)
}

export async function updatePlayerStats(
  playerId: string,
  minutesPlayed: number,
  isInjured: boolean,
  goals: number,
): Promise<void> {
  const { error } = await supabase.rpc("increment_player_stats", {
    p_id: playerId,
    p_minutes: minutesPlayed,
    p_goals: goals,
    p_injured: isInjured,
  })

  if (error) {
    console.error("Error updating player stats via RPC:", error)
  }
}

export async function updatePlayerTechnicalReport(playerId: string, technicalReport: string): Promise<void> {
  const { error } = await supabase
    .from("players")
    .update({ technical_report: technicalReport })
    .eq("id", playerId)

  if (error) {
    console.error("Error updating technical report:", error)
  }
}

export async function createPlayer(player: Omit<Player, "id" | "minutesPlayed" | "matchesPlayed" | "isInjured" | "goals">): Promise<Player | null> {
    const { data, error } = await supabase
        .from("players")
        .insert({
            name: player.name,
            division: player.division,
            age: player.age,
            position: player.position,
            height: player.height,
            weight: player.weight,
            photo: player.photo
        })
        .select()
        .single()

    if (error) {
        console.error("Error creating player:", error)
        return null
    }

    return mapDatabasePlayerToAppPlayer(data)
}

export async function updatePlayer(id: string, player: Partial<Player>): Promise<Player | null> {
    const updateData: any = {}
    if (player.name) updateData.name = player.name
    if (player.division) updateData.division = player.division
    if (player.age) updateData.age = player.age
    if (player.position) updateData.position = player.position
    if (player.height) updateData.height = player.height
    if (player.weight) updateData.weight = player.weight
    if (player.photo) updateData.photo = player.photo

    const { data, error } = await supabase
        .from("players")
        .update(updateData)
        .eq("id", id)
        .select()
        .single()

    if (error) {
        console.error("Error updating player:", error)
        return null
    }
    
    return mapDatabasePlayerToAppPlayer(data)
}

export async function deletePlayer(id: string): Promise<boolean> {
    const { error } = await supabase
        .from("players")
        .delete()
        .eq("id", id)

    if (error) {
        console.error("Error deleting player:", error)
        return false
    }
    return true
}
