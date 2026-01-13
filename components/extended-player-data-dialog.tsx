"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
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

  const handleChange = (field: keyof PlayerExtendedData, value: string | boolean | number) => {
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
                  <Label htmlFor="citizenship">Ciudadanía</Label>
                  <Input
                    id="citizenship"
                    placeholder="Ej: Argentina"
                    value={formData.citizenship || ""}
                    onChange={(e) => handleChange("citizenship", e.target.value)}
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
                  <Label htmlFor="parentsPhone">Tel Padres</Label>
                  <Input
                    id="parentsPhone"
                    placeholder="Ej: +54 341 987-6543"
                    value={formData.parentsPhone || ""}
                    onChange={(e) => handleChange("parentsPhone", e.target.value)}
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
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="representative">Representante</Label>
                  <Input
                    id="representative"
                    placeholder="Nombre del representante deportivo"
                    value={formData.representative || ""}
                    onChange={(e) => handleChange("representative", e.target.value)}
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

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-red-700">Documentos Legales</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="hasPrivateAgreement"
                    checked={formData.privateAgreementDetails !== undefined && formData.privateAgreementDetails !== ""}
                    onCheckedChange={(checked) => {
                      if (!checked) {
                        handleChange("privateAgreementDetails", "")
                      }
                    }}
                    disabled={readOnly}
                  />
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="hasPrivateAgreement" className="font-normal cursor-pointer">
                      Convenio Privado
                    </Label>
                    {(formData.privateAgreementDetails !== undefined || !readOnly) && (
                      <Textarea
                        id="privateAgreementDetails"
                        placeholder="Detalles del convenio privado..."
                        value={formData.privateAgreementDetails || ""}
                        onChange={(e) => handleChange("privateAgreementDetails", e.target.value)}
                        disabled={readOnly}
                        rows={3}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-red-700 bg-red-50 p-2 rounded">Registro</h3>
              <div className="space-y-4">
                {/* Firmó A.R.F */}
                <div className="space-y-3 border-l-2 border-red-200 pl-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="signedARF"
                      checked={formData.signedARF || false}
                      onCheckedChange={(checked) => {
                        handleChange("signedARF", checked as boolean)
                        if (!checked) {
                          handleChange("signedARFYear", "")
                        }
                      }}
                      disabled={readOnly}
                    />
                    <Label htmlFor="signedARF" className="font-normal cursor-pointer">
                      Firmó A.R.F (Asociación Rosarina de Fútbol)
                    </Label>
                  </div>
                  {formData.signedARF && (
                    <div className="ml-6 space-y-2">
                      <Label htmlFor="signedARFYear">Año</Label>
                      <Input
                        id="signedARFYear"
                        type="number"
                        placeholder="Ej: 2023"
                        value={formData.signedARFYear || ""}
                        onChange={(e) => handleChange("signedARFYear", Number.parseInt(e.target.value) || "")}
                        disabled={readOnly}
                        min="1900"
                        max="2100"
                      />
                    </div>
                  )}
                </div>

                {/* Firmó A.F.A */}
                <div className="space-y-3 border-l-2 border-red-200 pl-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="signedAFA"
                      checked={formData.signedAFA || false}
                      onCheckedChange={(checked) => {
                        handleChange("signedAFA", checked as boolean)
                        if (!checked) {
                          handleChange("signedAFAYear", "")
                        }
                      }}
                      disabled={readOnly}
                    />
                    <Label htmlFor="signedAFA" className="font-normal cursor-pointer">
                      Firmó A.F.A (Asociación del Fútbol Argentino)
                    </Label>
                  </div>
                  {formData.signedAFA && (
                    <div className="ml-6 space-y-2">
                      <Label htmlFor="signedAFAYear">Año</Label>
                      <Input
                        id="signedAFAYear"
                        type="number"
                        placeholder="Ej: 2023"
                        value={formData.signedAFAYear || ""}
                        onChange={(e) => handleChange("signedAFAYear", Number.parseInt(e.target.value) || "")}
                        disabled={readOnly}
                        min="1900"
                        max="2100"
                      />
                    </div>
                  )}
                </div>

                {/* Jugador Libre */}
                <div className="space-y-3 border-l-2 border-red-200 pl-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isFreePlayer"
                      checked={formData.isFreePlayer || false}
                      onCheckedChange={(checked) => {
                        handleChange("isFreePlayer", checked as boolean)
                        if (!checked) {
                          handleChange("freePlayerYear", "")
                        }
                      }}
                      disabled={readOnly}
                    />
                    <Label htmlFor="isFreePlayer" className="font-normal cursor-pointer">
                      Jugador Libre
                    </Label>
                  </div>
                  {formData.isFreePlayer && (
                    <div className="ml-6 space-y-2">
                      <Label htmlFor="freePlayerYear">Año</Label>
                      <Input
                        id="freePlayerYear"
                        type="number"
                        placeholder="Ej: 2023"
                        value={formData.freePlayerYear || ""}
                        onChange={(e) => handleChange("freePlayerYear", Number.parseInt(e.target.value) || "")}
                        disabled={readOnly}
                        min="1900"
                        max="2100"
                      />
                    </div>
                  )}
                </div>

                {/* Jugador a Préstamo */}
                <div className="space-y-3 border-l-2 border-red-200 pl-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isOnLoan"
                      checked={formData.isOnLoan || false}
                      onCheckedChange={(checked) => {
                        handleChange("isOnLoan", checked as boolean)
                        if (!checked) {
                          handleChange("loanYear", "")
                          handleChange("loanClub", "")
                        }
                      }}
                      disabled={readOnly}
                    />
                    <Label htmlFor="isOnLoan" className="font-normal cursor-pointer">
                      Jugador a Préstamo
                    </Label>
                  </div>
                  {formData.isOnLoan && (
                    <div className="ml-6 space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="loanYear">Año del Préstamo</Label>
                        <Input
                          id="loanYear"
                          type="number"
                          placeholder="Ej: 2023"
                          value={formData.loanYear || ""}
                          onChange={(e) => handleChange("loanYear", Number.parseInt(e.target.value) || "")}
                          disabled={readOnly}
                          min="1900"
                          max="2100"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="loanClub">Club</Label>
                        <Input
                          id="loanClub"
                          placeholder="Nombre del club"
                          value={formData.loanClub || ""}
                          onChange={(e) => handleChange("loanClub", e.target.value)}
                          disabled={readOnly}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
