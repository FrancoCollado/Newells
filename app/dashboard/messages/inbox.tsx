"use client"

import { useState, useRef, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  Send, 
  Search, 
  MoreVertical, 
  Check, 
  CheckCheck, 
  MessageSquare,
  Phone,
  Video
} from "lucide-react"
import { 
  sendMessageAsProfessionalAction, 
  markAsReadAsProfessionalAction,
  getProfessionalConversationsAction 
} from "./actions"
import { supabase } from "@/lib/supabase"
import { formatPresence } from "@/lib/format-presence"

interface Conversation {
  id: string
  player_id: string
  area: string
  last_message_at: string
  unread_count: number
  player: {
    id: string
    name: string
    division: string
    photo?: string
    last_seen?: string | null
  }
}

interface Message {
  id: string
  content: string
  sender_type: "PLAYER" | "PROFESSIONAL"
  created_at: string
  is_read: boolean
}

export function ProfessionalInbox({ 
  initialConversations 
}: { 
  initialConversations: Conversation[] 
}) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  
  // Sidebar Pagination
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Message Pagination
  const [msgPage, setMsgPage] = useState(0)
  const [hasMoreMessages, setHasMoreMessages] = useState(true)
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false)
  const topRef = useRef<HTMLDivElement>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const selectedConversation = conversations.find(c => c.id === selectedId)
  const filteredConversations = conversations;

  // Presence Subscription (Online Status)
  useEffect(() => {
    const channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: 'professional-observer',
        },
      },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const onlineIds = new Set<string>()
        
        for (const key in state) {
          if (state[key].length > 0) {
            // @ts-ignore
            const pid = state[key][0].player_id
            if (pid) onlineIds.add(pid)
          }
        }
        setOnlineUsers(onlineIds)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        // @ts-ignore
        const pid = newPresences[0].player_id
        if (pid) {
            setOnlineUsers(prev => new Set(prev).add(pid))
        }
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        // @ts-ignore
        const pid = leftPresences[0].player_id
        if (pid) {
            setOnlineUsers(prev => {
                const next = new Set(prev)
                next.delete(pid)
                return next
            })
            // Update local last_seen to "now" to avoid stale "Active 2 days ago" after being online
            setConversations(prev => prev.map(c => {
                if (c.player.id === pid) {
                    return {
                        ...c,
                        player: {
                            ...c.player,
                            last_seen: new Date().toISOString()
                        }
                    }
                }
                return c
            }))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Server-side Search Effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.length > 0) {
        setIsSearching(true)
        const results = await getProfessionalConversationsAction(0, 20, searchTerm)
        setConversations(results as Conversation[])
        setPage(0)
        setHasMore(results.length === 20)
        setIsSearching(false)
      } else if (searchTerm.length === 0) {
        const initial = await getProfessionalConversationsAction(0, 20)
        setConversations(initial as Conversation[])
        setPage(0)
        setHasMore(initial.length === 20)
      }
    }, 400)

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm])

  // Infinite Scroll Logic for Sidebar
  const loadMoreConversations = async () => {
    if (loadingMore || !hasMore) return
    
    setLoadingMore(true)
    try {
      const nextPage = page + 1
      const newConversations = await getProfessionalConversationsAction(nextPage, 20, searchTerm)
      
      if (newConversations.length < 20) {
        setHasMore(false)
      }

      if (newConversations.length > 0) {
        setConversations(prev => {
           const existingIds = new Set(prev.map(c => c.id))
           const uniqueNew = newConversations.filter((c: any) => !existingIds.has(c.id))
           return [...prev, ...uniqueNew as Conversation[]]
        })
        setPage(nextPage)
      }
    } catch (error) {
      console.error("Error loading more conversations:", error)
    } finally {
      setLoadingMore(false)
    }
  }

  // Observer for Sidebar
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMoreConversations()
        }
      },
      { threshold: 0.1 } 
    )
    if (loadMoreRef.current) observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [hasMore, loadingMore, page, searchTerm])

  // Load More (Older) Messages
  const loadOlderMessages = async () => {
    if (loadingMoreMessages || !hasMoreMessages || !selectedId) return
    
    const scrollContainer = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    const previousScrollHeight = scrollContainer?.scrollHeight || 0;

    setLoadingMoreMessages(true)
    
    try {
      const nextPage = msgPage + 1
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", selectedId)
        .order("created_at", { ascending: false })
        .range(nextPage * 50, (nextPage + 1) * 50 - 1)
      
      if (error) throw error

      if (data.length < 50) setHasMoreMessages(false)
      
      if (data.length > 0) {
        const olderBatch = data.reverse()
        setMessages(prev => [...olderBatch as Message[], ...prev])
        setMsgPage(nextPage)

        requestAnimationFrame(() => {
            if (scrollContainer) {
                const newScrollHeight = scrollContainer.scrollHeight;
                scrollContainer.scrollTop = newScrollHeight - previousScrollHeight;
            }
        });
      }
    } catch (error) {
      console.error("Error loading message history:", error)
    } finally {
      setLoadingMoreMessages(false)
    }
  }

  // Observer for Messages Scroll Up
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreMessages && selectedId) {
          loadOlderMessages()
        }
      },
      { threshold: 0.5 }
    )
    if (topRef.current) observer.observe(topRef.current)
    return () => observer.disconnect()
  }, [hasMoreMessages, loadingMoreMessages, msgPage, selectedId])

  // Fetch messages when conversation selected
  useEffect(() => {
    if (!selectedId) return

    const fetchMessages = async () => {
      setLoadingMessages(true)
      setMsgPage(0)
      setHasMoreMessages(true)
      
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", selectedId)
        .order("created_at", { ascending: false })
        .limit(50)
      
      if (data) {
        setMessages((data as Message[]).reverse())
        setConversations(prev => prev.map(c => 
          c.id === selectedId ? { ...c, unread_count: 0 } : c
        ))
        markAsReadAsProfessionalAction(selectedId)
        if (data.length < 50) setHasMoreMessages(false)
      }
      setLoadingMessages(false)
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "instant" }), 50)
    }

    fetchMessages()

    const channel = supabase
      .channel(`chat:${selectedId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'chat_messages', 
        filter: `conversation_id=eq.${selectedId}` 
      }, (payload) => {
        const newMessage = payload.new as Message
        
        // Side Effect: Mark as read if from player
        if (newMessage.sender_type === "PLAYER") {
            setTimeout(() => {
                markAsReadAsProfessionalAction(selectedId)
            }, 0)
        }

        setMessages(prev => {
             // Deduplication & Optimistic Replacement Logic
            const isMine = newMessage.sender_type === "PROFESSIONAL"
            
            // 1. If it's mine, try to find the optimistic temp message to replace
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

            // 2. If it's not mine (Player's) or I couldn't find the temp match, add it.
            if (prev.some(m => m.id === newMessage.id)) return prev

            return [...prev, newMessage]
        })
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'chat_messages',
        filter: `conversation_id=eq.${selectedId}`
      }, (payload) => {
         setMessages(prev => prev.map(m => m.id === payload.new.id ? payload.new as Message : m))
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
            // console.log(`Connected to chat:${selectedId}`)
        }
        if (status === 'CHANNEL_ERROR') {
            console.error(`Error connecting to realtime chat:${selectedId}`)
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedId])

  // Global Realtime listener for the SIDEBAR
  useEffect(() => {
    const globalChannel = supabase
      .channel('global-chat-updates')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'chat_messages', 
        filter: 'sender_type=eq.PLAYER' 
      }, (payload) => {
        const newMessage = payload.new as Message
        
        setConversations(prev => {
           const index = prev.findIndex(c => c.id === newMessage.conversation_id)
           if (index === -1) return prev 
           
           const list = [...prev]
           const conv = list[index]
           
           const isSelected = newMessage.conversation_id === selectedId
           const updatedConv = { 
              ...conv, 
              last_message_at: newMessage.created_at,
              unread_count: isSelected ? 0 : conv.unread_count + 1 
           }
           
           list.splice(index, 1)
           return [updatedConv, ...list]
        })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(globalChannel)
    }
  }, [selectedId])

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedId || !inputValue.trim()) return

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
    
    setConversations(prev => {
        const index = prev.findIndex(c => c.id === selectedId)
        if (index === -1) return prev
        const updated = { ...prev[index], last_message_at: new Date().toISOString() }
        const list = [...prev]
        list.splice(index, 1)
        return [updated, ...list]
    })

    try {
      await sendMessageAsProfessionalAction(selectedId, content)
    } catch (error) {
      console.error("Failed to send", error)
    }
  }

  return (
    <div className="flex h-full rounded-2xl border bg-background shadow-lg overflow-hidden ring-1 ring-border">
      {/* Sidebar List */}
      <div className="w-1/3 border-r bg-muted/10 flex flex-col min-w-[320px] h-full">
        {/* Sidebar Header */}
        <div className="shrink-0 p-4 border-b bg-background/50 backdrop-blur-sm">
          <h2 className="text-lg font-bold mb-4 px-1">Mensajes</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar..." 
              className="pl-9 bg-background border-muted-foreground/20 rounded-xl focus-visible:ring-red-600" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full custom-scrollbar">
                <div className="flex flex-col gap-1 p-3">
                    {filteredConversations.map((conv) => {
                      const isOnline = onlineUsers.has(conv.player.id)
                      const presenceText = formatPresence(conv.player.last_seen, isOnline)

                      return (
                        <button
                            key={conv.id}
                            onClick={() => setSelectedId(conv.id)}
                            className={cn(
                            "flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 group relative",
                            selectedId === conv.id 
                                ? "bg-red-50 dark:bg-red-900/10 shadow-sm border border-red-100 dark:border-red-900/30" 
                                : "hover:bg-muted/60 border border-transparent"
                            )}
                        >
                            {selectedId === conv.id && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-red-600 rounded-r-full" />
                            )}

                            <div className="relative shrink-0">
                                <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                                    <AvatarImage src={conv.player?.photo} className="object-cover" />
                                    <AvatarFallback className="bg-zinc-200 dark:bg-zinc-700 font-semibold text-muted-foreground">
                                        {conv.player?.name?.substring(0,2).toUpperCase() || "??"}
                                    </AvatarFallback>
                                </Avatar>
                                {isOnline && (
                                  <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white" />
                                )}
                                {conv.unread_count > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow ring-2 ring-background">
                                        {conv.unread_count}
                                    </span>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                                <span className={cn(
                                    "font-semibold truncate text-sm",
                                    selectedId === conv.id ? "text-red-900 dark:text-red-100" : "text-foreground"
                                )}>
                                    {conv.player?.name || "Jugador"}
                                </span>
                                <span className="text-[11px] text-muted-foreground whitespace-nowrap ml-2">
                                    {conv.last_message_at ? format(new Date(conv.last_message_at), "HH:mm", { locale: es }) : ''}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 overflow-hidden">
                                    <span className="text-xs text-muted-foreground truncate">
                                      {conv.unread_count > 0 ? "Nuevo mensaje" : presenceText || "Ver conversación"}
                                    </span>
                                </div>
                            </div>
                            </div>
                        </button>
                      )
                    })}
                    
                    {filteredConversations.length === 0 && !loadingMore && (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground opacity-60">
                            <MessageSquare className="h-10 w-10 mb-3 stroke-1" />
                            <p className="text-sm">Sin conversaciones.</p>
                        </div>
                    )}
                    
                    <div ref={loadMoreRef} className="py-2 text-center text-xs text-muted-foreground h-8">
                        {loadingMore && <span className="animate-pulse">Cargando...</span>}
                    </div>
                </div>
            </ScrollArea>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-50 dark:bg-zinc-950/50 h-full relative overflow-hidden">
        {selectedId && selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="shrink-0 h-16 border-b flex items-center justify-between px-6 bg-background/80 backdrop-blur-md z-20 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-10 w-10 border border-border shadow-sm">
                    <AvatarImage src={selectedConversation.player?.photo} className="object-cover" />
                    <AvatarFallback>{selectedConversation.player?.name?.[0] || "P"}</AvatarFallback>
                  </Avatar>
                  {onlineUsers.has(selectedConversation.player.id) && (
                    <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white" />
                  )}
                </div>
                
                <div>
                  <h3 className="font-bold text-sm leading-none mb-1">{selectedConversation.player?.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                     <span className={cn(
                        "w-2 h-2 rounded-full inline-block",
                        onlineUsers.has(selectedConversation.player.id) ? "bg-green-500" : "bg-zinc-300"
                     )} />
                     {onlineUsers.has(selectedConversation.player.id) 
                        ? <span className="text-green-600 font-medium">En línea</span>
                        : <span>{formatPresence(selectedConversation.player.last_seen, false)}</span>
                     }
                     <span className="mx-1 text-zinc-300">•</span>
                     <span className="capitalize">{selectedConversation.area}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                 <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted">
                    <Phone className="h-4 w-4" />
                 </Button>
                 <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted">
                    <Video className="h-4 w-4" />
                 </Button>
                 <Separator orientation="vertical" className="h-6 mx-1" />
                 <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted">
                    <MoreVertical className="h-4 w-4" />
                 </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-hidden relative">
                <ScrollArea className="h-full custom-scrollbar" ref={scrollRef}>
                    <div className="p-6 space-y-6">
                        <div ref={topRef} className="h-10 flex items-center justify-center">
                            {loadingMoreMessages && <Check className="h-4 w-4 animate-spin text-muted-foreground" />}
                        </div>

                        {!hasMoreMessages && messages.length > 0 && (
                            <div className="flex justify-center my-4">
                                <span className="text-[10px] bg-muted px-3 py-1 rounded-full text-muted-foreground uppercase tracking-widest font-medium">
                                    Inicio del historial
                                </span>
                            </div>
                        )}

                        {messages.map((msg, index) => {
                            const isMe = msg.sender_type === "PROFESSIONAL"
                            const showAvatar = !isMe && (index === 0 || messages[index-1].sender_type !== "PLAYER")
                            
                            return (
                                <div
                                key={msg.id}
                                className={cn(
                                    "flex w-full max-w-[85%] gap-3 relative group",
                                    isMe ? "ml-auto justify-end" : "justify-start"
                                )}
                                >
                                {!isMe && (
                                   <div className="w-8 shrink-0 flex items-end">
                                      {showAvatar && (
                                         <Avatar className="h-8 w-8 shadow-sm">
                                            <AvatarImage src={selectedConversation.player?.photo} />
                                            <AvatarFallback className="text-[10px]">{selectedConversation.player?.name[0]}</AvatarFallback>
                                         </Avatar>
                                      )}
                                   </div>
                                )}

                                <div className={cn("flex flex-col gap-1", isMe ? "items-end" : "items-start")}>
                                    <div
                                        className={cn(
                                        "px-5 py-3 text-sm shadow-sm relative",
                                        isMe
                                            ? "bg-gradient-to-br from-red-600 to-red-700 text-white rounded-2xl rounded-tr-none"
                                            : "bg-white dark:bg-zinc-800 border text-foreground rounded-2xl rounded-tl-none"
                                        )}
                                    >
                                        {msg.content}
                                    </div>
                                    
                                    <div className="flex items-center gap-1.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
                                </div>
                            )
                        })}
                        <div ref={bottomRef} />
                    </div>
                </ScrollArea>
            </div>

            {/* Input */}
            <div className="shrink-0 p-4 bg-background border-t">
              <form onSubmit={handleSend} className="flex gap-3 items-end max-w-4xl mx-auto">
                <div className="flex-1 relative shadow-sm">
                    <Input 
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        placeholder="Escribe un mensaje..."
                        className="pr-12 py-6 rounded-full border-muted-foreground/20 bg-muted/30 focus-visible:ring-red-600 focus-visible:border-red-600 pl-6"
                    />
                    <Button 
                        type="submit" 
                        size="icon" 
                        disabled={!inputValue.trim()}
                        className={cn(
                            "absolute right-1.5 top-1.5 h-9 w-9 rounded-full transition-all duration-200",
                            inputValue.trim() 
                                ? "bg-red-600 hover:bg-red-700 text-white shadow-md" 
                                : "bg-muted text-muted-foreground hover:bg-muted"
                        )}
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
             <div className="w-24 h-24 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <MessageSquare className="h-10 w-10 text-red-200 dark:text-red-800" />
             </div>
             <h3 className="text-lg font-semibold text-foreground mb-1">Tus Mensajes</h3>
             <p className="text-sm max-w-xs text-center">
                Selecciona una conversación de la lista para ver el historial y responder.
             </p>
          </div>
        )}
      </div>
    </div>
  )
}