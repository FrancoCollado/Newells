'use client';

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"
import type { Injury } from "@/lib/injuries"

interface InjuryDetailsViewProps {
  injury: Injury
  onClose: () => void
  canEdit: boolean
}

export function InjuryDetailsView({ injury, onClose, canEdit }: InjuryDetailsViewProps) {
  return (
    <Card className="mt-6 border-blue-200 bg-blue-50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Detalles Completos de la Lesión</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Datos del Evento Lesional */}
        <div>
          <h4 className="font-semibold mb-3">1. DATOS DEL EVENTO LESIONAL</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            {injury.injuryDate && (
              <div>
                <p className="text-muted-foreground">Fecha</p>
                <p className="font-medium">{new Date(injury.injuryDate).toLocaleDateString()}</p>
              </div>
            )}
            {injury.injuryTime && (
              <div>
                <p className="text-muted-foreground">Hora</p>
                <p className="font-medium">{injury.injuryTime}</p>
              </div>
            )}
            {injury.gameMinute && (
              <div>
                <p className="text-muted-foreground">Minuto del Partido</p>
                <p className="font-medium">{injury.gameMinute}</p>
              </div>
            )}
            {Array.isArray(injury.context) && injury.context.length > 0 && (
              <div>
                <p className="text-muted-foreground">Contexto</p>
                <p className="font-medium">{injury.context.join(", ")}</p>
              </div>
            )}
            {Array.isArray(injury.surface) && injury.surface.length > 0 && (
              <div>
                <p className="text-muted-foreground">Superficie</p>
                <p className="font-medium">{injury.surface.join(", ")}</p>
              </div>
            )}
          </div>
        </div>

        {/* Mecanismo de la Lesión */}
        <div>
          <h4 className="font-semibold mb-3">2. MECANISMO DE LA LESIÓN</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            {Array.isArray(injury.mechanismType) && injury.mechanismType.length > 0 && (
              <div>
                <p className="text-muted-foreground">Tipo de Mecanismo</p>
                <p className="font-medium">{injury.mechanismType.join(", ")}</p>
              </div>
            )}
            {Array.isArray(injury.specificSituation) && injury.specificSituation.length > 0 && (
              <div>
                <p className="text-muted-foreground">Situación Específica</p>
                <p className="font-medium">{injury.specificSituation.join(", ")}</p>
              </div>
            )}
          </div>
        </div>

        {/* Localización Anatómica */}
        <div>
          <h4 className="font-semibold mb-3">3. LOCALIZACIÓN ANATÓMICA</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            {Array.isArray(injury.anatomicalLocation) && injury.anatomicalLocation.length > 0 && (
              <div>
                <p className="text-muted-foreground">Localización</p>
                <p className="font-medium">{injury.anatomicalLocation.join(", ")}</p>
              </div>
            )}
            {injury.affectedSide && (
              <div>
                <p className="text-muted-foreground">Lado Afectado</p>
                <p className="font-medium capitalize">{injury.affectedSide}</p>
              </div>
            )}
          </div>
        </div>

        {/* Tipo de Lesión */}
        <div>
          <h4 className="font-semibold mb-3">4. TIPO DE LESIÓN</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            {Array.isArray(injury.injuryType) && injury.injuryType.length > 0 && (
              <div>
                <p className="text-muted-foreground">Tipo</p>
                <p className="font-medium">{injury.injuryType.join(", ")}</p>
              </div>
            )}
            {injury.clinicalDiagnosis && (
              <div className="md:col-span-2">
                <p className="text-muted-foreground">Diagnóstico Clínico</p>
                <p className="font-medium">{injury.clinicalDiagnosis}</p>
              </div>
            )}
          </div>
        </div>

        {/* Grado de Severidad */}
        <div>
          <h4 className="font-semibold mb-3">5. GRADO DE SEVERIDAD</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            {injury.severity && (
              <div>
                <p className="text-muted-foreground">Severidad</p>
                <p className="font-medium capitalize">{injury.severity}</p>
              </div>
            )}
            {injury.daysAbsent && (
              <div>
                <p className="text-muted-foreground">Días de Ausencia</p>
                <p className="font-medium">{injury.daysAbsent}</p>
              </div>
            )}
          </div>
        </div>

        {/* Evolución */}
        <div>
          <h4 className="font-semibold mb-3">6. EVOLUCIÓN</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            {injury.evolutionType && (
              <div>
                <p className="text-muted-foreground">Tipo de Evolución</p>
                <p className="font-medium capitalize">{injury.evolutionType}</p>
              </div>
            )}
            {Array.isArray(injury.treatment) && injury.treatment.length > 0 && (
              <div className="md:col-span-2">
                <p className="text-muted-foreground">Tratamiento</p>
                <p className="font-medium">{injury.treatment.join(", ")}</p>
              </div>
            )}
          </div>
        </div>

        {/* Imágenes Complementarias */}
        <div>
          <h4 className="font-semibold mb-3">7. IMÁGENES COMPLEMENTARIAS</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {injury.hasUltrasound && <div className="text-green-600">✓ Ecografía</div>}
            {injury.hasMri && <div className="text-green-600">✓ Resonancia Magnética</div>}
            {injury.hasXray && <div className="text-green-600">✓ Radiografía</div>}
            {injury.hasCt && <div className="text-green-600">✓ Tomografía</div>}
          </div>
          {injury.imagingFindings && (
            <div className="mt-3">
              <p className="text-muted-foreground text-sm">Hallazgos</p>
              <p className="font-medium">{injury.imagingFindings}</p>
            </div>
          )}
        </div>

        {/* Observaciones */}
        <div>
          <h4 className="font-semibold mb-3">8. OBSERVACIONES</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {injury.medicalObservations && (
              <div>
                <p className="text-muted-foreground">Observaciones Médicas</p>
                <p className="font-medium">{injury.medicalObservations}</p>
              </div>
            )}
            {injury.responsibleDoctor && (
              <div>
                <p className="text-muted-foreground">Médico Responsable</p>
                <p className="font-medium">{injury.responsibleDoctor}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
