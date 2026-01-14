"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { MedicalRecord } from "@/lib/medical-records"
import { Trash2, Plus } from "lucide-react"

type MedicalRecordFormProps = {
  playerId: string
  existingRecord: MedicalRecord | null
  userId: string
  userRole: string
}

export function MedicalRecordForm({ playerId, existingRecord, userId, userRole }: MedicalRecordFormProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(!existingRecord)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<MedicalRecord>>(existingRecord || {})

  const canEdit = userRole === "medico" || userRole === "dirigente"

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

  if (!isEditing && existingRecord) {
    return <MedicalRecordView record={existingRecord} onEdit={() => setIsEditing(true)} canEdit={canEdit} />
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="personal">Ficha Médica del Deportista</TabsTrigger>
          <TabsTrigger value="examination">Examen Médico</TabsTrigger>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Alergias</Label>
                  <Textarea
                    value={formData.allergies || ""}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Medicación Actual</Label>
                  <Textarea
                    value={formData.currentMedication || ""}
                    onChange={(e) => setFormData({ ...formData, currentMedication: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Family Context */}
          <Card>
            <CardHeader>
              <CardTitle>Contexto Filiar/Convivientes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="livingWithFather"
                    checked={formData.livingWithFather || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, livingWithFather: !!checked })}
                  />
                  <Label htmlFor="livingWithFather">Padre</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="livingWithMother"
                    checked={formData.livingWithMother || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, livingWithMother: !!checked })}
                  />
                  <Label htmlFor="livingWithMother">Madre</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="livingWithSiblings"
                    checked={formData.livingWithSiblings || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, livingWithSiblings: !!checked })}
                  />
                  <Label htmlFor="livingWithSiblings">Hermanos</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="livingWithPartner"
                    checked={formData.livingWithPartner || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, livingWithPartner: !!checked })}
                  />
                  <Label htmlFor="livingWithPartner">Pareja</Label>
                </div>
                <div>
                  <Label>Otros</Label>
                  <Input
                    value={formData.livingWithOthers || ""}
                    onChange={(e) => setFormData({ ...formData, livingWithOthers: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Estado de Pareja</Label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formData.relationshipStatus || ""}
                    onChange={(e) => setFormData({ ...formData, relationshipStatus: e.target.value })}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="estable">Estable</option>
                    <option value="ocasional">Ocasional</option>
                    <option value="ninguna">Ninguna</option>
                  </select>
                </div>
                <div>
                  <Label>Sostén Económico</Label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formData.economicSupport || ""}
                    onChange={(e) => setFormData({ ...formData, economicSupport: e.target.value })}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="personal">Personal</option>
                    <option value="padres">Padres</option>
                    <option value="otros">Otros</option>
                  </select>
                </div>
                <div>
                  <Label>Culto/Religión</Label>
                  <Input
                    value={formData.religion || ""}
                    onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
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
                  <Label>Patológicos/Quirúrgicos</Label>
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

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <option value="homolateral">HOMOLATERAL</option>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Pulmones - Simetría de Tórax</Label>
                  <Input
                    placeholder="CONSERVADO"
                    value={formData.chestSymmetry || ""}
                    onChange={(e) => setFormData({ ...formData, chestSymmetry: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Auscultación Pectoral</Label>
                  <Input
                    placeholder="RNSL, NO RUIDOS AGREGADOS"
                    value={formData.chestAuscultation || ""}
                    onChange={(e) => setFormData({ ...formData, chestAuscultation: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Permeabilidad Vía Superior</Label>
                  <Input
                    placeholder="PERMEABLE"
                    value={formData.upperAirwayPermeability || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        upperAirwayPermeability: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Peak Flow</Label>
                  <Input
                    value={formData.peakFlow || ""}
                    onChange={(e) => setFormData({ ...formData, peakFlow: e.target.value })}
                  />
                </div>
              </div>

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
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <Label>Pulso - Ritmo</Label>
                  <Input
                    placeholder="REGULAR"
                    value={formData.peripheralPulseRhythm || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        peripheralPulseRhythm: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Carótida</Label>
                  <Input
                    placeholder="S/P"
                    value={formData.carotidPulse || ""}
                    onChange={(e) => setFormData({ ...formData, carotidPulse: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Radial</Label>
                  <Input
                    placeholder="S/P"
                    value={formData.radialPulse || ""}
                    onChange={(e) => setFormData({ ...formData, radialPulse: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Pedio</Label>
                  <Input
                    placeholder="S/p"
                    value={formData.pedalPulse || ""}
                    onChange={(e) => setFormData({ ...formData, pedalPulse: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Tib Post</Label>
                  <Input
                    placeholder="S/P"
                    value={formData.tibialPulse || ""}
                    onChange={(e) => setFormData({ ...formData, tibialPulse: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Precordial - Sonidos Anómalos</Label>
                  <Input
                    placeholder="Ausente"
                    value={formData.abnormalSounds || ""}
                    onChange={(e) => setFormData({ ...formData, abnormalSounds: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Ritmo Apical - Frémito</Label>
                  <Input
                    placeholder="Ausente"
                    value={formData.fremitus || ""}
                    onChange={(e) => setFormData({ ...formData, fremitus: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Especificar Anomalías Clínicas</Label>
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

              <div>
                <Label>Especificar Alteraciones Patológicas</Label>
                <Textarea
                  placeholder="NO PRESENTA ALTERACIONES PATOLÓGICAS NI SECUELARES GRAVES"
                  value={formData.cardiovascularPathologies || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cardiovascularPathologies: e.target.value,
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
}: {
  record: MedicalRecord
  onEdit: () => void
  canEdit: boolean
}) {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">{canEdit && <Button onClick={onEdit}>Editar Ficha Médica</Button>}</div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="personal">Ficha Médica del Deportista</TabsTrigger>
          <TabsTrigger value="examination">Examen Médico</TabsTrigger>
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
              <InfoRow label="Alergias" value={record.allergies} />
              <InfoRow label="Medicación Actual" value={record.currentMedication} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contexto Familiar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow
                label="Convive con"
                value={[
                  record.livingWithFather && "Padre",
                  record.livingWithMother && "Madre",
                  record.livingWithSiblings && "Hermanos",
                  record.livingWithPartner && "Pareja",
                  record.livingWithOthers,
                ]
                  .filter(Boolean)
                  .join(", ")}
              />
              <InfoRow label="Estado de Pareja" value={record.relationshipStatus} />
              <InfoRow label="Sostén Económico" value={record.economicSupport} />
              <InfoRow label="Religión" value={record.religion} />
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
            </CardContent>
          </Card>

          {record.personalPathological && record.personalPathological.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Antecedentes Patológicos/Quirúrgicos</CardTitle>
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
              <InfoRow label="Simetría de Tórax" value={record.chestSymmetry} />
              <InfoRow label="Auscultación Pectoral" value={record.chestAuscultation} />
              <InfoRow label="Permeabilidad Vía Superior" value={record.upperAirwayPermeability} />
              <InfoRow label="Peak Flow" value={record.peakFlow} />
              <InfoRow label="Anomalías Respiratorias" value={record.respiratoryAnomalies} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sistema Cardiovascular</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="Pulso Periférico" value={record.peripheralPulseRhythm} />
              <InfoRow
                label="Pulsos"
                value={`Carótida: ${record.carotidPulse || ""}, Radial: ${record.radialPulse || ""}, Pedio: ${record.pedalPulse || ""}, Tibial: ${record.tibialPulse || ""}`}
              />
              <InfoRow label="Sonidos Anómalos" value={record.abnormalSounds} />
              <InfoRow label="Frémito" value={record.fremitus} />
              <InfoRow label="Anomalías Cardiovasculares" value={record.cardiovascularAnomalies} />
              <InfoRow label="Patologías Cardiovasculares" value={record.cardiovascularPathologies} />
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
