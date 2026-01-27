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
