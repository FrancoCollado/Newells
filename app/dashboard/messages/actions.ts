"use server"

import { createServerClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { sendMessage, markMessagesAsRead, type SenderType, getProfessionalConversations } from "@/lib/chat"

export async function getProfessionalConversationsAction(page = 0, limit = 20, query?: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  return await getProfessionalConversations(user.id, page, limit, query)
}

export async function sendMessageAsProfessionalAction(conversationId: string, content: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  // Basic verification: Ensure conversation exists (RLS handles the rest)
  const { data: conv } = await supabase.from("chat_conversations").select("id").eq("id", conversationId).single()
  if (!conv) throw new Error("Conversation not found")

  // Rate Limit Check
  const { data: lastMsg } = await supabase
    .from("chat_messages")
    .select("created_at")
    .eq("sender_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (lastMsg) {
    const timeSinceLast = Date.now() - new Date(lastMsg.created_at).getTime()
    if (timeSinceLast < 1000) {
      throw new Error("Envío demasiado rápido.")
    }
  }
  
  await sendMessage(conversationId, "PROFESSIONAL", user.id, content)
  revalidatePath(`/dashboard/messages`)
}

export async function markAsReadAsProfessionalAction(conversationId: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  await markMessagesAsRead(conversationId, "PROFESSIONAL")
  // No revalidatePath here - Client handles state updates optimistically/realtime
  // revalidatePath(`/dashboard/messages`) 
}

export async function getPlayersOnLoanAction() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  // Fetch players on loan - check both boolean and status string for robustness
  const { data: players, error: playersError } = await supabase
    .from("players")
    .select("id, name, division, photo, last_seen")
    .or("is_on_loan.eq.true,loan_status.eq.PRESTAMO")
    .order("name")

  if (playersError) throw playersError

  // For each player, check if there's an existing conversation and count unread messages
  const playersWithConv = await Promise.all(players.map(async (player) => {
    const { data: conv } = await supabase
      .from("chat_conversations")
      .select("id, last_message_at")
      .eq("player_id", player.id)
      .in("area", ["General", "Prestamo"])
      .limit(1)
      .single()

    let unreadCount = 0
    if (conv) {
      const { count } = await supabase
        .from("chat_messages")
        .select("*", { count: 'exact', head: true })
        .eq("conversation_id", conv.id)
        .eq("sender_type", "PLAYER")
        .eq("is_read", false)
      unreadCount = count || 0
    }

    return {
      ...player,
      conversation_id: conv?.id || null,
      last_message_at: conv?.last_message_at || null,
      unread_count: unreadCount
    }
  }))

  return playersWithConv
}

export async function sendBulkLoanMessageAction(content: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: players, error } = await supabase
    .from("players")
    .select("id")
    .or("is_on_loan.eq.true,loan_status.eq.PRESTAMO")

  if (error) throw error

  for (const player of players) {
    // 1. Get or create conversation
    let { data: conv } = await supabase
      .from("chat_conversations")
      .select("id")
      .eq("player_id", player.id)
      .in("area", ["General", "Prestamo"])
      .limit(1)
      .single()

    if (!conv) {
      const { data: newConv } = await supabase
        .from("chat_conversations")
        .insert({
          player_id: player.id,
          area: "Prestamo",
          professional_id: user.id
        })
        .select("id")
        .single()
      conv = newConv
    }

    if (conv) {
      await sendMessage(conv.id, "PROFESSIONAL", user.id, content)
    }
  }

  revalidatePath("/dashboard/messages")
  return { success: true, count: players.length }
}

export async function createLoanConversationAction(playerId: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  // Check if a conversation already exists for this player (any area or specific)
  // For simplicity, let's try to find a 'General' or 'Prestamo' conversation, or create 'Prestamo'
  
  const { data: existing } = await supabase
    .from("chat_conversations")
    .select("*")
    .eq("player_id", playerId)
    .in("area", ["General", "Prestamo"])
    .limit(1)
    .single()

  if (existing) return existing

  // Create new conversation
  const { data: newConv, error } = await supabase
    .from("chat_conversations")
    .insert({
      player_id: playerId,
      area: "Prestamo",
      professional_id: user.id 
    })
    .select()
    .single()

  if (error) throw error
  
  revalidatePath(`/dashboard/messages`)
  return newConv
}

