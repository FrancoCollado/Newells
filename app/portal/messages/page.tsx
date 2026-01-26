import { requirePlayerSession } from "@/lib/portal-auth"
import { getConversationsAction, createConversationAction } from "./actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageSquarePlus, User, ArrowLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { NewChatForm } from "./new-chat-form" // We'll create this small client component

export default async function MessagesPage() {
  const session = await requirePlayerSession()
  const conversations = await getConversationsAction()

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b">
        <div className="container max-w-lg mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/portal/dashboard">
              <Button variant="ghost" size="icon" className="-ml-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="font-bold text-lg">Mensajes</h1>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button size="icon" variant="ghost" className="text-primary">
                <MessageSquarePlus className="h-6 w-6" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nueva Consulta</DialogTitle>
                <DialogDescription>
                  Selecciona el área con la que deseas comunicarte.
                </DialogDescription>
              </DialogHeader>
              <NewChatForm />
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="container max-w-lg mx-auto px-4 py-4 space-y-4">
        {conversations.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <div className="bg-muted/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <MessageSquarePlus className="h-8 w-8 opacity-50" />
            </div>
            <p>No tienes mensajes aún.</p>
            <p className="text-sm mt-1">Inicia una conversación para hablar con los profesionales.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {conversations.map((conv: any) => (
              <Link href={`/portal/messages/${conv.id}`} key={conv.id}>
                <Card className="hover:bg-muted/50 transition-colors border-muted/60 shadow-sm active:scale-[0.98] transition-transform">
                  <CardContent className="p-4 flex items-center gap-4">
                    <Avatar className="h-12 w-12 border-2 border-background">
                      <AvatarImage src={conv.professional?.avatar_url} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {conv.area ? conv.area[0].toUpperCase() : "P"}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-base truncate capitalize">
                          {conv.area || "Profesional"}
                        </h3>
                        {conv.last_message_at && (
                          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                            {format(new Date(conv.last_message_at), "d MMM", { locale: es })}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm text-muted-foreground truncate">
                          {/* We don't have the last message content in the summary yet, update query if needed */}
                          Abrir conversación
                        </p>
                        {conv.unread_count > 0 && (
                          <Badge className="h-5 min-w-[1.25rem] px-1 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                            {conv.unread_count}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground/30 ml-1" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
