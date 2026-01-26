import { ProfessionalInbox } from "./inbox"
import { createServerClient } from "@/lib/supabase"
import { getProfessionalConversations } from "@/lib/chat"
import { MessagesClientLayout } from "./client-layout"
import { UserRole } from "@/lib/auth"

export const dynamic = 'force-dynamic'

export default async function MessagesPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return <div className="flex items-center justify-center h-screen">No autorizado</div>

  // Fetch complete profile for the layout
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const userData = profile ? {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    role: profile.role as UserRole,
    photo: profile.photo,
  } : {
    id: user.id,
    email: user.email!,
    name: user.user_metadata.name || "Usuario",
    role: "entrenador" as UserRole // Fallback
  }

  const conversations = await getProfessionalConversations(user.id)

  return (
    <MessagesClientLayout user={userData}>
      <div className="h-[calc(100vh-2rem)] flex flex-col overflow-hidden">
        {/* Header Content for Messages */}
        <header className="shrink-0 border-b pb-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Centro de Comunicación</h1>
              <p className="text-muted-foreground">Gestiona tus mensajes y conversaciones</p>
            </div>
            
            <div className="hidden md:flex items-center gap-6 border-l pl-6">
               <div className="text-center">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Conversaciones</p>
                  <p className="text-lg font-bold leading-none">{conversations.length}</p>
               </div>
            </div>
          </div>
        </header>
        
        {/* Inbox Container */}
        <div className="flex-1 overflow-hidden">
          <ProfessionalInbox initialConversations={conversations} />
        </div>
      </div>
    </MessagesClientLayout>
  )
}
