"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, logout, getRoleLabel, type User } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlayersList } from "@/components/players-list"
import type { Division } from "@/lib/players"
import { LogOut, Users, Activity, FileText, Settings, PlusCircle, Dumbbell, X, Save, Video, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { saveTraining, generateTrainingId, getTrainingsByDivision, type Training } from "@/lib/trainings"
import { getMatchesByDivision, type Match } from "@/lib/matches"
import { useToast } from "@/hooks/use-toast"
import { getDivisionLabel, getPlayers } from "@/lib/players"
import { hasPermission } from "@/lib/rbac"

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [selectedDivision, setSelectedDivision] = useState<Division | "all">("all")
  const [totalPlayers, setTotalPlayers] = useState(0)
  const [showTrainingModal, setShowTrainingModal] = useState(false)
  const [trainingDescription, setTrainingDescription] = useState("")
  const [trainings, setTrainings] = useState<Training[]>([])
  const [showTrainingsList, setShowTrainingsList] = useState(false)
  const [matches, setMatches] = useState<Match[]>([])
  const [showMatchesList, setShowMatchesList] = useState(false)
  const [matchesPage, setMatchesPage] = useState(0)
  const [hasMoreMatches, setHasMoreMatches] = useState(true)

  const [trainingsPage, setTrainingsPage] = useState(0)
  const [hasMoreTrainings, setHasMoreTrainings] = useState(true)

  const [loading, setLoading] = useState(true)
  const [savingTraining, setSavingTraining] = useState(false)
  const [loadingMoreMatches, setLoadingMoreMatches] = useState(false)
  const [loadingMoreTrainings, setLoadingMoreTrainings] = useState(false)

  const ITEMS_PER_PAGE = 5

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      
      // Load user and player count in parallel
      const [currentUser, allPlayers] = await Promise.all([
        getCurrentUser(),
        getPlayers()
      ])

      if (currentUser) {
        setUser(currentUser)
      }

      setTotalPlayers(allPlayers.length)
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    const fetchDivisionData = async () => {
        if (selectedDivision !== "all") {
            setMatchesPage(0)
            setTrainingsPage(0)
            setHasMoreMatches(true)
            setHasMoreTrainings(true)

            // Initial fetch (page 0)
            const [divisionTrainings, divisionMatches] = await Promise.all([
                getTrainingsByDivision(selectedDivision, 0, ITEMS_PER_PAGE),
                getMatchesByDivision(selectedDivision, 0, ITEMS_PER_PAGE)
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

  const handleLogout = async () => {
    await logout()
    router.push("/login")
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
        const today = new Date()
        const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split("T")[0]

        const training: Training = {
          id: generateTrainingId(),
          division: selectedDivision,
          date: localDate,
          description: trainingDescription,
          createdBy: user.name,
        }

        await saveTraining(training)
        setTrainings([training, ...trainings])
        setTrainingDescription("")
        setShowTrainingModal(false)

        toast({
          title: "Entrenamiento guardado",
          description: "El entrenamiento ha sido registrado exitosamente",
        })
    } catch (e) {
        toast({
            title: "Error",
            description: "No se pudo guardar el entrenamiento",
            variant: "destructive"
        })
    } finally {
        setSavingTraining(false)
    }
  }

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-red-700" /></div>
  }

  if (!user) return null

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

  const canManageContent = hasPermission(user.role, "manage_matches") || hasPermission(user.role, "manage_trainings")
  const canViewTrainings = hasPermission(user.role, "manage_trainings") || hasPermission(user.role, "manage_matches")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
        <header className="border-b bg-gradient-to-r from-red-700 to-black text-white">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Newell's Old Boys</h1>
                <p className="text-sm text-red-100">Sistema de Gestión Deportiva</p>
              </div>
              <div className="flex items-center gap-4">
                {hasPermission(user.role, "access_manager_panel") && (
                  <Button
                    variant="ghost"
                    onClick={() => router.push("/manager")}
                    className="text-white hover:bg-white/20"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Gestión
                  </Button>
                )}
                <Button variant="ghost" onClick={() => router.push("/areas")} className="text-white hover:bg-white/20">
                  <Activity className="h-4 w-4 mr-2" />
                  Áreas
                </Button>
                <div className="text-right">
                  <p className="font-semibold">{user.name}</p>
                  <Badge variant="secondary" className="bg-white/20 hover:bg-white/30">
                    {getRoleLabel(user.role)}
                  </Badge>
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="hover:bg-white/20">
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Jugadores del Club</CardTitle>
                  <CardDescription>Seleccione una división para filtrar jugadores</CardDescription>
                </div>
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
                  {canManageContent && selectedDivision !== "all" && (
                    <>
                      {hasPermission(user.role, "manage_matches") && (
                      <Button
                        onClick={() => router.push(`/matches/${selectedDivision}`)}
                        className="bg-red-700 hover:bg-red-800"
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Cargar Partido
                      </Button>
                      )}
                      {hasPermission(user.role, "manage_trainings") && (
                      <Button
                        onClick={() => setShowTrainingModal(true)}
                        size="sm"
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Dumbbell className="h-4 w-4 mr-2" />
                        Cargar Entrenamiento
                      </Button>
                      )}
                    </>
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
                    {showMatchesList ? "Ocultar" : "Ver"} Partidos ({matches.length}{hasMoreMatches ? "+" : ""})
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
                                    {loadingMoreMatches ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cargar más partidos antiguos"}
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
                    {showTrainingsList ? "Ocultar" : "Ver"} Entrenamientos ({trainings.length}{hasMoreTrainings ? "+" : ""})
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
                              <span className="text-xs text-muted-foreground">Por: {training.createdBy}</span>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{training.description}</p>
                          </div>
                        ))}
                        {hasMoreTrainings && (
                            <div className="text-center pt-2">
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={handleLoadMoreTrainings} 
                                    disabled={loadingMoreTrainings}
                                    className="text-red-700 hover:bg-red-50"
                                >
                                    {loadingMoreTrainings ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cargar más entrenamientos"}
                                </Button>
                            </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <PlayersList division={selectedDivision === "all" ? undefined : selectedDivision} userRole={user.role} />
            </CardContent>
          </Card>
        </main>

        {showTrainingModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white">
                <div className="flex items-center justify-between">
                  <CardTitle>Registrar Entrenamiento</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setShowTrainingModal(false)
                      setTrainingDescription("")
                    }}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <CardDescription className="text-red-100">
                  División: {selectedDivision !== "all" && getDivisionLabel(selectedDivision)} | Fecha:{" "}
                  {new Date().toLocaleDateString("es-AR")}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="training-description" className="text-base font-semibold">
                      Descripción del Entrenamiento
                    </Label>
                    <Textarea
                      id="training-description"
                      placeholder="Describe el entrenamiento realizado, ejercicios, objetivos trabajados, observaciones importantes..."
                      value={trainingDescription}
                      onChange={(e) => setTrainingDescription(e.target.value)}
                      rows={8}
                      className="mt-2 resize-none"
                    />
                    <p className="text-sm text-muted-foreground mt-2">{trainingDescription.length} caracteres</p>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowTrainingModal(false)
                        setTrainingDescription("")
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveTraining} className="bg-red-600 hover:bg-red-700" disabled={savingTraining}>
                      {savingTraining && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {savingTraining ? "Guardando..." : "Guardar Entrenamiento"}
                    </Button>
                  </div>
                </div>
              </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
              )
            }
            