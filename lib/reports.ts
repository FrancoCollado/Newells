import { supabase } from "./supabase"
import type { UserRole } from "./auth"

export interface Report {
  id: string
  playerId: string
  professionalId: string
  professionalName: string
  professionalRole: UserRole
  date: string
  content: string
  attachments: Array<{
    id: string
    name: string
    url: string
    type: string
  }>
}

export async function getReports(): Promise<Report[]> {
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .order("date", { ascending: false })

  if (error) {
    console.error("Error fetching reports:", error)
    return []
  }

  return data.map(mapDatabaseReportToAppReport)
}

export async function getReportsByPlayer(playerId: string, page = 0, limit = 10): Promise<Report[]> {
  const from = page * limit
  const to = from + limit - 1

  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("player_id", playerId)
    .order("date", { ascending: false })
    .range(from, to)

  if (error) {
    console.error("Error fetching reports by player:", error)
    return []
  }

  return data.map(mapDatabaseReportToAppReport)
}

export async function getReportsByPlayerId(playerId: string, page = 0, limit = 10): Promise<Report[]> {
  return getReportsByPlayer(playerId, page, limit)
}

export async function getReportsByPlayerAndRole(playerId: string, role: UserRole, page = 0, limit = 10): Promise<Report[]> {
  const from = page * limit
  const to = from + limit - 1

  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("player_id", playerId)
    .eq("professional_role", role)
    .order("date", { ascending: false })
    .range(from, to)

  if (error) {
    console.error("Error fetching reports by player and role:", error)
    return []
  }

  return data.map(mapDatabaseReportToAppReport)
}

export async function addReport(report: Omit<Report, "id" | "date">): Promise<Report | null> {
  const newReportData = {
    player_id: report.playerId,
    professional_id: report.professionalId,
    professional_name: report.professionalName,
    professional_role: report.professionalRole,
    content: report.content,
    attachments: report.attachments,
  }

  const { data, error } = await supabase
    .from("reports")
    .insert(newReportData)
    .select()
    .single()

  if (error || !data) {
    console.error("Error adding report:", error)
    return null
  }

  return mapDatabaseReportToAppReport(data)
}

export async function updateReport(report: Report): Promise<void> {
  const { error } = await supabase
    .from("reports")
    .update({
      content: report.content,
      attachments: report.attachments,
    })
    .eq("id", report.id)

  if (error) {
    console.error("Error updating report:", error)
    throw new Error("Error updating report")
  }
}

export async function deleteReport(reportId: string): Promise<void> {
  const { error } = await supabase.from("reports").delete().eq("id", reportId)

  if (error) {
    console.error("Error deleting report:", error)
    throw new Error("Error deleting report")
  }
}

function mapDatabaseReportToAppReport(dbReport: any): Report {
  return {
    id: dbReport.id,
    playerId: dbReport.player_id,
    professionalId: dbReport.professional_id,
    professionalName: dbReport.professional_name,
    professionalRole: dbReport.professional_role,
    date: dbReport.created_at || dbReport.date,
    content: dbReport.content,
    attachments: dbReport.attachments || [],
  }
}
