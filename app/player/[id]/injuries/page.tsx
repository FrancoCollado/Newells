"use client"

import { Badge } from "@/components/ui/badge"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { getCurrentUser, type User } from "@/lib/auth"
import { getPlayerById, type Player } from "@/lib/players"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Loader2, Upload, FileText, X } from "lucide-react" // Added Upload, FileText, X
import { hasPermission } from "@/lib/rbac"
import { useToast } from "@/hooks/use-toast"

import {
  saveInjuryAction,
  saveIllnessAction,
  getPlayerInjuriesAction,
  getPlayerIllnessesAction,
  updatePlayerInjuryStatusAction,
  getPlayerStudiesAction, // Added
  saveStudyAction, // Added
} from "./actions"
import type { Injury } from "@/lib/injuries"
import type { Illness } from "@/lib/illnesses"
import { InjuryDetailsView } from "@/components/injury-details-view"

export default function PlayerInjuriesPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [player, setPlayer] = useState<Player | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("lesiones")
  const [isInjured, setIsInjured] = useState(false)
  const [viewingInjuryId, setViewingInjuryId] = useState<string | null>(null)

  const [existingInjuries, setExistingInjuries] = useState<Injury[]>([])
  const [existingIllnesses, setExistingIllnesses] = useState<Illness[]>([])
  const [existingStudies, setExistingStudies] = useState<
    Array<{
      id: string
      created_at: string
      observations: string
      uploaded_by: string
      uploaded_by_name: string
      attachments: Array<{ id: string; name: string; type: string; url: string }>
    }>
  >([])

  const [injuryData, setInjuryData] = useState({
    // Datos del evento lesional
    injuryDate: "",
    injuryTime: "",
    context: [] as string[],
    gameMinute: "",
    surface: [] as string[],

    // Mecanismo de la lesión
    mechanismType: [] as string[],
    specificSituation: [] as string[],

    // Localización anatómica
    anatomicalLocation: [] as string[],
    affectedSide: "" as string,

    // Tipo de lesión
    injuryType: [],
    injuryTypeOther: "",
    clinicalDiagnosis: "",

    // Grado de severidad
    severity: "" as string,
    daysAbsent: "",

    // Evolución
    evolutionType: "" as string,
    treatment: [] as string[],

    // Imágenes complementarias
    hasUltrasound: false,
    hasMri: false,
    hasXray: false,
    hasCt: false,
    imagingFindings: "",

    // Observaciones
    medicalObservations: "",
    responsibleDoctor: "",
  })

  const [illnessData, setIllnessData] = useState({
    // Tipo de enfermedad
    infeccionRespiratoria: false,
    infeccionOtrosOrganos: false,
    fatigaMalestar: false,
    asmaAlergias: false,
    dolorEstomago: false,
    dolorCabeza: false,
    otroTipo: false,

    // Sistema orgánico afectado - ahora como arrays para múltiple selección
    sistemasAfectados: [] as string[],
    otroSistemaDescripcion: "",
    nuevaLesion: "",
    diagnostico: "",
    otrosComentarios: "",
    fechaRegresoJuego: "",
    attachments: [] as { fecha: string; descripcion: string }[],
  })

  // Estado y handlers para estudios complementarios
  const [studyData, setStudyData] = useState({
    observations: "",
    attachments: [] as Array<{ id: string; name: string; type: string; url: string }>,
  })

  const handleStudyFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      if (file.type !== "application/pdf") {
        toast({
          title: "Archivo no permitido",
          description: "Solo se permiten archivos PDF",
          variant: "destructive",
        })
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const newAttachment = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type,
          url: event.target?.result as string,
        }
        setStudyData((prev) => ({
          ...prev,
          attachments: [...prev.attachments, newAttachment],
        }))
      }
      reader.readAsDataURL(file)
    })
  }

  const removeStudyAttachment = (id: string) => {
    setStudyData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((a) => a.id !== id),
    }))
  }

  // Auto-complete responsibleDoctor with current user name
  useEffect(() => {
    if (user?.name && injuryData.responsibleDoctor === "") {
      setInjuryData((prev) => ({
        ...prev,
        responsibleDoctor: user.name,
      }))
    }
  }, [user?.name])

  // </CHANGE>

  const handleInjuryStatusChange = async (newStatus: boolean) => {
    if (!player) return

    try {
      await updatePlayerInjuryStatusAction(player.id, newStatus)
      setIsInjured(newStatus)
      toast({
        title: newStatus ? "Jugador marcado como lesionado" : "Jugador marcado como sano",
        description: "El estado se actualizó correctamente",
      })
    } catch (error) {
      console.error("[v0] Error al actualizar estado:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del jugador",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true) // Moved setLoading(true) here
        const currentUser = await getCurrentUser()
        const playerId = params.id as string // Defined playerId here

        if (!currentUser) {
          router.push("/login")
          return
        }

        // Validar permiso para ver registros médicos
        if (!hasPermission(currentUser.role, "view_medical_records")) {
          router.push("/dashboard")
          return
        }

        setUser(currentUser)

        const foundPlayer = await getPlayerById(playerId)
        if (!foundPlayer) {
          router.push("/dashboard")
          return
        }
        setPlayer(foundPlayer)
        console.log("[v0] Loading player data for ID:", playerId)
        // setPlayer(playerData) // This line is redundant if foundPlayer is used
        console.log("[v0] Player loaded:", {
          name: foundPlayer.name,
          age: foundPlayer.age,
          height: foundPlayer.height,
          weight: foundPlayer.weight,
          leagueStatsCount: foundPlayer.leagueStats?.length || 0,
          leagueStats: foundPlayer.leagueStats,
        })

        // Actualizar el estado inicial de isInjured basado en los datos del jugador
        if (foundPlayer && foundPlayer.isInjured !== undefined) {
          setIsInjured(foundPlayer.isInjured)
        }

        console.log("[v0] Cargando lesiones y enfermedades del jugador...")
        // Cargando estudios complementarios y usando Promise.all
        const [injuriesResult, illnessesResult, studiesResult] = await Promise.all([
          getPlayerInjuriesAction(playerId),
          getPlayerIllnessesAction(playerId),
          getPlayerStudiesAction(playerId),
        ])

        console.log("[v0] Lesiones cargadas:", injuriesResult?.data?.length || 0)
        console.log("[v0] Enfermedades cargadas:", illnessesResult?.data?.length || 0)
        console.log("[v0] Estudios cargados:", studiesResult?.length || 0) // Adjusted log for studies

        if (injuriesResult.success) {
          // console.log("[v0] Lesiones cargadas:", injuriesResult.data.length)
          setExistingInjuries(injuriesResult.data)
        }

        if (illnessesResult.success) {
          // console.log("[v0] Enfermedades cargadas:", illnessesResult.data.length)
          setExistingIllnesses(illnessesResult.data)
        }
        // Set existing studies directly
        setExistingStudies(studiesResult || [])
      } catch (error) {
        console.error("[v0] Error loading data:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la información del jugador",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [params.id, router, toast]) // Added toast dependency

  const updateInjuryData = (field: string, value: any) => {
    setInjuryData((prev) => {
      const current = prev[field as keyof typeof prev]
      
      // Si el campo es un array, agregar/remover del array
      if (Array.isArray(current)) {
        if (current.includes(value)) {
          return { ...prev, [field]: current.filter((item) => item !== value) }
        } else {
          return { ...prev, [field]: [...current, value] }
        }
      }
      
      // Si no es array, comportamiento normal
      return { ...prev, [field]: value }
    })
  }

  const updateIllnessData = (field: string, value: any) => {
    setIllnessData((prev) => {
      const current = prev[field as keyof typeof prev]
      
      // Si el campo es un array, agregar/remover del array
      if (Array.isArray(current)) {
        if (current.includes(value)) {
          return { ...prev, [field]: current.filter((item) => item !== value) }
        } else {
          return { ...prev, [field]: [...current, value] }
        }
      }
      
      // Si no es array, comportamiento normal
      return { ...prev, [field]: value }
    })
  }

  const handleSaveStudy = async () => {
    console.log("[v0] handleSaveStudy llamado")
    console.log("[v0] player existe:", !!player)
    console.log("[v0] user existe:", !!user)

    if (!player || !user || !hasPermission(user.role, "edit_medical_records")) {
      console.log("[v0] No pasa validación inicial")
      return
    }

    if (!studyData.observations.trim() && studyData.attachments.length === 0) {
      toast({
        title: "Campos requeridos",
        description: "Debe agregar observaciones o al menos un archivo PDF",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      console.log("[v0] Guardando estudio complementario...")
      // Assuming saveStudyAction takes playerId, userId, userName, observations, attachments
      await saveStudyAction(player.id, user.id, user.name, studyData.observations, studyData.attachments)

      toast({
        title: "Estudio guardado",
        description: "El estudio complementario se ha registrado correctamente",
      })

      // Recargar estudios
      const studies = await getPlayerStudiesAction(player.id)
      setExistingStudies(studies || [])

      // Limpiar formulario
      setStudyData({
        observations: "",
        attachments: [],
      })
    } catch (error) {
      console.error("[v0] Error al guardar estudio:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el estudio complementario",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveInjury = async () => {
    console.log("[v0] handleSaveInjury llamado")
    console.log("[v0] Player:", player?.id, player?.name)
    console.log("[v0] User:", user?.id, user?.role)
    console.log("[v0] Has permission:", hasPermission(user?.role || "", "edit_medical_records"))

    if (!player || !user || !hasPermission(user.role, "edit_medical_records")) return

    console.log("[v0] injuryData.injuryDate:", injuryData.injuryDate)
    console.log("[v0] Full injuryData:", JSON.stringify(injuryData, null, 2))

    if (!injuryData.injuryDate) {
      console.log("[v0] ERROR: Fecha de lesión no proporcionada")
      toast({
        title: "Error",
        description: "La fecha de la lesión es obligatoria",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    console.log("[v0] Guardando lesión para jugador:", player.id)
    console.log("[v0] injuryData:", injuryData)

    try {
      const result = await saveInjuryAction({
        playerId: params.id as string,
        ...injuryData,
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      console.log("[v0] Lesión guardada exitosamente")
      toast({
        title: "Éxito",
        description: "La lesión ha sido registrada correctamente",
      })

      const injuriesResult = await getPlayerInjuriesAction(params.id as string)
      if (injuriesResult.success) {
        setExistingInjuries(injuriesResult.data)
      }

      // Limpiar formulario
      setInjuryData({
        injuryDate: "",
        injuryTime: "",
        context: [],
        gameMinute: "",
        surface: [],
        mechanismType: [],
        specificSituation: [],
        anatomicalLocation: [],
        affectedSide: "",
        injuryType: [],
        injuryTypeOther: "",
        clinicalDiagnosis: "",
        severity: "",
        daysAbsent: "",
        evolutionType: "",
        treatment: [],
        hasUltrasound: false,
        hasMri: false,
        hasXray: false,
        hasCt: false,
        imagingFindings: "",
        medicalDischargeDate: "",
        progressiveReturnDate: "",
        competitiveRtpDate: "",
        rtpCriteriaClinical: false,
        rtpCriteriaFunctional: false,
        rtpCriteriaStrength: false,
        rtpCriteriaGps: false,
        medicalObservations: "",
        responsibleDoctor: "",
      })
    } catch (error) {
      console.error("[v0] Error al guardar lesión:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo guardar la lesión",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveIllness = async () => {
    if (!player || !user || !hasPermission(user.role, "edit_medical_records")) return

    setSaving(true)
    console.log("[v0] Guardando enfermedad para jugador:", player.id)

    try {
      const result = await saveIllnessAction({
        playerId: params.id as string,
        ...illnessData,
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      console.log("[v0] Enfermedad guardada exitosamente")
      toast({
        title: "Éxito",
        description: "La enfermedad ha sido registrada correctamente",
      })

      const illnessesResult = await getPlayerIllnessesAction(params.id as string)
      if (illnessesResult.success) {
        setExistingIllnesses(illnessesResult.data)
      }

      // Limpiar formulario
      setIllnessData({
        infeccionRespiratoria: false,
        infeccionOtrosOrganos: false,
        fatigaMalestar: false,
        asmaAlergias: false,
        dolorEstomago: false,
        dolorCabeza: false,
        otroTipo: false,
        sistemasAfectados: [],
        otroSistemaDescripcion: "",
        nuevaLesion: "",
        diagnostico: "",
        otrosComentarios: "",
        fechaRegresoJuego: "",
        attachments: [],
      })
    } catch (error) {
      console.error("[v0] Error al guardar enfermedad:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo guardar la enfermedad",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (!user || !player) return null

  const canEdit = hasPermission(user.role, "edit_medical_records")

  return (
    <AuthGuard>
      {" "}
      {/* Removed allowedRoles from AuthGuard */}
      <div className="min-h-screen bg-background">
        <header className="border-b bg-gradient-to-r from-red-700 to-black text-white">
          {" "}
          {/* Changed gradient colors */}
          <div className="container mx-auto px-4 py-4">
            <Button
              variant="ghost"
              onClick={() => router.push(`/player/${player.id}`)}
              className="text-white hover:bg-white/20 mb-2" // Added mb-2
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al perfil {/* Changed text */}
            </Button>
            <h1 className="text-2xl font-bold">Lesiones y enfermedades - {player.name}</h1>
            <p className="text-sm text-red-100">Gestión médica del jugador</p> {/* Changed text and color */}
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-orange-900">Estado del Jugador</CardTitle>
                  <CardDescription>Marcar si el jugador se encuentra lesionado</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={isInjured}
                    onCheckedChange={handleInjuryStatusChange}
                    disabled={!user || !hasPermission(user.role, "edit_medical_records")}
                  />
                  <Label className="text-base font-medium">{isInjured ? "Lesionado" : "Disponible"}</Label>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Registro de Lesiones y Enfermedades</CardTitle>
              <CardDescription>
                Complete la información sobre lesiones varias y enfermedades del jugador
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  {" "}
                  {/* Changed grid-cols-2 to grid-cols-3 */}
                  <TabsTrigger value="lesiones">Lesiones Varias ({existingInjuries.length})</TabsTrigger>
                  <TabsTrigger value="enfermedades">Enfermedades ({existingIllnesses.length})</TabsTrigger>
                  <TabsTrigger value="estudios">
                    {" "}
                    {/* Added */}
                    Estudios Complementarios ({existingStudies.length}) {/* Added */}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="lesiones" className="space-y-6">
                  {" "}
                  {/* Changed from mt-6 to space-y-6 */}
                  {existingInjuries.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Registros de Lesiones</CardTitle>
                        <CardDescription>Historial de lesiones registradas</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {existingInjuries.map((injury, index) => (
                          <div key={injury.id} className="p-4 border rounded-lg space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold">Lesión #{index + 1}</p>
                                <p className="text-sm text-muted-foreground">
                                  {injury.injuryDate ? new Date(injury.injuryDate).toLocaleDateString() : "Sin fecha"}
                                </p>
                              </div>
                              <div className="flex gap-2 items-center">
                                {injury.isDischarged && (
                                  <Badge className="bg-green-100 text-green-800 border-green-300">
                                    DADO DE ALTA
                                  </Badge>
                                )}
                                {viewingInjuryId !== injury.id && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => setViewingInjuryId(injury.id)}
                                  >
                                    Ver Detalles
                                  </Button>
                                )}
                              </div>
                            </div>
                            {viewingInjuryId !== injury.id && (
                              <div className="space-y-1 text-sm">
                                {injury.anatomicalLocation && Array.isArray(injury.anatomicalLocation) && (
                                  <p>
                                    <strong>Localización:</strong> {injury.anatomicalLocation.join(", ")}
                                  </p>
                                )}
                                {injury.injuryType && Array.isArray(injury.injuryType) && (
                                  <p>
                                    <strong>Tipo:</strong> {injury.injuryType.join(", ")}
                                  </p>
                                )}
                                {injury.clinicalDiagnosis && (
                                  <p>
                                    <strong>Diagnóstico:</strong> {injury.clinicalDiagnosis}
                                  </p>
                                )}
                                {injury.severity && (
                                  <p>
                                    <strong>Severidad:</strong> {injury.severity}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                  {viewingInjuryId && existingInjuries.find((i) => i.id === viewingInjuryId) && (
                    <InjuryDetailsView
                      injury={existingInjuries.find((i) => i.id === viewingInjuryId)!}
                      onClose={() => setViewingInjuryId(null)}
                      canEdit={canEdit}
                    />
                  )}
                  {/* Formulario de nueva lesión */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Registrar Nueva Lesión</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* Sección 1: Datos Generales */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">1. DATOS GENERALES DEL JUGADOR</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-2">
                            <Label className="text-muted-foreground">Nombre y Apellido</Label>
                            <Input value={player.name} disabled className="bg-muted" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-muted-foreground">DNI / ID interno</Label>
                            <Input value={player.id.slice(0, 8)} disabled className="bg-muted" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-muted-foreground">Edad</Label>
                            <Input value={player.age || ""} disabled className="bg-muted" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-muted-foreground">Posición</Label>
                            <Input value={player.position} disabled className="bg-muted" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-muted-foreground">Pierna dominante</Label>
                            <Input value={player.dominantFoot} disabled className="bg-muted" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-muted-foreground">Categoría</Label>
                            <Input value={player.division} disabled className="bg-muted" />
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Sección 2: Datos del Evento Lesional */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">2. DATOS DEL EVENTO LESIONAL</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Fecha de la lesión *</Label>
                            <Input
                              type="date"
                              value={injuryData.injuryDate}
                              onChange={(e) => updateInjuryData("injuryDate", e.target.value)}
                              disabled={!canEdit}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Hora</Label>
                            <Input
                              type="time"
                              value={injuryData.injuryTime}
                              onChange={(e) => updateInjuryData("injuryTime", e.target.value)}
                              disabled={!canEdit}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Contexto</Label>
                          <div className="flex flex-wrap gap-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="context-entrenamiento"
                                checked={injuryData.context.includes("entrenamiento")}
                                onCheckedChange={(checked) => {
                                  updateInjuryData("context", "entrenamiento")
                                }}
                                disabled={!canEdit}
                              />
                              <Label htmlFor="context-entrenamiento" className="font-normal">
                                Entrenamiento
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="context-partido-oficial"
                                checked={injuryData.context.includes("partido_oficial")}
                                onCheckedChange={(checked) => {
                                  updateInjuryData("context", "partido_oficial")
                                }}
                                disabled={!canEdit}
                              />
                              <Label htmlFor="context-partido-oficial" className="font-normal">
                                Partido oficial
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="context-partido-amistoso"
                                checked={injuryData.context.includes("partido_amistoso")}
                                onCheckedChange={(checked) => {
                                  updateInjuryData("context", "partido_amistoso")
                                }}
                                disabled={!canEdit}
                              />
                              <Label htmlFor="context-partido-amistoso" className="font-normal">
                                Partido amistoso
                              </Label>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Minuto de juego / Momento de la sesión</Label>
                          <Input
                            value={injuryData.gameMinute}
                            onChange={(e) => updateInjuryData("gameMinute", e.target.value)}
                            placeholder="Ej: Minuto 45"
                            disabled={!canEdit}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Superficie</Label>
                          <div className="flex flex-wrap gap-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="surface-natural"
                                checked={injuryData.surface.includes("cesped_natural")}
                                onCheckedChange={(checked) => {
                                  updateInjuryData("surface", "cesped_natural")
                                }}
                                disabled={!canEdit}
                              />
                              <Label htmlFor="surface-natural" className="font-normal">
                                Césped natural
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="surface-sintetico"
                                checked={injuryData.surface.includes("cesped_sintetico")}
                                onCheckedChange={(checked) => {
                                  updateInjuryData("surface", "cesped_sintetico")
                                }}
                                disabled={!canEdit}
                              />
                              <Label htmlFor="surface-sintetico" className="font-normal">
                                Césped sintético
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="surface-otra"
                                checked={injuryData.surface.includes("otra")}
                                onCheckedChange={(checked) => {
                                  updateInjuryData("surface", "otra")
                                }}
                                disabled={!canEdit}
                              />
                              <Label htmlFor="surface-otra" className="font-normal">
                                Otra
                              </Label>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Sección 3: Mecanismo de la Lesión */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">3. MECANISMO DE LA LESIÓN</h3>
                        <div className="space-y-2">
                          <Label>Tipo de mecanismo</Label>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="mechanism-contacto"
                                checked={injuryData.mechanismType.includes("contacto")}
                                onCheckedChange={() => updateInjuryData("mechanismType", "contacto")}
                                disabled={!canEdit}
                              />
                              <Label htmlFor="mechanism-contacto" className="font-normal">
                                Contacto
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="mechanism-no-contacto"
                                checked={injuryData.mechanismType.includes("no_contacto")}
                                onCheckedChange={() => updateInjuryData("mechanismType", "no_contacto")}
                                disabled={!canEdit}
                              />
                              <Label htmlFor="mechanism-no-contacto" className="font-normal">
                                No contacto
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="mechanism-sobrecarga"
                                checked={injuryData.mechanismType.includes("sobrecarga")}
                                onCheckedChange={() => updateInjuryData("mechanismType", "sobrecarga")}
                                disabled={!canEdit}
                              />
                              <Label htmlFor="mechanism-sobrecarga" className="font-normal">
                                Sobrecarga / Fatiga
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="mechanism-trauma"
                                checked={injuryData.mechanismType.includes("trauma_indirecto")}
                                onCheckedChange={() => updateInjuryData("mechanismType", "trauma_indirecto")}
                                disabled={!canEdit}
                              />
                              <Label htmlFor="mechanism-trauma" className="font-normal">
                                Trauma indirecto
                              </Label>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Situación específica</Label>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="situation-sprint"
                                checked={injuryData.specificSituation.includes("sprint")}
                                onCheckedChange={() => updateInjuryData("specificSituation", "sprint")}
                                disabled={!canEdit}
                              />
                              <Label htmlFor="situation-sprint" className="font-normal">
                                Sprint
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="situation-cambio"
                                checked={injuryData.specificSituation.includes("cambio_direccion")}
                                onCheckedChange={() => updateInjuryData("specificSituation", "cambio_direccion")}
                                disabled={!canEdit}
                              />
                              <Label htmlFor="situation-cambio" className="font-normal">
                                Cambio de dirección
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="situation-salto"
                                checked={injuryData.specificSituation.includes("salto_caida")}
                                onCheckedChange={() => updateInjuryData("specificSituation", "salto_caida")}
                                disabled={!canEdit}
                              />
                              <Label htmlFor="situation-salto" className="font-normal">
                                Salto / Caída
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="situation-golpe"
                                checked={injuryData.specificSituation.includes("golpe_choque")}
                                onCheckedChange={() => updateInjuryData("specificSituation", "golpe_choque")}
                                disabled={!canEdit}
                              />
                              <Label htmlFor="situation-golpe" className="font-normal">
                                Golpe / Choque
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="situation-disparo"
                                checked={injuryData.specificSituation.includes("disparo")}
                                onCheckedChange={() => updateInjuryData("specificSituation", "disparo")}
                                disabled={!canEdit}
                              />
                              <Label htmlFor="situation-disparo" className="font-normal">
                                Disparo
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="situation-aceleracion"
                                checked={injuryData.specificSituation.includes("aceleracion_desaceleracion")}
                                onCheckedChange={() => updateInjuryData("specificSituation", "aceleracion_desaceleracion")}
                                disabled={!canEdit}
                              />
                              <Label htmlFor="situation-aceleracion" className="font-normal">
                                Aceleración / desaceleración
                              </Label>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Sección 4: Localización Anatómica */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">4. LOCALIZACIÓN ANATÓMICA</h3>
                        <div className="space-y-4">
                          <div>
                            <Label className="font-semibold">Cabeza / Tronco</Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                              {[
                                "Conmoción cerebral",
                                "Columna cervical",
                                "Columna dorsal",
                                "Columna lumbar",
                                "Pelvis",
                              ].map((location) => (
                                <div key={location} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`loc-${location}`}
                                    checked={injuryData.anatomicalLocation.includes(location)}
                                    onCheckedChange={() => updateInjuryData("anatomicalLocation", location)}
                                    disabled={!canEdit}
                                  />
                                  <Label htmlFor={`loc-${location}`} className="font-normal text-sm">
                                    {location}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <Label className="font-semibold">Extremidad Superior</Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                              {["Hombro", "Brazo", "Codo", "Antebrazo", "Muñeca / Mano"].map((location) => (
                                <div key={location} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`loc-${location}`}
                                    checked={injuryData.anatomicalLocation.includes(location)}
                                    onCheckedChange={() => updateInjuryData("anatomicalLocation", location)}
                                    disabled={!canEdit}
                                  />
                                  <Label htmlFor={`loc-${location}`} className="font-normal text-sm">
                                    {location}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <Label className="font-semibold">Extremidad Inferior</Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                              {[
                                "Cadera / Ingle (Groin)",
                                "Muslo anterior",
                                "Muslo posterior",
                                "Rodilla",
                                "Pierna",
                                "Tobillo",
                                "Pie",
                              ].map((location) => (
                                <div key={location} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`loc-${location}`}
                                    checked={injuryData.anatomicalLocation.includes(location)}
                                    onCheckedChange={() => updateInjuryData("anatomicalLocation", location)}
                                    disabled={!canEdit}
                                  />
                                  <Label htmlFor={`loc-${location}`} className="font-normal text-sm">
                                    {location}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Lado afectado</Label>
                            <div className="flex gap-4">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id="side-derecho"
                                  name="affectedSide"
                                  value="derecho"
                                  checked={injuryData.affectedSide === "derecho"}
                                  onChange={() => updateInjuryData("affectedSide", "derecho")}
                                  disabled={!canEdit}
                                  className="w-4 h-4"
                                />
                                <Label htmlFor="side-derecho" className="font-normal cursor-pointer">
                                  Derecho
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id="side-izquierdo"
                                  name="affectedSide"
                                  value="izquierdo"
                                  checked={injuryData.affectedSide === "izquierdo"}
                                  onChange={() => updateInjuryData("affectedSide", "izquierdo")}
                                  disabled={!canEdit}
                                  className="w-4 h-4"
                                />
                                <Label htmlFor="side-izquierdo" className="font-normal cursor-pointer">
                                  Izquierdo
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id="side-bilateral"
                                  name="affectedSide"
                                  value="bilateral"
                                  checked={injuryData.affectedSide === "bilateral"}
                                  onChange={() => updateInjuryData("affectedSide", "bilateral")}
                                  disabled={!canEdit}
                                  className="w-4 h-4"
                                />
                                <Label htmlFor="side-bilateral" className="font-normal cursor-pointer">
                                  Bilateral
                                </Label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Sección 5: Tipo de Lesión */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">5. TIPO DE LESIÓN</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { value: "muscular", label: "Lesión muscular" },
                            { value: "tendinosa", label: "Lesión tendinosa" },
                            { value: "ligamentosa", label: "Lesión ligamentosa" },
                            { value: "meniscal_cartilago", label: "Lesión meniscal / cartílago" },
                            { value: "contusion_hematoma", label: "Contusión / hematoma" },
                            { value: "fractura_osea", label: "Fractura / lesión ósea" },
                            { value: "conmocion_cerebral", label: "Conmoción cerebral" },
                            { value: "otra", label: "Otra" },
                          ].map(({ value, label }) => (
                            <div key={value} className="flex items-center space-x-2">
                              <Checkbox
                                id={`injury-type-${value}`}
                                checked={injuryData.injuryType.includes(value)}
                                onCheckedChange={() => updateInjuryData("injuryType", value)}
                                disabled={!canEdit}
                              />
                              <Label htmlFor={`injury-type-${value}`} className="font-normal">
                                {label}
                              </Label>
                            </div>
                          ))}
                        </div>

                        {injuryData.injuryType.includes("otra") && (
                          <div className="space-y-2">
                            <Label>Especificar otra lesión</Label>
                            <Input
                              value={injuryData.injuryTypeOther}
                              onChange={(e) => updateInjuryData("injuryTypeOther", e.target.value)}
                              placeholder="Especificar..."
                              disabled={!canEdit}
                            />
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label>Diagnóstico clínico específico</Label>
                          <Textarea
                            value={injuryData.clinicalDiagnosis}
                            onChange={(e) => updateInjuryData("clinicalDiagnosis", e.target.value)}
                            placeholder="Ingrese el diagnóstico clínico específico..."
                            rows={3}
                            disabled={!canEdit}
                          />
                        </div>
                      </div>

                      <Separator />

                      {/* Sección 6: Grado de Severidad */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">
                          6. GRADO DE SEVERIDAD (según días de baja – criterio UEFA)
                        </h3>
                        <div className="flex gap-6">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="severity-leve"
                              checked={injuryData.severity === "leve"}
                              onCheckedChange={() => updateInjuryData("severity", "leve")}
                              disabled={!canEdit}
                            />
                            <Label htmlFor="severity-leve" className="font-normal">
                              Leve: 1–3 días
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="severity-moderada"
                              checked={injuryData.severity === "moderada"}
                              onCheckedChange={() => updateInjuryData("severity", "moderada")}
                              disabled={!canEdit}
                            />
                            <Label htmlFor="severity-moderada" className="font-normal">
                              Moderada: 4–28 días
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="severity-severa"
                              checked={injuryData.severity === "severa"}
                              onCheckedChange={() => updateInjuryData("severity", "severa")}
                              disabled={!canEdit}
                            />
                            <Label htmlFor="severity-severa" className="font-normal">
                              Severa: {">"}28 días
                            </Label>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Días reales de ausencia deportiva</Label>
                          <Input
                            type="number"
                            value={injuryData.daysAbsent}
                            onChange={(e) => updateInjuryData("daysAbsent", e.target.value)}
                            placeholder="Número de días"
                            disabled={!canEdit}
                          />
                        </div>
                      </div>

                      <Separator />

                      {/* Sección 7: Evolución */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">7. EVOLUCIÓN</h3>
                        <div className="space-y-2">
                          <Label>Tipo de lesión</Label>
                          <div className="flex gap-6">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="evolution-nueva"
                                checked={injuryData.evolutionType === "nueva"}
                                onCheckedChange={() => updateInjuryData("evolutionType", "nueva")}
                                disabled={!canEdit}
                              />
                              <Label htmlFor="evolution-nueva" className="font-normal">
                                Nueva
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="evolution-recaida"
                                checked={injuryData.evolutionType === "recaida"}
                                onCheckedChange={() => updateInjuryData("evolutionType", "recaida")}
                                disabled={!canEdit}
                              />
                              <Label htmlFor="evolution-recaida" className="font-normal">
                                Recaída (misma localización y tipo)
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="evolution-recidiva"
                                checked={injuryData.evolutionType === "recidiva"}
                                onCheckedChange={() => updateInjuryData("evolutionType", "recidiva")}
                                disabled={!canEdit}
                              />
                              <Label htmlFor="evolution-recidiva" className="font-normal">
                                Recidiva
                              </Label>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Tratamiento instaurado</Label>
                          <div className="flex gap-6">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="treatment-conservador"
                                checked={injuryData.treatment === "conservador"}
                                onCheckedChange={(checked) =>
                                  updateInjuryData("treatment", checked ? "conservador" : "")
                                }
                                disabled={!canEdit}
                              />
                              <Label htmlFor="treatment-conservador" className="font-normal">
                                Conservador
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="treatment-quirurgico"
                                checked={injuryData.treatment === "quirurgico"}
                                onCheckedChange={(checked) =>
                                  updateInjuryData("treatment", checked ? "quirurgico" : "")
                                }
                                disabled={!canEdit}
                              />
                              <Label htmlFor="treatment-quirurgico" className="font-normal">
                                Quirúrgico
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="treatment-infiltracion"
                                checked={injuryData.treatment === "infiltracion_prp"}
                                onCheckedChange={(checked) =>
                                  updateInjuryData("treatment", checked ? "infiltracion_prp" : "")
                                }
                                disabled={!canEdit}
                              />
                              <Label htmlFor="treatment-infiltracion" className="font-normal">
                                Infiltración / PRP
                              </Label>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Sección 8: Imágenes Complementarias */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">8. IMÁGENES COMPLEMENTARIAS</h3>
                        <div className="flex flex-wrap gap-6">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="imaging-ultrasound"
                              checked={injuryData.hasUltrasound}
                              onCheckedChange={(checked) => updateInjuryData("hasUltrasound", checked)}
                              disabled={!canEdit}
                            />
                            <Label htmlFor="imaging-ultrasound" className="font-normal">
                              Ecografía
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="imaging-mri"
                              checked={injuryData.hasMri}
                              onCheckedChange={(checked) => updateInjuryData("hasMri", checked)}
                              disabled={!canEdit}
                            />
                            <Label htmlFor="imaging-mri" className="font-normal">
                              Resonancia Magnética
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="imaging-xray"
                              checked={injuryData.hasXray}
                              onCheckedChange={(checked) => updateInjuryData("hasXray", checked)}
                              disabled={!canEdit}
                            />
                            <Label htmlFor="imaging-xray" className="font-normal">
                              Radiografía
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="imaging-ct"
                              checked={injuryData.hasCt}
                              onCheckedChange={(checked) => updateInjuryData("hasCt", checked)}
                              disabled={!canEdit}
                            />
                            <Label htmlFor="imaging-ct" className="font-normal">
                              TAC
                            </Label>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Hallazgos relevantes</Label>
                          <Textarea
                            value={injuryData.imagingFindings}
                            onChange={(e) => updateInjuryData("imagingFindings", e.target.value)}
                            placeholder="Describa los hallazgos relevantes de las imágenes..."
                            rows={3}
                            disabled={!canEdit}
                          />
                        </div>
                      </div>

                      <Separator />

                      {/* Sección 9: Observaciones Médicas */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">9. OBSERVACIONES MÉDICAS</h3>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Observaciones</Label>
                            <Textarea
                              value={injuryData.medicalObservations}
                              onChange={(e) => updateInjuryData("medicalObservations", e.target.value)}
                              placeholder="Ingrese observaciones médicas adicionales..."
                              rows={4}
                              disabled={!canEdit}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Médico responsable</Label>
                            <Input
                              value={injuryData.responsibleDoctor}
                              onChange={(e) => updateInjuryData("responsibleDoctor", e.target.value)}
                              placeholder="Nombre y apellido del médico responsable"
                              disabled={!canEdit}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="enfermedades" className="space-y-6">
                  {" "}
                  {/* Changed from mt-6 to space-y-6 */}
                  {existingIllnesses.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Registros de Enfermedades</CardTitle>
                        <CardDescription>Historial de enfermedades registradas</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {existingIllnesses.map((illness, index) => (
                          <div key={illness.id} className="p-4 border rounded-lg space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold">Enfermedad #{index + 1}</p>
                                <p className="text-sm text-muted-foreground">
                                  {illness.createdAt ? new Date(illness.createdAt).toLocaleDateString() : "Sin fecha"}
                                </p>
                              </div>
                            </div>
                            <div className="space-y-1 text-sm">
                              {illness.diagnostico && (
                                <p>
                                  <strong>Diagnóstico:</strong> {illness.diagnostico}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-2 mt-2">
                                {illness.infeccionRespiratoria && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                    Infección Respiratoria
                                  </span>
                                )}
                                {illness.asmaAlergias && (
                                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                                    Asma/Alergias
                                  </span>
                                )}
                                {illness.dolorCabeza && (
                                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                                    Dolor de Cabeza
                                  </span>
                                )}
                                {illness.dolorEstomago && (
                                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                                    Dolor de Estómago
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                  {/* Formulario de nueva enfermedad */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Registrar Nueva Enfermedad</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* Sección 1: Tipo de enfermedad */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">Tipo de enfermedad</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="illness-respiratoria"
                              checked={illnessData.infeccionRespiratoria}
                              onCheckedChange={(checked) => updateIllnessData("infeccionRespiratoria", checked)}
                              disabled={!canEdit}
                            />
                            <Label htmlFor="illness-respiratoria" className="font-normal">
                              Infección en las vías respiratorias
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="illness-otros-organos"
                              checked={illnessData.infeccionOtrosOrganos}
                              onCheckedChange={(checked) => updateIllnessData("infeccionOtrosOrganos", checked)}
                              disabled={!canEdit}
                            />
                            <Label htmlFor="illness-otros-organos" className="font-normal">
                              Infección en otros órganos / partes del cuerpo
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="illness-fatiga"
                              checked={illnessData.fatigaMalestar}
                              onCheckedChange={(checked) => updateIllnessData("fatigaMalestar", checked)}
                              disabled={!canEdit}
                            />
                            <Label htmlFor="illness-fatiga" className="font-normal">
                              Fatiga, malestar o fiebre inexplicables
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="illness-asma"
                              checked={illnessData.asmaAlergias}
                              onCheckedChange={(checked) => updateIllnessData("asmaAlergias", checked)}
                              disabled={!canEdit}
                            />
                            <Label htmlFor="illness-asma" className="font-normal">
                              Asma o alergias
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="illness-estomago"
                              checked={illnessData.dolorEstomago}
                              onCheckedChange={(checked) => updateIllnessData("dolorEstomago", checked)}
                              disabled={!canEdit}
                            />
                            <Label htmlFor="illness-estomago" className="font-normal">
                              Dolor de estómago, diarrea o problemas intestinales
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="illness-cabeza"
                              checked={illnessData.dolorCabeza}
                              onCheckedChange={(checked) => updateIllnessData("dolorCabeza", checked)}
                              disabled={!canEdit}
                            />
                            <Label htmlFor="illness-cabeza" className="font-normal">
                              Dolor de cabeza, migraña o náuseas
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="illness-otro"
                              checked={illnessData.otroTipo}
                              onCheckedChange={(checked) => updateIllnessData("otroTipo", checked)}
                              disabled={!canEdit}
                            />
                            <Label htmlFor="illness-otro" className="font-normal">
                              Otros
                            </Label>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Sección 2: Sistema Orgánico Afectado */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">
                          Otra enfermedad, Sistema orgánico afectado
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="system-respiratorio"
                              checked={illnessData.respiratorio}
                              onCheckedChange={(checked) => updateIllnessData("respiratorio", checked)}
                              disabled={!canEdit}
                            />
                            <Label htmlFor="system-respiratorio" className="font-normal">
                              Respiratorio
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="system-dermatologico"
                              checked={illnessData.dermatologico}
                              onCheckedChange={(checked) => updateIllnessData("dermatologico", checked)}
                              disabled={!canEdit}
                            />
                            <Label htmlFor="system-dermatologico" className="font-normal">
                              Dermatológico
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="system-neurologico"
                              checked={illnessData.neurologico}
                              onCheckedChange={(checked) => updateIllnessData("neurologico", checked)}
                              disabled={!canEdit}
                            />
                            <Label htmlFor="system-neurologico" className="font-normal">
                              Neurológico
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="system-inmunologico"
                              checked={illnessData.inmunologico}
                              onCheckedChange={(checked) => updateIllnessData("inmunologico", checked)}
                              disabled={!canEdit}
                            />
                            <Label htmlFor="system-inmunologico" className="font-normal">
                              Inmunológico
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="system-metabolico"
                              checked={illnessData.metabolico}
                              onCheckedChange={(checked) => updateIllnessData("metabolico", checked)}
                              disabled={!canEdit}
                            />
                            <Label htmlFor="system-metabolico" className="font-normal">
                              Metabólicos/endocrinológicos
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="system-reumatologico"
                              checked={illnessData.trastornoReumatologico}
                              onCheckedChange={(checked) => updateIllnessData("trastornoReumatologico", checked)}
                              disabled={!canEdit}
                            />
                            <Label htmlFor="system-reumatologico" className="font-normal">
                              Trastorno reumatológico del tejido conectivo
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="system-renal"
                              checked={illnessData.renalUrogenital}
                              onCheckedChange={(checked) => updateIllnessData("renalUrogenital", checked)}
                              disabled={!canEdit}
                            />
                            <Label htmlFor="system-renal" className="font-normal">
                              Renal/urogenital/ginecológica
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="system-hematologico"
                              checked={illnessData.hematologico}
                              onCheckedChange={(checked) => updateIllnessData("hematologico", checked)}
                              disabled={!canEdit}
                            />
                            <Label htmlFor="system-hematologico" className="font-normal">
                              Hematológico
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="system-cardiovascular"
                              checked={illnessData.cardiovascular}
                              onCheckedChange={(checked) => updateIllnessData("cardiovascular", checked)}
                              disabled={!canEdit}
                            />
                            <Label htmlFor="system-cardiovascular" className="font-normal">
                              Cardiovascular
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="system-psiquiatrica"
                              checked={illnessData.psiquiatrica}
                              onCheckedChange={(checked) => updateIllnessData("psiquiatrica", checked)}
                              disabled={!canEdit}
                            />
                            <Label htmlFor="system-psiquiatrica" className="font-normal">
                              Psiquiátrica y conductual
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="system-dental"
                              checked={illnessData.dental}
                              onCheckedChange={(checked) => updateIllnessData("dental", checked)}
                              disabled={!canEdit}
                            />
                            <Label htmlFor="system-dental" className="font-normal">
                              Dental
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="system-oftalmologico"
                              checked={illnessData.oftalmologico}
                              onCheckedChange={(checked) => updateIllnessData("oftalmologico", checked)}
                              disabled={!canEdit}
                            />
                            <Label htmlFor="system-oftalmologico" className="font-normal">
                              Oftalmológico/otorrinolaringológico
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="system-ambiental"
                              checked={illnessData.ambiental}
                              onCheckedChange={(checked) => updateIllnessData("ambiental", checked)}
                              disabled={!canEdit}
                            />
                            <Label htmlFor="system-ambiental" className="font-normal">
                              Ambiental (incluyendo el calor/mal de altura)
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="system-otro"
                              checked={illnessData.otroSistema}
                              onCheckedChange={(checked) => updateIllnessData("otroSistema", checked)}
                              disabled={!canEdit}
                            />
                            <Label htmlFor="system-otro" className="font-normal">
                              Otro
                            </Label>
                          </div>
                        </div>

                        {illnessData.otroSistema && (
                          <div className="space-y-2 mt-4">
                            <Label>Describir otro sistema afectado</Label>
                            <Textarea
                              value={illnessData.otroSistemaDescripcion}
                              onChange={(e) => updateIllnessData("otroSistemaDescripcion", e.target.value)}
                              placeholder="Especifique el sistema orgánico..."
                              rows={2}
                              disabled={!canEdit}
                            />
                          </div>
                        )}
                      </div>

                      <Separator />

                      {/* Sección 3: Recurrencia */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">Recurrencia</h3>

                        <div className="space-y-2">
                          <Label>¿Se trató de una nueva lesión?</Label>
                          <div className="flex gap-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="nueva-si"
                                checked={illnessData.nuevaLesion === "si"}
                                onCheckedChange={(checked) => updateIllnessData("nuevaLesion", checked ? "si" : "")}
                                disabled={!canEdit}
                              />
                              <Label htmlFor="nueva-si" className="font-normal">
                                Sí
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="nueva-no"
                                checked={illnessData.nuevaLesion === "no"}
                                onCheckedChange={(checked) => updateIllnessData("nuevaLesion", checked ? "no" : "")}
                                disabled={!canEdit}
                              />
                              <Label htmlFor="nueva-no" className="font-normal">
                                No
                              </Label>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Diagnóstico</Label>
                          <Input
                            value={illnessData.diagnostico}
                            onChange={(e) => updateIllnessData("diagnostico", e.target.value)}
                            placeholder="Ingrese el diagnóstico..."
                            disabled={!canEdit}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Otros comentarios</Label>
                          <Textarea
                            value={illnessData.otrosComentarios}
                            onChange={(e) => updateIllnessData("otrosComentarios", e.target.value)}
                            placeholder="Ingrese comentarios adicionales..."
                            rows={3}
                            disabled={!canEdit}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Fecha de regreso al juego después de un episodio de enfermedad anterior</Label>
                          <Input
                            type="date"
                            value={illnessData.fechaRegresoJuego}
                            onChange={(e) => updateIllnessData("fechaRegresoJuego", e.target.value)}
                            disabled={!canEdit}
                          />
                        </div>
                      </div>

                      <Separator />

                      {/* Sección 4: Recursos */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">RECURSOS</h3>
                        <div className="space-y-4">
                          <div className="text-sm text-muted-foreground">
                            <p>Adjunte archivos relacionados con la enfermedad (estudios, informes médicos, etc.)</p>
                          </div>

                          <div className="space-y-2">
                            <Label>Adjuntar archivos</Label>
                            <Input
                              type="file"
                              disabled={!canEdit}
                              className="cursor-pointer"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            />
                            <p className="text-xs text-muted-foreground">
                              Formatos soportados: PDF, DOC, DOCX, JPG, PNG
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="estudios" className="space-y-6 mt-6">
                  {" "}
                  {/* Added */}
                  {/* Formulario de nuevo estudio */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Subir Estudio Complementario</CardTitle>
                      <CardDescription>Agregue estudios médicos en formato PDF con observaciones</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="study-observations">Observaciones</Label>
                        <Textarea
                          id="study-observations"
                          placeholder="Ingrese observaciones sobre el estudio..."
                          value={studyData.observations}
                          onChange={(e) => setStudyData((prev) => ({ ...prev, observations: e.target.value }))}
                          rows={4}
                          disabled={!canEdit} // Add disabled attribute
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Archivos PDF *</Label>
                        <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors">
                          <input
                            type="file"
                            onChange={handleStudyFileChange}
                            multiple
                            accept="application/pdf"
                            className="hidden"
                            id="study-file-upload"
                            disabled={!canEdit} // Add disabled attribute
                          />
                          <label htmlFor="study-file-upload" className="cursor-pointer block w-full h-full">
                            {" "}
                            {/* Make label block and full height */}
                            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm font-medium mb-1">
                              Arrastre archivos PDF o haga clic para seleccionar
                            </p>
                            <p className="text-xs text-muted-foreground">Solo archivos PDF</p>
                          </label>
                        </div>

                        {studyData.attachments.length > 0 && (
                          <div className="space-y-2 mt-4">
                            <p className="text-sm font-medium">
                              Archivos seleccionados ({studyData.attachments.length})
                            </p>
                            {studyData.attachments.map((file) => (
                              <div
                                key={file.id}
                                className="flex items-center gap-2 p-3 bg-muted rounded-lg group hover:bg-muted/80 transition-colors"
                              >
                                <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-sm flex-1 truncate">{file.name}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeStudyAttachment(file.id)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  disabled={!canEdit} // Add disabled attribute
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <Button
                        onClick={handleSaveStudy}
                        disabled={saving || !canEdit} // Add canEdit to disabled condition
                        className="w-full bg-red-700 hover:bg-red-800"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          "Guardar Estudio"
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                  {/* Historial de estudios */}
                  {existingStudies.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Historial de Estudios Complementarios</CardTitle>
                        <CardDescription>
                          {existingStudies.length} estudio{existingStudies.length !== 1 ? "s" : ""} registrado
                          {existingStudies.length !== 1 ? "s" : ""}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {existingStudies.map((study) => (
                          <Card key={study.id} className="bg-muted/30">
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <div>
                                  <CardTitle className="text-base">Subido por: {study.uploaded_by_name}</CardTitle>
                                  <CardDescription className="text-xs">
                                    {new Date(study.created_at).toLocaleString("es-AR", {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </CardDescription>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              {study.observations && (
                                <div>
                                  <Label className="text-xs text-muted-foreground">Observaciones:</Label>
                                  <p className="text-sm mt-1 whitespace-pre-wrap">{study.observations}</p>
                                </div>
                              )}

                              {study.attachments && study.attachments.length > 0 && (
                                <div>
                                  <Label className="text-xs text-muted-foreground">Archivos adjuntos:</Label>
                                  <div className="space-y-2 mt-2">
                                    {study.attachments.map((file) => (
                                      <div key={file.id} className="flex items-center gap-2 p-2 bg-background rounded">
                                        <FileText className="h-4 w-4 text-red-600" />
                                        <a
                                          href={file.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-sm flex-1 truncate hover:underline text-red-600"
                                        >
                                          {file.name}
                                        </a>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>

              {canEdit && (
                <div className="mt-6 flex justify-end">
                  <Button
                    className="bg-orange-700 hover:bg-orange-800"
                    onClick={
                      activeTab === "lesiones"
                        ? handleSaveInjury
                        : activeTab === "enfermedades"
                          ? handleSaveIllness
                          : handleSaveStudy
                    } // Added condition for studies
                    disabled={saving}
                  >
                    {saving ? <Loader2 className="animate-spin h-4 w-4" /> : "Guardar Información"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </AuthGuard>
  )
}
