"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { getCurrentUser, type User } from "@/lib/auth"
import {
  getPlayerById,
  getDivisionLabel,
  updatePlayerTechnicalReport,
  updatePlayerAttendance,
  updatePlayerPhysicalData,
  type Player,
} from "@/lib/players"
import { getReportsByPlayerId, type Report } from "@/lib/reports"
import { ReportCard } from "@/components/report-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { PlayerIndicesManager } from "@/components/player-indices-manager"
import { useToast } from "@/hooks/use-toast"
import { ExtendedPlayerDataDialog } from "@/components/extended-player-data-dialog"
import { PlayerObservationsDialog } from "@/components/player-observations-dialog"
import { PlayerLeagueStatsTabs } from "@/components/player-league-stats-tabs"
import {
  ArrowLeft,
  UserIcon,
  FileText,
  AlertCircle,
  Edit2,
  Save,
  X,
  Activity,
  Loader2,
  BarChart3,
  ClipboardList,
  RefreshCw,
  Stethoscope,
} from "lucide-react"
import { hasPermission } from "@/lib/rbac" // Importar función para verificar permisos

export default function PlayerDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [player, setPlayer] = useState<Player | null>(null)
  const [recentReports, setRecentReports] = useState<Report[]>([])
  const [isEditingReport, setIsEditingReport] = useState(false)
  const [editedReport, setEditedReport] = useState("")
  const [loading, setLoading] = useState(true)
  const [showIndicesModal, setShowIndicesModal] = useState(false)
  const [isEditingPhysicalData, setIsEditingPhysicalData] = useState(false)
  const [editedAge, setEditedAge] = useState("")
  const [editedWeight, setEditedWeight] = useState("")
  const [editedHeight, setEditedHeight] = useState("")
  const [editedAttendance, setEditedAttendance] = useState("")
  const [isEditingAttendance, setIsEditingAttendance] = useState(false)
  const [showExtendedData, setShowExtendedData] = useState(false)
  const [showObservations, setShowObservations] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadPlayerData = async (playerId: string) => {
    console.log("[v0] Loading player data for ID:", playerId)

    const [currentUser, foundPlayer, allReports] = await Promise.all([
      getCurrentUser(),
      getPlayerById(playerId),
      getReportsByPlayerId(playerId),
    ])

    if (currentUser) {
      setUser(currentUser)
    }

    if (foundPlayer) {
      console.log("[v0] Player loaded:", {
        name: foundPlayer.name,
        age: foundPlayer.age,
        height: foundPlayer.height,
        weight: foundPlayer.weight,
        leagueStatsCount: foundPlayer.leagueStats?.length || 0,
        leagueStats: foundPlayer.leagueStats,
      })

      setPlayer(foundPlayer)
      setEditedReport(foundPlayer.technicalReport || "")
      setEditedAttendance(foundPlayer.attendancePercentage.toString())
      setEditedAge(foundPlayer.age.toString())
      setEditedWeight(foundPlayer.weight.toString())
      setEditedHeight(foundPlayer.height.toString())
      const sortedReports = allReports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setRecentReports(sortedReports.slice(0, 5))
    }
  }

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      const playerId = params.id as string
      await loadPlayerData(playerId)
      setLoading(false)
    }
    init()
  }, [params.id])

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!document.hidden && params.id) {
        console.log("[v0] Page became visible, refreshing player data...")
        await loadPlayerData(params.id as string)
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [params.id])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    const playerId = params.id as string
    await loadPlayerData(playerId)
    setIsRefreshing(false)
    toast({
      title: "Datos actualizados",
      description: "Las estadísticas del jugador se han actualizado correctamente",
    })
  }

  const handleCancelEdit = () => {
    setIsEditingReport(false)
    setEditedReport(player?.technicalReport || "")
  }

  const handleSaveReport = async () => {
    if (!player) return

    const updatedPlayer = { ...player, technicalReport: editedReport }
    setPlayer(updatedPlayer)
    setIsEditingReport(false)

    await updatePlayerTechnicalReport(player.id, editedReport)
  }

  const handleSaveAttendance = async () => {
    if (!player) return

    const value = Number.parseFloat(editedAttendance)

    if (isNaN(value) || value < 0 || value > 100) {
      toast({
        title: "Error",
        description: "El porcentaje debe estar entre 0 y 100",
        variant: "destructive",
      })
      return
    }

    const success = await updatePlayerAttendance(player.id, value)

    if (success) {
      setPlayer({ ...player, attendancePercentage: value })
      setIsEditingAttendance(false)
      toast({
        title: "Asistencia actualizada",
        description: "El porcentaje de asistencia se actualizó correctamente",
      })
    } else {
      toast({
        title: "Error",
        description: "No se pudo actualizar el porcentaje",
        variant: "destructive",
      })
    }
  }

  const handleCancelAttendanceEdit = () => {
    setIsEditingAttendance(false)
    setEditedAttendance(player?.attendancePercentage.toString() || "100")
  }

  const handleSavePhysicalData = async () => {
    if (!player) return

    const age = Number.parseInt(editedAge)
    const weight = Number.parseFloat(editedWeight)
    const height = Number.parseFloat(editedHeight)

    console.log("[v0] Saving physical data:", { age, weight, height })

    if (isNaN(age) || age < 1 || age > 100) {
      toast({
        title: "Error",
        description: "La edad debe estar entre 1 y 100 años",
        variant: "destructive",
      })
      return
    }

    if (isNaN(weight) || weight < 1 || weight > 200) {
      toast({
        title: "Error",
        description: "El peso debe estar entre 1 y 200 kg",
        variant: "destructive",
      })
      return
    }

    if (isNaN(height) || height < 50 || height > 250) {
      toast({
        title: "Error",
        description: "La altura debe estar entre 50 y 250 cm",
        variant: "destructive",
      })
      return
    }

    const success = await updatePlayerPhysicalData(player.id, age, weight, height)

    if (success) {
      setPlayer({ ...player, age, weight, height })
      setIsEditingPhysicalData(false)
      console.log("[v0] Physical data updated successfully")
      toast({
        title: "Datos actualizados",
        description: "Los datos físicos se actualizaron correctamente",
      })
    } else {
      console.error("[v0] Failed to update physical data")
      toast({
        title: "Error",
        description: "No se pudieron actualizar los datos",
        variant: "destructive",
      })
    }
  }

  const handleCancelPhysicalDataEdit = () => {
    setIsEditingPhysicalData(false)
    if (player) {
      setEditedAge(player.age.toString())
      setEditedWeight(player.weight.toString())
      setEditedHeight(player.height.toString())
    }
  }

  const handleUpdateObservations = (observations: string) => {
    if (player) {
      setPlayer({ ...player, observations })
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-red-700" />
      </div>
    )
  }

  if (!user) return null

  if (!player) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h1 className="text-xl font-bold mb-2">Jugador no encontrado</h1>
          <p className="text-muted-foreground mb-4">El jugador que buscas no existe o ha sido eliminado.</p>
          <Button onClick={() => router.push("/dashboard")} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Inicio
          </Button>
        </div>
      </AuthGuard>
    )
  }

  const canEdit = user.role === "dirigente" || user.role === "entrenador"
  const canViewIndices =
    user.role === "dirigente" ||
    user.role === "entrenador" ||
    user.role === "medico" ||
    user.role === "nutricionista" ||
    user.role === "kinesiologo" ||
    user.role === "fisioterapeuta" ||
    user.role === "psicologo"
  const canEditPhysicalData = hasPermission(user.role, "edit_player_physical_data")
  const canViewExtendedData = user.role === "dirigente" || user.role === "administrador"
  const canViewObservations = user.role === "dirigente" || user.role === "entrenador" || user.role === "administrador"
  const hasObservations = player.observations && player.observations.trim().length > 0
  const canViewMedicalRecord = hasPermission(user.role, "view_medical_records")

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <header className="border-b bg-gradient-to-r from-red-700 to-black text-white">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => router.push("/dashboard")}
                  className="text-white hover:bg-white/20"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al Inicio
                </Button>
                <Button variant="ghost" onClick={() => router.push("/areas")} className="text-white hover:bg-white/20">
                  <Activity className="h-4 w-4 mr-2" />
                  Áreas
                </Button>
              </div>
              <Button
                variant="ghost"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="text-white hover:bg-white/20"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                {isRefreshing ? "Actualizando..." : "Actualizar Estadísticas"}
              </Button>
            </div>
            <h1 className="text-2xl font-bold mt-2">Perfil del Jugador</h1>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-1">
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <div className="h-32 w-32 rounded-full bg-red-100 flex items-center justify-center mb-4">
                    <UserIcon className="h-16 w-16 text-red-700" />
                  </div>
                  <h2 className="text-2xl font-bold text-center mb-2">{player.name}</h2>
                  <Badge className="mb-4">{getDivisionLabel(player.division)}</Badge>
                  <Badge variant="outline" className="mb-2">
                    {player.position}
                  </Badge>
                  {player.isInjured && (
                    <Badge variant="destructive" className="mt-2">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Lesionado
                    </Badge>
                  )}

                  {canViewIndices && (
                    <Button
                      onClick={() => setShowIndicesModal(true)}
                      variant="outline"
                      className="mt-4 w-full border-red-700 text-red-700 bg-red-50 hover:bg-red-100"
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Índices Individuales
                    </Button>
                  )}

                  {canViewMedicalRecord && (
                    <Button
                      onClick={() => router.push(`/player/${player.id}/medical-record`)}
                      className="mt-3 w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <Stethoscope className="h-4 w-4 mr-2" />
                      Historia Clínica
                    </Button>
                  )}

                  {canViewMedicalRecord && (
                    <Button
                      onClick={() => router.push(`/player/${player.id}/injuries`)}
                      className="mt-3 w-full bg-orange-600 hover:bg-orange-700"
                    >
                      <Activity className="h-4 w-4 mr-2" />
                      Lesiones y enfermedades
                    </Button>
                  )}

                  {canViewExtendedData && (
                    <Button
                      onClick={() => setShowExtendedData(true)}
                      variant="outline"
                      className="mt-2 w-full border-gray-700 text-gray-700 hover:bg-gray-50"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Ver Datos Administrativos
                    </Button>
                  )}

                  {canViewObservations && (
                    <Button
                      onClick={() => setShowObservations(true)}
                      variant="outline"
                      className={`mt-2 w-full ${
                        hasObservations
                          ? "border-green-600 text-green-700 bg-green-50 hover:bg-green-100"
                          : "border-gray-300 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <ClipboardList className="h-4 w-4 mr-2" />
                      Detalles
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Estadísticas del Jugador</CardTitle>
                    <CardDescription>Información básica y estadísticas por liga</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {(user.role === "dirigente" || user.role === "entrenador") && (
                  <div className="mb-6 p-4 bg-muted rounded-lg border-2 border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Activity className="h-6 w-6 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Porcentaje de Asistencia</p>
                          {isEditingAttendance ? (
                            <div className="flex items-center gap-2 mt-1">
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={editedAttendance}
                                onChange={(e) => setEditedAttendance(e.target.value)}
                                className="w-24 h-9 text-lg font-bold"
                              />
                              <span className="text-lg font-bold">%</span>
                            </div>
                          ) : (
                            <p className="text-2xl font-bold text-green-600">{player.attendancePercentage}%</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!isEditingAttendance && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditingAttendance(true)}
                            className="gap-2 border-green-600 text-green-700 hover:bg-green-50"
                          >
                            <Edit2 className="h-4 w-4" />
                            Editar
                          </Button>
                        )}
                        {isEditingAttendance && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleCancelAttendanceEdit}
                              className="gap-2 bg-transparent"
                            >
                              <X className="h-4 w-4" />
                              Cancelar
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={handleSaveAttendance}
                              className="gap-2 bg-green-600 hover:bg-green-700"
                            >
                              <Save className="h-4 w-4" />
                              Guardar
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <PlayerLeagueStatsTabs
                  player={player}
                  canEditPhysicalData={canEditPhysicalData}
                  isEditingPhysicalData={isEditingPhysicalData}
                  editedAge={editedAge}
                  editedWeight={editedWeight}
                  editedHeight={editedHeight}
                  onEditPhysicalData={() => setIsEditingPhysicalData(true)}
                  onSavePhysicalData={handleSavePhysicalData}
                  onCancelPhysicalDataEdit={handleCancelPhysicalDataEdit}
                  onAgeChange={setEditedAge}
                  onWeightChange={setEditedWeight}
                  onHeightChange={setEditedHeight}
                />
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl bg-gradient-to-r from-red-700 to-red-900 bg-clip-text text-transparent">
                    Informe Técnico
                  </CardTitle>
                  <CardDescription>Observaciones importantes del cuerpo técnico</CardDescription>
                </div>
                {canEdit && !isEditingReport && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditingReport(true)} className="gap-2">
                    <Edit2 className="h-4 w-4" />
                    Editar
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isEditingReport ? (
                <div className="space-y-4">
                  <Textarea
                    value={editedReport}
                    onChange={(e) => setEditedReport(e.target.value)}
                    placeholder="Escribe un breve informe técnico del jugador (máximo 2-3 oraciones)..."
                    className="min-h-[120px] resize-none"
                    maxLength={300}
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={handleCancelEdit} className="gap-2 bg-transparent">
                      <X className="h-4 w-4" />
                      Cancelar
                    </Button>
                    <Button size="sm" onClick={handleSaveReport} className="gap-2 bg-red-700 hover:bg-red-800">
                      <Save className="h-4 w-4" />
                      Guardar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-muted p-6 rounded-lg">
                  {player.technicalReport ? (
                    <p className="text-foreground leading-relaxed">{player.technicalReport}</p>
                  ) : (
                    <p className="text-muted-foreground italic">
                      No hay informe técnico registrado para este jugador.
                      {canEdit && " Haz clic en 'Editar' para agregar uno."}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Últimos Informes Profesionales
              </CardTitle>
              <CardDescription>Los últimos 5 informes más recientes de todos los profesionales</CardDescription>
            </CardHeader>
            <CardContent>
              {recentReports.length > 0 ? (
                <div className="space-y-4">
                  {recentReports.map((report) => (
                    <ReportCard key={report.id} report={report} showDownload={user.role === "dirigente"} />
                  ))}

                  <div className="text-center pt-4 border-t">
                    <Button
                      onClick={() => router.push(`/player/${player.id}/reports`)}
                      className="bg-red-700 hover:bg-red-800"
                    >
                      Ver Todos los Informes
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">Aún no hay informes registrados para este jugador</p>
                  {user.role !== "dirigente" && (
                    <Button
                      onClick={() => router.push(`/player/${player.id}/reports/new`)}
                      className="bg-red-700 hover:bg-red-800"
                    >
                      Crear Primer Informe
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </main>

        {showIndicesModal && (
          <PlayerIndicesManager
            playerId={player.id}
            playerName={player.name}
            onClose={() => setShowIndicesModal(false)}
          />
        )}

        {showExtendedData && (
          <ExtendedPlayerDataDialog
            player={player}
            open={showExtendedData}
            onOpenChange={setShowExtendedData}
            onUpdate={(updatedPlayer) => {
              setPlayer(updatedPlayer)
            }}
            readOnly={true}
          />
        )}

        {showObservations && (
          <PlayerObservationsDialog
            player={player}
            open={showObservations}
            onOpenChange={setShowObservations}
            onUpdate={handleUpdateObservations}
            readOnly={false}
          />
        )}
      </div>
    </AuthGuard>
  )
}
