import { requirePlayerSession } from "@/lib/portal-auth"
import { createAdminClient } from "@/lib/supabase"
import { logoutAction } from "./actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  User, 
  LogOut, 
  ShieldAlert, 
  Shirt,
  MessageSquare
} from "lucide-react"
import { PortalProfileForm } from "@/components/portal-profile-form"
import Link from "next/link"
import { PlayerStatusManager } from "@/components/player-status-manager"

export default async function PlayerDashboard() {
  const session = await requirePlayerSession()
  const supabase = createAdminClient()

  // Fetch full player data
  const { data: player, error } = await supabase
    .from("players")
    .select("*")
    .eq("id", session.playerId)
    .single()

  if (error || !player) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-2">Error al cargar perfil</h1>
          <p className="text-muted-foreground mb-4">No se pudo recuperar la información del jugador.</p>
          <form action={logoutAction}>
            <Button variant="outline">Salir</Button>
          </form>
        </div>
      </div>
    )
  }

  // Helper to format name
  const firstName = player.name.split(' ')[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-gradient-to-r from-red-700 to-black text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Newell's Old Boys</h1>
              <p className="text-sm text-red-100">Portal del Jugador</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-semibold">{player.name}</p>
                <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white">
                  {player.category || player.division}
                </Badge>
              </div>
              <form action={logoutAction}>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <LogOut className="h-5 w-5" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <PlayerStatusManager playerId={player.id} initialLastSeen={(player as any).last_seen} />
        
        {/* Hero / Welcome Section */}
        <div className="flex flex-col md:flex-row gap-6 mb-8 items-start md:items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground tracking-tight">Hola, {firstName} 👋</h2>
            <p className="text-muted-foreground mt-1 text-lg">
              Bienvenido a tu panel personal.
            </p>
          </div>
          <div className="flex gap-3">
             <Badge variant={player.is_injured ? "destructive" : "default"} className={`px-3 py-1.5 text-sm font-medium shadow-sm ${!player.is_injured ? "bg-green-600 hover:bg-green-700" : ""}`}>
                {player.is_injured ? "En Recuperación" : "Apto Físico"}
             </Badge>
          </div>
        </div>

        {/* Player Identity Card - Full Width Banner */}
        <div className="mb-8">
          <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-r from-zinc-900 via-zinc-800 to-black text-white relative">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-red-900/10 rounded-full blur-2xl -ml-10 -mb-10"></div>

            <CardContent className="p-6 md:p-8 py-0 flex md:flex-row items-center gap-8 relative z-10">
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-red-500 rounded-full blur-lg opacity-20"></div>
                <Avatar className="w-20 h-20 md:w-32 md:h-32 border-4 border-white/10 shadow-2xl relative">
                    <AvatarImage src={player.photo || ""} className="object-cover" />
                    <AvatarFallback className="text-2xl font-bold bg-zinc-800 text-zinc-400">
                    {player.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                {/* Active Status Indicator */}
                <div className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-4 border-zinc-900 ${player.is_injured ? 'bg-red-500' : 'bg-green-500'}`}></div>
              </div>
              
              <div className="text-center md:text-left space-y-3 flex-1">

                <div>
                  <h3 className="text-2xl md:text-4xl font-bold tracking-tight mb-2">{player.name}</h3>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-zinc-300">
                    <Badge variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10 px-3 py-1 text-sm">
                      <Shirt className="w-4 h-4 mr-2" />
                      <span className="capitalize">{player.position}</span>
                    </Badge>
                    <Badge variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10 px-3 py-1 text-sm">
                      {player.category || player.division}
                    </Badge>
                  </div>
                </div>
              </div>

               {/* Right side status / info */}
               <div className="hidden md:block text-right text-zinc-400 text-sm border-l border-white/10 pl-8 py-2">
                  <p className="mb-1">Estado Actual</p>
                  <p className={`font-medium ${player.is_injured ? "text-red-400" : "text-green-400"}`}>
                    {player.is_injured ? "En Sanidad" : "Disponible"}
                  </p>
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
          
             {/* Communication Card */}
             <Link href="/portal/messages">
               <Card className="shadow-sm border-muted/60 hover:border-red-200 transition-colors cursor-pointer group">
                  <CardHeader>
                     <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                          <MessageSquare className="h-5 w-5 text-blue-600"/>
                        </div>
                        <div>
                          <CardTitle>Mensajes con Profesionales</CardTitle>
                          <CardDescription>
                              Comunicate con el cuerpo médico y técnico.
                          </CardDescription>
                        </div>
                     </div>
                  </CardHeader>
               </Card>
             </Link>

             {/* Physical Data Form */}
             <Card className="shadow-sm border-muted/60">
                <CardHeader>
                   <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center">
                        <User className="h-5 w-5 text-red-600"/>
                      </div>
                      <div>
                        <CardTitle>Mis Datos Personales</CardTitle>
                        <CardDescription>
                            Mantené actualizada tu información física y de contacto.
                        </CardDescription>
                      </div>
                   </div>
                </CardHeader>
                <CardContent>
                   <PortalProfileForm player={player} />
                </CardContent>
             </Card>

             {/* Additional Info Cards (Privacy Only) */}
             <div className="grid grid-cols-1 gap-6">
                <Card className="bg-muted/20 border-dashed shadow-none">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="h-10 w-10 shrink-0 rounded-full bg-zinc-100 flex items-center justify-center">
                        <ShieldAlert className="w-5 h-5 text-zinc-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Privacidad</h3>
                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                          La información proporcionada es confidencial y de uso exclusivo para la gestión deportiva del club.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
             </div>
        </div>
      </main>
    </div>
  )
}
