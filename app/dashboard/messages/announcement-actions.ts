"use server"

import { createServerClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export interface CreateAnnouncementData {
  title: string
  content: string
  expiresAt?: string | null
  targets: {
    type: 'division' | 'player'
    value: string // division name or player UUID
  }[]
}

export async function createAnnouncementAction(data: CreateAnnouncementData) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  // 1. Create Announcement
  const { data: announcement, error: annError } = await supabase
    .from("announcements")
    .insert({
      title: data.title,
      content: data.content,
      created_by: user.id,
      expires_at: data.expiresAt || null
    })
    .select()
    .single()

  if (annError) throw annError

  // 2. Create Recipients
  const recipients = data.targets.map(target => ({
    announcement_id: announcement.id,
    division: target.type === 'division' ? target.value : null,
    player_id: target.type === 'player' ? target.value : null
  }))

  const { error: recError } = await supabase
    .from("announcement_recipients")
    .insert(recipients)

  if (recError) throw recError

  revalidatePath("/dashboard/messages")
  return { success: true }
}

export async function searchPlayersAction(query: string) {
  const supabase = await createServerClient()
  
  let dbQuery = supabase
    .from("players")
    .select("id, name, division, photo")
  
  // Split query by spaces to allow searching "Name Surname" or "Surname Name"
  const terms = query.trim().split(/\s+/).filter(Boolean)
  
  if (terms.length > 0) {
    terms.forEach(term => {
      dbQuery = dbQuery.ilike("name", `%${term}%`)
    })
  } else {
    // If empty query (should be handled by frontend, but safety check)
    return []
  }

  const { data, error } = await dbQuery.limit(10)
  
  if (error) {
    console.error("Error searching players:", error)
  }
  
  // console.log(`Search query: "${query}" -> Terms: ${JSON.stringify(terms)} -> Found: ${data?.length || 0}`)
  
  return data || []
}

export async function getProfessionalAnnouncementsAction(page = 0, limit = 10) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const from = page * limit
  const to = from + limit - 1

  const { data } = await supabase
    .from("announcements")
    .select(`
        *,
        recipients:announcement_recipients(division, player:players(name))
    `)
    .eq("created_by", user.id)
    .order("created_at", { ascending: false })
    .range(from, to)

  return data || []
}

export async function deleteAnnouncementAction(id: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  await supabase.from("announcements").delete().eq("id", id).eq("created_by", user.id)
  revalidatePath("/dashboard/messages")
}
