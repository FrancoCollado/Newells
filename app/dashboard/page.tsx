"use client"

import type React from "react"
import { Suspense } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useSearchParams } from "next/navigation"
import { Match } from "@/lib/matches" // Import Match type

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, logout, getRoleLabel, type User } from "@/lib/auth"
import { uploadTrainingAttachment, getTrainings, saveTraining, getTrainingsByDivision, deleteTraining, updateTraining, type Training } from "@/lib/trainings"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlayersList } from "@/components/players-list"
import type { Division, LeagueType } from "@/lib/players"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import {
  LogOut,
  Users,
  Activity,
  FileText,
  Settings,
  PlusCircle,
  Dumbbell,
  X,
  Video,
  Loader2,
  BarChart3,
  Stethoscope,
  Upload,
  MessageSquare,
  HeartPulse,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { getMatchesByDivision } from "@/lib/matches"
import { getDivisionLabel, getPlayers } from "@/lib/players"
import { hasPermission } from "@/lib/rbac"
import { IndicesManager } from "@/components/indices-manager"
import { CaptacionManager } from "@/components/captacion-manager"
import { LeagueTypeFilter } from "@/components/league-type-filter"
import { ReadaptacionManager } from "@/components/readaptacion-manager"
import { ProfessionalLayout } from "@/components/professional-layout"

const Loading = () => null;

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [selectedDivision, setSelectedDivision] = useState<Division | "all">("all")
  const [selectedLeagueType, setSelectedLeagueType] = useState<LeagueType | "all">("all")
  const [totalPlayers, setTotalPlayers] = useState(0)
  const [showTrainingModal, setShowTrainingModal] = useState(false)
  const [trainingDescription, setTrainingDescription] = useState("")
  const [trainingLink, setTrainingLink] = useState("")
  const [trainingAttachments, setTrainingAttachments] = useState<
    Array<{ id: string; name: string; type: string; url: string }>
  >([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [trainings, setTrainings] = useState<any[]>([])
  const [showTrainingsList, setShowTrainingsList] = useState(false)
  const [matches, setMatches] = useState<Match[]>([])
  const [showMatchesList, setShowMatchesList] = useState(false)
  const [matchesPage, setMatchesPage] = useState(0)
  const [hasMoreMatches, setHasMoreMatches] = useState(true)

  const [trainingsPage, setTrainingsPage] = useState(0)
  const [hasMoreTrainings, setHasMoreTrainings] = useState(true)
  const [showAllTrainings, setShowAllTrainings] = useState(false)

  const [loading, setLoading] = useState(true)
  const [savingTraining, setSavingTraining] = useState(false)
  const [loadingMoreMatches, setLoadingMoreMatches] = useState(false)
  const [loadingMoreTrainings, setLoadingMoreTrainings] = useState(false)

  const [showIndicesModal, setShowIndicesModal] = useState(false)
  const [showCaptacionModal, setShowCaptacionModal] = useState(false)
  const [editingTrainingId, setEditingTrainingId] = useState<string | null>(null)
  const [editingTrainingData, setEditingTrainingData] = useState<any | null>(null)

  const [showReadaptacionModal, setShowReadaptacionModal] = useState(false)

  const ITEMS_PER_PAGE = 5

  const fetchDivisionData = async () => {
    if (selectedDivision !== "all") {
      setMatchesPage(0)
      setTrainingsPage(0)
      setHasMoreMatches(true)
      setHasMoreTrainings(true)

      // Initial fetch (page 0)
      const [divisionTrainings, divisionMatches] = await Promise.all([
        getTrainingsByDivision(selectedDivision, 0, ITEMS_PER_PAGE),
        getMatchesByDivision(selectedDivision, 0, ITEMS_PER_PAGE),
      ])

      setTrainings(divisionTrainings)
      setMatches(divisionMatches)

      if (divisionTrainings.length < ITEMS_PER_PAGE) setHasMoreTrainings(false)
      if (divisionMatches.length < ITEMS_PER_PAGE) setHasMoreMatches(false)
    } else {
      setTrainings([])
      setMatches([])
    }
  }

  useEffect(() => {
    const init = async () => {
      setLoading(true)

      // Load user and player count in parallel
      const [currentUser, allPlayers] = await Promise.all([getCurrentUser(), getPlayers()])

      if (currentUser) {
        setUser(currentUser)
      }

      setTotalPlayers(allPlayers.length)
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    fetchDivisionData()
  }, [selectedDivision])

  const handleLoadMoreMatches = async () => {
    if (!hasMoreMatches || selectedDivision === "all") return
    setLoadingMoreMatches(true)
    const nextPage = matchesPage + 1
    const newMatches = await getMatchesByDivision(selectedDivision, nextPage, ITEMS_PER_PAGE)

    if (newMatches.length < ITEMS_PER_PAGE) {
      setHasMoreMatches(false)
    }

    setMatches([...matches, ...newMatches])
    setMatchesPage(nextPage)
    setLoadingMoreMatches(false)
  }

  const handleLoadMoreTrainings = async () => {
    if (!hasMoreTrainings || selectedDivision === "all") return
    setLoadingMoreTrainings(true)
    const nextPage = trainingsPage + 1
    const newTrainings = await getTrainingsByDivision(selectedDivision, nextPage, ITEMS_PER_PAGE)

    if (newTrainings.length < ITEMS_PER_PAGE) {
      setHasMoreTrainings(false)
    }

    setTrainings([...trainings, ...newTrainings])
    setTrainingsPage(nextPage)
    setLoadingMoreTrainings(false)
  }

  const handleLoadAllTrainings = async () => {
    if (selectedDivision === "all") return
    setLoadingMoreTrainings(true)
    setShowAllTrainings(true)
    
    // Cargar todos los entrenamientos sin límite
    let allTrainings: any[] = []
    let page = 0
    let hasMore = true
    
    while (hasMore) {
      const pageTrainings = await getTrainingsByDivision(selectedDivision, page, 100) // Usar 100 por página para obtener más rápido
      allTrainings = [...allTrainings, ...pageTrainings]
      hasMore = pageTrainings.length === 100
      page++
    }
    
    setTrainings(allTrainings)
    setLoadingMoreTrainings(false)
  }

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  const handleTrainingFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("[v0] *** handleTrainingFileChange LLAMADO ***")
    const files = e.target.files
    if (!files) {
      console.log("[v0] No hay archivos")
      return
    }

    console.log("[v0] Archivos seleccionados:", files.length)

    for (const file of Array.from(files)) {
      try {
        console.log("[v0] Procesando archivo:", file.name)
        const placeholderId = Math.random().toString(36).substr(2, 9)
        
        setTrainingAttachments((prev) => [
          ...prev,
          {
            id: placeholderId,
            name: file.name + " (subiendo...)",
            type: file.type || "application/octet-stream",
            url: "",
          },
        ])

        console.log("[v0] ANTES DE UPLOAD - uploadTrainingAttachment existe:", typeof uploadTrainingAttachment)
        console.log("[v0] INICIO: Subiendo archivo a Storage:", file.name)
        const uploadedAttachment = await uploadTrainingAttachment(file)
        console.log("[v0] UPLOAD COMPLETO - URL devuelta:", uploadedAttachment.url)

        setTrainingAttachments((prev) => {
          const updated = prev.map((att) =>
            att.id === placeholderId ? uploadedAttachment : att
          )
          console.log("[v0] Estado actualizado con attachment:", updated)
          return updated
        })

        toast({
          title: "Archivo subido",
          description: `${file.name} disponible para descargar`,
        })
      } catch (error) {
        console.error("[v0] Error subiendo archivo:", error)
        setTrainingAttachments((prev) =>
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

  const handleDownloadAttachment = (attachment: { name: string; url: string }) => {
    try {
      if (!attachment.url) {
        toast({
          title: "Error",
          description: "El archivo no está disponible",
          variant: "destructive",
        })
        return
      }

      // Detectar blob URLs antiguas que no se pueden descargar
      if (attachment.url.startsWith("blob:")) {
        toast({
          title: "Archivo Expirado",
          description: `"${attachment.name}" ha expirado. Por favor vuelva a subirlo desde "Cargar entrenamientos".`,
          variant: "destructive",
        })
        return
      }

      console.log("[v0] Descargando:", attachment.name, "URL:", attachment.url.substring(0, 50))

      const link = document.createElement("a")
      link.href = attachment.url
      link.download = attachment.name
      link.target = "_blank"
      link.rel = "noopener noreferrer"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      console.log("[v0] Descarga iniciada correctamente")
    } catch (error) {
      console.error("[v0] Error descargando:", error)
      toast({
        title: "Error descargando archivo",
        description: "No se pudo descargar el archivo. Intente nuevamente.",
        variant: "destructive",
      })
    }
  }

  const handleSaveTraining = async () => {
    if (!trainingDescription.trim()) {
      toast({
        title: "Error",
        description: "Ingrese una descripción del entrenamiento",
        variant: "destructive",
      })
      return
    }

    if (!user || selectedDivision === "all") return

    setSavingTraining(true)

    try {
      console.log("[v0] GUARDANDO TRAINING - Attachments que se guardarán:", trainingAttachments)
      trainingAttachments.forEach((att) => {
        console.log("[v0] Attachment URL a guardar:", att.url)
      })

      if (editingTrainingId && editingTrainingData) {
        // Modo edición
        const updatedTraining = {
          ...editingTrainingData,
          description: trainingDescription,
          link: trainingLink || undefined,
          attachments: trainingAttachments.length > 0 ? trainingAttachments : undefined,
        }

        await updateTraining(updatedTraining)
        setTrainings(trainings.map((t) => (t.id === editingTrainingId ? updatedTraining : t)))

        toast({
          title: "Entrenamiento actualizado",
          description: "El entrenamiento ha sido actualizado exitosamente",
        })
      } else {
        // Modo crear
        const today = new Date()
        const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split("T")[0]

        const newTraining = await saveTraining({
          division: selectedDivision,
          date: localDate,
          description: trainingDescription,
          createdBy: user.name,
          link: trainingLink || undefined,
          attachments: trainingAttachments.length > 0 ? trainingAttachments : undefined,
        })

        setTrainings([newTraining, ...trainings])

        toast({
          title: "Entrenamiento guardado",
          description: "El entrenamiento ha sido registrado exitosamente",
        })
      }

      setTrainingDescription("")
      setTrainingLink("")
      setTrainingAttachments([])
      setShowTrainingModal(false)
      setEditingTrainingId(null)
      setEditingTrainingData(null)
    } catch (e) {
      toast({
        title: "Error",
        description: editingTrainingId ? "No se pudo actualizar el entrenamiento" : "No se pudo guardar el entrenamiento",
        variant: "destructive",
      })
    } finally {
      setSavingTraining(false)
    }
  }

  const divisions: Array<{ value: Division | "all"; label: string }> = [
    { value: "all", label: "Todas las Divisiones" },
    { value: "1eralocal", label: "1era Local" },
    { value: "reserva", label: "Reserva" },
    { value: "4ta", label: "4ta División" },
    { value: "5ta", label: "5ta División" },
    { value: "6ta", label: "6ta División" },
    { value: "7ma", label: "7ma División" },
    { value: "8va", label: "8va División" },
    { value: "9na", label: "9na División" },
    { value: "10ma", label: "10ma División" },
    { value: "11", label: "11va División" },
    { value: "12", label: "12va División" },
    { value: "13", label: "13va División" },
    { value: "arqueros", label: "Arqueros" },
  ]

  const canManageContent = user && (hasPermission(user.role, "manage_matches") || hasPermission(user.role, "manage_trainings"))
  const canViewTrainings = user && (hasPermission(user.role, "manage_trainings") || hasPermission(user.role, "manage_matches"))
  const canViewIndices = user && hasPermission(user.role, "view_indices")

  return (
    <ProfessionalLayout
      user={user}
      onLogout={handleLogout}
      onOpenCaptacion={() => setShowCaptacionModal(true)}
      onOpenReadaptacion={() => setShowReadaptacionModal(true)}
    >
        {loading && (
          <div className="flex h-screen items-center justify-center">
            <Loader2 className="animate-spin h-8 w-8 text-red-700" />
          </div>
        )}

        {!user && !loading && null}

        {user && !loading && (
          <>
            <div className="mb-6">
              <h2 className="text-3xl font-bold mb-2">Panel de Control</h2>
              <p className="text-muted-foreground">
                {hasPermission(user.role, "access_manager_panel")
                  ? "Gestione jugadores, formaciones y acceda a todos los informes"
                  : "Acceda a la información de los jugadores y gestione sus informes"}
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Jugadores</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalPlayers}</div>
                  <p className="text-xs text-muted-foreground">En todas las divisiones</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Divisiones</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">13</div>
                  <p className="text-xs text-muted-foreground">4ta a 13va + Arqueros</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Mi Rol</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{getRoleLabel(user.role)}</div>
                  <p className="text-xs text-muted-foreground">Acceso al sistema</p>
                </CardContent>
              </Card>
            </div>

            {/* Players Section */}
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle>Jugadores del Club</CardTitle>
                      <CardDescription>Seleccione una división para filtrar jugadores</CardDescription>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    {/* Primera fila: Filtros */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Select value={selectedDivision} onValueChange={(v) => setSelectedDivision(v as Division | "all")}>
                        <SelectTrigger className="w-full sm:w-[250px]">
                          <SelectValue placeholder="Seleccione división" />
                        </SelectTrigger>
                        <SelectContent>
                          {divisions.map((div) => (
                            <SelectItem key={div.value} value={div.value}>
                              {div.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <LeagueTypeFilter value={selectedLeagueType} onChange={setSelectedLeagueType} />
                    </div>

                    {/* Segunda fila: Botones de acciones (solo cuando hay división seleccionada) */}
                    {selectedDivision !== "all" && (
                      <div className="flex flex-wrap gap-2">
                        {canViewIndices && (
                          <Button
                            onClick={() => setShowIndicesModal(true)}
                            variant="outline"
                            size="sm"
                            className="border-red-700 text-red-700 hover:bg-red-50 mb-4"
                          >
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Índices
                          </Button>
                        )}
                        {canManageContent && hasPermission(user.role, "manage_matches") && (
                          <Button
                            onClick={() => router.push(`/matches/${selectedDivision}`)}
                            size="sm"
                            className="bg-red-700 hover:bg-red-800"
                          >
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Cargar Partido
                          </Button>
                        )}
                        {canManageContent && hasPermission(user.role, "manage_trainings") && (
                          <Button
                            onClick={() => setShowTrainingModal(true)}
                            size="sm"
                            className="bg-red-600 hover:bg-red-700"
                          >
                            <Dumbbell className="h-4 w-4 mr-2" />
                            Cargar Entrenamiento
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {canManageContent && selectedDivision !== "all" && matches.length > 0 && (
                  <div className="mb-6">
                    <Button
                      onClick={() => setShowMatchesList(!showMatchesList)}
                      variant="outline"
                      className="border-red-700 text-red-700 hover:bg-red-50 mb-4"
                    >
                      <Video className="h-4 w-4 mr-2" />
                      {showMatchesList ? "Ocultar" : "Ver"} Partidos ({matches.length}
                      {hasMoreMatches ? "+" : ""})
                    </Button>

                    {showMatchesList && (
                      <div className="border-2 border-red-200 rounded-lg p-4 bg-red-50/70 mb-6">
                        <h3 className="font-semibold text-lg mb-3 text-red-900">
                          Historial de Partidos - {getDivisionLabel(selectedDivision)}
                        </h3>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {matches.map((match) => (
                            <div
                              key={match.id}
                              className="bg-white border-2 border-red-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-1">
                                    <span className="text-sm font-semibold text-red-700">
                                      {(() => {
                                        const [year, month, day] = match.date.split("-").map(Number)
                                        const localDate = new Date(year, month - 1, day)
                                        return localDate.toLocaleDateString("es-AR", {
                                          weekday: "long",
                                          year: "numeric",
                                          month: "long",
                                          day: "numeric",
                                        })
                                      })()}
                                    </span>
                                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                                      {match.result}
                                    </Badge>
                                  </div>
                                  <p className="text-base font-semibold">vs {match.opponent}</p>
                                </div>
                                <span className="text-xs text-muted-foreground">Por: {match.createdBy}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                                <Users className="h-4 w-4" />
                                <span>{match.players.length} jugadores participaron</span>
                              </div>
                              {match.videoUrl && (
                                <div className="mt-3">
                                  <a
                                    href={match.videoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-sm text-red-700 hover:text-red-800 font-medium hover:underline"
                                  >
                                    <Video className="h-4 w-4" />
                                    Ver video del partido
                                  </a>
                                </div>
                              )}
                            </div>
                          ))}
                          {hasMoreMatches && (
                            <div className="text-center pt-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleLoadMoreMatches}
                                disabled={loadingMoreMatches}
                                className="text-red-700 hover:bg-red-50"
                              >
                                {loadingMoreMatches ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  "Cargar más partidos antiguos"
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {canViewTrainings && selectedDivision !== "all" && trainings.length > 0 && (
                  <div className="mb-6">
                    <Button
                      onClick={() => setShowTrainingsList(!showTrainingsList)}
                      variant="outline"
                      className="border-red-600 text-red-600 hover:bg-red-50 mb-4"
                    >
                      <Dumbbell className="h-4 w-4 mr-2" />
                      {showTrainingsList ? "Ocultar" : "Ver"} Entrenamientos ({trainings.length}
                      {hasMoreTrainings ? "+" : ""})
                    </Button>

                    {showTrainingsList && (
                      <div className="border-2 border-red-200 rounded-lg p-4 bg-red-50/50 mb-6">
                        <h3 className="font-semibold text-lg mb-3 text-red-900">
                          Historial de Entrenamientos - {getDivisionLabel(selectedDivision)}
                        </h3>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {trainings.map((training) => (
                            <div
                              key={training.id}
                              className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-sm font-semibold text-red-700">
                                  {(() => {
                                    const [year, month, day] = training.date.split("-").map(Number)
                                    const localDate = new Date(year, month - 1, day)
                                    return localDate.toLocaleDateString("es-AR", {
                                      weekday: "long",
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })
                                  })()}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">Por: {training.createdBy}</span>
                                  {user && user.name === training.createdBy && (
                                    <div className="flex gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          setEditingTrainingId(training.id)
                                          setEditingTrainingData(training)
                                          setTrainingDescription(training.description)
                                          setTrainingLink(training.link || "")
                                          setTrainingAttachments(training.attachments || [])
                                          setShowTrainingModal(true)
                                        }}
                                        className="h-6 w-6 p-0 text-blue-600 hover:bg-blue-50"
                                      >
                                        ✏️
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={async () => {
                                          try {
                                            await deleteTraining(training.id)
                                            setTrainings(trainings.filter((t) => t.id !== training.id))
                                            toast({
                                              title: "Éxito",
                                              description: "Entrenamiento eliminado",
                                            })
                                          } catch (error) {
                                            toast({
                                              title: "Error",
                                              description: "No se pudo eliminar el entrenamiento",
                                              variant: "destructive",
                                            })
                                          }
                                        }}
                                        className="h-6 w-6 p-0 text-red-600 hover:bg-red-50"
                                      >
                                        🗑️
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm whitespace-pre-wrap">{training.description}</p>
                              
                              {training.link && (
                                <div className="mt-2">
                                  <a
                                    href={training.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1"
                                  >
                                    🔗 Ver enlace
                                  </a>
                                </div>
                              )}

                              {training.attachments && training.attachments.length > 0 && (
                                <div className="mt-3 pt-3 border-t">
                                  <p className="text-xs font-medium text-gray-700 mb-2">Archivos adjuntos:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {training.attachments.map((attachment) => (
                                      <button
                                        key={attachment.id}
                                        onClick={() => handleDownloadAttachment(attachment)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300 transition-colors cursor-pointer"
                                      >
                                        <span>📎</span>
                                        <span className="max-w-[150px] truncate">{attachment.name}</span>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        {!showAllTrainings && hasMoreTrainings && (
                          <div className="flex gap-2 mt-4 justify-center">
                            <Button
                              onClick={handleLoadMoreTrainings}
                              variant="outline"
                              disabled={loadingMoreTrainings}
                              className="border-red-300 text-red-700 hover:bg-red-50 bg-transparent"
                            >
                              {loadingMoreTrainings ? "Cargando..." : "Cargar más entrenamientos"}
                            </Button>
                            <Button
                              onClick={handleLoadAllTrainings}
                              variant="outline"
                              disabled={loadingMoreTrainings}
                              className="border-red-600 text-red-700 hover:bg-red-50 font-semibold bg-transparent"
                            >
                              Ver todos los entrenamientos
                            </Button>
                          </div>
                        )}
                        {showAllTrainings && (
                          <div className="flex justify-center mt-4">
                            <Button
                              onClick={async () => {
                                setShowAllTrainings(false)
                                setTrainingsPage(0)
                                setHasMoreTrainings(true)
                                // Recargar los datos iniciales
                                const initialTrainings = await getTrainingsByDivision(selectedDivision, 0, ITEMS_PER_PAGE)
                                setTrainings(initialTrainings)
                                if (initialTrainings.length < ITEMS_PER_PAGE) setHasMoreTrainings(false)
                              }}
                              variant="outline"
                              className="border-red-300 text-red-700 hover:bg-red-50"
                            >
                              Ver solo los últimos entrenamientos
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {showTrainingModal && (
                  <div className="border-t mt-4 pt-4">
                    <h3 className="font-semibold mb-4">
                      {editingTrainingId ? "Editar Entrenamiento" : "Nuevo Entrenamiento"}
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Descripción *</label>
                        <Textarea
                          value={trainingDescription}
                          onChange={(e) => setTrainingDescription(e.target.value)}
                          placeholder="Describe el entrenamiento realizado..."
                          className="w-full min-h-[120px] p-3 border rounded-md resize-y focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Link (opcional)</label>
                        <Input
                          type="url"
                          value={trainingLink}
                          onChange={(e) => setTrainingLink(e.target.value)}
                          placeholder="https://..."
                          className="w-full p-2.5 border rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Archivos adjuntos (opcional)</label>
                        <Input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          onChange={handleTrainingFileChange}
                          className="w-full p-2 border rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                        />
                        {trainingAttachments.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {trainingAttachments.map((attachment) => (
                              <div key={attachment.id} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
                                <span className="truncate">{attachment.name}</span>
                                <button
                                  type="button"
                                  onClick={() => setTrainingAttachments(trainingAttachments.filter((a) => a.id !== attachment.id))}
                                  className="text-red-600 hover:text-red-800 ml-2"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-5 border-t mt-5">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowTrainingModal(false)
                          setTrainingDescription("")
                          setTrainingLink("")
                          setTrainingAttachments([])
                          setEditingTrainingId(null)
                          setEditingTrainingData(null)
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleSaveTraining}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={savingTraining}
                      >
                        {savingTraining && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {savingTraining ? "Guardando..." : editingTrainingId ? "Actualizar" : "Guardar"}
                      </Button>
                    </div>
                  </div>
                )}

                <PlayersList 
                  division={selectedDivision === "all" ? undefined : selectedDivision} 
                  userRole={user.role} 
                  leagueType={selectedLeagueType} 
                />
              </CardContent>
            </Card>
          </>
        )}

      {showIndicesModal && selectedDivision !== "all" && user && (
        <IndicesManager
          division={selectedDivision as string}
          userName={user.name}
          userId={user.id}
          onClose={() => setShowIndicesModal(false)}
          canEdit={user.role === "dirigente" || user.role === "entrenador"}
        />
      )}
      {/* 2. Este bloque hace que el modal aparezca cuando haces clic en el botón */}
      {showCaptacionModal && (
        <CaptacionManager
          userName={user.name}
          onClose={() => setShowCaptacionModal(false)}
        />
      )}
      {showReadaptacionModal && user && (
        <ReadaptacionManager
          userName={user.name}
          onClose={() => setShowReadaptacionModal(false)}
        />
      )}
    </ProfessionalLayout>
  )
}

export { Loading }
