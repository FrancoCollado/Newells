import { requirePlayerSession } from "@/lib/portal-auth"
import { getMessagesAction } from "../actions"
import { ChatInterface } from "./chat-interface"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { createAdminClient } from "@/lib/supabase"

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await requirePlayerSession()
  const messages = await getMessagesAction(id)
  
  // Fetch conversation details for header
  const supabase = createAdminClient()
  const { data: conversation } = await supabase
    .from("chat_conversations")
    .select("area, professional:auth.users(email)") // Simplified join, adjust if profile table exists
    .eq("id", id)
    .single()

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <header className="shrink-0 flex items-center gap-3 p-4 border-b bg-background/80 backdrop-blur-md z-10 h-16 shadow-sm">
        <Link href="/portal/messages">
          <Button variant="ghost" size="icon" className="-ml-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="font-bold text-lg capitalize">
            {conversation?.area || "Chat"}
          </h1>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
             <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
             <span>Profesional en línea</span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative">
        <ChatInterface 
           conversationId={id} 
           initialMessages={messages}
           currentUserId={session.playerId}
        />
      </main>
    </div>
  )
}
