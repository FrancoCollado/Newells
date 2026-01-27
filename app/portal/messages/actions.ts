"use server"

import { requirePlayerSession } from "@/lib/portal-auth"
import { 
  getPlayerConversations, 
  getConversationMessages, 
  sendMessage, 
  markMessagesAsRead,
  createConversation,
  type SenderType 
} from "@/lib/chat"
import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase"
import { redirect } from "next/navigation"

// Helper to verify ownership
async function verifyConversationOwnership(conversationId: string, playerId: string) {
  const supabase = createAdminClient()
  console.log(`[Chat Debug] Verificando propiedad. Conv: ${conversationId}, Player: ${playerId}`);
  
  const { data: conversation, error } = await supabase
    .from("chat_conversations")
    .select("id, player_id")
    .eq("id", conversationId)
    .single()

  if (error) {
    console.error("[Chat Debug] Error buscando conversación:", error);
    throw new Error("Conversation not found");
  }

  if (!conversation || conversation.player_id !== playerId) {
    console.error(`[Chat Debug] Violación de propiedad. Dueño real: ${conversation?.player_id}, Intento de: ${playerId}`);
    throw new Error("Unauthorized");
  }
  
  return conversation
}

export async function getConversationsAction() {
  const session = await requirePlayerSession()
  return await getPlayerConversations(session.playerId)
}

export async function getMessagesAction(conversationId: string, page = 0, limit = 50) {
  const session = await requirePlayerSession()
  
  try {
    await verifyConversationOwnership(conversationId, session.playerId)
    return await getConversationMessages(conversationId, page, limit)
  } catch (error) {
    console.error("Security violation attempt or invalid ID:", error)
    return []
  }
}

export async function sendMessageAction(conversationId: string, content: string) {
  const session = await requirePlayerSession()
  if (!content.trim()) return
  
  try {
    await verifyConversationOwnership(conversationId, session.playerId)

    // Rate Limit Check
    const supabase = createAdminClient()
    const { data: lastMsg } = await supabase
      .from("chat_messages")
      .select("created_at")
      .eq("sender_id", session.playerId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (lastMsg) {
      const timeSinceLast = Date.now() - new Date(lastMsg.created_at).getTime()
      if (timeSinceLast < 1000) { // 1 second limit
        throw new Error("Estás enviando mensajes muy rápido. Espera un momento.")
      }
    }

    await sendMessage(conversationId, "PLAYER", session.playerId, content)
    revalidatePath(`/portal/messages/${conversationId}`)
    revalidatePath(`/portal/messages`)
  } catch (error: any) {
    console.error("Failed to send message:", error)
    if (error.message.includes("rápido")) throw error // Re-throw rate limit error for UI
    throw new Error("No se pudo enviar el mensaje")
  }
}

export async function createConversationAction(area: string) {
  const session = await requirePlayerSession()
  const conv = await createConversation(session.playerId, area)
  revalidatePath(`/portal/messages`)
  return conv
}

export async function markAsReadAction(conversationId: string) {
  const session = await requirePlayerSession()
  try {
    await verifyConversationOwnership(conversationId, session.playerId)
    await markMessagesAsRead(conversationId, "PLAYER")
    // revalidatePath(`/portal/messages`) // Removed to prevent Router update during render
  } catch (error) {
    console.error("Failed to mark as read:", error)
  }
}
