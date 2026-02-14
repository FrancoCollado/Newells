"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, logout, type User } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { ProfessionalLayout } from "@/components/professional-layout"
import {
  ArrowLeft,
  LogOut,
  HeartPulse,
  Brain,
  Utensils,
  Dumbbell,
  Sparkles,
  Plus,
  FileText,
  CalendarIcon,
  Save,
  Trash2,
  Loader2,
  Upload,
  X,
  Film,
  Link as LinkIcon,
  Search,
} from "lucide-react"
import {
  type AreaReport,
  type AreaEvent,
  getAreaReports,
  getAreaEvents,
  saveAreaReport,
  saveAreaEvent,
  deleteAreaReport,
  deleteAreaEvent,
} from "@/lib/areas"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { canEditArea, canViewAllAreas } from "@/lib/rbac"

export default function AreasPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [selectedArea, setSelectedArea] = useState<string>("medica")
  const [reports, setReports] = useState<AreaReport[]>([])
  const [events, setEvents] = useState<AreaEvent[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [editingReport, setEditingReport] = useState<AreaReport | null>(null)
  const [newEventTitle, setNewEventTitle] = useState("")
  const [newEventDescription, setNewEventDescription] = useState("")
  const [showNewReportForm, setShowNewReportForm] = useState(false)
  const [showNewEventForm, setShowNewEventForm] = useState(false)

  // Pagination states
  const [reportsPage, setReportsPage] = useState(0)
  const [hasMoreReports, setHasMoreReports] = useState(true)
  const [loadingMoreReports, setLoadingMoreReports] = useState(false)
  const REPORTS_LIMIT = 10

  // Form states
  const [newReportTitle, setNewReportTitle] = useState("")
  const [newReportContent, setNewReportContent] = useState("")
  const [newReportHyperlink, setNewReportHyperlink] = useState("")
  const [newReportAttachments, setNewReportAttachments] = useState<
    Array<{
      id: string
      name: string
      type: string
      url: string
    }>
  >([])

  // Loading & UI states
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: "report" | "event" } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const newAttachment = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type || "application/octet-stream",
          url: event.target?.result as string,
        }
        setNewReportAttachments((prev) => [...prev, newAttachment])
      }
      reader.readAsDataURL(file)
    })

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeAttachment = (id: string) => {
    setNewReportAttachments((prev) => prev.filter((a) => a.id !== id))
  }

  const handleSaveReport = async () => {
    if (!newReportTitle.trim() || !user) return
    if (!canEditArea(user.role, selectedArea)) return

    setActionLoading(true)

    let savedReport: AreaReport | null = null

    if (editingReport) {
      // 🔄 EDITAR INFORME
      savedReport = await saveAreaReport({
        id: editingReport.id,
        area: selectedArea,
        title: newReportTitle,
        content: newReportContent,
        attachments: newReportAttachments,
      })

      if (savedReport) {
        setReports((prev) =>
          prev.map((r) => (r.id === editingReport.id ? savedReport! : r))
        )
      }
    } else {
      // 🆕 CREAR INFORME
      savedReport = await saveAreaReport({
        area: selectedArea,
        title: newReportTitle,
        content: newReportContent,
        createdBy: user.name,
        hyperlink: newReportHyperlink,
        attachments: newReportAttachments,
      })

      if (savedReport) {
        setReports([savedReport, ...reports])
      }
    }

    // Reset formulario
    setNewReportTitle("")
    setNewReportContent("")
    setNewReportHyperlink("")
    setNewReportAttachments([])
    setEditingReport(null)
    setShowNewReportForm(false)
    setActionLoading(false)
  }

  const handleSaveEvent = async () => {
    if (!newEventTitle.trim() || !selectedDate || !user) return

    if (!canEditArea(user.role, selectedArea)) {
      return // Silently fail - UI should prevent this
    }

    setActionLoading(true)
    const newEvent = await saveAreaEvent({
      area: selectedArea,
      date: selectedDate,
      title: newEventTitle,
      description: newEventDescription,
    })

    if (newEvent) {
      setEvents([...events, newEvent])
      setNewEventTitle("")
      setNewEventDescription("")
      setShowNewEventForm(false)
    }
    setActionLoading(false)
  }

  const confirmDelete = async () => {
    if (!itemToDelete || !user) return

    if (!canEditArea(user.role, selectedArea)) {
      return // Silently fail - UI should prevent this
    }

    setActionLoading(true)
    if (itemToDelete.type === "report") {
      await deleteAreaReport(itemToDelete.id)
      setReports(reports.filter((r) => r.id !== itemToDelete.id))
    } else {
      await deleteAreaEvent(itemToDelete.id)
      setEvents(events.filter((e) => e.id !== itemToDelete.id))
    }
    setItemToDelete(null)
    setActionLoading(false)
  }

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      const currentUser = await getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
      }
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    if (user && !canViewAllAreas(user.role) && !canEditArea(user.role, selectedArea)) {
      // Solo redirigir si el usuario NO puede ver todas las áreas Y NO puede editar esta área específica
      toast({
        title: "Acceso denegado",
        description: "No tiene permisos para ver esta área",
        variant: "destructive",
      })
      router.push("/dashboard")
    }
  }, [user, selectedArea, router, toast])

  useEffect(() => {
    const fetchData = async () => {
      if (user && selectedArea) {
        setLoading(true)

        setReportsPage(0)
        setHasMoreReports(true)

        const [fetchedReports, fetchedEvents] = await Promise.all([
          getAreaReports(selectedArea, 0, REPORTS_LIMIT),
          getAreaEvents(selectedArea),
        ])

        setReports(fetchedReports)
        if (fetchedReports.length < REPORTS_LIMIT) setHasMoreReports(false)

        setEvents(fetchedEvents)
        setLoading(false)
      }
    }

    fetchData()
  }, [user, selectedArea])

  const handleLoadMoreReports = async () => {
    if (!hasMoreReports) return
    setLoadingMoreReports(true)
    const nextPage = reportsPage + 1
    const newReports = await getAreaReports(selectedArea, nextPage, REPORTS_LIMIT)

    if (newReports.length < REPORTS_LIMIT) {
      setHasMoreReports(false)
    }

    setReports([...reports, ...newReports])
    setReportsPage(nextPage)
    setLoadingMoreReports(false)
  }

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  if (loading && !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-red-700" />
      </div>
    )
  }

  if (!user) return null

  const areas = [
    { id: "medica", label: "Médica", icon: HeartPulse, color: "text-red-600" },
    { id: "psicologica", label: "Psicológica", icon: Brain, color: "text-purple-600" },
    { id: "nutricional", label: "Nutricional", icon: Utensils, color: "text-green-600" },
    { id: "entrenamiento", label: "Entrenamiento", icon: Dumbbell, color: "text-blue-600" },
    { id: "fisioterapia", label: "Kinesiología", icon: Sparkles, color: "text-orange-600" },
    { id: "arqueros", label: "Arqueros", icon: Dumbbell, color: "text-cyan-600" },
    { id: "psicosocial", label: "Psicosocial", icon: Brain, color: "text-pink-600" },
    { id: "odontologia", label: "Odontología", icon: HeartPulse, color: "text-teal-600" },
    { id: "videoanalisis", label: "Videoanalisis", icon: Film, color: "text-yellow-600" },
    { id: "captacion", label: "Captación", icon: Search, color: "text-slate-600" },
  ]

  const areaReports = reports
  const areaEvents = events
  const selectedDateEvents = areaEvents.filter(
    (e) =>
      selectedDate &&
      e.date.getDate() === selectedDate.getDate() &&
      e.date.getMonth() === selectedDate.getMonth() &&
      e.date.getFullYear() === selectedDate.getFullYear(),
  )

  const eventDates = areaEvents.map((e) => e.date)

  const canEdit = canEditArea(user.role, selectedArea)
  const canViewAll = canViewAllAreas(user.role)

  return (
    <ProfessionalLayout user={user} onLogout={handleLogout}>
      <Tabs value={selectedArea} onValueChange={setSelectedArea} className="space-y-6">
          <TabsList className="grid grid-cols-5 md:flex md:flex-wrap justify-center gap-1 h-auto p-1 bg-muted/50 w-full overflow-hidden">
            {areas.map((area) => (
              <TabsTrigger 
                key={area.id} 
                value={area.id} 
                className="flex flex-col md:flex-row items-center gap-1 md:gap-2 px-1 md:px-3 py-1 md:py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm min-w-0"
              >
                <area.icon className={`h-3.5 w-3.5 md:h-4 md:w-4 ${area.color} shrink-0`} />
                <span className="text-[8px] sm:text-[10px] md:text-xs font-bold md:font-medium truncate w-full md:w-auto text-center">
                  {area.label}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {areas.map((area) => (
            <TabsContent key={area.id} value={area.id} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar Section */}
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className={`h-5 w-5 ${area.color}`} />
                      Calendario
                    </CardTitle>
                    <CardDescription>Eventos y actividades programadas</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                      modifiers={{
                        event: eventDates,
                      }}
                      modifiersClassNames={{
                        event: "bg-red-100 text-red-900 font-bold",
                      }}
                    />
                    {canEdit && (
                      <Button
                        variant="outline"
                        className="w-full bg-transparent"
                        onClick={() => setShowNewEventForm(!showNewEventForm)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Evento
                      </Button>
                    )}

                    {showNewEventForm && canEdit && (
                      <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                        <div>
                          <Label>Título del Evento</Label>
                          <Input
                            value={newEventTitle}
                            onChange={(e) => setNewEventTitle(e.target.value)}
                            placeholder="Ej: Chequeo médico"
                          />
                        </div>
                        <div>
                          <Label>Descripción</Label>
                          <Textarea
                            value={newEventDescription}
                            onChange={(e) => setNewEventDescription(e.target.value)}
                            placeholder="Detalles del evento..."
                            rows={3}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveEvent} className="flex-1" disabled={actionLoading}>
                            {actionLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4 mr-2" />
                            )}
                            Guardar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowNewEventForm(false)}
                            className="flex-1"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    )}

                    {selectedDate && selectedDateEvents.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Eventos del día:</h4>
                        {selectedDateEvents.map((event) => (
                          <div key={event.id} className="p-3 bg-muted rounded-lg space-y-1">
                            <div className="flex items-start justify-between">
                              <p className="font-medium text-sm">{event.title}</p>
                              {canEdit && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setItemToDelete({ id: event.id, type: "event" })}
                                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                            {event.description && <p className="text-xs text-muted-foreground">{event.description}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Reports Section */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className={`h-5 w-5 ${area.color}`} />
                          Informes Generales
                        </CardTitle>
                        <CardDescription>
                          {canEdit ? "Reportes y documentación del área" : "Visualización de reportes (solo lectura)"}
                        </CardDescription>
                      </div>
                      {canEdit && (
                        <Button onClick={() => setShowNewReportForm(!showNewReportForm)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Nuevo Informe
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {showNewReportForm && canEdit && (
                      <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                        <div>
                          <Label>Título del Informe</Label>
                          <Input
                            value={newReportTitle}
                            onChange={(e) => setNewReportTitle(e.target.value)}
                            placeholder="Ej: Informe mensual de lesiones"
                          />
                        </div>
                        <div>
                          <Label>Contenido</Label>
                          <Textarea
                            value={newReportContent}
                            onChange={(e) => setNewReportContent(e.target.value)}
                            placeholder="Escribe el contenido del informe..."
                            rows={6}
                          />
                        </div>
                        <div>
                          <Label>Hipervínculo (Opcional)</Label>
                          <Input
                            value={newReportHyperlink}
                            onChange={(e) => setNewReportHyperlink(e.target.value)}
                            placeholder="https://ejemplo.com/documento"
                            type="url"
                          />
                          <p className="text-xs text-muted-foreground mt-1">Agregue un enlace a documentos externos, videos, etc.</p>
                        </div>
                        <div className="space-y-2">
                          <Label>Archivos Adjuntos</Label>
                          <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-muted/50 transition-colors">
                            <input
                              ref={fileInputRef}
                              type="file"
                              onChange={handleFileChange}
                              multiple
                              className="hidden"
                              id="area-file-upload"
                            />
                            <label htmlFor="area-file-upload" className="cursor-pointer">
                              <Upload className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                              <p className="text-xs font-medium mb-1">Haga clic para adjuntar archivos</p>
                              <p className="text-xs text-muted-foreground">PDF, imágenes, documentos</p>
                            </label>
                          </div>

                          {newReportAttachments.length > 0 && (
                            <div className="space-y-2 mt-2">
                              <p className="text-xs font-medium">
                                Archivos seleccionados ({newReportAttachments.length})
                              </p>
                              {newReportAttachments.map((file) => (
                                <div
                                  key={file.id}
                                  className="flex items-center gap-2 p-2 bg-background rounded group hover:bg-muted/80 transition-colors"
                                >
                                  <FileText className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                  <span className="text-xs flex-1 truncate">{file.name}</span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeAttachment(file.id)}
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleSaveReport} className="flex-1" disabled={actionLoading}>
                            {actionLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4 mr-2" />
                            )}
                            Guardar Informe
                          </Button>
                          <Button variant="outline" onClick={() => setShowNewReportForm(false)} className="flex-1">
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    )}

                    {loading ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-red-700" />
                      </div>
                    ) : areaReports.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No hay informes registrados para esta área</p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[600px] overflow-y-auto">
                        {areaReports.map((report) => (
                          <div key={report.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <h4 className="font-semibold">{report.title}</h4>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(report.date).toLocaleDateString("es-AR", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}{" "}
                                  - Por: {report.createdBy}
                                </p>
                              </div>
                              {canEdit && (
                                <div className="flex gap-1">
                                  {/* ✏️ EDITAR */}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setEditingReport(report)
                                      setNewReportTitle(report.title)
                                      setNewReportContent(report.content || "")
                                      setNewReportHyperlink(report.hyperlink || "")
                                      setNewReportAttachments(report.attachments || [])
                                      setShowNewReportForm(true)
                                    }}
                                    className="h-8 w-8 p-0"
                                  >
                                    ✏️
                                  </Button>

                                  {/* 🗑️ BORRAR */}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setItemToDelete({ id: report.id, type: "report" })}
                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}

                            </div>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.content}</p>
                            
                            {report.hyperlink && (
                              <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800">
                                <div className="flex items-center gap-2">
                                  <LinkIcon className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                  <a 
                                    href={report.hyperlink} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium break-all"
                                  >
                                    {report.hyperlink}
                                  </a>
                                </div>
                              </div>
                            )}
                            
                            {report.attachments && report.attachments.length > 0 && (
                              <div className="mt-3 pt-3 border-t space-y-1">
                                <p className="text-xs font-medium text-muted-foreground mb-2">
                                  Archivos adjuntos ({report.attachments.length}):
                                </p>
                                {report.attachments.map((attachment) => (
                                  <button
                                    key={attachment.id}
                                    onClick={() => {
                                      const byteString = atob(attachment.url.split(",")[1])
                                      const mimeString = attachment.url.split(",")[0].split(":")[1].split(";")[0]

                                      const ab = new ArrayBuffer(byteString.length)
                                      const ia = new Uint8Array(ab)

                                      for (let i = 0; i < byteString.length; i++) {
                                        ia[i] = byteString.charCodeAt(i)
                                      }

                                      const blob = new Blob([ab], { type: mimeString })
                                      const url = URL.createObjectURL(blob)

                                      const a = document.createElement("a")
                                      a.href = url
                                      a.download = attachment.name
                                      document.body.appendChild(a)
                                      a.click()
                                      document.body.removeChild(a)
                                      URL.revokeObjectURL(url)
                                    }}
                                    className="flex items-center gap-2 p-2 bg-muted rounded hover:bg-muted/80 transition-colors text-xs w-full text-left"
                                  >
                                    <FileText className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                    <span className="flex-1 truncate">{attachment.name}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                        {hasMoreReports && (
                          <div className="text-center pt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleLoadMoreReports}
                              disabled={loadingMoreReports}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              {loadingMoreReports ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Cargar más informes"
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Additional Info Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <area.icon className={`h-5 w-5 ${area.color}`} />
                    Información Importante - {area.label}
                  </CardTitle>
                  <CardDescription>Datos relevantes y protocolos del área</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Contactos de Emergencia</h4>
                      <p className="text-sm text-muted-foreground">
                        Información de contacto para situaciones urgentes relacionadas con {area.label.toLowerCase()}
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Protocolos Activos</h4>
                      <p className="text-sm text-muted-foreground">
                        Procedimientos y protocolos actuales del {area.label.toLowerCase()}
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Estadísticas</h4>
                      <p className="text-sm text-muted-foreground">
                        Datos y métricas relevantes del {area.label.toLowerCase()}
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Recursos</h4>
                      <p className="text-sm text-muted-foreground">
                        Materiales y recursos disponibles para el {area.label.toLowerCase()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente este{" "}
              {itemToDelete?.type === "report" ? "informe" : "evento"}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ProfessionalLayout>
  )
}
