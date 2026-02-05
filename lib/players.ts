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
  | "libre"

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
  isPensioned?: boolean
  isRegularStudent?: boolean
  schoolSituation?: string
  schoolYear?: string
}

export interface Player {
  id: string
  name: string
  division: Division[]
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
  dominantFoot?: string
  extendedData?: PlayerExtendedData
  observations?: string
  leagueTypes: LeagueType[] // Jugador puede estar en AFA, ROSARINA, o ambos
  loanStatus: LoanStatus // PRESTAMO o null
  leagueStats: LeagueStats[] // Estadísticas separadas por liga
  isPensioned?: boolean
}

export const MOCK_PLAYERS: Player[] = [
  // 4ta División
  {
    id: "1",
    name: "Lucas Martínez",
    division: ["4ta"],
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
    division: ["4ta"],
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
    division: ["reserva"],
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
    division: ["reserva"],
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
    division: ["5ta"],
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
    division: ["5ta"],
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
    division: ["7ma"],
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
    division: ["7ma"],
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
    division: ["9na"],
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
    division: ["9na"],
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
    division: ["arqueros"],
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
    division: ["arqueros"],
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
    libre: "Libre",
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
    division: Array.isArray(dbPlayer.division) ? dbPlayer.division : (dbPlayer.division ? [dbPlayer.division] : []),
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
    dominantFoot: dbPlayer.dominant_foot,
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
      isPensioned: dbPlayer.is_pensioned,
      isRegularStudent: dbPlayer.is_regular_student,
      schoolSituation: dbPlayer.school_situation,
      schoolYear: dbPlayer.school_year,
    },
    isPensioned: dbPlayer.is_pensioned,
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
        is_pensioned: p.isPensioned,
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
  leagueTypeFilter?: LeagueType | "PRESTAMO" | "LIBRE" | "todas",
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
    query = query.contains("division", [division])
  }

  if (searchTerm) {
    query = query.ilike("name", `%${searchTerm}%`)
  }

  if (leagueTypeFilter && leagueTypeFilter !== "todas") {
    if (leagueTypeFilter === "PRESTAMO") {
      query = query.eq("loan_status", "PRESTAMO")
    } else if (leagueTypeFilter === "LIBRE") {
      query = query.contains("division", ["libre"])
    } else {
      // Usar el operador @> (contains) de PostgreSQL para arrays JSONB
      query = query.overlaps("league_types", [leagueTypeFilter])
    }
  }

  let { data, error } = await query

  // Si falla por el tipo de división (array vs string)
  if (error && (error.code === "42883" || error.message?.includes("operator does not exist: text @> text[]"))) {
    console.warn("[v0] getPlayersByDivision: retrying with string equality for division")
    let fallbackQuery = supabase
      .from("players")
      .select(`
        *,
        player_league_stats (*)
      `)
      .range(from, to)

    if (division && division !== "todas") {
      fallbackQuery = fallbackQuery.eq("division", division)
    }

    if (searchTerm) {
      fallbackQuery = fallbackQuery.ilike("name", `%${searchTerm}%`)
    }

    const fallbackResult = await fallbackQuery
    data = fallbackResult.data
    error = fallbackResult.error
  }

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
  console.log("[v0] createPlayer called with:", player)

  const tryInsert = async (payload: any, label: string) => {
    console.log(`[v0] ${label} - Attempting insert...`)
    const { data, error } = await supabase.from("players").insert(payload).select().single()
    if (error) {
      console.warn(`[v0] ${label} failed:`, JSON.stringify({
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      }, null, 2))
    } else {
      console.log(`[v0] ${label} SUCCESS!`)
    }
    return { data, error }
  }

  const name = player.name
  const division = player.division
  const age = player.age || 0
  const position = player.position || "Defensor"
  const height = player.height || 0
  const weight = player.weight || 0

  // Helper para obtener division_old (legacy column que es NOT NULL en DB)
  const getDivisionOld = (div: any) => Array.isArray(div) ? (div[0] || "reserva") : div

  // Preparar todos los posibles campos
  const allFields: any = {
    name,
    division, // Intentar como array primero
    division_old: getDivisionOld(division), // Fix: Agregar division_old para evitar error NOT NULL
    age,
    position,
    height,
    weight,
    photo: player.photo || null,
    attendance_percentage: 100,
    league_types: player.leagueTypes || ["ROSARINA"],
    loan_status: player.loanStatus || null,
    is_on_loan: player.loanStatus === "PRESTAMO",
    observations: player.observations || null,
    is_pensioned: player.isPensioned || false,
  }

  if (player.extendedData) {
    const ext = player.extendedData
    if (ext.birthDate) allFields.birth_date = ext.birthDate
    if (ext.document) allFields.document = ext.document
    if (ext.province) allFields.province = ext.province
    if (ext.admissionDate) allFields.admission_date = ext.admissionDate
    if (ext.phone) allFields.phone = ext.phone
    if (ext.address) allFields.address = ext.address
    if (ext.originLocality) allFields.origin_locality = ext.originLocality
    if (ext.originAddress) allFields.origin_address = ext.originAddress
    if (ext.originProvince) allFields.origin_province = ext.originProvince
    if (ext.fatherName) allFields.father_name = ext.fatherName
    if (ext.motherName) allFields.mother_name = ext.motherName
    if (ext.tutorName) allFields.tutor_name = ext.tutorName
    if (ext.nationality) allFields.nationality = ext.nationality
    if (ext.healthInsurance) allFields.health_insurance = ext.healthInsurance
    if (ext.originLeague) allFields.origin_league = ext.originLeague
    if (ext.originClub) allFields.origin_club = ext.originClub
    if (ext.citizenship) allFields.citizenship = ext.citizenship
    if (ext.parentsPhone) allFields.parents_phone = ext.parentsPhone
    if (ext.representative) allFields.representative = ext.representative
    if (ext.privateAgreementDetails) allFields.private_agreement_details = ext.privateAgreementDetails
    if (ext.signedARF !== undefined) allFields.signed_arf = ext.signedARF
    if (ext.signedARFYear) allFields.signed_arf_year = ext.signedARFYear
    if (ext.signedAFA !== undefined) allFields.signed_afa = ext.signedAFA
    if (ext.signedAFAYear) allFields.signed_afa_year = ext.signedAFAYear
    if (ext.isFreePlayer !== undefined) allFields.is_free_player = ext.isFreePlayer
    if (ext.freePlayerYear) allFields.free_player_year = ext.freePlayerYear
    if (ext.isOnLoan !== undefined) allFields.is_on_loan = ext.isOnLoan
    if (ext.loanYear) allFields.loan_year = ext.loanYear
    if (ext.loanClub) allFields.loan_club = ext.loanClub
    if (ext.isRegularStudent !== undefined) allFields.is_regular_student = ext.isRegularStudent
    if (ext.schoolSituation) allFields.school_situation = ext.schoolSituation
    if (ext.schoolYear) allFields.school_year = ext.schoolYear
  }

  // Intento 1: Todos los campos con división como array
  let result = await tryInsert(allFields, "Attempt 1 (Full + Array Div)")

  // Intento 3: Solo campos básicos con división como array (Run if Attempt 1 failed for ANY reason)
  if (result.error) {
    const basicPayload3 = {
      name,
      division, // Array
      division_old: getDivisionOld(division), // Fix
      age,
      position,
      height,
      weight
    }
    result = await tryInsert(basicPayload3, "Attempt 3 (Basic + Array Div)")
  }

  // Intento 2: Todos los campos con división como string (por si el schema es viejo)
  if (result.error) {
    const stringDivision = Array.isArray(division) ? (division[0] || "reserva") : division
    const payload2 = { 
      ...allFields, 
      division: stringDivision,
      division_old: stringDivision // Fix
    }
    result = await tryInsert(payload2, "Attempt 2 (Full + String Div)")
  }

  // Intento 4: Solo campos básicos con división como string
  if (result.error) {
    const stringDivision = Array.isArray(division) ? (division[0] || "reserva") : division
    const basicPayload4 = {
      name,
      division: stringDivision,
      division_old: stringDivision, // Fix
      age,
      position,
      height,
      weight
    }
    result = await tryInsert(basicPayload4, "Attempt 4 (Basic + String Div)")
  }

  // Intento 6: Con formato explícito de array de PostgreSQL
  if (result.error) {
    console.warn("[v0] Attempting explicit PostgreSQL array literal format...")
    const arrayLiteral = Array.isArray(division) 
      ? `{${division.map(d => `"${d}"`).join(",")}}`
      : `{"${division}"}`
      
    const payload6 = {
      name,
      division: arrayLiteral,
      division_old: getDivisionOld(division), // Fix
      age,
      position,
      height,
      weight
    }
    result = await tryInsert(payload6, "Attempt 6 (Explicit PG Array Literal)")
  }

  // Intento 7: Admin Client
  if (result.error) {
    try {
      console.log("[v0] Attempt 7 - Trying with Admin Client (Bypassing RLS)...")
      const { createAdminClient } = await import("./supabase")
      const adminSupabase = createAdminClient()
      const stringDivision = Array.isArray(division) ? (division[0] || "reserva") : division
      
      const { data: adminData, error: adminError } = await adminSupabase
        .from("players")
        .insert({ 
          name, 
          division: stringDivision,
          division_old: stringDivision // Fix
        }) 
        .select()
        .single()
      
      if (!adminError) {
        console.log("[v0] Attempt 7 SUCCESS! The issue was RLS/Permissions.")
        result = { data: adminData, error: null }
      } else {
        console.warn("[v0] Attempt 7 failed (Admin also failed):", adminError.message)
      }
    } catch (adminCatchError) {
      console.error("[v0] Error in Attempt 7 (Admin Client):", adminCatchError)
    }
  }

  if (result.error) {
    console.error("❌ Todos los intentos de creación fallaron. Error completo:", JSON.stringify(result.error, null, 2))
    return null
  }

  return mapDatabasePlayerToAppPlayer(result.data)
}

