"use client"

import { useState, useEffect } from "react"
import { getPlayers, type Player, type Position } from "@/lib/players"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Save, Users, Loader2, Trash2, FolderOpen } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { 
  saveFormation, 
  getFormations, 
  deleteFormation, 
  type Formation, 
  type FormationType, 
  type FormationPlayer 
} from "@/lib/formations"
import { getCurrentUser, type User } from "@/lib/auth"

const FORMATIONS: Record<FormationType, { name: string; positions: Position[] }> = {
  "4-3-3": {
    name: "4-3-3",
    positions: [
      "Arquero",
      "Defensor",
      "Defensor",
      "Defensor",
      "Defensor",
      "Mediocampista",
      "Mediocampista",
      "Mediocampista",
      "Delantero",
      "Delantero",
      "Delantero",
    ],
  },
  "4-4-2": {
    name: "4-4-2",
    positions: [
      "Arquero",
      "Defensor",
      "Defensor",
      "Defensor",
      "Defensor",
      "Mediocampista",
      "Mediocampista",
      "Mediocampista",
      "Mediocampista",
      "Delantero",
      "Delantero",
    ],
  },
  "3-5-2": {
    name: "3-5-2",
    positions: [
      "Arquero",
      "Defensor",
      "Defensor",
      "Defensor",
      "Mediocampista",
      "Mediocampista",
      "Mediocampista",
      "Mediocampista",
      "Mediocampista",
      "Delantero",
      "Delantero",
    ],
  },
  "4-2-3-1": {
    name: "4-2-3-1",
    positions: [
      "Arquero",
      "Defensor",
      "Defensor",
      "Defensor",
      "Defensor",
      "Mediocampista",
      "Mediocampista",
      "Mediocampista",
      "Mediocampista",
      "Mediocampista",
      "Delantero",
    ],
  },
  "5-3-2": {
    name: "5-3-2",
    positions: [
      "Arquero",
      "Defensor",
      "Defensor",
      "Defensor",
      "Defensor",
      "Defensor",
      "Mediocampista",
      "Mediocampista",
      "Mediocampista",
      "Delantero",
      "Delantero",
    ],
  },
}

