import { ProfessionalInbox } from "./inbox"
import { createServerClient } from "@/lib/supabase"
import { getProfessionalConversations } from "@/lib/chat"
import { MessageSquare, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function MessagesPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return <div className="flex items-center justify-center h-screen">No autorizado</div>

  const conversations = await getProfessionalConversations(user.id)

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header Institucional */}
      <header className="shrink-0 border-b bg-gradient-to-r from-red-700 to-black text-white shadow-md">
        <div className="container mx-auto px-6 py-4 max-w-[1400px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-red-200" />
                  <h1 className="text-xl font-bold tracking-tight">Centro de Comunicación</h1>
                </div>
              </div>
            </div>
            
            {/* Stats rápidas en el header */}
            <div className="hidden md:flex items-center gap-6 border-l border-white/10 pl-6">
               <div className="text-center">
                  <p className="text-[10px] uppercase tracking-widest text-red-200/60 font-semibold">Conversaciones</p>
                  <p className="text-lg font-bold leading-none">{conversations.length}</p>
               </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Inbox Container - h-full and overflow-hidden here is key */}
      <main className="flex-1 overflow-hidden container mx-auto p-4 md:p-6 max-w-[1400px]">
        <ProfessionalInbox initialConversations={conversations} />
      </main>
    </div>
  )
}
