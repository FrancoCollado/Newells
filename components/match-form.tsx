"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, type User } from "@/lib/auth"
import { getDivisionLabel, type Division, type Player, getPlayers } from "@/lib/players"
import { saveMatch, generateMatchId, updateMatch, type Match, uploadMatchAttachment } from "@/lib/matches"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Upload, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { LeagueType } from "@/lib/players"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface MatchFormProps {
  division: Division
  initialMatch?: Match
  user: User
  onSuccess?: () => void
}

export function MatchForm({ division, initialMatch, user, onSuccess }: MatchFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  
  const [opponent, setOpponent] = useState(initialMatch?.opponent || "")
  const [result, setResult] = useState(initialMatch?.result || "")
  const [date, setDate] = useState(initialMatch?.date || (() => {
    const today = new Date()
    const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split("T")[0]
    return localDate
  }))
  const [videoUrl, setVideoUrl] = useState(initialMatch?.videoUrl || "")
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedPlayers, setSelectedPlayers] = useState<Match['players']>(initialMatch?.players || [])
  const [leagueType, setLeagueType] = useState<LeagueType>(initialMatch?.leagueType || "AFA")
  const [attachments, setAttachments] = useState<NonNullable<Match['attachments']>>(initialMatch?.attachments || [])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      const allPlayers = await getPlayers()
      const divisionPlayers = allPlayers.filter(
        (p) => p.division.includes(division) && (p.leagueTypes?.includes(leagueType) || p.leagueTypes?.length === 0),
      )
      setPlayers(divisionPlayers)
      setLoading(false)
    }
    init()
  }, [division, leagueType])

  const handlePlayerToggle = (player: Player) => {
    const exists = selectedPlayers.find((p) => p.playerId === player.id)
    if (exists) {
      setSelectedPlayers(selectedPlayers.filter((p) => p.playerId !== player.id))
    } else {
      setSelectedPlayers([
        ...selectedPlayers,
        {
          playerId: player.id,
          playerName: player.name,
          minutesPlayed: 0,
          wasInjured: false,
          goals: 0,
          goalsAgainst: 0,
        },
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    for (const file of Array.from(files)) {
      try {
        const placeholderId = Math.random().toString(36).substr(2, 9)
        
        setAttachments((prev) => [
          ...prev,
          {
            id: placeholderId,
            name: file.name + " (subiendo...)",
            type: file.type || "application/octet-stream",
            url: "",
          },
        ])

        const uploadedAttachment = await uploadMatchAttachment(file)

        setAttachments((prev) => {
          return prev.map((att) =>
            att.id === placeholderId ? uploadedAttachment : att
          )
        })

        toast({
          title: "Archivo subido",
          description: `${file.name} adjuntado correctamente`,
        })
      } catch (error) {
        console.error("Error uploading file:", error)
        setAttachments((prev) =>
          prev.filter((att) => !att.name.includes("(subiendo...)"))
        )
        toast({
          title: "Error",
          description: `No se pudo subir ${file.name}`,
          variant: "destructive",
        })
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
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
      const matchData: Match = {
        id: initialMatch?.id || generateMatchId(),
        division,
        date,
        opponent,
        result,
        players: selectedPlayers,
        createdBy: initialMatch?.createdBy || user.name,
        videoUrl: videoUrl || undefined,
        leagueType,
        attachments: attachments.length > 0 ? attachments : undefined,
      }

      if (initialMatch) {
        await updateMatch(matchData)
        toast({
          title: "Partido actualizado",
          description: "Los datos del partido han sido modificados exitosamente",
        })
      } else {
        await saveMatch(matchData)
        toast({
          title: "Partido guardado",
          description: "El partido y las estadísticas han sido actualizadas",
        })
      }

      if (onSuccess) {
        onSuccess()
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: `Hubo un error al ${initialMatch ? 'actualizar' : 'guardar'} el partido`,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading && !players.length) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-red-700" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Información del Partido</CardTitle>
          <CardDescription>Complete los datos del partido jugado</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
            <Label htmlFor="leagueType" className="text-red-900 font-semibold">
              Tipo de Liga *
            </Label>
            <Select value={leagueType} onValueChange={(v) => setLeagueType(v as LeagueType)} disabled={!!initialMatch}>
              <SelectTrigger className="border-red-300">
                <SelectValue placeholder="Seleccione tipo de liga" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AFA">AFA</SelectItem>
                <SelectItem value="ROSARINA">ROSARINA</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-red-700">
              {initialMatch 
                ? "El tipo de liga no se puede modificar en la edición." 
                : "Seleccione la liga en la que se jugó este partido. Las estadísticas se registrarán para esa liga específica."}
            </p>
          </div>

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
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Adjuntos (opcional)
            </Label>
            <Input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileChange}
              className="w-full p-2 border rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
            />
            {attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded border">
                    <span className="truncate max-w-[300px]">{attachment.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setAttachments(prev => prev.filter(a => a.id !== attachment.id))}
                      className="text-red-600 hover:text-red-800 h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
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
                        <Label htmlFor={`injury-${player.id}`} className="text-sm cursor-pointer whitespace-nowrap">
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

          <div className="mt-6 flex justify-end gap-3">
             <Button type="button" variant="outline" onClick={() => router.back()}>
               Cancelar
             </Button>
            <Button type="submit" className="bg-red-700 hover:bg-red-800" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {saving ? "Guardando..." : initialMatch ? "Actualizar Partido" : "Guardar Partido"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
