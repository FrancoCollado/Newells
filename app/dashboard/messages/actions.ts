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

  const { data, error } = await supabase
    .from("players")
    .select("id, name, division, photo, last_seen")
    .eq("is_on_loan", true)
    .order("name")

  if (error) throw error
  return data
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
