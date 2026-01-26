"use client"

import { useState, useRef, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Send, 
  User, 
  Check, 
  CheckCheck 
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { sendMessageAsProfessionalAction, markAsReadAsProfessionalAction } from "@/app/dashboard/messages/actions"
import { getOrCreateConversationAction } from "./actions"

interface Message {
  id: string
  content: string
  sender_type: "PLAYER" | "PROFESSIONAL"
  created_at: string
  is_read: boolean
}

interface PlayerChatProps {
  playerId: string
  professionalArea: string
  professionalId: string
}

export function PlayerProfileChat({ playerId, professionalArea, professionalId }: PlayerChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState("")
  const [loading, setLoading] = useState(true)
  
  // Pagination
  const [msgPage, setMsgPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const topRef = useRef<HTMLDivElement>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Initialize
  useEffect(() => {
    const initChat = async () => {
      try {
        const conv = await getOrCreateConversationAction(playerId, professionalArea)
        setConversationId(conv.id)
        
        const { data } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: false })
          .limit(50)
        
        if (data) {
          setMessages((data as Message[]).reverse())
          markAsReadAsProfessionalAction(conv.id)
          if (data.length < 50) setHasMore(false)
        }
      } catch (error) {
        console.error("Error initializing chat:", error)
      } finally {
        setLoading(false)
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "instant" }), 50)
      }
    }
    initChat()
  }, [playerId, professionalArea])

  const loadOlderMessages = async () => {
    if (loadingMore || !hasMore || !conversationId) return
    setLoadingMore(true)
    try {
      const nextPage = msgPage + 1
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: false })
        .range(nextPage * 50, (nextPage + 1) * 50 - 1)
      
      if (data) {
        if (data.length < 50) setHasMore(false)
        setMessages(prev => [...(data as Message[]).reverse(), ...prev])
        setMsgPage(nextPage)
      }
    } catch (e) {
    } finally {
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) loadOlderMessages()
      },
      { threshold: 0.5 }
    )
    if (topRef.current) observer.observe(topRef.current)
    return () => observer.disconnect()
  }, [hasMore, loadingMore, conversationId])

  // Realtime
  useEffect(() => {
    if (!conversationId) return

    const channel = supabase
      .channel(`chat-profile:${conversationId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'chat_messages', 
        filter: `conversation_id=eq.${conversationId}` 
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message])
        if ((payload.new as Message).sender_type === "PLAYER") {
            markAsReadAsProfessionalAction(conversationId)
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'chat_messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
         setMessages(prev => prev.map(m => m.id === payload.new.id ? payload.new as Message : m))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!conversationId || !inputValue.trim()) return

    const content = inputValue
    setInputValue("")

    const tempMsg: Message = {
      id: "temp-" + Date.now(),
      content,
      sender_type: "PROFESSIONAL",
      created_at: new Date().toISOString(),
      is_read: false
    }
    setMessages(prev => [...prev, tempMsg])
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50)

    try {
      await sendMessageAsProfessionalAction(conversationId, content)
    } catch (error) {
      console.error("Failed to send", error)
    }
  }

  if (loading) {
     return <div className="p-8 text-center text-muted-foreground animate-pulse">Cargando chat...</div>
  }

  return (
    <div className="flex flex-col h-[500px] border rounded-xl bg-background overflow-hidden shadow-sm">
      {/* Header - Fixed shrink-0 */}
      <div className="shrink-0 p-3 px-4 border-b bg-muted/30 text-xs font-semibold text-muted-foreground flex justify-between items-center uppercase tracking-wider">
        <span>Canal {professionalArea}</span>
        <div className="flex items-center gap-1.5">
           <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
           <span>En línea</span>
        </div>
      </div>
      
      {/* Messages - Scrollable flex-1 */}
      <div className="flex-1 overflow-hidden relative bg-slate-50/50 dark:bg-zinc-950/20">
        <ScrollArea className="h-full custom-scrollbar" ref={scrollRef}>
            <div className="p-4 space-y-4">
                {/* Infinite Scroll Trigger */}
                <div ref={topRef} className="h-10 flex items-center justify-center">
                    {loadingMore && <Check className="h-4 w-4 animate-spin text-muted-foreground" />}
                </div>

                {!hasMore && messages.length > 0 && (
                    <div className="flex justify-center my-2">
                        <span className="text-[10px] bg-white dark:bg-zinc-800 px-2 py-0.5 rounded-full text-muted-foreground uppercase tracking-widest font-medium border shadow-xs">
                            Inicio del chat
                        </span>
                    </div>
                )}

                {messages.length === 0 && (
                    <div className="text-center text-muted-foreground py-10 opacity-50 flex flex-col items-center gap-2">
                        <User className="h-8 w-8 stroke-1" />
                        <div className="text-sm">
                            <p>No hay mensajes aún.</p>
                            <p className="text-[10px]">Escribe el primer mensaje para contactar al jugador.</p>
                        </div>
                    </div>
                )}
                {messages.map((msg) => {
                    const isMe = msg.sender_type === "PROFESSIONAL"
                    return (
                        <div
                        key={msg.id}
                        className={cn(
                            "flex w-full max-w-[85%] flex-col gap-1",
                            isMe ? "ml-auto items-end" : "items-start"
                        )}
                        >
                        <div
                            className={cn(
                            "rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                            isMe
                                ? "bg-gradient-to-br from-red-600 to-red-700 text-white rounded-br-none"
                                : "bg-white dark:bg-zinc-800 border text-foreground rounded-bl-none"
                            )}
                        >
                            {msg.content}
                        </div>
                        <div className="flex items-center gap-1 px-1">
                            <span className="text-[10px] text-muted-foreground">
                                {format(new Date(msg.created_at), "HH:mm", { locale: es })}
                            </span>
                            {isMe && (
                                msg.is_read ? (
                                    <CheckCheck className="h-3 w-3 text-red-600" />
                                ) : (
                                    <Check className="h-3 w-3 text-muted-foreground" />
                                )
                            )}
                        </div>
                        </div>
                    )
                })}
                <div ref={bottomRef} />
            </div>
        </ScrollArea>
      </div>

      {/* Input - Fixed shrink-0 */}
      <div className="shrink-0 p-3 bg-background border-t">
        <form onSubmit={handleSend} className="flex gap-2">
            <Input 
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Enviar mensaje..."
                className="flex-1 rounded-full bg-muted/50 border-muted-foreground/20 focus-visible:ring-red-600"
            />
            <Button 
                type="submit" 
                size="icon" 
                disabled={!inputValue.trim()}
                className={cn(
                    "rounded-full transition-all duration-200",
                    inputValue.trim() ? "bg-red-600 hover:bg-red-700 text-white" : ""
                )}
            >
                <Send className="h-4 w-4" />
            </Button>
        </form>
      </div>
    </div>
  )
}