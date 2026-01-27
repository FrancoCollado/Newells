"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check, Loader2, Megaphone, Search, X } from "lucide-react"
import { createAnnouncementAction, searchPlayersAction } from "./announcement-actions"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"

import { add } from "date-fns"

const DIVISIONS = ["Todas", "Primera", "Reserva", "4ta", "5ta", "6ta", "7ma", "8va", "9na", "10ma"]

interface CreateAnnouncementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateAnnouncementDialog({ open, onOpenChange, onSuccess }: CreateAnnouncementDialogProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [targetType, setTargetType] = useState<"division" | "player">("division")
  const [duration, setDuration] = useState("1w")
  
  // Selection State
  const [selectedDivision, setSelectedDivision] = useState<string>("")
  const [selectedPlayers, setSelectedPlayers] = useState<{id: string, name: string}[]>([])
  
  // Player Search State
  const [query, setQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)

  const [isPending, startTransition] = useTransition()

  const handleSearch = async (val: string) => {
    setQuery(val)
    if (val.length < 2) {
      setSearchResults([])
      return
    }
    setSearching(true)
    const res = await searchPlayersAction(val)
    setSearchResults(res)
    setSearching(false)
  }

  const addPlayer = (p: any) => {
    if (!selectedPlayers.find(sp => sp.id === p.id)) {
      setSelectedPlayers([...selectedPlayers, { id: p.id, name: p.name }])
    }
    setQuery("")
    setSearchResults([])
  }

  const removePlayer = (id: string) => {
    setSelectedPlayers(selectedPlayers.filter(p => p.id !== id))
  }

  const handleSubmit = () => {
    if (!title || !content) return
    if (targetType === "division" && !selectedDivision) return
    if (targetType === "player" && selectedPlayers.length === 0) return

    // Calculate Expiration
    let expiresAt = null
    const now = new Date()
    
    switch (duration) {
      case '24h': expiresAt = add(now, { hours: 24 }).toISOString(); break;
      case '3d': expiresAt = add(now, { days: 3 }).toISOString(); break;
      case '1w': expiresAt = add(now, { weeks: 1 }).toISOString(); break;
      case '1m': expiresAt = add(now, { months: 1 }).toISOString(); break;
      case 'never': expiresAt = null; break;
    }

    startTransition(async () => {
      const targets = targetType === "division" 
        ? [{ type: "division" as const, value: selectedDivision }]
        : selectedPlayers.map(p => ({ type: "player" as const, value: p.id }))

      await createAnnouncementAction({
        title,
        content,
        expiresAt,
        targets
      })
      onSuccess()
      onOpenChange(false)
      // Reset form
      setTitle("")
      setContent("")
      setSelectedPlayers([])
      setSelectedDivision("")
      setDuration("1w")
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Crear Comunicado</DialogTitle>
          <DialogDescription>
            Envía anuncios importantes a divisiones enteras o jugadores específicos.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Título</Label>
            <Input 
              placeholder="Ej: Cambio de horario entrenamiento" 
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label>Duración</Label>
                <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="24h">24 Horas</SelectItem>
                    <SelectItem value="3d">3 Días</SelectItem>
                    <SelectItem value="1w">1 Semana</SelectItem>
                    <SelectItem value="1m">1 Mes</SelectItem>
                    <SelectItem value="never">Permanente</SelectItem>
                </SelectContent>
                </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Contenido</Label>
            <Textarea 
              placeholder="Escribe el mensaje aquí..." 
              className="min-h-[100px]"
              value={content}
              onChange={e => setContent(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Destinatarios</Label>
            <Tabs defaultValue="division" value={targetType} onValueChange={(v) => setTargetType(v as any)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="division">Por División</TabsTrigger>
                <TabsTrigger value="player">Jugadores Específicos</TabsTrigger>
              </TabsList>
              
              <TabsContent value="division" className="pt-2">
                <Select value={selectedDivision} onValueChange={setSelectedDivision}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar división" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIVISIONS.map(d => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TabsContent>
              
              <TabsContent value="player" className="pt-2 space-y-3">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar jugador..." 
                    className="pl-8" 
                    value={query}
                    onChange={e => handleSearch(e.target.value)}
                  />
                  
                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <>
                        <div 
                            className="fixed inset-0 z-40" 
                            onClick={() => setSearchResults([])} 
                        />
                        <div className="absolute top-full mt-1 left-0 w-full border rounded-md shadow-lg max-h-40 overflow-y-auto bg-popover z-50">
                        {searchResults.map(p => (
                            <div 
                            key={p.id} 
                            className="flex items-center gap-2 p-2 hover:bg-muted cursor-pointer transition-colors"
                            onClick={() => addPlayer(p)}
                            >
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={p.photo} />
                                <AvatarFallback>{p.name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm truncate">{p.name}</span>
                            <Badge variant="secondary" className="ml-auto text-[10px]">{p.division}</Badge>
                            </div>
                        ))}
                        </div>
                    </>
                  )}
                </div>

                {/* Selected List */}
                {selectedPlayers.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedPlayers.map(p => (
                      <Badge key={p.id} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
                        {p.name}
                        <button onClick={() => removePlayer(p.id)} className="hover:bg-muted rounded-full p-0.5">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isPending || !title || !content}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enviar Comunicado
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