export function FormationsManager() {
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [selectedFormationType, setSelectedFormationType] = useState<FormationType>("4-3-3")
  const [formationName, setFormationName] = useState("")
  const [selectedPlayers, setSelectedPlayers] = useState<FormationPlayer[]>([])
  const [savedFormations, setSavedFormations] = useState<Formation[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const init = async () => {
        setLoading(true)
        const currentUser = await getCurrentUser()
        setUser(currentUser)

        const allPlayers = await getPlayers()
        // Filtrar por 1era local o reserva para el equipo principal, o mostrar todos
        const teamPlayers = allPlayers.filter((p) => p.division.includes("1eralocal") || p.division.includes("reserva"))
        setPlayers(teamPlayers.length > 0 ? teamPlayers : allPlayers)

        const formations = await getFormations()
        setSavedFormations(formations)
        
        setLoading(false)
    }
    init()
  }, [])

  const handlePositionChange = (index: number, playerId: string) => {
    const formationDef = FORMATIONS[selectedFormationType]
    const position = formationDef.positions[index]

    const newSelectedPlayers = [...selectedPlayers]
    // Filter out previous entry for this index if exists
    const filtered = newSelectedPlayers.filter(p => p.index !== index)
    
    filtered.push({ playerId, position, index })
    setSelectedPlayers(filtered)
  }

  const handleFormationTypeChange = (type: FormationType) => {
    setSelectedFormationType(type)
    setSelectedPlayers([]) // Reset players on formation change
  }

  const handleSave = async () => {
    const formationDef = FORMATIONS[selectedFormationType]
    
    if (!formationName.trim()) {
        toast({ title: "Error", description: "Ingrese un nombre para la formación", variant: "destructive" })
        return
    }

    if (selectedPlayers.length < formationDef.positions.length) {
      toast({
        title: "Formación incompleta",
        description: "Debe asignar todos los jugadores a la formación",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    const newFormation = await saveFormation({
        name: formationName,
        formationType: selectedFormationType,
        players: selectedPlayers,
        createdBy: user?.name
    })

    if (newFormation) {
        setSavedFormations([newFormation, ...savedFormations])
        setFormationName("")
        toast({ title: "Formación guardada", description: "La formación ha sido guardada correctamente" })
    } else {
        toast({ title: "Error", description: "No se pudo guardar la formación", variant: "destructive" })
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
      const success = await deleteFormation(id)
      if (success) {
          setSavedFormations(savedFormations.filter(f => f.id !== id))
          toast({ title: "Eliminado", description: "Formación eliminada" })
      }
  }

  const loadFormation = (formation: Formation) => {
      setSelectedFormationType(formation.formationType)
      setFormationName(formation.name)
      setSelectedPlayers(formation.players)
      toast({ title: "Cargada", description: `Formación "${formation.name}" cargada` })
  }

  if (loading) {
     return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-red-700" /></div>
  }

  const formationDef = FORMATIONS[selectedFormationType]

  return (
    <div className="space-y-8">
      {/* Formation Editor */}
      <div className="space-y-6">
        <div className="flex items-end gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px] space-y-2">
            <Label>Tipo de Formación</Label>
            <Select value={selectedFormationType} onValueChange={(value: FormationType) => handleFormationTypeChange(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4-3-3">4-3-3 (Ataque)</SelectItem>
                <SelectItem value="4-4-2">4-4-2 (Clásico)</SelectItem>
                <SelectItem value="3-5-2">3-5-2 (Control)</SelectItem>
                <SelectItem value="4-2-3-1">4-2-3-1 (Equilibrado)</SelectItem>
                <SelectItem value="5-3-2">5-3-2 (Defensivo)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-w-[200px] space-y-2">
            <Label>Nombre de la Táctica</Label>
            <Input 
                placeholder="Ej: Titulares vs Central" 
                value={formationName} 
                onChange={(e) => setFormationName(e.target.value)} 
            />
          </div>
          <Button onClick={handleSave} className="bg-red-700 hover:bg-red-800" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Guardar
          </Button>
        </div>

        {/* Visual Field */}
        <Card className="bg-gradient-to-b from-green-600 to-green-700 border-0">
          <CardContent className="p-8">
            <div className="space-y-4">
              <div className="text-center mb-6">
                <Badge className="bg-white text-green-800 text-lg px-4 py-2">{formationDef.name}</Badge>
              </div>

              {/* Field Rows */}
              <div className="space-y-4">
                {formationDef.positions.map((position, index) => {
                    const assigned = selectedPlayers.find(p => p.index === index)
                    return (
                        <div key={index} className="flex items-center gap-4">
                        <div className="w-32 flex-shrink-0">
                            <Badge variant="secondary" className="w-full justify-center">
                            {position} {index + 1}
                            </Badge>
                        </div>
                        <Select
                            value={assigned?.playerId || ""}
                            onValueChange={(value) => handlePositionChange(index, value)}
                        >
                            <SelectTrigger className="bg-white w-full">
                            <SelectValue placeholder="Seleccionar jugador" />
                            </SelectTrigger>
                            <SelectContent>
                            {players
                                .filter((p) => p.position === position) // Filter by position
                                .map((player) => (
                                <SelectItem key={player.id} value={player.id}>
                                    {player.name}
                                </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        </div>
                    )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Saved Formations List */}
      <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  Formaciones Guardadas
              </CardTitle>
          </CardHeader>
          <CardContent>
              {savedFormations.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No hay formaciones guardadas</p>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {savedFormations.map((formation) => (
                          <div key={formation.id} className="border rounded-lg p-4 flex flex-col gap-2 bg-muted/20">
                              <div className="flex justify-between items-start">
                                  <div>
                                      <h4 className="font-bold">{formation.name}</h4>
                                      <Badge variant="outline" className="mt-1">{formation.formationType}</Badge>
                                  </div>
                                  <Button variant="ghost" size="icon" onClick={() => handleDelete(formation.id)} className="text-destructive hover:bg-destructive/10">
                                      <Trash2 className="h-4 w-4" />
                                  </Button>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                  Creado por: {formation.createdBy || "Desconocido"}
                              </div>
                              <Button variant="secondary" size="sm" onClick={() => loadFormation(formation)} className="mt-2">
                                  Cargar Táctica
                              </Button>
                          </div>
                      ))}
                  </div>
              )}
          </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">
              Jugadores Asignados: {selectedPlayers.length} / {formationDef.positions.length}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedPlayers.map((sp, index) => {
              const player = players.find((p) => p.id === sp.playerId)
              const playerName = player ? player.name : "Jugador no disponible (Eliminado)"
              const isMissing = !player

              return (
                <div key={index} className={`flex items-center gap-3 p-3 rounded-lg ${isMissing ? "bg-red-50 border border-red-200" : "bg-muted"}`}>
                  <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${isMissing ? "text-red-600 italic" : ""}`}>{playerName}</p>
                    <p className="text-sm text-muted-foreground">{sp.position}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
