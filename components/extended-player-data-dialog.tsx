"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { PlayerExtendedData } from "@/lib/players"
import { FileText } from "lucide-react"

interface ExtendedPlayerDataDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  extendedData?: PlayerExtendedData
  onSave: (data: PlayerExtendedData) => void
  readOnly?: boolean
}

export function ExtendedPlayerDataDialog({
  open,
  onOpenChange,
  extendedData,
  onSave,
  readOnly = false,
}: ExtendedPlayerDataDialogProps) {
  const [formData, setFormData] = useState<PlayerExtendedData>(extendedData || {})

  useEffect(() => {
    setFormData(extendedData || {})
  }, [extendedData])

  const handleChange = (field: keyof PlayerExtendedData, value: string | boolean) => {
    const updated = { ...formData, [field]: value === "" ? undefined : value }
    setFormData(updated)
    if (!readOnly) {
      onSave(updated)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Datos Administrativos del Jugador
          </DialogTitle>
          <DialogDescription>
            Información adicional y datos administrativos {readOnly ? "(Solo lectura)" : "(Opcional)"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <div className="space-y-6">
            {/* Datos Personales */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-red-700">Datos Personales</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate || ""}
                    onChange={(e) => handleChange("birthDate", e.target.value)}
                    disabled={readOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="document">Documento</Label>
                  <Input
                    id="document"
                    placeholder="Ej: 12345678"
                    value={formData.document || ""}
                    onChange={(e) => handleChange("document", e.target.value)}
                    disabled={readOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nacionalidad</Label>
                  <Input
                    id="nationality"
                    placeholder="Ej: Argentina"
                    value={formData.nationality || ""}
                    onChange={(e) => handleChange("nationality", e.target.value)}
                    disabled={readOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admissionDate">Fecha de Ingreso</Label>
                  <Input
                    id="admissionDate"
                    type="date"
                    value={formData.admissionDate || ""}
                    onChange={(e) => handleChange("admissionDate", e.target.value)}
                    disabled={readOnly}
                  />
                </div>
              </div>
            </div>

            {/* Contacto */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-red-700">Contacto y Domicilio</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    placeholder="Ej: +54 341 123-4567"
                    value={formData.phone || ""}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    disabled={readOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="province">Provincia</Label>
                  <Input
                    id="province"
                    placeholder="Ej: Santa Fe"
                    value={formData.province || ""}
                    onChange={(e) => handleChange("province", e.target.value)}
                    disabled={readOnly}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="address">Domicilio</Label>
                  <Input
                    id="address"
                    placeholder="Ej: Calle Falsa 123"
                    value={formData.address || ""}
                    onChange={(e) => handleChange("address", e.target.value)}
                    disabled={readOnly}
                  />
                </div>
              </div>
            </div>

            {/* Origen */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-red-700">Datos de Origen</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="originLocality">Localidad de Origen</Label>
                  <Input
                    id="originLocality"
                    placeholder="Ej: Rosario"
                    value={formData.originLocality || ""}
                    onChange={(e) => handleChange("originLocality", e.target.value)}
                    disabled={readOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="originProvince">Provincia de Origen</Label>
                  <Input
                    id="originProvince"
                    placeholder="Ej: Santa Fe"
                    value={formData.originProvince || ""}
                    onChange={(e) => handleChange("originProvince", e.target.value)}
                    disabled={readOnly}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="originAddress">Domicilio de Origen</Label>
                  <Input
                    id="originAddress"
                    placeholder="Dirección de origen"
                    value={formData.originAddress || ""}
                    onChange={(e) => handleChange("originAddress", e.target.value)}
                    disabled={readOnly}
                  />
                </div>
              </div>
            </div>

            {/* Familia */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-red-700">Datos Familiares</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fatherName">Nombre del Padre</Label>
                  <Input
                    id="fatherName"
                    placeholder="Nombre completo"
                    value={formData.fatherName || ""}
                    onChange={(e) => handleChange("fatherName", e.target.value)}
                    disabled={readOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motherName">Nombre de la Madre</Label>
                  <Input
                    id="motherName"
                    placeholder="Nombre completo"
                    value={formData.motherName || ""}
                    onChange={(e) => handleChange("motherName", e.target.value)}
                    disabled={readOnly}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="tutorName">Nombre del Tutor (si aplica)</Label>
                  <Input
                    id="tutorName"
                    placeholder="Nombre completo del tutor legal"
                    value={formData.tutorName || ""}
                    onChange={(e) => handleChange("tutorName", e.target.value)}
                    disabled={readOnly}
                  />
                </div>
              </div>
            </div>

            {/* Datos Médicos */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-red-700">Datos Médicos</h3>
              <div className="space-y-2">
                <Label htmlFor="healthInsurance">Obra Social</Label>
                <Input
                  id="healthInsurance"
                  placeholder="Ej: OSDE, Swiss Medical, etc."
                  value={formData.healthInsurance || ""}
                  onChange={(e) => handleChange("healthInsurance", e.target.value)}
                  disabled={readOnly}
                />
              </div>
            </div>

            {/* Procedencia Deportiva */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-red-700">Procedencia Deportiva</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="originLeague">Liga de Procedencia</Label>
                  <Input
                    id="originLeague"
                    placeholder="Ej: Liga Rosarina"
                    value={formData.originLeague || ""}
                    onChange={(e) => handleChange("originLeague", e.target.value)}
                    disabled={readOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="originClub">Club de Procedencia</Label>
                  <Input
                    id="originClub"
                    placeholder="Ej: Club X"
                    value={formData.originClub || ""}
                    onChange={(e) => handleChange("originClub", e.target.value)}
                    disabled={readOnly}
                  />
                </div>
              </div>
            </div>

            {/* Documentación Legal */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-red-700">Documentación Legal</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isFreePlayer"
                    checked={formData.isFreePlayer || false}
                    onCheckedChange={(checked) => handleChange("isFreePlayer", checked as boolean)}
                    disabled={readOnly}
                  />
                  <Label htmlFor="isFreePlayer" className="font-normal cursor-pointer">
                    Jugador Libre
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasPrivateAgreement"
                    checked={formData.hasPrivateAgreement || false}
                    onCheckedChange={(checked) => handleChange("hasPrivateAgreement", checked as boolean)}
                    disabled={readOnly}
                  />
                  <Label htmlFor="hasPrivateAgreement" className="font-normal cursor-pointer">
                    Convenio Privado
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="signedARF"
                    checked={formData.signedARF || false}
                    onCheckedChange={(checked) => handleChange("signedARF", checked as boolean)}
                    disabled={readOnly}
                  />
                  <Label htmlFor="signedARF" className="font-normal cursor-pointer">
                    Firmó A.R.F (Asociación Rosarina de Fútbol)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="signedAFA"
                    checked={formData.signedAFA || false}
                    onCheckedChange={(checked) => handleChange("signedAFA", checked as boolean)}
                    disabled={readOnly}
                  />
                  <Label htmlFor="signedAFA" className="font-normal cursor-pointer">
                    Firmó A.F.A (Asociación del Fútbol Argentino)
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
