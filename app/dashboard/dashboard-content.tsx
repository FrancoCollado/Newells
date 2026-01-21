"use client"

import type React from "react"
import { useToast } from "@/components/ui/use-toast"
import { useSearchParams } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, logout, getRoleLabel, type User } from "@/lib/auth"
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
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { saveTraining, getTrainingsByDivision, updateTraining, deleteTraining, type Training } from "@/lib/trainings"
import { getMatchesByDivision, type Match } from "@/lib/matches"
import { getDivisionLabel, getPlayers } from "@/lib/players"
import { hasPermission } from "@/lib/rbac"
import { IndicesManager } from "@/components/indices-manager"
import { CaptacionManager } from "@/components/captacion-manager"
import { LeagueTypeFilter } from "@/components/league-type-filter"

export function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [user, setUser] = useState<User | null>(null)
  const [players, setPlayers] = useState<any[]>([])
  const [trainings, setTrainings] = useState<Training[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [actionLoading, setActionLoading] = useState(false)
  const [selectedDivision, setSelectedDivision] = useState<string>("todas")
  const [selectedLeagueType, setSelectedLeagueType] = useState<LeagueType>("primera")
  const [filterText, setFilterText] = useState("")
  const [showNewTrainingForm, setShowNewTrainingForm] = useState(false)
  const [trainingDescription, setTrainingDescription] = useState("")
  const [trainingLink, setTrainingLink] = useState("")
  const [trainingAttachments, setTrainingAttachments] = useState<
    Array<{
      id: string
      name: string
      type: string
      url: string
    }>
  >([])
  const [showIndicesModal, setShowIndicesModal] = useState(false)
  const [showCaptacionModal, setShowCaptacionModal] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push("/login")
        return
      }
      setUser(currentUser)
    }
    checkAuth()
  }, [router])

  useEffect(() => {
    const loadDivision = () => {
      const div = searchParams.get("division") || "todas"
      setSelectedDivision(div)
    }
    loadDivision()
  }, [searchParams])

  useEffect(() => {
    if (!user || !selectedDivision) return

    const loadData = async () => {
      try {
        const [playersData, trainingsData] = await Promise.all([
          getPlayers(),
          getTrainingsByDivision(selectedDivision === "todas" ? undefined : (selectedDivision as Division)),
        ])

        setPlayers(playersData)
        setTrainings(trainingsData)
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar los datos",
          variant: "destructive",
        })
      }
    }

    loadData()
  }, [user, selectedDivision, toast])

  const handleTrainingFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const { uploadTrainingAttachment } = await import("@/lib/trainings")

    for (const file of Array.from(files)) {
      try {
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

        const uploadedAttachment = await uploadTrainingAttachment(file)

        setTrainingAttachments((prev) =>
          prev.map((att) =>
            att.id === placeholderId ? uploadedAttachment : att
          )
        )

        toast({
          title: "Archivo subido",
          description: `${file.name} ha sido subido exitosamente`,
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

      const link = document.createElement("a")
      link.href = attachment.url
      link.download = attachment.name
      link.target = "_blank"
      link.rel = "noopener noreferrer"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("[v0] Error descargando archivo:", error)
      toast({
        title: "Error descargando archivo",
        description: "No se pudo descargar el archivo. Intente nuevamente.",
        variant: "destructive",
      })
    }
  }

  const removeTrainingAttachment = (id: string) => {
    setTrainingAttachments((prev) => prev.filter((a) => a.id !== id))
  }

  const handleAddTraining = async () => {
    if (!user || !selectedDivision || !trainingDescription.trim()) {
      toast({
        title: "Error",
        description: "Completa todos los campos requeridos",
        variant: "destructive",
      })
      return
    }

    setActionLoading(true)
    try {
      await saveTraining({
        division: selectedDivision === "todas" ? "todas" : (selectedDivision as Division),
        date: new Date().toISOString().split("T")[0],
        description: trainingDescription.trim(),
        createdBy: user.name,
        link: trainingLink.trim() || undefined,
        attachments: trainingAttachments,
      })

      setTrainingDescription("")
      setTrainingLink("")
      setTrainingAttachments([])
      setShowNewTrainingForm(false)

      toast({
        title: "Éxito",
        description: "Entrenamiento guardado correctamente",
      })

      const updatedTrainings = await getTrainingsByDivision(
        selectedDivision === "todas" ? undefined : (selectedDivision as Division)
      )
      setTrainings(updatedTrainings)
    } catch (error) {
      console.error("Error saving training:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el entrenamiento",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteTraining = async (id: string) => {
    setActionLoading(true)
    try {
      await deleteTraining(id)
      toast({
        title: "Éxito",
        description: "Entrenamiento eliminado",
      })
      const updatedTrainings = await getTrainingsByDivision(
        selectedDivision === "todas" ? undefined : (selectedDivision as Division)
      )
      setTrainings(updatedTrainings)
    } catch (error) {
      console.error("Error deleting training:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el entrenamiento",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>
  }

  const filteredPlayers = players.filter((p) =>
    `${p.name} ${p.apellido}`.toLowerCase().includes(filterText.toLowerCase())
  )

  const filteredTrainings = trainings.filter((t) => t.description.toLowerCase().includes(filterText.toLowerCase()))

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <Badge>{getRoleLabel(user.role)}</Badge>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Gestión de Entrenamientos</CardTitle>
            <CardDescription>Visualiza y crea entrenamientos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label>División</Label>
                <Select value={selectedDivision} onValueChange={setSelectedDivision}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas las divisiones</SelectItem>
                    <SelectItem value="sub14">Sub 14</SelectItem>
                    <SelectItem value="sub15">Sub 15</SelectItem>
                    <SelectItem value="sub17">Sub 17</SelectItem>
                    <SelectItem value="sub20">Sub 20</SelectItem>
                    <SelectItem value="primera">Primera</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <LeagueTypeFilter
                selectedLeagueType={selectedLeagueType}
                onLeagueTypeChange={setSelectedLeagueType}
              />

              {hasPermission(user.role, "manage_trainings") && (
                <Button onClick={() => setShowNewTrainingForm(!showNewTrainingForm)}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Nuevo Entrenamiento
                </Button>
              )}
            </div>

            {showNewTrainingForm && (
              <Card className="bg-muted/50 border-dashed">
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <Label htmlFor="description">Descripción del entrenamiento *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe el entrenamiento..."
                      value={trainingDescription}
                      onChange={(e) => setTrainingDescription(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="link">Enlace (opcional)</Label>
                    <Input
                      id="link"
                      placeholder="https://ejemplo.com"
                      value={trainingLink}
                      onChange={(e) => setTrainingLink(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="files">Archivos adjuntos</Label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="files"
                      multiple
                      onChange={handleTrainingFileChange}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Seleccionar archivos
                    </Button>
                  </div>

                  {trainingAttachments.length > 0 && (
                    <div className="space-y-2">
                      <Label>Archivos adjuntos ({trainingAttachments.length}):</Label>
                      <div className="space-y-2">
                        {trainingAttachments.map((att) => (
                          <div
                            key={att.id}
                            className="flex items-center justify-between bg-background p-2 rounded border"
                          >
                            <span className="text-sm truncate">{att.name}</span>
                            <button
                              onClick={() => removeTrainingAttachment(att.id)}
                              className="text-destructive hover:text-destructive/80"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button onClick={handleAddTraining} disabled={actionLoading}>
                      {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Guardar
                    </Button>
                    <Button variant="outline" onClick={() => setShowNewTrainingForm(false)}>
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Buscar entrenamientos..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              {filteredTrainings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay entrenamientos para mostrar
                </div>
              ) : (
                filteredTrainings.map((training) => (
                  <Card key={training.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{getDivisionLabel(training.division)}</CardTitle>
                          <CardDescription>{training.date}</CardDescription>
                        </div>
                        {hasPermission(user.role, "manage_trainings") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTraining(training.id)}
                            disabled={actionLoading}
                          >
                            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm">{training.description}</p>

                      {training.link && (
                        <div className="text-sm">
                          <a href={training.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            Ver enlace
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
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Jugadores</CardTitle>
          </CardHeader>
          <CardContent>
            <PlayersList division={selectedDivision === "all" ? "todas" : selectedDivision} userRole={user.role} leagueType={selectedLeagueType} />
          </CardContent>
        </Card>
      </main>

      {showIndicesModal && selectedDivision !== "all" && user && (
        <IndicesManager
          division={selectedDivision as string}
          userName={user.name}
          userId={user.id}
          onClose={() => setShowIndicesModal(false)}
          canEdit={user.role === "dirigente" || user.role === "entrenador"}
        />
      )}
      {showCaptacionModal && (
        <CaptacionManager onClose={() => setShowCaptacionModal(false)} />
      )}
    </div>
  )
}
