import { supabase } from "./supabase"

export interface AreaReport {
  id: string
  area: string
  date: string
  title: string
  content: string
  createdBy: string
  hyperlink?: string
  attachments: Array<{
    id: string
    name: string
    url: string
    type: string
  }>
}

export interface AreaEvent {
  id: string
  area: string
  date: Date
  title: string
  description: string
}

export async function getAreaReports(area: string, page = 0, limit = 10): Promise<AreaReport[]> {
  const from = page * limit
  const to = from + limit - 1

  const { data, error } = await supabase
    .from("area_reports")
    .select("*")
    .eq("area", area)
    .order("date", { ascending: false })
    .range(from, to)

  if (error) {
    console.error("Error fetching area reports:", error)
    return []
  }

  return data.map((r: any) => ({
    id: r.id,
    area: r.area,
    date: r.date,
    title: r.title,
    content: r.content,
    createdBy: r.created_by,
    hyperlink: r.hyperlink,
    attachments: r.attachments || [],
  }))
}

export async function saveAreaReport(report: {
  id?: string
  area: string
  title: string
  content: string
  createdBy?: string
  hyperlink?: string
  attachments?: Array<{
    id: string
    name: string
    url: string
    type: string
  }>
}): Promise<AreaReport | null> {
  // 🔄 EDITAR INFORME
  if (report.id) {
    const { data, error } = await supabase
      .from("area_reports")
      .update({
        title: report.title,
        content: report.content,
        hyperlink: report.hyperlink,
        attachments: report.attachments,
      })
      .eq("id", report.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating area report:", error)
      return null
    }

    return {
      id: data.id,
      area: data.area,
      date: data.date,
      title: data.title,
      content: data.content,
      createdBy: data.created_by,
      hyperlink: data.hyperlink,
      attachments: data.attachments || [],
    }
  }

  // 🆕 CREAR INFORME
  const { data, error } = await supabase
    .from("area_reports")
    .insert({
      area: report.area,
      title: report.title,
      content: report.content,
      created_by: report.createdBy,
      hyperlink: report.hyperlink,
      attachments: report.attachments,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating area report:", error)
    return null
  }

  return {
    id: data.id,
    area: data.area,
    date: data.date,
    title: data.title,
    content: data.content,
    createdBy: data.created_by,
    hyperlink: data.hyperlink,
    attachments: data.attachments || [],
  }
}


export async function deleteAreaReport(id: string): Promise<void> {
  const { error } = await supabase.from("area_reports").delete().eq("id", id)
  if (error) console.error("Error deleting area report:", error)
}

export async function getAreaEvents(area: string): Promise<AreaEvent[]> {
  // Optimization: Fetch only events from 3 months ago onwards
  const threeMonthsAgo = new Date()
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

  const { data, error } = await supabase
    .from("area_events")
    .select("*")
    .eq("area", area)
    .gte("date", threeMonthsAgo.toISOString()) // Filter by date
    .order("date", { ascending: true })

  if (error) {
    console.error("Error fetching area events:", error)
    return []
  }

  return data.map((e: any) => ({
    id: e.id,
    area: e.area,
    date: new Date(e.date),
    title: e.title,
    description: e.description,
  }))
}

export async function saveAreaEvent(event: Omit<AreaEvent, "id">): Promise<AreaEvent | null> {
  const { data, error } = await supabase
    .from("area_events")
    .insert({
      area: event.area,
      date: event.date.toISOString(),
      title: event.title,
      description: event.description,
    })
    .select()
    .single()

  if (error) {
    console.error("Error saving area event:", error)
    return null
  }

  return {
    id: data.id,
    area: data.area,
    date: new Date(data.date),
    title: data.title,
    description: data.description,
  }
}

export async function deleteAreaEvent(id: string): Promise<void> {
  const { error } = await supabase.from("area_events").delete().eq("id", id)
  if (error) console.error("Error deleting area event:", error)
}
