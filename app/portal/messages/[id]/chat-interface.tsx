"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { getMessagesAction, sendMessageAction, markAsReadAction } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase" // Import supabase client
import { useRouter } from "next/navigation"

interface Message {
  id: string
  content: string
  sender_type: "PLAYER" | "PROFESSIONAL"
  created_at: string
  is_read?: boolean // Optional as it might not be in all queries
}

interface ChatInterfaceProps {
  conversationId: string
  initialMessages: Message[]
  currentUserId: string // Player ID, though sender_type check is enough
}

export function ChatInterface({ conversationId, initialMessages, currentUserId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState("")
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  
  // Pagination State
  const [msgPage, setMsgPage] = useState(0)
  const [hasMore, setHasMore] = useState(initialMessages.length >= 50)
  const [loadingMore, setLoadingMore] = useState(false)
  const topRef = useRef<HTMLDivElement>(null)
  
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Mark as read on mount if needed
  useEffect(() => {
    // Check if there are any unread messages from professional in the initial batch
    // Note: 'is_read' field availability depends on the query, assuming it's available or we mark anyway on open.
    // Ideally we check specific messages, but "markAsReadAction" marks ALL for the conversation.
    
    // We simply mark as read on open
    startTransition(async () => {
        await markAsReadAction(conversationId)
        router.refresh() // Update server components (badges)
    })
  }, [conversationId, router])

  // Realtime Subscription (Replaces Polling)
  useEffect(() => {
    if (!conversationId) return

    const channel = supabase
      .channel(`chat-portal:${conversationId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'chat_messages', 
        filter: `conversation_id=eq.${conversationId}` 
      }, (payload) => {
        const newMessage = payload.new as Message

        // Side Effect: Mark as read if from professional
        if (newMessage.sender_type === "PROFESSIONAL") {
            setTimeout(() => {
                startTransition(async () => {
                    await markAsReadAction(conversationId)
                    router.refresh()
                })
            }, 0)
        }

        setMessages(prev => {
            const isMine = newMessage.sender_type === "PLAYER"
            
            // 1. Optimistic Replacement for my messages
            if (isMine) {
                const tempIndex = prev.findIndex(m => 
                    m.id.startsWith("temp-") && 
                    m.content === newMessage.content
                )
                
                if (tempIndex !== -1) {
                    const newMessages = [...prev]
                    newMessages[tempIndex] = newMessage
                    return newMessages
                }
            }

            // 2. Add incoming message if not duplicate
            if (prev.some(m => m.id === newMessage.id)) return prev
            
            return [...prev, newMessage]
        })

        // Scroll to bottom on new message if it's new (not replacement)
        // We do a simple timeout to allow render
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'chat_messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
         setMessages(prev => prev.map(m => m.id === payload.new.id ? payload.new as Message : m))
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
            // console.log(`Portal Chat Connected: ${conversationId}`)
        }
        if (status === 'CHANNEL_ERROR') {
            console.error(`Portal Realtime Error: ${conversationId}. Check RLS policies.`)
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId])

  // Load More (Older) Messages
  const loadOlderMessages = async () => {
    if (loadingMore || !hasMore) return
    
    const scrollContainer = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
    const previousScrollHeight = scrollContainer?.scrollHeight || 0;

    setLoadingMore(true)
    
    try {
      const nextPage = msgPage + 1
      const olderMessages = await getMessagesAction(conversationId, nextPage, 50)
      
      if (olderMessages.length < 50) setHasMore(false)
      
      if (olderMessages.length > 0) {
        setMessages(prev => [...olderMessages, ...prev])
        setMsgPage(nextPage)

        // Restore scroll position
        requestAnimationFrame(() => {
            if (scrollContainer) {
                const newScrollHeight = scrollContainer.scrollHeight;
                scrollContainer.scrollTop = newScrollHeight - previousScrollHeight;
            }
        });
      }
    } catch (error) {
      console.error("Error loading history:", error)
    } finally {
      setLoadingMore(false)
    }
  }

  // Intersection Observer for Top
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadOlderMessages()
        }
      },
      { threshold: 0.5 }
    )
    if (topRef.current) observer.observe(topRef.current)
    return () => observer.disconnect()
  }, [hasMore, loadingMore, msgPage])

  // Scroll to bottom only on INITIAL load
  useEffect(() => {
    if (msgPage === 0) {
        bottomRef.current?.scrollIntoView({ behavior: "instant" })
    }
  }, []) // Empty dependency array to run only once on mount (or rely on ref)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isPending) return

    const content = inputValue.trim()
    setInputValue("")

    const optimisticMsg: Message = {
      id: "temp-" + Date.now(),
      content,
      sender_type: "PLAYER",
      created_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, optimisticMsg])
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100)

    startTransition(async () => {
      try {
        await sendMessageAction(conversationId, content)
      } catch (error) {
        console.error("Failed to send", error)
      }
    })
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-zinc-950/20">
      <div className="flex-1 overflow-hidden relative">
        <ScrollArea className="h-full custom-scrollbar" ref={scrollRef}>
          <div className="p-4 md:p-6 space-y-6 pb-10 max-w-3xl mx-auto">
            {/* Infinite Scroll Trigger */}
            <div ref={topRef} className="h-10 flex items-center justify-center">
                {loadingMore && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </div>

            {!hasMore && messages.length > 0 && (
                <div className="flex justify-center my-4">
                <span className="text-[10px] bg-white dark:bg-zinc-800 px-3 py-1 rounded-full text-muted-foreground uppercase tracking-widest font-medium shadow-sm border">
                    Inicio de la conversación
                </span>
                </div>
            )}

            {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex w-full max-w-[85%] flex-col gap-1",
                    msg.sender_type === "PLAYER" ? "ml-auto items-end" : "items-start"
                  )}
                >
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-3 text-sm shadow-sm",
                      msg.sender_type === "PLAYER"
                        ? "bg-gradient-to-br from-red-600 to-red-700 text-white rounded-br-none"
                        : "bg-white dark:bg-zinc-800 border text-foreground rounded-bl-none"
                    )}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-muted-foreground px-1">
                    {format(new Date(msg.created_at), "HH:mm", { locale: es })}
                  </span>
                </div>
            ))}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>
      </div>

      <div className="shrink-0 p-4 bg-background border-t">
        <form onSubmit={handleSend} className="flex gap-2 max-w-3xl mx-auto items-end">
          <div className="flex-1 relative">
            <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="pr-12 py-6 rounded-2xl bg-muted/50 border-muted-foreground/20 focus-visible:ring-red-600 focus-visible:border-red-600 pl-5"
                disabled={isPending}
            />
            <Button 
                type="submit" 
                size="icon" 
                className={cn(
                    "absolute right-1.5 top-1.5 h-9 w-9 rounded-xl transition-all duration-200",
                    inputValue.trim() && !isPending 
                        ? "bg-red-600 hover:bg-red-700 text-white shadow-md" 
                        : "bg-muted text-muted-foreground"
                )}
                disabled={!inputValue.trim() || isPending}
            >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