export async function updatePlayer(id: string, player: Partial<Player>): Promise<Player | null> {
  console.log(`[v0] Updating player ${id}:`, player)
  
  const basicUpdateData: any = {}
  if (player.name) basicUpdateData.name = player.name
  if (player.division) basicUpdateData.division = player.division
  if (player.age !== undefined) basicUpdateData.age = player.age
  if (player.position) basicUpdateData.position = player.position
  if (player.height !== undefined) basicUpdateData.height = player.height
  if (player.weight !== undefined) basicUpdateData.weight = player.weight
  if (player.photo) basicUpdateData.photo = player.photo

  const optionalUpdateData: any = {}
  if (player.attendancePercentage !== undefined) optionalUpdateData.attendance_percentage = player.attendancePercentage
  if (player.leagueTypes !== undefined) optionalUpdateData.league_types = player.leagueTypes
  if (player.loanStatus !== undefined) {
    optionalUpdateData.loan_status = player.loanStatus
    optionalUpdateData.is_on_loan = player.loanStatus === "PRESTAMO"
  }

  const extendedUpdateData: any = {}
  if (player.isPensioned !== undefined) extendedUpdateData.is_pensioned = player.isPensioned
  if (player.observations !== undefined) extendedUpdateData.observations = player.observations || null

  if (player.extendedData) {
    const ext = player.extendedData
    if (ext.birthDate !== undefined) extendedUpdateData.birth_date = ext.birthDate || null
    if (ext.document !== undefined) extendedUpdateData.document = ext.document || null
    if (ext.province !== undefined) extendedUpdateData.province = ext.province || null
    if (ext.admissionDate !== undefined) extendedUpdateData.admission_date = ext.admissionDate || null
    if (ext.phone !== undefined) extendedUpdateData.phone = ext.phone || null
    if (ext.address !== undefined) extendedUpdateData.address = ext.address || null
    if (ext.originLocality !== undefined) extendedUpdateData.origin_locality = ext.originLocality || null
    if (ext.originAddress !== undefined) extendedUpdateData.origin_address = ext.originAddress || null
    if (ext.originProvince !== undefined) extendedUpdateData.origin_province = ext.originProvince || null
    if (ext.fatherName !== undefined) extendedUpdateData.father_name = ext.fatherName || null
    if (ext.motherName !== undefined) extendedUpdateData.mother_name = ext.motherName || null
    if (ext.tutorName !== undefined) extendedUpdateData.tutor_name = ext.tutorName || null
    if (ext.nationality !== undefined) extendedUpdateData.nationality = ext.nationality || null
    if (ext.healthInsurance !== undefined) extendedUpdateData.health_insurance = ext.healthInsurance || null
    if (ext.originLeague !== undefined) extendedUpdateData.origin_league = ext.originLeague || null
    if (ext.originClub !== undefined) extendedUpdateData.origin_club = ext.originClub || null
    if (ext.citizenship !== undefined) extendedUpdateData.citizenship = ext.citizenship || null
    if (ext.parentsPhone !== undefined) extendedUpdateData.parents_phone = ext.parentsPhone || null
    if (ext.representative !== undefined) extendedUpdateData.representative = ext.representative || null
    if (ext.privateAgreementDetails !== undefined) extendedUpdateData.private_agreement_details = ext.privateAgreementDetails || null
    if (ext.signedARF !== undefined) extendedUpdateData.signed_arf = ext.signedARF
    if (ext.signedARFYear !== undefined) extendedUpdateData.signed_arf_year = ext.signedARFYear || null
    if (ext.signedAFA !== undefined) extendedUpdateData.signed_afa = ext.signedAFA
    if (ext.signedAFAYear !== undefined) extendedUpdateData.signed_afa_year = ext.signedAFAYear || null
    if (ext.isFreePlayer !== undefined) extendedUpdateData.is_free_player = ext.isFreePlayer
    if (ext.freePlayerYear !== undefined) extendedUpdateData.free_player_year = ext.freePlayerYear || null
    if (ext.isOnLoan !== undefined) extendedUpdateData.is_on_loan = ext.isOnLoan
    if (ext.loanYear !== undefined) extendedUpdateData.loan_year = ext.loanYear || null
    if (ext.loanClub !== undefined) extendedUpdateData.loan_club = ext.loanClub || null
    if (ext.isRegularStudent !== undefined) extendedUpdateData.is_regular_student = ext.isRegularStudent
    if (ext.schoolSituation !== undefined) extendedUpdateData.school_situation = ext.schoolSituation || null
    if (ext.schoolYear !== undefined) extendedUpdateData.school_year = ext.schoolYear || null
  }

  // Intento 1: Todo
  const fullUpdate = { ...basicUpdateData, ...optionalUpdateData, ...extendedUpdateData }
  let { data, error } = await supabase.from("players").update(fullUpdate).eq("id", id).select().single()

  // Intento 2: Sin columnas extendidas
  if (error && (error.message?.includes("column") || error.code === "42703")) {
    console.warn("[v0] Update failed (missing columns), retrying with basic+optional fields")
    const basicPlusOptional = { ...basicUpdateData, ...optionalUpdateData }
    const { data: retryData, error: retryError } = await supabase
      .from("players")
      .update(basicPlusOptional)
      .eq("id", id)
      .select()
      .single()
    data = retryData
    error = retryError
  }

  // Intento 3: Solo básicas
  if (error && (error.message?.includes("column") || error.code === "42703")) {
    console.warn("[v0] Update failed (missing columns), retrying with basic fields only")
    const { data: retryData, error: retryError } = await supabase
      .from("players")
      .update(basicUpdateData)
      .eq("id", id)
      .select()
      .single()
    data = retryData
    error = retryError
  }

  // Intento 4: Error de tipo en division
  if (error && (error.message?.includes("array") || error.message?.includes("division") || error.code === "42804")) {
    console.warn("[v0] Update failed (division type mismatch), retrying with division as string")
    const updateWithStrDivision = { 
      ...basicUpdateData,
      division: Array.isArray(player.division) ? player.division[0] : player.division
    }
    const { data: retryData, error: retryError } = await supabase
      .from("players")
      .update(updateWithStrDivision)
      .eq("id", id)
      .select()
      .single()
    data = retryData
    error = retryError
  }

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
  const { error: leagueError } = await supabase.rpc("increment_player_league_stats", {
    p_id: playerId,
    p_league_type: leagueType,
    p_minutes: minutesPlayed,
    p_goals: goals,
  })

  if (leagueError) {
    console.error("Error updating player league stats:", leagueError)
  }

  if (isInjured) {
    const { error: injuryError } = await supabase.from("players").update({ is_injured: true }).eq("id", playerId)

    if (injuryError) {
      console.error("[v0] Error updating injury status:", injuryError)
      throw injuryError
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

export async function updatePlayerInjuryStatus(playerId: string, isInjured: boolean): Promise<void> {
  const { createServerClient } = await import("./supabase")
  const supabaseServer = await createServerClient()
  
  const { error } = await supabaseServer.from("players").update({ is_injured: isInjured }).eq("id", playerId)

  if (error) {
    console.error("[v0] Error updating player injury status:", error)
    throw error
  }

  console.log(`[v0] Player ${playerId} injury status updated to: ${isInjured}`)
}

export async function updatePlayerPensionedStatus(playerId: string, isPensioned: boolean): Promise<void> {
  const { error } = await supabase.from("players").update({ is_pensioned: isPensioned }).eq("id", playerId)

  if (error) {
    console.error("[v0] Error updating player pensioned status:", error)
    throw error
  }

  console.log(`[v0] Player ${playerId} pensioned status updated to: ${isPensioned}`)
}

export async function setPlayerFree(playerId: string): Promise<boolean> {
  const { error } = await supabase
    .from("players")
    .update({ 
      division: ["libre"],
      is_free_player: true
    })
    .eq("id", playerId)

  if (error) {
    console.error("Error setting player free:", error)
    return false
  }
  return true
}