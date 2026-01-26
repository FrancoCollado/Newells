"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { getCurrentUser, logout, type User } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, Loader2, CheckCircle, FileText, Plus } from "lucide-react"
import { hasPermission } from "@/lib/rbac"
import { useToast } from "@/hooks/use-toast"
import { getActiveInjuriesAction, addEvolutionAction, dischargeInjuryAction } from "./actions"
import type { Injury } from "@/lib/injuries"
import { ProfessionalLayout } from "@/components/professional-layout"

type InjuryWithPlayer = Injury & { playerName: string; playerDivision: string }

export default function InjuredPlayersPage() {
  return (
    <AuthGuard>
      <InjuredPlayersContent />
    </AuthGuard>
  )
}

function InjuredPlayersContent() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [injuries, setInjuries] = useState<InjuryWithPlayer[]>([])

  const [selectedInjury, setSelectedInjury] = useState<InjuryWithPlayer | null>(null)
  const [showEvolutionDialog, setShowEvolutionDialog] = useState(false)
  const [evolutionText, setEvolutionText] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      const currentUser = await getCurrentUser()

      if (currentUser) {
        setUser(currentUser)
        await loadInjuries()
      }

      setLoading(false)
    }
    init()
  }, [])

  const loadInjuries = async () => {
    try {
      const data = await getActiveInjuriesAction()
      setInjuries(data)
      console.log("[v0] Lesiones activas cargadas:", data.length)
    } catch (error) {
      console.error("[v0] Error al cargar lesiones:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las lesiones",
        variant: "destructive",
      })
    }
  }

  const handleAddEvolution = async () => {
    if (!selectedInjury || !evolutionText.trim()) return

    setSaving(true)
    try {
      await addEvolutionAction(selectedInjury.id, evolutionText)
      toast({
        title: "Evolución agregada",
        description: "La evolución se guardó exitosamente",
      })
      setEvolutionText("")
      setShowEvolutionDialog(false)
      setSelectedInjury(null)
    } catch (error) {
      console.error("[v0] Error al agregar evolución:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la evolución",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDischarge = async (injury: InjuryWithPlayer) => {
    if (!confirm(`¿Está seguro de dar de alta a ${injury.playerName}? Esto marcará al jugador como no lesionado.`)) {
      return
    }

    try {
      await dischargeInjuryAction(injury.playerId, injury.id)
      toast({
        title: "Alta médica",
        description: `${injury.playerName} ha sido dado de alta`,
      })
      await loadInjuries()
    } catch (error) {
      console.error("[v0] Error al dar de alta:", error)
      toast({
        title: "Error",
        description: "No se pudo dar de alta al jugador",
        variant: "destructive",
      })
    }
  }

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case "leve":
        return "bg-green-100 text-green-800 border-green-300"
      case "moderada":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "severa":
        return "bg-red-100 text-red-800 border-red-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-red-700" />
      </div>
    )
  }

  if (!user || !hasPermission(user.role, "view_injured_players")) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Acceso Denegado</CardTitle>
            <CardDescription>No tiene permisos para ver esta página</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const canManageEvolutions = hasPermission(user.role, "manage_injury_evolutions")

  return (
    <ProfessionalLayout user={user} onLogout={handleLogout}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Jugadores Lesionados</h1>
        <p className="text-muted-foreground">Gestión y seguimiento de lesiones activas</p>
      </div>

        {injuries.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No hay jugadores lesionados</h3>
              <p className="text-muted-foreground">Todos los jugadores están en condiciones de jugar</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">Lesiones Activas</h2>
                <p className="text-muted-foreground">
                  {injuries.length} jugador{injuries.length !== 1 ? "es" : ""} lesionado
                  {injuries.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {injuries.map((injury) => (
              <Card key={injury.id} className="border-l-4 border-l-red-600">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{injury.playerName}</CardTitle>
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          {injury.playerDivision}
                        </Badge>
                        {injury.severity && (
                          <Badge variant="outline" className={getSeverityColor(injury.severity)}>
                            {injury.severity}
                          </Badge>
                        )}
                      </div>
                      <CardDescription>
                        Fecha de lesión: {new Date(injury.injuryDate).toLocaleDateString("es-AR")}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Información de la lesión */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {injury.anatomicalLocation && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Localización</p>
                          <p className="text-base">{injury.anatomicalLocation}</p>
                        </div>
                      )}
                      {injury.clinicalDiagnosis && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Diagnóstico</p>
                          <p className="text-base">{injury.clinicalDiagnosis}</p>
                        </div>
                      )}
                      {injury.daysAbsent && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Días de recuperación</p>
                          <p className="text-base">{injury.daysAbsent} días</p>
                        </div>
                      )}
                      {injury.treatment && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Tratamiento</p>
                          <p className="text-base capitalize">{injury.treatment.replace("_", " ")}</p>
                        </div>
                      )}
                    </div>

                    {/* Observaciones médicas */}
                    {injury.medicalObservations && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Observaciones Médicas</p>
                        <p className="text-sm bg-muted p-3 rounded-md">{injury.medicalObservations}</p>
                      </div>
                    )}

                    {/* Acciones */}
                    <div className="flex gap-2 pt-2">
                      {canManageEvolutions && (
                        <>
                          <Button
                            onClick={() => {
                              setSelectedInjury(injury)
                              setShowEvolutionDialog(true)
                            }}
                            variant="outline"
                            size="sm"
                            className="border-blue-600 text-blue-600 hover:bg-blue-50"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar Evolución
                          </Button>
                          <Button
                            onClick={() => handleDischarge(injury)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Dar de Alta
                          </Button>
                        </>
                      )}
                      <Button
                        onClick={() => router.push(`/player/${injury.playerId}/injuries`)}
                        variant="outline"
                        size="sm"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Ver Historial Completo
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

      {/* Dialog para agregar evolución */}
      <Dialog open={showEvolutionDialog} onOpenChange={setShowEvolutionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Agregar Evolución</DialogTitle>
            <DialogDescription>
              {selectedInjury && `Evolución de la lesión de ${selectedInjury.playerName}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Describa la evolución de la lesión..."
              value={evolutionText}
              onChange={(e) => setEvolutionText(e.target.value)}
              rows={6}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEvolutionDialog(false)
                  setEvolutionText("")
                }}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button onClick={handleAddEvolution} disabled={saving || !evolutionText.trim()}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Guardar Evolución
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </ProfessionalLayout>
  )
}