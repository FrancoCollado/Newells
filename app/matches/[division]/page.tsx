"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { getCurrentUser, type User } from "@/lib/auth"
import { getDivisionLabel, type Division, type Player, getPlayers } from "@/lib/players"
import { saveMatch, generateMatchId } from "@/lib/matches"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save, Upload, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AddMatchPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [opponent, setOpponent] = useState("")
  const [result, setResult] = useState("")
  const [date, setDate] = useState(() => {
    const today = new Date()
    const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split("T")[0]
    return localDate
  })
  const [videoUrl, setVideoUrl] = useState("")
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedPlayers, setSelectedPlayers] = useState<
    { playerId: string; playerName: string; minutesPlayed: number; wasInjured: boolean; goals: number }[]
  >([])

  const division = params.division as Division

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      const currentUser = await getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
      }

      const allPlayers = await getPlayers()
      const divisionPlayers = allPlayers.filter((p) => p.division === division)
      setPlayers(divisionPlayers)
      setLoading(false)
    }
    init()
  }, [division])

  const handlePlayerToggle = (player: Player) => {
    const exists = selectedPlayers.find((p) => p.playerId === player.id)
    if (exists) {
      setSelectedPlayers(selectedPlayers.filter((p) => p.playerId !== player.id))
    } else {
      setSelectedPlayers([
        ...selectedPlayers,
        { playerId: player.id, playerName: player.name, minutesPlayed: 0, wasInjured: false, goals: 0 },
      ])
    }
  }

  const handleMinutesChange = (playerId: string, minutes: string) => {
    setSelectedPlayers(
      selectedPlayers.map((p) =>
        p.playerId === playerId ? { ...p, minutesPlayed: Number.parseInt(minutes) || 0 } : p,
      ),
    )
  }

  const handleGoalsChange = (playerId: string, goals: string) => {
    setSelectedPlayers(
      selectedPlayers.map((p) => (p.playerId === playerId ? { ...p, goals: Number.parseInt(goals) || 0 } : p)),
    )
  }

  const handleInjuryToggle = (playerId: string) => {
    setSelectedPlayers(selectedPlayers.map((p) => (p.playerId === playerId ? { ...p, wasInjured: !p.wasInjured } : p)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!opponent || !result || selectedPlayers.length === 0) {
      toast({
        title: "Error",
        description: "Complete todos los campos y seleccione al menos un jugador",
        variant: "destructive",
      })
      return
    }

    setSaving(true)

    try {
      const match = {
        id: generateMatchId(),
        division,
        date,
        opponent,
        result,
        players: selectedPlayers,
        createdBy: user?.name ?? "Usuario",
        videoUrl: videoUrl || undefined,
      }

      // Save match AND update stats (handled internally by saveMatch)
      await saveMatch(match)

      toast({
        title: "Partido guardado",
        description: "El partido y las estadísticas han sido actualizadas",
      })

      router.push("/dashboard")
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Hubo un error al guardar el partido",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
     return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-red-700" /></div>
  }

  if (!user || (user.role !== "dirigente" && user.role !== "entrenador")) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-gradient-to-r from-red-700 to-black text-white">
        <div className="container mx-auto px-4 py-4">
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard")}
              className="text-white hover:bg-white/20 mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Dashboard
            </Button>
            <h1 className="text-2xl font-bold">Cargar Partido - {getDivisionLabel(division)}</h1>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <form onSubmit={handleSubmit}>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Información del Partido</CardTitle>
                <CardDescription>Complete los datos del partido jugado</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Fecha</Label>
                    <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="opponent">Rival</Label>
                    <Input
                      id="opponent"
                      placeholder="Ej: Rosario Central"
                      value={opponent}
                      onChange={(e) => setOpponent(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="result">Resultado</Label>
                    <Input
                      id="result"
                      placeholder="Ej: 3-1"
                      value={result}
                      onChange={(e) => setResult(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="videoUrl" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Video del Partido (opcional)
                  </Label>
                  <Input
                    id="videoUrl"
                    type="url"
                    placeholder="Ej: https://youtube.com/watch?v=... o https://vimeo.com/..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Ingrese la URL del video del partido (YouTube, Vimeo, etc.)
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Jugadores que Participaron</CardTitle>
                <CardDescription>Seleccione los jugadores y registre sus minutos jugados y goles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {players.map((player) => {
                    const selected = selectedPlayers.find((p) => p.playerId === player.id)
                    return (
                      <div key={player.id} className="flex items-center gap-4 p-4 border rounded-lg flex-wrap">
                        <Checkbox
                          checked={!!selected}
                          onCheckedChange={() => handlePlayerToggle(player)}
                          id={`player-${player.id}`}
                        />
                        <Label
                          htmlFor={`player-${player.id}`}
                          className="flex-1 cursor-pointer font-medium min-w-[200px]"
                        >
                          {player.name} - {player.position}
                        </Label>

                        {selected && (
                          <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-2">
                              <Label htmlFor={`minutes-${player.id}`} className="text-sm whitespace-nowrap">
                                Minutos:
                              </Label>
                              <Input
                                id={`minutes-${player.id}`}
                                type="number"
                                min="0"
                                max="90"
                                placeholder="0"
                                className="w-20"
                                value={selected.minutesPlayed || ""}
                                onChange={(e) => handleMinutesChange(player.id, e.target.value)}
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              <Label htmlFor={`goals-${player.id}`} className="text-sm whitespace-nowrap">
                                Goles:
                              </Label>
                              <Input
                                id={`goals-${player.id}`}
                                type="number"
                                min="0"
                                max="20"
                                placeholder="0"
                                className="w-16"
                                value={selected.goals || ""}
                                onChange={(e) => handleGoalsChange(player.id, e.target.value)}
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={selected.wasInjured}
                                onCheckedChange={() => handleInjuryToggle(player.id)}
                                id={`injury-${player.id}`}
                              />
                              <Label
                                htmlFor={`injury-${player.id}`}
                                className="text-sm cursor-pointer whitespace-nowrap"
                              >
                                Lesionado
                              </Label>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {players.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No hay jugadores en esta división</p>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <Button type="submit" className="bg-red-700 hover:bg-red-800" disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {saving ? "Guardando..." : "Guardar Partido"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </main>
      </div>
  )
}
