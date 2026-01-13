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

export type LeagueType = "AFA" | "ROSARINA"
export type LoanStatus = "PRESTAMO" | null

export interface LeagueStats {
  leagueType: LeagueType
  minutesPlayed: number
  matchesPlayed: number
  goals: number
}

export interface PlayerExtendedData {
  birthDate?: string
  document?: string
  province?: string
  admissionDate?: string
  phone?: string
  address?: string
  originLocality?: string
  originAddress?: string
  originProvince?: string
  fatherName?: string
  motherName?: string
  tutorName?: string
  nationality?: string
  healthInsurance?: string
  originLeague?: string
  originClub?: string
  citizenship?: string
  parentsPhone?: string
  representative?: string
  privateAgreementDetails?: string
  signedARF?: boolean
  signedARFYear?: number
  signedAFA?: boolean
  signedAFAYear?: number
  isFreePlayer?: boolean
  freePlayerYear?: number
  isOnLoan?: boolean
  loanYear?: number
  loanClub?: string
}

export interface Player {
  id: string
  name: string
  division: Division
  age: number
  position: Position
  height: number
  weight: number
  photo?: string
  minutesPlayed: number
  matchesPlayed: number
  isInjured: boolean
  technicalReport?: string
  goals: number
  attendancePercentage: number
  extendedData?: PlayerExtendedData
  observations?: string
  leagueTypes: LeagueType[] // Jugador puede estar en AFA, ROSARINA, o ambos
  loanStatus: LoanStatus // PRESTAMO o null
  leagueStats: LeagueStats[] // Estadísticas separadas por liga
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
    attendancePercentage: 100,
    leagueTypes: ["ROSARINA"],
    loanStatus: null,
    leagueStats: [],
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
    attendancePercentage: 100,
    leagueTypes: ["ROSARINA"],
    loanStatus: null,
    leagueStats: [],
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
    attendancePercentage: 100,
    leagueTypes: ["ROSARINA"],
    loanStatus: null,
    leagueStats: [],
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
    attendancePercentage: 100,
    leagueTypes: ["ROSARINA"],
    loanStatus: null,
    leagueStats: [],
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
    attendancePercentage: 100,
    leagueTypes: ["ROSARINA"],
    loanStatus: null,
    leagueStats: [],
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
    attendancePercentage: 100,
    leagueTypes: ["ROSARINA"],
    loanStatus: null,
    leagueStats: [],
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
    attendancePercentage: 100,
    leagueTypes: ["ROSARINA"],
    loanStatus: null,
    leagueStats: [],
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
    attendancePercentage: 100,
    leagueTypes: ["ROSARINA"],
    loanStatus: null,
    leagueStats: [],
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
    attendancePercentage: 100,
    leagueTypes: ["ROSARINA"],
    loanStatus: null,
    leagueStats: [],
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
    attendancePercentage: 100,
    leagueTypes: ["ROSARINA"],
    loanStatus: null,
    leagueStats: [],
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
    attendancePercentage: 100,
    leagueTypes: ["ROSARINA"],
    loanStatus: null,
    leagueStats: [],
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
    attendancePercentage: 100,
    leagueTypes: ["ROSARINA"],
    loanStatus: null,
    leagueStats: [],
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
  const leagueStats: LeagueStats[] = Array.isArray(dbPlayer.player_league_stats)
    ? dbPlayer.player_league_stats.map((stat: any) => ({
        leagueType: stat.league_type,
        minutesPlayed: stat.minutes_played || 0,
        matchesPlayed: stat.matches_played || 0,
        goals: stat.goals || 0,
      }))
    : []

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
    attendancePercentage: dbPlayer.attendance_percentage ?? 100,
    observations: dbPlayer.observations,
    leagueTypes: dbPlayer.league_types || ["ROSARINA"],
    loanStatus: dbPlayer.loan_status,
    leagueStats,
    extendedData: {
      birthDate: dbPlayer.birth_date,
      document: dbPlayer.document,
      province: dbPlayer.province,
      admissionDate: dbPlayer.admission_date,
      phone: dbPlayer.phone,
      address: dbPlayer.address,
      originLocality: dbPlayer.origin_locality,
      originAddress: dbPlayer.origin_address,
      originProvince: dbPlayer.origin_province,
      fatherName: dbPlayer.father_name,
      motherName: dbPlayer.mother_name,
      tutorName: dbPlayer.tutor_name,
      nationality: dbPlayer.nationality,
      healthInsurance: dbPlayer.health_insurance,
      originLeague: dbPlayer.origin_league,
      originClub: dbPlayer.origin_club,
      citizenship: dbPlayer.citizenship,
      parentsPhone: dbPlayer.parents_phone,
      representative: dbPlayer.representative,
      privateAgreementDetails: dbPlayer.private_agreement_details,
      signedARF: dbPlayer.signed_arf,
      signedARFYear: dbPlayer.signed_arf_year,
      signedAFA: dbPlayer.signed_afa,
      signedAFAYear: dbPlayer.signed_afa_year,
      isFreePlayer: dbPlayer.is_free_player,
      freePlayerYear: dbPlayer.free_player_year,
      isOnLoan: dbPlayer.is_on_loan,
      loanYear: dbPlayer.loan_year,
      loanClub: dbPlayer.loan_club,
    },
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
        attendance_percentage: p.attendancePercentage,
        league_types: p.leagueTypes,
        loan_status: p.loanStatus,
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

export async function getPlayersByDivision(
  division?: Division | "todas",
  page = 0,
  limit = 20,
  searchTerm?: string,
  leagueTypeFilter?: LeagueType | "PRESTAMO" | "todas",
): Promise<Player[]> {
  console.log("[v0] Filtering players:", { division, page, limit, searchTerm, leagueTypeFilter })

  const from = page * limit
  const to = from + limit - 1

  let query = supabase
    .from("players")
    .select(`
      *,
      player_league_stats (*)
    `)
    .range(from, to)

  if (division && division !== "todas") {
    query = query.eq("division", division)
  }

  if (searchTerm) {
    query = query.ilike("name", `%${searchTerm}%`)
  }

  if (leagueTypeFilter && leagueTypeFilter !== "todas") {
    if (leagueTypeFilter === "PRESTAMO") {
      query = query.eq("loan_status", "PRESTAMO")
    } else {
      // Usar el operador @> (contains) de PostgreSQL para arrays JSONB
      query = query.overlaps("league_types", [leagueTypeFilter])
    }
  }

  const { data, error } = await query

  console.log("[v0] Query result:", { dataLength: data?.length, error })

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
    .select(`
      *,
      player_league_stats (*)
    `)
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
  const { error } = await supabase.from("players").update({ technical_report: technicalReport }).eq("id", playerId)

  if (error) {
    console.error("Error updating technical report:", error)
  }
}

export async function updatePlayerAttendance(playerId: string, attendancePercentage: number): Promise<boolean> {
  const { error } = await supabase
    .from("players")
    .update({ attendance_percentage: attendancePercentage })
    .eq("id", playerId)

  if (error) {
    console.error("Error updating attendance percentage:", error)
    return false
  }

  return true
}

export async function createPlayer(
  player: Omit<Player, "id" | "minutesPlayed" | "matchesPlayed" | "isInjured" | "goals" | "attendancePercentage">,
): Promise<Player | null> {
  const insertData: any = {
    name: player.name,
    division: player.division,
    age: player.age,
    position: player.position,
    height: player.height,
    weight: player.weight,
    photo: player.photo,
    attendance_percentage: 100,
    league_types: player.leagueTypes || ["ROSARINA"],
    loan_status: player.loanStatus || null,
  }

  if (player.extendedData) {
    const ext = player.extendedData
    if (ext.birthDate) insertData.birth_date = ext.birthDate
    if (ext.document) insertData.document = ext.document
    if (ext.province) insertData.province = ext.province
    if (ext.admissionDate) insertData.admission_date = ext.admissionDate
    if (ext.phone) insertData.phone = ext.phone
    if (ext.address) insertData.address = ext.address
    if (ext.originLocality) insertData.origin_locality = ext.originLocality
    if (ext.originAddress) insertData.origin_address = ext.originAddress
    if (ext.originProvince) insertData.origin_province = ext.originProvince
    if (ext.fatherName) insertData.father_name = ext.fatherName
    if (ext.motherName) insertData.mother_name = ext.motherName
    if (ext.tutorName) insertData.tutor_name = ext.tutorName
    if (ext.nationality) insertData.nationality = ext.nationality
    if (ext.healthInsurance) insertData.health_insurance = ext.healthInsurance
    if (ext.originLeague) insertData.origin_league = ext.originLeague
    if (ext.originClub) insertData.origin_club = ext.originClub
    if (ext.citizenship) insertData.citizenship = ext.citizenship
    if (ext.parentsPhone) insertData.parents_phone = ext.parentsPhone
    if (ext.representative) insertData.representative = ext.representative
    if (ext.privateAgreementDetails) insertData.private_agreement_details = ext.privateAgreementDetails
    if (ext.signedARF !== undefined) insertData.signed_arf = ext.signedARF
    if (ext.signedARFYear) insertData.signed_arf_year = ext.signedARFYear
    if (ext.signedAFA !== undefined) insertData.signed_afa = ext.signedAFA
    if (ext.signedAFAYear) insertData.signed_afa_year = ext.signedAFAYear
    if (ext.isFreePlayer !== undefined) insertData.is_free_player = ext.isFreePlayer
    if (ext.freePlayerYear) insertData.free_player_year = ext.freePlayerYear
    if (ext.isOnLoan !== undefined) insertData.is_on_loan = ext.isOnLoan
    if (ext.loanYear) insertData.loan_year = ext.loanYear
    if (ext.loanClub) insertData.loan_club = ext.loanClub
  }

  if (player.observations) {
    insertData.observations = player.observations
  }

  const { data, error } = await supabase.from("players").insert(insertData).select().single()

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
  if (player.attendancePercentage !== undefined) updateData.attendance_percentage = player.attendancePercentage
  if (player.leagueTypes !== undefined) updateData.league_types = player.leagueTypes
  if (player.loanStatus !== undefined) updateData.loan_status = player.loanStatus

  if (player.extendedData) {
    const ext = player.extendedData
    if (ext.birthDate !== undefined) updateData.birth_date = ext.birthDate || null
    if (ext.document !== undefined) updateData.document = ext.document || null
    if (ext.province !== undefined) updateData.province = ext.province || null
    if (ext.admissionDate !== undefined) updateData.admission_date = ext.admissionDate || null
    if (ext.phone !== undefined) updateData.phone = ext.phone || null
    if (ext.address !== undefined) updateData.address = ext.address || null
    if (ext.originLocality !== undefined) updateData.origin_locality = ext.originLocality || null
    if (ext.originAddress !== undefined) updateData.origin_address = ext.originAddress || null
    if (ext.originProvince !== undefined) updateData.origin_province = ext.originProvince || null
    if (ext.fatherName !== undefined) updateData.father_name = ext.fatherName || null
    if (ext.motherName !== undefined) updateData.mother_name = ext.motherName || null
    if (ext.tutorName !== undefined) updateData.tutor_name = ext.tutorName || null
    if (ext.nationality !== undefined) updateData.nationality = ext.nationality || null
    if (ext.healthInsurance !== undefined) updateData.health_insurance = ext.healthInsurance || null
    if (ext.originLeague !== undefined) updateData.origin_league = ext.originLeague || null
    if (ext.originClub !== undefined) updateData.origin_club = ext.originClub || null
    if (ext.citizenship !== undefined) updateData.citizenship = ext.citizenship || null
    if (ext.parentsPhone !== undefined) updateData.parents_phone = ext.parentsPhone || null
    if (ext.representative !== undefined) updateData.representative = ext.representative || null
    if (ext.privateAgreementDetails !== undefined)
      updateData.private_agreement_details = ext.privateAgreementDetails || null
    if (ext.signedARF !== undefined) updateData.signed_arf = ext.signedARF
    if (ext.signedARFYear !== undefined) updateData.signed_arf_year = ext.signedARFYear || null
    if (ext.signedAFA !== undefined) updateData.signed_afa = ext.signedAFA
    if (ext.signedAFAYear !== undefined) updateData.signed_afa_year = ext.signedAFAYear || null
    if (ext.isFreePlayer !== undefined) updateData.is_free_player = ext.isFreePlayer
    if (ext.freePlayerYear !== undefined) updateData.free_player_year = ext.freePlayerYear || null
    if (ext.isOnLoan !== undefined) updateData.is_on_loan = ext.isOnLoan
    if (ext.loanYear !== undefined) updateData.loan_year = ext.loanYear || null
    if (ext.loanClub !== undefined) updateData.loan_club = ext.loanClub || null
  }

  if (player.observations !== undefined) {
    updateData.observations = player.observations || null
  }

  const { data, error } = await supabase.from("players").update(updateData).eq("id", id).select().single()

  if (error) {
    console.error("Error updating player:", error)
    return null
  }

  return mapDatabasePlayerToAppPlayer(data)
}

export async function deletePlayer(id: string): Promise<boolean> {
  const { error } = await supabase.from("players").delete().eq("id", id)

  if (error) {
    console.error("Error deleting player:", error)
    return false
  }
  return true
}

export async function updatePlayerPhysicalData(
  playerId: string,
  age: number,
  weight: number,
  height: number,
): Promise<boolean> {
  const { error } = await supabase
    .from("players")
    .update({
      age: age,
      weight: weight,
      height: height,
    })
    .eq("id", playerId)

  if (error) {
    console.error("Error updating player physical data:", error)
    return false
  }

  return true
}

export async function updatePlayerObservations(playerId: string, observations: string): Promise<boolean> {
  const { error } = await supabase.from("players").update({ observations }).eq("id", playerId)

  if (error) {
    console.error("Error updating player observations:", error)
    return false
  }

  return true
}

export async function updatePlayerStatsByLeague(
  playerId: string,
  leagueType: LeagueType,
  minutesPlayed: number,
  goals: number,
  isInjured: boolean,
): Promise<void> {
  // Actualizar estadísticas específicas de la liga
  const { error: leagueError } = await supabase.rpc("increment_player_league_stats", {
    p_id: playerId,
    p_league_type: leagueType,
    p_minutes: minutesPlayed,
    p_goals: goals,
  })

  if (leagueError) {
    console.error("Error updating player league stats:", leagueError)
  }

  // Actualizar estado de lesión si es necesario
  if (isInjured) {
    const { error: injuryError } = await supabase.from("players").update({ is_injured: true }).eq("id", playerId)

    if (injuryError) {
      console.error("Error updating injury status:", injuryError)
    }
  }
}

export async function getPlayerLeagueStats(playerId: string, leagueType: LeagueType): Promise<LeagueStats | null> {
  const { data, error } = await supabase
    .from("player_league_stats")
    .select("*")
    .eq("player_id", playerId)
    .eq("league_type", leagueType)
    .single()

  if (error || !data) return null

  return {
    leagueType: data.league_type,
    minutesPlayed: data.minutes_played,
    matchesPlayed: data.matches_played,
    goals: data.goals,
  }
}

export async function updatePlayerLeagueTypes(
  playerId: string,
  leagueTypes: LeagueType[],
  loanStatus: LoanStatus,
): Promise<boolean> {
  const { error } = await supabase
    .from("players")
    .update({
      league_types: leagueTypes,
      loan_status: loanStatus,
    })
    .eq("id", playerId)

  if (error) {
    console.error("Error updating player league types:", error)
    return false
  }

  return true
}
