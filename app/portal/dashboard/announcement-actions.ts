"use server"

import { createAdminClient } from "@/lib/supabase"

export interface Announcement {
  id: string
  title: string
  content: string
  created_at: string
  expires_at: string | null
  created_by?: string
  creator?: {
    name: string
    role: string
  }
}

export async function getPlayerAnnouncementsAction(playerId: string, division: string) {
  const supabase = createAdminClient()
  
  // 1. Find relevant announcement IDs
  const { data: recipientRows, error: recError } = await supabase
    .from("announcement_recipients")
    .select("announcement_id")
    .or(`player_id.eq.${playerId},division.eq.${division},division.eq.Todas`)
  
  if (recError) {
    console.error("Error fetching announcement recipients:", recError)
    return []
  }

  const ids = recipientRows.map(r => r.announcement_id)
  
  if (ids.length === 0) return []

  // 2. Fetch active announcements
  const { data: announcements, error: annError } = await supabase
    .from("announcements")
    .select("*")
    .in("id", ids)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order("created_at", { ascending: false })

  if (annError) {
    console.error("Error fetching announcements:", annError)
    return []
  }

  // 3. Fetch creators details
  const creatorIds = [...new Set(announcements.map((a: any) => a.created_by).filter(Boolean))]
  
  if (creatorIds.length > 0) {
    const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, role")
        .in("id", creatorIds)
    
    return announcements.map((ann: any) => ({
        ...ann,
        creator: profiles?.find((p: any) => p.id === ann.created_by)
    })) as Announcement[]
  }
  
  return announcements as Announcement[]
}
