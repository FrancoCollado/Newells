"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { MedicalRecord } from "@/lib/medical-records"
import { Trash2, Plus, Loader2, Upload, FileText, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { saveStudyAction, getPlayerStudiesAction } from "@/app/actions/medical-studies-actions"
import type { Player } from "@/lib/players"

type MedicalRecordFormProps = {
  playerId: string
  player: Player
  existingRecord: MedicalRecord | null
  userId: string
  userName?: string
  userRole: string
}

export function MedicalRecordForm({ playerId, player, existingRecord, userId, userName = "Usuario", userRole }: MedicalRecordFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(!existingRecord)
  const [isSaving, setIsSaving] = useState(false)
  
  // Combine existing record with player data for autocompletion
  const [formData, setFormData] = useState<Partial<MedicalRecord>>(() => {
    const baseData = existingRecord || {}
    
    // Autocomplete only if the field is empty in existing record
    return {
      ...baseData,
      birthDate: baseData.birthDate || player.extendedData?.birthDate || "",
      dni: baseData.dni || player.extendedData?.document || "",
      phoneMobile: baseData.phoneMobile || player.extendedData?.phone || "",
      heightCm: baseData.heightCm || player.height || undefined,
      weightKg: baseData.weightKg || player.weight || undefined,
      currentAddressProvince: baseData.currentAddressProvince || player.extendedData?.province || "",
      examiningDoctor: baseData.examiningDoctor || userName || "",
      pieHabil: baseData.pieHabil || player.dominantFoot || "",
      // Add other autocompletions if fields match
    }
  })
  
  // Studies state
  const [studies, setStudies] = useState<any[]>([])
  const [studyData, setStudyData] = useState({
    observations: "",
    attachments: [] as Array<{ id: string; name: string; type: string; url: string }>,
  })
  const [savingStudy, setSavingStudy] = useState(false)

  const canEdit = userRole === "medico" || userRole === "dirigente"

  useEffect(() => {
    const loadStudies = async () => {
      const data = await getPlayerStudiesAction(playerId)
      setStudies(data)
    }
    loadStudies()
  }, [playerId])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/medical-records/${playerId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Error al guardar")

      router.refresh()
      setIsEditing(false)
    } catch (error) {
      console.error("Error saving medical record:", error)
      alert("Error al guardar la ficha médica")
    } finally {
      setIsSaving(false)
    }
  }

  const addArrayItem = (field: string, item: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...((prev[field as keyof MedicalRecord] as any[]) || []), item],
    }))
  }

  const removeArrayItem = (field: string, index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field as keyof MedicalRecord] as any[])?.filter((_, i) => i !== index) || [],
    }))
  }

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

  const handleSaveStudy = async () => {
    if (!canEdit) return

    if (!studyData.observations.trim() && studyData.attachments.length === 0) {
      toast({
        title: "Campos requeridos",
        description: "Debe agregar observaciones o al menos un archivo PDF",
        variant: "destructive",
      })
      return
    }

    setSavingStudy(true)
    try {
      const result = await saveStudyAction(playerId, userId, userName, studyData.observations, studyData.attachments)

      if (result.success) {
        toast({
          title: "Estudio guardado",
          description: "El estudio complementario se ha registrado correctamente",
        })
        
        // Recargar estudios
        const updatedStudies = await getPlayerStudiesAction(playerId)
        setStudies(updatedStudies)

        // Limpiar formulario
        setStudyData({
          observations: "",
          attachments: [],
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Error al guardar estudio:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el estudio complementario",
        variant: "destructive",
      })
    } finally {
      setSavingStudy(false)
    }
  }

  if (!isEditing && existingRecord) {
    return <MedicalRecordView record={existingRecord} onEdit={() => setIsEditing(true)} canEdit={canEdit} studies={studies} />
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">Ficha Médica del Deportista</TabsTrigger>
          <TabsTrigger value="examination">Examen Médico</TabsTrigger>
          <TabsTrigger value="studies">Estudios Complementarios</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Fecha de Nacimiento</Label>
                  <Input
                    type="date"
                    value={formData.birthDate || ""}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Ciudad de Nacimiento</Label>
                  <Input
                    value={formData.birthPlaceCity || ""}
                    onChange={(e) => setFormData({ ...formData, birthPlaceCity: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Provincia de Nacimiento</Label>
                  <Input
                    value={formData.birthPlaceProvince || ""}
                    onChange={(e) => setFormData({ ...formData, birthPlaceProvince: e.target.value })}
                  />
                </div>
                <div>
                  <Label>País de Nacimiento</Label>
                  <Input
                    value={formData.birthPlaceCountry || ""}
                    onChange={(e) => setFormData({ ...formData, birthPlaceCountry: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Ciudad (Domicilio Actual)</Label>
                  <Input
                    value={formData.currentAddressCity || ""}
                    onChange={(e) => setFormData({ ...formData, currentAddressCity: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Provincia</Label>
                  <Input
                    value={formData.currentAddressProvince || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentAddressProvince: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>País</Label>
                  <Input
                    value={formData.currentAddressCountry || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentAddressCountry: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>DNI</Label>
                  <Input
                    value={formData.dni || ""}
                    onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Pasaporte</Label>
                  <Input
                    value={formData.passport || ""}
                    onChange={(e) => setFormData({ ...formData, passport: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Teléfono Fijo</Label>
                  <Input
                    value={formData.phoneLandline || ""}
                    onChange={(e) => setFormData({ ...formData, phoneLandline: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Teléfono Móvil</Label>
                  <Input
                    value={formData.phoneMobile || ""}
                    onChange={(e) => setFormData({ ...formData, phoneMobile: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Seguridad Social (Tipo)</Label>
                  <Input
                    placeholder="Obra social / Prepaga"
                    value={formData.socialSecurityType || ""}
                    onChange={(e) => setFormData({ ...formData, socialSecurityType: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Nº de Seguridad Social</Label>
                  <Input
                    value={formData.socialSecurityNumber || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialSecurityNumber: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nombre del Médico de Cabecera</Label>
                  <Input
                    value={formData.primaryDoctorName || ""}
                    onChange={(e) => setFormData({ ...formData, primaryDoctorName: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Teléfono del Médico de Cabecera</Label>
                  <Input
                    value={formData.primaryDoctorPhone || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        primaryDoctorPhone: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Family History */}
          <Card>
            <CardHeader>
              <CardTitle>Historias Familiares</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="familyHistoryCardiac"
                    checked={formData.familyHistoryCardiac || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, familyHistoryCardiac: !!checked })}
                  />
                  <Label htmlFor="familyHistoryCardiac">Problemas cardíacos</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="familyHistoryCancer"
                    checked={formData.familyHistoryCancer || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, familyHistoryCancer: !!checked })}
                  />
                  <Label htmlFor="familyHistoryCancer">Cáncer o tumor</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="familyHistoryEmotional"
                    checked={formData.familyHistoryEmotional || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, familyHistoryEmotional: !!checked })}
                  />
                  <Label htmlFor="familyHistoryEmotional">Problemas emocionales</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="familyHistoryHeadaches"
                    checked={formData.familyHistoryHeadaches || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, familyHistoryHeadaches: !!checked })}
                  />
                  <Label htmlFor="familyHistoryHeadaches">Dolor de cabeza o migraña</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="familyHistoryAnemia"
                    checked={formData.familyHistoryAnemia || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, familyHistoryAnemia: !!checked })}
                  />
                  <Label htmlFor="familyHistoryAnemia">Anemia</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="familyHistoryAllergiesAsthma"
                    checked={formData.familyHistoryAllergiesAsthma || false}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        familyHistoryAllergiesAsthma: !!checked,
                      })
                    }
                  />
                  <Label htmlFor="familyHistoryAllergiesAsthma">Alergias o Asma</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="familyHistoryEpilepsy"
                    checked={formData.familyHistoryEpilepsy || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, familyHistoryEpilepsy: !!checked })}
                  />
                  <Label htmlFor="familyHistoryEpilepsy">Epilepsia</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="familyHistoryDiabetes"
                    checked={formData.familyHistoryDiabetes || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, familyHistoryDiabetes: !!checked })}
                  />
                  <Label htmlFor="familyHistoryDiabetes">Diabetes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="familyHistoryStomach"
                    checked={formData.familyHistoryStomach || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, familyHistoryStomach: !!checked })}
                  />
                  <Label htmlFor="familyHistoryStomach">Dolencias estomacales</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="familyHistoryRenal"
                    checked={formData.familyHistoryRenal || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, familyHistoryRenal: !!checked })}
                  />
                  <Label htmlFor="familyHistoryRenal">Dolencias renales o vejiga</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="familyHistorySuddenDeath"
                    checked={formData.familyHistorySuddenDeath || false}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        familyHistorySuddenDeath: !!checked,
                      })
                    }
                  />
                  <Label htmlFor="familyHistorySuddenDeath">
                    Ha muerto algún filiar menor de 50 a en forma repentina
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="familyHistoryGenetic"
                    checked={formData.familyHistoryGenetic || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, familyHistoryGenetic: !!checked })}
                  />
                  <Label htmlFor="familyHistoryGenetic">Anomalías genéticas</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="familyHistoryHypertension"
                    checked={formData.familyHistoryHypertension || false}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        familyHistoryHypertension: !!checked,
                      })
                    }
                  />
                  <Label htmlFor="familyHistoryHypertension">Tensión arterial alta</Label>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Label>Comentarios de Historia Familiar</Label>
                <Textarea
                  value={formData.familyHistoryComments || ""}
                  onChange={(e) => setFormData({ ...formData, familyHistoryComments: e.target.value })}
                  placeholder="Ingrese comentarios o detalles adicionales sobre la historia familiar..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Critical Medical Information */}
          <Card>
            <CardHeader>
              <CardTitle>Información Médica Relevante</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Alergias</Label>
                  <Textarea
                    value={formData.allergies || ""}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    placeholder="Especifique alergias..."
                  />
                </div>
                <div>
                  <Label>Medicación Actual</Label>
                  <Textarea
                    value={formData.currentMedication || ""}
                    onChange={(e) => setFormData({ ...formData, currentMedication: e.target.value })}
                    placeholder="Especifique si toma medicación actualmente..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label>Enfermedades actual</Label>
                  <Textarea
                    value={formData.currentIllnesses || ""}
                    onChange={(e) => setFormData({ ...formData, currentIllnesses: e.target.value })}
                    placeholder="Especifique si el jugador padece enfermedades actualmente..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal History */}
          <Card>
            <CardHeader>
              <CardTitle>Antecedentes Personales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Antecedentes Patológicos</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      addArrayItem("personalPathological", {
                        condition: "",
                        details: "",
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-1" /> Agregar
                  </Button>
                </div>
                {(formData.personalPathological || []).map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <Input
                      placeholder="Condición"
                      value={item.condition}
                      onChange={(e) => {
                        const updated = [...(formData.personalPathological || [])]
                        updated[idx] = { ...item, condition: e.target.value }
                        setFormData({ ...formData, personalPathological: updated })
                      }}
                    />
                    <Input
                      placeholder="Detalles"
                      value={item.details}
                      onChange={(e) => {
                        const updated = [...(formData.personalPathological || [])]
                        updated[idx] = { ...item, details: e.target.value }
                        setFormData({ ...formData, personalPathological: updated })
                      }}
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => removeArrayItem("personalPathological", idx)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Antecedentes Quirúrgicos</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      addArrayItem("personalSurgical", {
                        procedure: "",
                        details: "",
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-1" /> Agregar
                  </Button>
                </div>
                {(formData.personalSurgical || []).map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <Input
                      placeholder="Procedimiento"
                      value={item.procedure}
                      onChange={(e) => {
                        const updated = [...(formData.personalSurgical || [])]
                        updated[idx] = { ...item, procedure: e.target.value }
                        setFormData({ ...formData, personalSurgical: updated })
                      }}
                    />
                    <Input
                      placeholder="Detalles"
                      value={item.details}
                      onChange={(e) => {
                        const updated = [...(formData.personalSurgical || [])]
                        updated[idx] = { ...item, details: e.target.value }
                        setFormData({ ...formData, personalSurgical: updated })
                      }}
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => removeArrayItem("personalSurgical", idx)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Lesiones de Jerarquía</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => addArrayItem("personalInjuries", { injury: "", details: "" })}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Agregar
                  </Button>
                </div>
                {(formData.personalInjuries || []).map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <Input
                      placeholder="Lesión"
                      value={item.injury}
                      onChange={(e) => {
                        const updated = [...(formData.personalInjuries || [])]
                        updated[idx] = { ...item, injury: e.target.value }
                        setFormData({ ...formData, personalInjuries: updated })
                      }}
                    />
                    <Input
                      placeholder="Detalles"
                      value={item.details}
                      onChange={(e) => {
                        const updated = [...(formData.personalInjuries || [])]
                        updated[idx] = { ...item, details: e.target.value }
                        setFormData({ ...formData, personalInjuries: updated })
                      }}
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => removeArrayItem("personalInjuries", idx)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div>
                <Label>Comentarios</Label>
                <Textarea
                  value={formData.personalComments || ""}
                  onChange={(e) => setFormData({ ...formData, personalComments: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Sports History */}
          <Card>
            <CardHeader>
              <CardTitle>Historia Personal de Deportes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-2">
                <Label>Deportes Practicados</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    addArrayItem("sportsHistory", {
                      sport: "",
                      ageStarted: 0,
                      duration: "",
                      competitive: false,
                      observations: "",
                    })
                  }
                >
                  <Plus className="h-4 w-4 mr-1" /> Agregar Deporte
                </Button>
              </div>
              {(formData.sportsHistory || []).map((item: any, idx: number) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-2 p-3 border rounded">
                  <Input
                    placeholder="Deporte"
                    value={item.sport}
                    onChange={(e) => {
                      const updated = [...(formData.sportsHistory || [])]
                      updated[idx] = { ...item, sport: e.target.value }
                      setFormData({ ...formData, sportsHistory: updated })
                    }}
                  />
                  <Input
                    type="number"
                    placeholder="Edad de Inicio"
                    value={item.ageStarted}
                    onChange={(e) => {
                      const updated = [...(formData.sportsHistory || [])]
                      updated[idx] = { ...item, ageStarted: Number.parseInt(e.target.value) }
                      setFormData({ ...formData, sportsHistory: updated })
                    }}
                  />
                  <Input
                    placeholder="Tiempo"
                    value={item.duration}
                    onChange={(e) => {
                      const updated = [...(formData.sportsHistory || [])]
                      updated[idx] = { ...item, duration: e.target.value }
                      setFormData({ ...formData, sportsHistory: updated })
                    }}
                  />
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={item.competitive}
                      onCheckedChange={(checked) => {
                        const updated = [...(formData.sportsHistory || [])]
                        updated[idx] = { ...item, competitive: !!checked }
                        setFormData({ ...formData, sportsHistory: updated })
                      }}
                    />
                    <Label>Competitivo</Label>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Observaciones"
                      value={item.observations}
                      onChange={(e) => {
                        const updated = [...(formData.sportsHistory || [])]
                        updated[idx] = { ...item, observations: e.target.value }
                        setFormData({ ...formData, sportsHistory: updated })
                      }}
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => removeArrayItem("sportsHistory", idx)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examination" className="space-y-6">
          {/* Medical Examination */}
          <Card>
            <CardHeader>
              <CardTitle>Examen Médico</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Médico Evaluador</Label>
                  <Input
                    value={formData.examiningDoctor || ""}
                    onChange={(e) => setFormData({ ...formData, examiningDoctor: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Fecha de Examen</Label>
                  <Input
                    type="date"
                    value={formData.examDate || ""}
                    onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label>Presión Arterial</Label>
                  <Input
                    placeholder="120/80"
                    value={formData.bloodPressure || ""}
                    onChange={(e) => setFormData({ ...formData, bloodPressure: e.target.value })}
                  />
                </div>
                <div>
                  <Label>FC/min</Label>
                  <Input
                    type="number"
                    value={formData.heartRate || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        heartRate: Number.parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label>FR/min</Label>
                  <Input
                    type="number"
                    value={formData.respiratoryRate || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        respiratoryRate: Number.parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Talla (cm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.heightCm || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        heightCm: Number.parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Peso (kg)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.weightKg || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        weightKg: Number.parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <Label>Sistema Nervioso Central - Anomalías</Label>
                <Textarea
                  placeholder="NO PRESENTA ANOMALÍAS"
                  value={formData.cnsAnomalies || ""}
                  onChange={(e) => setFormData({ ...formData, cnsAnomalies: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Eyes, Ears, Nose, Throat */}
          <Card>
            <CardHeader>
              <CardTitle>Oído, Ojo, Nariz, Boca y Garganta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Agudeza Visual (Izq)</Label>
                  <Input
                    placeholder="10/10"
                    value={formData.visualAcuityLeft || ""}
                    onChange={(e) => setFormData({ ...formData, visualAcuityLeft: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Agudeza Visual (Der)</Label>
                  <Input
                    placeholder="10/10"
                    value={formData.visualAcuityRight || ""}
                    onChange={(e) => setFormData({ ...formData, visualAcuityRight: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Visión de Colores</Label>
                  <Input
                    placeholder="CONSERVADA"
                    value={formData.colorVision || ""}
                    onChange={(e) => setFormData({ ...formData, colorVision: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Movimientos Oculares</Label>
                  <Input
                    placeholder="CONSERVADOS"
                    value={formData.ocularMovements || ""}
                    onChange={(e) => setFormData({ ...formData, ocularMovements: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Campo Visual</Label>
                  <Input
                    placeholder="CONSERVADO"
                    value={formData.visualField || ""}
                    onChange={(e) => setFormData({ ...formData, visualField: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Ojo Director</Label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formData.dominantEye || ""}
                    onChange={(e) => setFormData({ ...formData, dominantEye: e.target.value })}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="derecho">DERECHO</option>
                    <option value="izquierdo">IZQUIERDO</option>
                  </select>
                </div>
                <div>
                  <Label>Pie hábil</Label>
                  <Input
                    value={formData.pieHabil || ""}
                    onChange={(e) => setFormData({ ...formData, pieHabil: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Lateralidad</Label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formData.laterality || ""}
                    onChange={(e) => setFormData({ ...formData, laterality: e.target.value })}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="homolateral">HOMOLATERAL</option>
                    <option value="heterolateral">HETEROLATERAL</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Pupilas</Label>
                  <Input
                    placeholder="CAE, ISOC/REACTIVAS"
                    value={formData.pupils || ""}
                    onChange={(e) => setFormData({ ...formData, pupils: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Amígdalas</Label>
                  <Input
                    value={formData.tonsils || ""}
                    onChange={(e) => setFormData({ ...formData, tonsils: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Especificar Anomalías</Label>
                <Textarea
                  placeholder="NO PRESENTA ANOMALÍAS"
                  value={formData.entAnomalies || ""}
                  onChange={(e) => setFormData({ ...formData, entAnomalies: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Respiratory */}
          <Card>
            <CardHeader>
              <CardTitle>Respiratorio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Especificar Anomalías</Label>
                <Textarea
                  placeholder="NO PRESENTA ANOMALÍAS AL EXAMEN CLÍNICO"
                  value={formData.respiratoryAnomalies || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      respiratoryAnomalies: e.target.value,
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Cardiovascular */}
          <Card>
            <CardHeader>
              <CardTitle>Cardiovascular</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Especificar Anomalías</Label>
                <Textarea
                  placeholder="NO PRESENTA ANOMALÍAS CLINICAMENTE DETECTABLES"
                  value={formData.cardiovascularAnomalies || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cardiovascularAnomalies: e.target.value,
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Skin */}
          <Card>
            <CardHeader>
              <CardTitle>Piel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Lesiones</Label>
                  <Input
                    placeholder="Ausente"
                    value={formData.skinLesions || ""}
                    onChange={(e) => setFormData({ ...formData, skinLesions: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Trofismo</Label>
                  <Input
                    placeholder="Normal"
                    value={formData.skinTrophism || ""}
                    onChange={(e) => setFormData({ ...formData, skinTrophism: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="varicoseVeins"
                    checked={formData.varicoseVeins || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, varicoseVeins: !!checked })}
                  />
                  <Label htmlFor="varicoseVeins">Varicosidades</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hernias"
                    checked={formData.hernias || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, hernias: !!checked })}
                  />
                  <Label htmlFor="hernias">Hernias</Label>
                </div>
              </div>

              <div>
                <Label>Especificar Anomalías</Label>
                <Textarea
                  placeholder="NO PRESENTA ALTERACIONES PATOLÓGICAS NI SECUELARES GRAVES"
                  value={formData.skinAnomalies || ""}
                  onChange={(e) => setFormData({ ...formData, skinAnomalies: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* New Examination Protocol Sections */}
          <Card>
            <CardHeader>
              <CardTitle>Genitales</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea 
                value={formData.examinationGenitals || ""}
                onChange={e => setFormData({ ...formData, examinationGenitals: e.target.value })}
                placeholder="Ingrese hallazgos del examen de genitales..."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Abdominal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Pared</Label>
                  <Input 
                    value={formData.abdPared || ""}
                    onChange={e => setFormData({ ...formData, abdPared: e.target.value })}
                    placeholder="Ej: s/p"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sensibilidad</Label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formData.abdSensibilidad || ""}
                    onChange={e => setFormData({ ...formData, abdSensibilidad: e.target.value })}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="conservada">CONSERVADA</option>
                    <option value="no conservada">NO CONSERVADA</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Organomegalia</Label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formData.abdOrganomegalia || ""}
                    onChange={e => setFormData({ ...formData, abdOrganomegalia: e.target.value })}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="presenta">PRESENTA</option>
                    <option value="no presenta">NO PRESENTA</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Masas</Label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formData.abdMasas || ""}
                    onChange={e => setFormData({ ...formData, abdMasas: e.target.value })}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="palpables">PALPABLES AL EXAMEN FÍSICO</option>
                    <option value="no palpables">NO PALPABLES AL EXAMEN FÍSICO</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alineación y Posturas Corporales</CardTitle>
              <CardDescription>Si la postura ideal es SI, el resto se marcará como NO automáticamente.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2 border p-3 rounded-lg bg-green-50/30">
                  <Checkbox
                    id="posturaIdeal"
                    checked={formData.posturaIdeal || false}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFormData({
                          ...formData,
                          posturaIdeal: true,
                          posturaCifolordotica: false,
                          posturaEspaldaRecta: false,
                          posturaEspaldaArqueada: false,
                          posturaEscoleosis: false,
                          posturaDefectuosaCabezaHombros: false,
                          posturaDefectuosaColumnaPelvis: false,
                          posturaDefectuosaPiernaRodillaPie: false
                        })
                      } else {
                        setFormData({ ...formData, posturaIdeal: false })
                      }
                    }}
                  />
                  <Label htmlFor="posturaIdeal" className="font-bold">IDEAL</Label>
                </div>
                
                {[
                  { id: "posturaCifolordotica", label: "Cifolordótica" },
                  { id: "posturaEspaldaRecta", label: "Espalda recta" },
                  { id: "posturaEspaldaArqueada", label: "Espalda arqueada" },
                  { id: "posturaEscoleosis", label: "Escoleosis" },
                  { id: "posturaDefectuosaCabezaHombros", label: "Postura defectuosa de la cabeza y hombros" },
                  { id: "posturaDefectuosaColumnaPelvis", label: "Postura defectuosa de columna y pelvis" },
                  { id: "posturaDefectuosaPiernaRodillaPie", label: "Postura defectuosa de la pierna, rodilla y pie" },
                ].map((item) => (
                  <div key={item.id} className="flex items-center space-x-2 border p-3 rounded-lg">
                    <Checkbox
                      id={item.id}
                      checked={formData[item.id as keyof MedicalRecord] as boolean || false}
                      onCheckedChange={(checked) => {
                        setFormData({
                          ...formData,
                          [item.id]: !!checked,
                          posturaIdeal: checked ? false : formData.posturaIdeal
                        })
                      }}
                    />
                    <Label htmlFor={item.id} className="text-sm">{item.label}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Evaluación de los Músculos del Tronco</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: "troncoExtensoresEspalda", label: "Extensores de la espalda (decúbito prono)" },
                  { id: "troncoFlexoresLaterales", label: "Flexores laterales del tronco (decúbito lateral)" },
                  { id: "troncoFlexoresOblicuos", label: "Flexores oblicuos del tronco (decúbito supino)" },
                  { id: "troncoFlexoresAnteriores", label: "Flexores anteriores del tronco" },
                ].map(item => (
                  <div key={item.id} className="space-y-2">
                    <Label>{item.label}</Label>
                    <select
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                      value={formData[item.id as keyof MedicalRecord] as string || ""}
                      onChange={e => setFormData({ ...formData, [item.id]: e.target.value })}
                    >
                      <option value="">Seleccionar...</option>
                      <option value="deficit">Déficit</option>
                      <option value="sin deficit">Sin déficit</option>
                    </select>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test de Flexibilidad y Longitud Muscular</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: "flexLongitudFlexoresCadera", label: "Prueba de longitud de flexores de la cadera" },
                  { id: "flexLongitudIsquiosurales", label: "Prueba de longitud de musculos isquiosurales" },
                  { id: "flexInclinacionAdelante", label: "Prueba de inclinación hacia delante (Flexibilidad/Isquios)" },
                  { id: "flexAmplitudMovimientoTronco", label: "Amplitud de movimiento de flexion y extensión del tronco" },
                  { id: "flexLongitudFlexoresPlantares", label: "Test de longitud de los flexores plantares del tobillo" },
                  { id: "flexTensorFasciaLata", label: "Pruebas para evaluar el tensor de la fascia lata y banda iliotibial" },
                  { id: "flexLongitudGlenohumerales", label: "Test de longitud de los musculos glenohumerales y escapulares" },
                  { id: "flexLongitudRotadoresHombro", label: "Pruebas de longitud de los musculos rotadores del hombro" },
                  { id: "flexExtensionFlexionCervical", label: "Extensión y flexion de la comuna cervical" },
                ].map(item => (
                  <div key={item.id} className="space-y-2">
                    <Label>{item.label}</Label>
                    <select
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                      value={formData[item.id as keyof MedicalRecord] as string || ""}
                      onChange={e => setFormData({ ...formData, [item.id]: e.target.value })}
                    >
                      <option value="">Seleccionar...</option>
                      <option value="deficit">Déficit</option>
                      <option value="sin deficit">Sin déficit</option>
                    </select>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Evaluación de Movilidad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: "movRotacionCaderas", label: "Rotación de caderas" },
                  { id: "movCuclillas", label: "Cuclillas" },
                  { id: "movBisagraCadera", label: "Bisagra cadera" },
                  { id: "movCuadripediaFlexoExtension", label: "Cuadripedia flexo-extensión" },
                  { id: "movCuadripediaTorsion", label: "Cuadripedia torción" },
                ].map(item => (
                  <div key={item.id} className="space-y-2">
                    <Label>{item.label}</Label>
                    <select
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                      value={formData[item.id as keyof MedicalRecord] as string || ""}
                      onChange={e => setFormData({ ...formData, [item.id]: e.target.value })}
                    >
                      <option value="">Seleccionar...</option>
                      <option value="deficit">Déficit</option>
                      <option value="sin deficit">Sin déficit</option>
                    </select>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Observaciones del Examen Físico</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Ingrese comentarios finales del examen físico..."
                value={formData.examinationObservations || ""}
                onChange={e => setFormData({ ...formData, examinationObservations: e.target.value })}
                rows={4}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="studies" className="space-y-6">
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
                  disabled={!canEdit}
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
                    disabled={!canEdit}
                  />
                  <label htmlFor="study-file-upload" className="cursor-pointer block w-full h-full">
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
                          disabled={!canEdit}
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
                disabled={savingStudy || !canEdit}
                className="w-full bg-red-700 hover:bg-red-800"
              >
                {savingStudy ? (
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
          {studies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Historial de Estudios Complementarios</CardTitle>
                <CardDescription>
                  {studies.length} estudio{studies.length !== 1 ? "s" : ""} registrado{studies.length !== 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {studies.map((study) => (
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
                            {study.attachments.map((file: any) => (
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

      <div className="flex gap-4 justify-end">
        {existingRecord && (
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancelar
          </Button>
        )}
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Guardando..." : "Guardar Ficha Médica"}
        </Button>
      </div>
    </div>
  )
}

function MedicalRecordView({
  record,
  onEdit,
  canEdit,
  studies = [],
}: {
  record: MedicalRecord
  onEdit: () => void
  canEdit: boolean
  studies?: any[]
}) {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">{canEdit && <Button onClick={onEdit}>Editar Ficha Médica</Button>}</div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">Ficha Médica del Deportista</TabsTrigger>
          <TabsTrigger value="examination">Examen Médico</TabsTrigger>
          <TabsTrigger value="studies">Estudios Complementarios</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="Fecha de Nacimiento" value={record.birthDate} />
              <InfoRow
                label="Lugar de Nacimiento"
                value={`${record.birthPlaceCity || ""} ${record.birthPlaceProvince || ""} ${record.birthPlaceCountry || ""}`}
              />
              <InfoRow
                label="Domicilio Actual"
                value={`${record.currentAddressCity || ""} ${record.currentAddressProvince || ""} ${record.currentAddressCountry || ""}`}
              />
              <InfoRow label="DNI" value={record.dni} />
              <InfoRow label="Pasaporte" value={record.passport} />
              <InfoRow label="Teléfono Fijo" value={record.phoneLandline} />
              <InfoRow label="Teléfono Móvil" value={record.phoneMobile} />
              <InfoRow label="Seguridad Social" value={record.socialSecurityType} />
              <InfoRow label="Nº Seguridad Social" value={record.socialSecurityNumber} />
              <InfoRow label="Médico de Cabecera" value={record.primaryDoctorName} />
              <InfoRow label="Teléfono del Médico" value={record.primaryDoctorPhone} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historia Familiar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                {record.familyHistoryCardiac && <div>✓ Problemas cardíacos</div>}
                {record.familyHistoryCancer && <div>✓ Cáncer o tumor</div>}
                {record.familyHistoryEmotional && <div>✓ Problemas emocionales</div>}
                {record.familyHistoryHeadaches && <div>✓ Dolor de cabeza o migraña</div>}
                {record.familyHistoryAnemia && <div>✓ Anemia</div>}
                {record.familyHistoryAllergiesAsthma && <div>✓ Alergias o Asma</div>}
                {record.familyHistoryEpilepsy && <div>✓ Epilepsia</div>}
                {record.familyHistoryDiabetes && <div>✓ Diabetes</div>}
                {record.familyHistoryStomach && <div>✓ Dolencias estomacales</div>}
                {record.familyHistoryRenal && <div>✓ Dolencias renales o vejiga</div>}
                {record.familyHistorySuddenDeath && <div>✓ Muerte súbita familiar</div>}
                {record.familyHistoryGenetic && <div>✓ Anomalías genéticas</div>}
                {record.familyHistoryHypertension && <div>✓ Hipertensión arterial</div>}
              </div>
              {record.familyHistoryComments && (
                <div className="mt-4 pt-4 border-t">
                  <Label className="text-xs text-muted-foreground">Comentarios:</Label>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{record.familyHistoryComments}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información Médica Relevante</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="Alergias" value={record.allergies} />
              <InfoRow label="Medicación Actual" value={record.currentMedication} />
              <InfoRow label="Enfermedades actual" value={record.currentIllnesses} />
            </CardContent>
          </Card>

          {record.personalPathological && record.personalPathological.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Antecedentes Patológicos</CardTitle>
              </CardHeader>
              <CardContent>
                {record.personalPathological.map((item: any, idx: number) => (
                  <div key={idx} className="mb-2">
                    <strong>{item.condition}:</strong> {item.details}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {record.personalSurgical && record.personalSurgical.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Antecedentes Quirúrgicos</CardTitle>
              </CardHeader>
              <CardContent>
                {record.personalSurgical.map((item: any, idx: number) => (
                  <div key={idx} className="mb-2">
                    <strong>{item.procedure}:</strong> {item.details}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {record.personalInjuries && record.personalInjuries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Lesiones de Jerarquía</CardTitle>
              </CardHeader>
              <CardContent>
                {record.personalInjuries.map((item: any, idx: number) => (
                  <div key={idx} className="mb-2">
                    <strong>{item.injury}:</strong> {item.details}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {record.sportsHistory && record.sportsHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Historia Deportiva</CardTitle>
              </CardHeader>
              <CardContent>
                {record.sportsHistory.map((item: any, idx: number) => (
                  <div key={idx} className="mb-3 p-3 border rounded">
                    <div>
                      <strong>Deporte:</strong> {item.sport}
                    </div>
                    <div>
                      <strong>Edad de inicio:</strong> {item.ageStarted} años
                    </div>
                    <div>
                      <strong>Duración:</strong> {item.duration}
                    </div>
                    <div>
                      <strong>Competitivo:</strong> {item.competitive ? "Sí" : "No"}
                    </div>
                    {item.observations && (
                      <div>
                        <strong>Observaciones:</strong> {item.observations}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="examination" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Datos del Examen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="Médico Evaluador" value={record.examiningDoctor} />
              <InfoRow label="Fecha de Examen" value={record.examDate} />
              <InfoRow label="Presión Arterial" value={record.bloodPressure} />
              <InfoRow label="Frecuencia Cardíaca" value={record.heartRate} />
              <InfoRow label="Frecuencia Respiratoria" value={record.respiratoryRate} />
              <InfoRow label="Talla (cm)" value={record.heightCm} />
              <InfoRow label="Peso (kg)" value={record.weightKg} />
              <InfoRow label="Sistema Nervioso Central" value={record.cnsAnomalies} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Oído, Ojo, Nariz, Boca y Garganta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow
                label="Agudeza Visual (Izq/Der)"
                value={`${record.visualAcuityLeft || ""} / ${record.visualAcuityRight || ""}`}
              />
              <InfoRow label="Visión de Colores" value={record.colorVision} />
              <InfoRow label="Movimientos Oculares" value={record.ocularMovements} />
              <InfoRow label="Campo Visual" value={record.visualField} />
              <InfoRow label="Ojo Director" value={record.dominantEye} />
              <InfoRow label="Pie hábil" value={record.pieHabil} />
              <InfoRow label="Lateralidad" value={record.laterality} />
              <InfoRow label="Pupilas" value={record.pupils} />
              <InfoRow label="Amígdalas" value={record.tonsils} />
              <InfoRow label="Anomalías ENT" value={record.entAnomalies} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sistema Respiratorio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="Anomalías Respiratorias" value={record.respiratoryAnomalies} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sistema Cardiovascular</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="Anomalías Cardiovasculares" value={record.cardiovascularAnomalies} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Piel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="Lesiones" value={record.skinLesions} />
              <InfoRow label="Trofismo" value={record.skinTrophism} />
              <InfoRow label="Varicosidades" value={record.varicoseVeins ? "Sí" : "No"} />
              <InfoRow label="Hernias" value={record.hernias ? "Sí" : "No"} />
              <InfoRow label="Anomalías de Piel" value={record.skinAnomalies} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Genitales y Abdominal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="Genitales" value={record.examinationGenitals} />
              <InfoRow label="Pared Abdominal" value={record.abdPared} />
              <InfoRow label="Sensibilidad Abdominal" value={record.abdSensibilidad} />
              <InfoRow label="Organomegalia" value={record.abdOrganomegalia} />
              <InfoRow label="Masas" value={record.abdMasas} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alineación y Posturas Corporales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                {record.posturaIdeal && <div className="font-bold text-green-600">✓ POSTURA IDEAL</div>}
                {record.posturaCifolordotica && <div>• Cifolordótica</div>}
                {record.posturaEspaldaRecta && <div>• Espalda recta</div>}
                {record.posturaEspaldaArqueada && <div>• Espalda arqueada</div>}
                {record.posturaEscoleosis && <div>• Escoleosis</div>}
                {record.posturaDefectuosaCabezaHombros && <div>• Postura defectuosa de la cabeza y hombros</div>}
                {record.posturaDefectuosaColumnaPelvis && <div>• Postura defectuosa de columna y pelvis</div>}
                {record.posturaDefectuosaPiernaRodillaPie && <div>• Postura defectuosa de la pierna, rodilla y pie</div>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Evaluación de los Músculos del Tronco</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="Extensores de la espalda" value={record.troncoExtensoresEspalda} />
              <InfoRow label="Flexores laterales" value={record.troncoFlexoresLaterales} />
              <InfoRow label="Flexores oblicuos" value={record.troncoFlexoresOblicuos} />
              <InfoRow label="Flexores anteriores" value={record.troncoFlexoresAnteriores} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Flexibilidad y Movilidad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase text-muted-foreground">Test de Flexibilidad</h4>
                <InfoRow label="Flexores cadera" value={record.flexLongitudFlexoresCadera} />
                <InfoRow label="Isquiosurales" value={record.flexLongitudIsquiosurales} />
                <InfoRow label="Inclinación adelante" value={record.flexInclinacionAdelante} />
                <InfoRow label="Movimiento tronco" value={record.flexAmplitudMovimientoTronco} />
                <InfoRow label="Flexores plantares" value={record.flexLongitudFlexoresPlantares} />
                <InfoRow label="Tensor fascia lata" value={record.flexTensorFasciaLata} />
                <InfoRow label="Glenohumerales" value={record.flexLongitudGlenohumerales} />
                <InfoRow label="Rotadores hombro" value={record.flexLongitudRotadoresHombro} />
                <InfoRow label="Cervical" value={record.flexExtensionFlexionCervical} />
              </div>
              <div className="pt-4 border-t space-y-3">
                <h4 className="text-xs font-bold uppercase text-muted-foreground">Evaluación de Movilidad</h4>
                <InfoRow label="Rotación caderas" value={record.movRotacionCaderas} />
                <InfoRow label="Cuclillas" value={record.movCuclillas} />
                <InfoRow label="Bisagra cadera" value={record.movBisagraCadera} />
                <InfoRow label="Cuadripedia flexo-extensión" value={record.movCuadripediaFlexoExtension} />
                <InfoRow label="Cuadripedia torsión" value={record.movCuadripediaTorsion} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Observaciones Finales</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{record.examinationObservations}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="studies" className="space-y-6">
          {studies.length > 0 ? (
            <div className="space-y-4">
              {studies.map((study) => (
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
                          {study.attachments.map((file: any) => (
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
            </div>
          ) : (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                No hay estudios complementarios registrados.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function InfoRow({
  label,
  value,
}: {
  label: string
  value?: string | number | null
}) {
  if (!value) return null
  return (
    <div className="flex gap-2">
      <span className="font-semibold min-w-[200px]">{label}:</span>
      <span>{value}</span>
    </div>
  )
}
