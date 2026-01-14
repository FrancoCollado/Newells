"use client"

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
import { ArrowLeft, Loader2, Stethoscope } from "lucide-react"
import { hasPermission } from "@/lib/rbac"
import { useToast } from "@/hooks/use-toast"

import {
  saveInjuryAction,
  saveIllnessAction,
  getPlayerInjuriesAction,
  getPlayerIllnessesAction,
  updatePlayerInjuryStatusAction,
} from "./actions"
import type { Injury } from "@/lib/injuries"
import type { Illness } from "@/lib/illnesses"

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

  const [existingInjuries, setExistingInjuries] = useState<Injury[]>([])
  const [existingIllnesses, setExistingIllnesses] = useState<Illness[]>([])

  const [injuryData, setInjuryData] = useState({
    // Datos del evento lesional
    injuryDate: "",
    injuryTime: "",
    context: "",
    gameMinute: "",
    surface: "",

    // Mecanismo de la lesión
    mechanismType: "",
    specificSituation: "",

    // Localización anatómica
    anatomicalLocation: "",
    affectedSide: "",

    // Tipo de lesión
    injuryType: "",
    injuryTypeOther: "",
    clinicalDiagnosis: "",

    // Grado de severidad
    severity: "",
    daysAbsent: "",

    // Evolución
    evolutionType: "",
    treatment: "",

    // Imágenes complementarias
    hasUltrasound: false,
    hasMri: false,
    hasXray: false,
    hasCt: false,
    imagingFindings: "",

    // Alta y RTP
    medicalDischargeDate: "",
    progressiveReturnDate: "",
    competitiveRtpDate: "",
    rtpCriteriaClinical: false,
    rtpCriteriaFunctional: false,
    rtpCriteriaStrength: false,
    rtpCriteriaGps: false,

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

    // Sistema orgánico afectado
    respiratorio: false,
    dermatologico: false,
    neurologico: false,
    inmunologico: false,
    metabolico: false,
    trastornoReumatologico: false,
    renalUrogenital: false,
    hematologico: false,
    cardiovascular: false,
    psiquiatrica: false,
    dental: false,
    oftalmologico: false,
    ambiental: false,
    otroSistema: false,
    otroSistemaDescripcion: "", // Changed from otroSistemaDesc
    nuevaLesion: "", // Changed from nuevaEnfermedad
    diagnostico: "",
    otrosComentarios: "",
    fechaRegresoJuego: "", // Changed from fechaRegresoAnterior
    attachments: [] as { fecha: string; descripcion: string }[],
  })

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
        if (!currentUser) {
          router.push("/login") // Changed from router.push("/dashboard")
          return
        }
        setUser(currentUser)

        const playerId = params.id as string
        console.log("[v0] Loading player data for ID:", playerId)
        const playerData = await getPlayerById(playerId)
        setPlayer(playerData)
        console.log("[v0] Player loaded:", {
          name: playerData.name,
          age: playerData.age,
          height: playerData.height,
          weight: playerData.weight,
          leagueStatsCount: playerData.leagueStats?.length || 0,
          leagueStats: playerData.leagueStats,
        })

        // Actualizar el estado inicial de isInjured basado en los datos del jugador
        if (playerData && playerData.isInjured !== undefined) {
          setIsInjured(playerData.isInjured)
        }

        console.log("[v0] Cargando lesiones y enfermedades del jugador...")
        const injuriesResult = await getPlayerInjuriesAction(playerId)
        const illnessesResult = await getPlayerIllnessesAction(playerId)

        if (injuriesResult.success) {
          console.log("[v0] Lesiones cargadas:", injuriesResult.data.length)
          setExistingInjuries(injuriesResult.data)
        }

        if (illnessesResult.success) {
          console.log("[v0] Enfermedades cargadas:", illnessesResult.data.length)
          setExistingIllnesses(illnessesResult.data)
        }
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
    setInjuryData((prev) => ({ ...prev, [field]: value }))
  }

  const updateIllnessData = (field: string, value: any) => {
    setIllnessData((prev) => ({ ...prev, [field]: value }))
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
        context: "",
        gameMinute: "",
        surface: "",
        mechanismType: "",
        specificSituation: "",
        anatomicalLocation: "",
        affectedSide: "",
        injuryType: "",
        injuryTypeOther: "",
        clinicalDiagnosis: "",
        severity: "",
        daysAbsent: "",
        evolutionType: "",
        treatment: "",
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
        respiratorio: false,
        dermatologico: false,
        neurologico: false,
        inmunologico: false,
        metabolico: false,
        trastornoReumatologico: false,
        renalUrogenital: false,
        hematologico: false,
        cardiovascular: false,
        psiquiatrica: false,
        dental: false,
        oftalmologico: false,
        ambiental: false,
        otroSistema: false,
        otroSistemaDescripcion: "", // Changed from otroSistemaDesc
        nuevaLesion: "", // Changed from nuevaEnfermedad
        diagnostico: "",
        otrosComentarios: "",
        fechaRegresoJuego: "", // Changed from fechaRegresoAnterior
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
        <header className="border-b bg-gradient-to-r from-orange-700 to-orange-900 text-white">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => router.push(`/player/${player.id}`)}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Perfil
              </Button>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <Stethoscope className="h-6 w-6" />
              <div>
                <h1 className="text-2xl font-bold">Lesiones y Enfermedades</h1>
                <p className="text-sm text-orange-100">{player.name}</p>
              </div>
            </div>
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
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="lesiones">Lesiones Varias ({existingInjuries.length})</TabsTrigger>{" "}
                  {/* Updated count */}
                  <TabsTrigger value="enfermedades">Enfermedades ({existingIllnesses.length})</TabsTrigger>{" "}
                  {/* Updated count */}
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
                            </div>
                            <div className="space-y-1 text-sm">
                              {injury.anatomicalLocation && (
                                <p>
                                  <strong>Localización:</strong> {injury.anatomicalLocation}
                                </p>
                              )}
                              {injury.injuryType && (
                                <p>
                                  <strong>Tipo:</strong> {injury.injuryType}
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
                          </div>
                        ))}
                      </CardContent>
                    </Card>
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
                                checked={injuryData.context === "entrenamiento"}
                                onCheckedChange={(checked) =>
                                  updateInjuryData("context", checked ? "entrenamiento" : "")
                                }
                                disabled={!canEdit}
                              />
                              <Label htmlFor="context-entrenamiento" className="font-normal">
                                Entrenamiento
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="context-partido-oficial"
                                checked={injuryData.context === "partido_oficial"}
                                onCheckedChange={(checked) =>
                                  updateInjuryData("context", checked ? "partido_oficial" : "")
                                }
                                disabled={!canEdit}
                              />
                              <Label htmlFor="context-partido-oficial" className="font-normal">
                                Partido oficial
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="context-partido-amistoso"
                                checked={injuryData.context === "partido_amistoso"}
                                onCheckedChange={(checked) =>
                                  updateInjuryData("context", checked ? "partido_amistoso" : "")
                                }
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
                                checked={injuryData.surface === "cesped_natural"}
                                onCheckedChange={(checked) =>
                                  updateInjuryData("surface", checked ? "cesped_natural" : "")
                                }
                                disabled={!canEdit}
                              />
                              <Label htmlFor="surface-natural" className="font-normal">
                                Césped natural
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="surface-sintetico"
                                checked={injuryData.surface === "cesped_sintetico"}
                                onCheckedChange={(checked) =>
                                  updateInjuryData("surface", checked ? "cesped_sintetico" : "")
                                }
                                disabled={!canEdit}
                              />
                              <Label htmlFor="surface-sintetico" className="font-normal">
                                Césped sintético
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="surface-otra"
                                checked={injuryData.surface === "otra"}
                                onCheckedChange={(checked) => updateInjuryData("surface", checked ? "otra" : "")}
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
                                checked={injuryData.mechanismType === "contacto"}
                                onCheckedChange={(checked) =>
                                  updateInjuryData("mechanismType", checked ? "contacto" : "")
                                }
                                disabled={!canEdit}
                              />
                              <Label htmlFor="mechanism-contacto" className="font-normal">
                                Contacto
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="mechanism-no-contacto"
                                checked={injuryData.mechanismType === "no_contacto"}
                                onCheckedChange={(checked) =>
                                  updateInjuryData("mechanismType", checked ? "no_contacto" : "")
                                }
                                disabled={!canEdit}
                              />
                              <Label htmlFor="mechanism-no-contacto" className="font-normal">
                                No contacto
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="mechanism-sobrecarga"
                                checked={injuryData.mechanismType === "sobrecarga"}
                                onCheckedChange={(checked) =>
                                  updateInjuryData("mechanismType", checked ? "sobrecarga" : "")
                                }
                                disabled={!canEdit}
                              />
                              <Label htmlFor="mechanism-sobrecarga" className="font-normal">
                                Sobrecarga / Fatiga
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="mechanism-trauma"
                                checked={injuryData.mechanismType === "trauma_indirecto"}
                                onCheckedChange={(checked) =>
                                  updateInjuryData("mechanismType", checked ? "trauma_indirecto" : "")
                                }
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
                                checked={injuryData.specificSituation === "sprint"}
                                onCheckedChange={(checked) =>
                                  updateInjuryData("specificSituation", checked ? "sprint" : "")
                                }
                                disabled={!canEdit}
                              />
                              <Label htmlFor="situation-sprint" className="font-normal">
                                Sprint
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="situation-cambio"
                                checked={injuryData.specificSituation === "cambio_direccion"}
                                onCheckedChange={(checked) =>
                                  updateInjuryData("specificSituation", checked ? "cambio_direccion" : "")
                                }
                                disabled={!canEdit}
                              />
                              <Label htmlFor="situation-cambio" className="font-normal">
                                Cambio de dirección
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="situation-salto"
                                checked={injuryData.specificSituation === "salto_caida"}
                                onCheckedChange={(checked) =>
                                  updateInjuryData("specificSituation", checked ? "salto_caida" : "")
                                }
                                disabled={!canEdit}
                              />
                              <Label htmlFor="situation-salto" className="font-normal">
                                Salto / Caída
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="situation-golpe"
                                checked={injuryData.specificSituation === "golpe_choque"}
                                onCheckedChange={(checked) =>
                                  updateInjuryData("specificSituation", checked ? "golpe_choque" : "")
                                }
                                disabled={!canEdit}
                              />
                              <Label htmlFor="situation-golpe" className="font-normal">
                                Golpe / Choque
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="situation-disparo"
                                checked={injuryData.specificSituation === "disparo"}
                                onCheckedChange={(checked) =>
                                  updateInjuryData("specificSituation", checked ? "disparo" : "")
                                }
                                disabled={!canEdit}
                              />
                              <Label htmlFor="situation-disparo" className="font-normal">
                                Disparo
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="situation-aceleracion"
                                checked={injuryData.specificSituation === "aceleracion_desaceleracion"}
                                onCheckedChange={(checked) =>
                                  updateInjuryData("specificSituation", checked ? "aceleracion_desaceleracion" : "")
                                }
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
                                    checked={injuryData.anatomicalLocation === location}
                                    onCheckedChange={(checked) =>
                                      updateInjuryData("anatomicalLocation", checked ? location : "")
                                    }
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
                                    checked={injuryData.anatomicalLocation === location}
                                    onCheckedChange={(checked) =>
                                      updateInjuryData("anatomicalLocation", checked ? location : "")
                                    }
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
                                    checked={injuryData.anatomicalLocation === location}
                                    onCheckedChange={(checked) =>
                                      updateInjuryData("anatomicalLocation", checked ? location : "")
                                    }
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
                                <Checkbox
                                  id="side-derecho"
                                  checked={injuryData.affectedSide === "derecho"}
                                  onCheckedChange={(checked) =>
                                    updateInjuryData("affectedSide", checked ? "derecho" : "")
                                  }
                                  disabled={!canEdit}
                                />
                                <Label htmlFor="side-derecho" className="font-normal">
                                  Derecho
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="side-izquierdo"
                                  checked={injuryData.affectedSide === "izquierdo"}
                                  onCheckedChange={(checked) =>
                                    updateInjuryData("affectedSide", checked ? "izquierdo" : "")
                                  }
                                  disabled={!canEdit}
                                />
                                <Label htmlFor="side-izquierdo" className="font-normal">
                                  Izquierdo
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="side-bilateral"
                                  checked={injuryData.affectedSide === "bilateral"}
                                  onCheckedChange={(checked) =>
                                    updateInjuryData("affectedSide", checked ? "bilateral" : "")
                                  }
                                  disabled={!canEdit}
                                />
                                <Label htmlFor="side-bilateral" className="font-normal">
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
                                checked={injuryData.injuryType === value}
                                onCheckedChange={(checked) => updateInjuryData("injuryType", checked ? value : "")}
                                disabled={!canEdit}
                              />
                              <Label htmlFor={`injury-type-${value}`} className="font-normal">
                                {label}
                              </Label>
                            </div>
                          ))}
                        </div>

                        {injuryData.injuryType === "otra" && (
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
                              onCheckedChange={(checked) => updateInjuryData("severity", checked ? "leve" : "")}
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
                              onCheckedChange={(checked) => updateInjuryData("severity", checked ? "moderada" : "")}
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
                              onCheckedChange={(checked) => updateInjuryData("severity", checked ? "severa" : "")}
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
                                onCheckedChange={(checked) => updateInjuryData("evolutionType", checked ? "nueva" : "")}
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
                                onCheckedChange={(checked) =>
                                  updateInjuryData("evolutionType", checked ? "recaida" : "")
                                }
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
                                onCheckedChange={(checked) =>
                                  updateInjuryData("evolutionType", checked ? "recidiva" : "")
                                }
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

                      {/* Sección 9: Alta y Return to Play */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">9. ALTA Y RETURN TO PLAY (RTP)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Fecha de alta médica</Label>
                            <Input
                              type="date"
                              value={injuryData.medicalDischargeDate}
                              onChange={(e) => updateInjuryData("medicalDischargeDate", e.target.value)}
                              disabled={!canEdit}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Fecha de reintegro progresivo</Label>
                            <Input
                              type="date"
                              value={injuryData.progressiveReturnDate}
                              onChange={(e) => updateInjuryData("progressiveReturnDate", e.target.value)}
                              disabled={!canEdit}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Fecha de RTP competitivo</Label>
                            <Input
                              type="date"
                              value={injuryData.competitiveRtpDate}
                              onChange={(e) => updateInjuryData("competitiveRtpDate", e.target.value)}
                              disabled={!canEdit}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Criterios de RTP cumplidos</Label>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="rtp-clinical"
                                checked={injuryData.rtpCriteriaClinical}
                                onCheckedChange={(checked) => updateInjuryData("rtpCriteriaClinical", checked)}
                                disabled={!canEdit}
                              />
                              <Label htmlFor="rtp-clinical" className="font-normal">
                                Clínicos
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="rtp-functional"
                                checked={injuryData.rtpCriteriaFunctional}
                                onCheckedChange={(checked) => updateInjuryData("rtpCriteriaFunctional", checked)}
                                disabled={!canEdit}
                              />
                              <Label htmlFor="rtp-functional" className="font-normal">
                                Funcionales
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="rtp-strength"
                                checked={injuryData.rtpCriteriaStrength}
                                onCheckedChange={(checked) => updateInjuryData("rtpCriteriaStrength", checked)}
                                disabled={!canEdit}
                              />
                              <Label htmlFor="rtp-strength" className="font-normal">
                                Fuerza / Potencia
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="rtp-gps"
                                checked={injuryData.rtpCriteriaGps}
                                onCheckedChange={(checked) => updateInjuryData("rtpCriteriaGps", checked)}
                                disabled={!canEdit}
                              />
                              <Label htmlFor="rtp-gps" className="font-normal">
                                Campo / GPS
                              </Label>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Sección 10: Observaciones Médicas */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2">10. OBSERVACIONES MÉDICAS</h3>
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
              </Tabs>

              {canEdit && (
                <div className="mt-6 flex justify-end">
                  <Button
                    className="bg-orange-700 hover:bg-orange-800"
                    onClick={activeTab === "lesiones" ? handleSaveInjury : handleSaveIllness}
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
