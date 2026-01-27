import { requirePlayerSession } from "@/lib/portal-auth"
import { createAdminClient } from "@/lib/supabase"
import { updatePlayerPhysicals, logoutAction } from "./actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Activity, Ruler, Weight, User, LogOut, ShieldAlert, Trophy, Timer, Goal, Shirt, CreditCard, MessageSquare, ChevronRight, MapPin, Calendar, Phone, Heart, Users, FileText, Globe, Briefcase } from "lucide-react"
import Link from "next/link"
import { getPlayerConversations } from "@/lib/chat"
import { MessagesBadge } from "./messages-badge"
import { PlayerStatusManager } from "@/components/player-status-manager"
import { AnnouncementsFeed } from "./announcements-feed"

export default async function PlayerDashboard() {
  const session = await requirePlayerSession()
  const supabase = createAdminClient()

  // Fetch full player data
  const { data: player, error } = await supabase
    .from("players")
    .select("*")
    .eq("id", session.playerId)
    .single()

  // Fetch unread messages count
  const conversations = await getPlayerConversations(session.playerId)
  const totalUnreadCount = conversations.reduce((acc, curr) => acc + (curr.unread_count || 0), 0)
  const conversationIds = conversations.map(c => c.id)

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

  // Helper to format name for display
  const displayName = player.name.includes(',') 
    ? player.name.split(',').reverse().map(s => s.trim()).join(' ')
    : player.name;
    
  const firstName = displayName.split(' ')[0];

  return (
    <div className="min-h-screen bg-background">
      <PlayerStatusManager playerId={player.id} initialLastSeen={player.last_seen} />
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
                <p className="font-semibold">{displayName}</p>
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



        {/* Hero / Welcome Section */}
        <div className="mb-8 flex flex-col gap-2 items-start justify-between w-full max-w-4xl mx-auto">
          <div>
            {/* <h2 className="text-3xl font-bold text-foreground tracking-tight">Hola, {firstName} 👋</h2> */}
            <p className="text-muted-foreground mt-1 text-lg">
              Bienvenido a tu panel personal.
            </p>
          </div>
          <div className="flex gap-3">
            <Badge variant={player.is_injured ? "destructive" : "default"} className={`px-3 py-1.5 text-sm font-medium shadow-sm ${!player.is_injured ? "bg-green-600 hover:bg-green-700" : ""}`}>
              {player.is_injured ? "En Recuperación" : "Sin lesiones"}
            </Badge>
          </div>
          {/* Player Identity Card - Full Width Banner */}
          <div className="w-full">
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
                      {displayName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {/* Active Status Indicator */}
                  <div className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-4 border-zinc-900 ${player.is_injured ? 'bg-red-500' : 'bg-green-500'}`}></div>
                </div>

                <div className="text-center md:text-left space-y-3 flex-1">

                  <div>
                    <h3 className="text-2xl md:text-4xl font-bold tracking-tight mb-2">{displayName}</h3>
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
                {/* <div className="hidden md:block text-right text-zinc-400 text-sm border-l border-white/10 pl-8 py-2">
                  <p className="mb-1">Estado Actual</p>
                  <p className={`font-medium ${player.is_injured ? "text-red-400" : "text-green-400"}`}>
                    {player.is_injured ? "En Recuperación" : "Sin Lesiones"}
                  </p>
               </div> */}
              </CardContent>
            </Card>
          </div>
        </div>







        {/* Announcements Feed */}
        <AnnouncementsFeed 
          playerId={player.id} 
          division={player.category || player.division || ""} 
        />

        {/* Messages Shortcut */}
        <MessagesBadge 
          initialUnreadCount={totalUnreadCount} 
          conversationIds={conversationIds} 
        />

        {/* Main Content Area */}
        <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">

          {/* Physical Data Form */}
          <Card className="shadow-sm border-muted/60">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center">
                  <User className="h-5 w-5 text-red-600" />
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
              <form action={updatePlayerPhysicals} className="space-y-8">
                
                {/* Sección 1: Datos Físicos (Solo Lectura) */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <Activity className="w-4 h-4" /> Datos Físicos
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <Label htmlFor="height" className="flex items-center gap-2 text-base">
                            <Ruler className="w-4 h-4 text-muted-foreground" /> Altura
                            </Label>
                            <div className="relative group">
                            <Input
                                id="height"
                                name="height"
                                type="number"
                                defaultValue={player.height}
                                className="pr-12 h-12 text-lg transition-all border-zinc-200 bg-muted/50 text-muted-foreground cursor-not-allowed"
                                placeholder="180"
                                readOnly
                            />
                            <span className="absolute right-4 top-3.5 text-muted-foreground font-medium">cm</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="weight" className="flex items-center gap-2 text-base">
                            <Weight className="w-4 h-4 text-muted-foreground" /> Peso
                            </Label>
                            <div className="relative group">
                            <Input
                                id="weight"
                                name="weight"
                                type="number"
                                step="0.1"
                                defaultValue={player.weight}
                                className="pr-12 h-12 text-lg transition-all border-zinc-200 bg-muted/50 text-muted-foreground cursor-not-allowed"
                                placeholder="75.5"
                                readOnly
                            />
                            <span className="absolute right-4 top-3.5 text-muted-foreground font-medium">kg</span>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Sección 2: Datos Personales */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <User className="w-4 h-4" /> Datos Personales
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <Label htmlFor="document" className="flex items-center gap-2 text-base">
                            <CreditCard className="w-4 h-4 text-muted-foreground" /> DNI / Documento
                            </Label>
                            <Input
                                id="document"
                                name="document"
                                type="text"
                                defaultValue={player.document || ""}
                                className="h-12 text-lg"
                                placeholder="Ingresá tu número de documento"
                            />
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="passport_number" className="flex items-center gap-2 text-base">
                            <CreditCard className="w-4 h-4 text-muted-foreground" /> Pasaporte
                            </Label>
                            <Input
                                id="passport_number"
                                name="passport_number"
                                type="text"
                                defaultValue={player.passport_number || ""}
                                className="h-12 text-lg"
                                placeholder="Número de pasaporte"
                            />
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="birth_date" className="flex items-center gap-2 text-base">
                            <Calendar className="w-4 h-4 text-muted-foreground" /> Fecha de Nacimiento
                            </Label>
                            <Input
                                id="birth_date"
                                name="birth_date"
                                type="date"
                                defaultValue={player.birth_date ? new Date(player.birth_date).toISOString().split('T')[0] : ""}
                                className="h-12 text-lg"
                            />
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Sección 3: Datos de Origen */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <Globe className="w-4 h-4" /> Datos de Origen
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <Label htmlFor="nationality" className="flex items-center gap-2 text-base">
                            <FileText className="w-4 h-4 text-muted-foreground" /> Nacionalidad
                            </Label>
                            <Input
                                id="nationality"
                                name="nationality"
                                type="text"
                                defaultValue={player.nationality || ""}
                                className="h-12 text-lg"
                                placeholder="Ej: Argentina"
                            />
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="passport_origin" className="flex items-center gap-2 text-base">
                            <Globe className="w-4 h-4 text-muted-foreground" /> Pasaporte (Origen/Emisión)
                            </Label>
                            <Input
                                id="passport_origin"
                                name="passport_origin"
                                type="text"
                                defaultValue={player.passport_origin || ""}
                                className="h-12 text-lg"
                                placeholder="Ej: Renovado en Italia"
                            />
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="province" className="flex items-center gap-2 text-base">
                            <MapPin className="w-4 h-4 text-muted-foreground" /> Provincia
                            </Label>
                            <Input
                                id="province"
                                name="province"
                                type="text"
                                defaultValue={player.province || ""}
                                className="h-12 text-lg"
                                placeholder="Ej: Santa Fe"
                            />
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Sección 4: Contacto y Domicilio */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> Contacto y Domicilio
                    </h3>
                    <div className="grid grid-cols-1 gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label htmlFor="address" className="flex items-center gap-2 text-base">
                                <MapPin className="w-4 h-4 text-muted-foreground" /> Domicilio Personal
                                </Label>
                                <Input
                                    id="address"
                                    name="address"
                                    type="text"
                                    defaultValue={player.address || ""}
                                    className="h-12 text-lg"
                                    placeholder="Calle y Altura (Origen)"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="rosario_address" className="flex items-center gap-2 text-base">
                                <MapPin className="w-4 h-4 text-muted-foreground" /> Domicilio en Rosario
                                </Label>
                                <Input
                                    id="rosario_address"
                                    name="rosario_address"
                                    type="text"
                                    defaultValue={player.rosario_address || ""}
                                    className="h-12 text-lg"
                                    placeholder="Calle y Altura (Rosario)"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label htmlFor="phone" className="flex items-center gap-2 text-base">
                                <Phone className="w-4 h-4 text-muted-foreground" /> Teléfono Personal
                                </Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    defaultValue={player.phone || ""}
                                    className="h-12 text-lg"
                                    placeholder="+54 9 ..."
                                />
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="parents_phone" className="flex items-center gap-2 text-base">
                                <Phone className="w-4 h-4 text-muted-foreground" /> Teléfono Padres
                                </Label>
                                <Input
                                    id="parents_phone"
                                    name="parents_phone"
                                    type="tel"
                                    defaultValue={player.parents_phone || ""}
                                    className="h-12 text-lg"
                                    placeholder="Teléfono de contacto familiar"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Sección 5: Datos Familiares (Emergencia) */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <Users className="w-4 h-4" /> Datos Familiares
                    </h3>
                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-3">
                            <Label htmlFor="tutor_name" className="flex items-center gap-2 text-base">
                            <User className="w-4 h-4 text-muted-foreground" /> Nombre Padre/Madre/Tutor
                            </Label>
                            <Input
                                id="tutor_name"
                                name="tutor_name"
                                type="text"
                                defaultValue={player.tutor_name || ""}
                                className="h-12 text-lg"
                                placeholder="Nombre completo del familiar"
                            />
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Sección: Datos del Representante */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <Briefcase className="w-4 h-4" /> Datos del Representante
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <Label htmlFor="representative" className="flex items-center gap-2 text-base">
                            <User className="w-4 h-4 text-muted-foreground" /> Nombre y Apellido
                            </Label>
                            <Input
                                id="representative"
                                name="representative"
                                type="text"
                                defaultValue={player.representative || ""}
                                className="h-12 text-lg"
                                placeholder="Nombre completo del representante"
                            />
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="representative_phone" className="flex items-center gap-2 text-base">
                            <Phone className="w-4 h-4 text-muted-foreground" /> Teléfono
                            </Label>
                            <Input
                                id="representative_phone"
                                name="representative_phone"
                                type="tel"
                                defaultValue={player.representative_phone || ""}
                                className="h-12 text-lg"
                                placeholder="+54 9 ..."
                            />
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Sección 6: Datos Médicos (Obra Social) */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <Heart className="w-4 h-4" /> Datos Médicos
                    </h3>
                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-3">
                            <Label htmlFor="health_insurance" className="flex items-center gap-2 text-base">
                            <Heart className="w-4 h-4 text-muted-foreground" /> Obra Social
                            </Label>
                            <Input
                                id="health_insurance"
                                name="health_insurance"
                                type="text"
                                defaultValue={player.health_insurance || ""}
                                className="h-12 text-lg"
                                placeholder="Ej: OSDE, IAPOS"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t sticky bottom-0 bg-background/95 backdrop-blur py-4 z-10">
                  <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-medium px-8 h-11 shadow-lg shadow-red-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                    Guardar Cambios
                  </Button>
                </div>
              </form>
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
                      Para cambios en tu domicilio, contactá a la administración.
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