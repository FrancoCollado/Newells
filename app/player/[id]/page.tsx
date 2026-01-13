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
import {
  ArrowLeft,
  UserIcon,
  Calendar,
  Ruler,
  Weight,
  Target,
  FileText,
  Clock,
  Trophy,
  AlertCircle,
  Edit2,
  Save,
  X,
  Goal,
  Activity,
  Loader2,
  BarChart3,
  Percent,
} from "lucide-react"

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
  const [isEditingAttendance, setIsEditingAttendance] = useState(false)
  const [editedAttendance, setEditedAttendance] = useState("")

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      const playerId = params.id as string

      const [currentUser, foundPlayer, allReports] = await Promise.all([
        getCurrentUser(),
        getPlayerById(playerId),
        getReportsByPlayerId(playerId),
      ])

      if (currentUser) {
        setUser(currentUser)
      }

      if (foundPlayer) {
        setPlayer(foundPlayer)
        setEditedReport(foundPlayer.technicalReport || "")
        setEditedAttendance(foundPlayer.attendancePercentage.toString())
        const sortedReports = allReports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        setRecentReports(sortedReports.slice(0, 5))
      }

      setLoading(false)
    }
    init()
  }, [params.id])

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
            Volver al Dashboard
          </Button>
        </div>
      </AuthGuard>
    )
  }

  const canEdit = user.role === "dirigente" || user.role === "entrenador"
  const canViewIndices = user.role === "dirigente" || user.role === "entrenador"

  return (
    <AuthGuard>
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
            <Button
              variant="ghost"
              onClick={() => router.push("/areas")}
              className="text-white hover:bg-white/20 mb-2 ml-2"
            >
              <Activity className="h-4 w-4 mr-2" />
              Áreas
            </Button>
            <h1 className="text-2xl font-bold">Perfil del Jugador</h1>
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
                      className="mt-4 w-full border-red-700 text-red-700 hover:bg-red-50"
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Índices Individuales
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Información Básica</CardTitle>
                <CardDescription>Datos actuales del jugador</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                    <Calendar className="h-8 w-8 text-red-700 mb-2" />
                    <p className="text-2xl font-bold">{player.age}</p>
                    <p className="text-sm text-muted-foreground">Años</p>
                  </div>

                  <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                    <Ruler className="h-8 w-8 text-red-700 mb-2" />
                    <p className="text-2xl font-bold">{player.height}</p>
                    <p className="text-sm text-muted-foreground">cm</p>
                  </div>

                  <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                    <Weight className="h-8 w-8 text-red-700 mb-2" />
                    <p className="text-2xl font-bold">{player.weight}</p>
                    <p className="text-sm text-muted-foreground">kg</p>
                  </div>

                  <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                    <Target className="h-8 w-8 text-red-700 mb-2" />
                    <p className="text-xl font-bold">{player.position}</p>
                    <p className="text-sm text-muted-foreground">Posición</p>
                  </div>

                  <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                    <Clock className="h-8 w-8 text-red-700 mb-2" />
                    <p className="text-2xl font-bold">{player.minutesPlayed}</p>
                    <p className="text-sm text-muted-foreground">Minutos</p>
                  </div>

                  <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                    <Trophy className="h-8 w-8 text-red-700 mb-2" />
                    <p className="text-2xl font-bold">{player.matchesPlayed}</p>
                    <p className="text-sm text-muted-foreground">Partidos</p>
                  </div>

                  <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                    <Goal className="h-8 w-8 text-red-700 mb-2" />
                    <p className="text-2xl font-bold">{player.goals}</p>
                    <p className="text-sm text-muted-foreground">Goles</p>
                  </div>

                  <div className="flex flex-col items-center p-4 bg-muted rounded-lg relative">
                    <Percent
                      className={`h-8 w-8 mb-2 ${
                        player.attendancePercentage >= 80
                          ? "text-green-600"
                          : player.attendancePercentage >= 60
                            ? "text-yellow-600"
                            : "text-red-600"
                      }`}
                    />
                    {isEditingAttendance ? (
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={editedAttendance}
                          onChange={(e) => setEditedAttendance(e.target.value)}
                          className="w-16 h-8 text-center"
                        />
                        <span className="text-sm">%</span>
                      </div>
                    ) : (
                      <p className="text-2xl font-bold">{player.attendancePercentage}%</p>
                    )}
                    <p className="text-sm text-muted-foreground">Asistencia</p>
                    {canEdit && (
                      <div className="absolute top-2 right-2">
                        {isEditingAttendance ? (
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleSaveAttendance}>
                              <Save className="h-3 w-3" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={handleCancelAttendanceEdit}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => setIsEditingAttendance(true)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                    <AlertCircle className={`h-8 w-8 mb-2 ${player.isInjured ? "text-red-700" : "text-green-600"}`} />
                    <p className="text-xl font-bold">{player.isInjured ? "Lesionado" : "Sano"}</p>
                    <p className="text-sm text-muted-foreground">Estado</p>
                  </div>
                </div>
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

        {showIndicesModal && user && player && (
          <PlayerIndicesManager
            playerId={player.id}
            playerName={player.name}
            userId={user.id}
            onClose={() => setShowIndicesModal(false)}
          />
        )}
      </div>
    </AuthGuard>
  )
}
