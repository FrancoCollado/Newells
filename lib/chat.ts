import { createAdminClient, createServerClient } from "./supabase"

export type SenderType = "PLAYER" | "PROFESSIONAL"

export interface ChatConversation {
  id: string
  player_id: string
  professional_id?: string | null
  area?: string | null
  last_message_at: string
  created_at: string
  unread_count?: number // Calculated field
  professional?: {
    full_name: string | null
    avatar_url: string | null
  }
}

export interface ChatMessage {
  id: string
  conversation_id: string
  sender_type: SenderType
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
}

// -- Player Actions (Using Admin Client for Proxy Auth) --

export async function getPlayerConversations(playerId: string) {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from("chat_conversations")
    .select(`
      *,
      messages:chat_messages(count)
    `)
    .eq("player_id", playerId)
    .order("last_message_at", { ascending: false })

  if (error) throw error
  
  // Fetch unread counts separately or map them if Supabase supported filtered count in select better
  // For now, simpler approach:
  const conversationsWithUnread = await Promise.all(data.map(async (conv) => {
    const { count } = await supabase
      .from("chat_messages")
      .select("*", { count: 'exact', head: true })
      .eq("conversation_id", conv.id)
      .eq("sender_type", "PROFESSIONAL") // Unread messages FROM professional
      .eq("is_read", false)
    
    return {
      ...conv,
      unread_count: count || 0
    }
  }))

  return conversationsWithUnread
}

export async function getConversationMessages(conversationId: string, page = 0, limit = 50) {
  const supabase = createAdminClient()
  
  const from = page * limit
  const to = from + limit - 1

  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false }) // Get latest first for range
    .range(from, to)

  if (error) throw error
  
  // Return them in chronological order for the UI
  return (data as ChatMessage[]).reverse()
}

export async function sendMessage(
  conversationId: string, 
  senderType: SenderType, 
  senderId: string, 
  content: string
) {
  const supabase = createAdminClient()
  
  // 1. Insert message
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      conversation_id: conversationId,
      sender_type: senderType,
      sender_id: senderId,
      content: content
    })
    .select()
    .single()

  if (error) throw error

  // 2. Update conversation last_message_at
  await supabase
    .from("chat_conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", conversationId)

  return data
}

export async function markMessagesAsRead(conversationId: string, readerType: SenderType) {
  const supabase = createAdminClient()
  
  // If reader is PLAYER, we mark messages from PROFESSIONAL as read
  const senderTypeToMark = readerType === "PLAYER" ? "PROFESSIONAL" : "PLAYER"

  const { error } = await supabase
    .from("chat_messages")
    .update({ is_read: true })
    .eq("conversation_id", conversationId)
    .eq("sender_type", senderTypeToMark)
    .eq("is_read", false)

  if (error) throw error
}

export async function createConversation(playerId: string, area: string) {
  const supabase = createAdminClient()
  
  // Check if exists first
  const { data: existing } = await supabase
    .from("chat_conversations")
    .select("*")
    .eq("player_id", playerId)
    .eq("area", area)
    .single()

  if (existing) return existing

  const { data, error } = await supabase
    .from("chat_conversations")
    .insert({
      player_id: playerId,
      area: area
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// -- Professional Actions --
// (Can reuse functions above if context is managed, but explicit is better for clarity)

export async function getProfessionalConversations(professionalId: string, page = 0, limit = 20, query?: string) {
  const supabase = await createServerClient()
  
  const from = page * limit
  const to = from + limit - 1

  // Base query construction
  // We use !inner if we are searching to ensure we filter by player name effectively
  // If no search, standard left join is fine, but consistency is good.
  let selectQuery = `
      *,
      player:players!inner(id, name, division, photo, last_seen)
    `

  let dbQuery = supabase
    .from("chat_conversations")
    .select(selectQuery)
    .order("last_message_at", { ascending: false })
    .range(from, to)

  if (query && query.trim() !== "") {
    // Search by Player Name
    // Note: Filtering on joined tables requires the !inner join type used above
    dbQuery = dbQuery.ilike('player.name', `%${query}%`)
  }

  const { data, error } = await dbQuery

  if (error) throw error
  
  // Count unread from PLAYER
  const conversationsWithUnread = await Promise.all(data.map(async (conv: any) => {
    const { count } = await supabase
      .from("chat_messages")
      .select("*", { count: 'exact', head: true })
      .eq("conversation_id", conv.id)
      .eq("sender_type", "PLAYER") 
      .eq("is_read", false)
    
    return {
      ...conv,
      unread_count: count || 0
    }
  }))

  return conversationsWithUnread
}
