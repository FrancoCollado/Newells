"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

interface MessagesBadgeProps {
  initialUnreadCount: number
  conversationIds: string[]
}

export function MessagesBadge({ initialUnreadCount, conversationIds }: MessagesBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount)

  useEffect(() => {
    // If no conversations, no need to subscribe
    if (conversationIds.length === 0) return

    const channel = supabase
      .channel('dashboard-badge')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'chat_messages',
        // We can't easily filter by "IN array" in the channel filter string,
        // so we listen to all inserts on the table and filter client-side.
        // Note: For high-volume apps this is inefficient, but for this scale it's fine.
        // Ideally, RLS would filter this stream for us.
      }, (payload) => {
        const newMessage = payload.new as any
        
        // Check if message belongs to one of our conversations
        if (conversationIds.includes(newMessage.conversation_id)) {
            // Only count if it's from a professional and unread
            if (newMessage.sender_type === "PROFESSIONAL") {
                setUnreadCount(prev => prev + 1)
            }
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationIds])

  return (
    <div className="max-w-4xl mx-auto mb-6">
      <Link href="/portal/messages">
        <Button variant="outline" className="w-full h-auto py-4 justify-between px-6 bg-card hover:bg-accent/50 border-muted/60 shadow-sm group">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-500/10 rounded-full text-blue-600 group-hover:bg-blue-500/20 transition-colors">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="font-semibold text-base block text-foreground">Mensajería</span>
              <span className="text-sm text-muted-foreground font-normal">Contactar con profesionales</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200">
                  {unreadCount}
                </Badge>
              </div>
            )}
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </div>
        </Button>
      </Link>
    </div>
  )
}
