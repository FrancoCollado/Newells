"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, Activity, HeartPulse } from "lucide-react"

interface RehabilitacionManagerProps {
  userName: string
  onClose: () => void
}

export function RehabilitacionManager({ userName, onClose }: RehabilitacionManagerProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HeartPulse className="h-6 w-6 text-red-700" />
              <DialogTitle className="text-2xl font-bold text-red-900">
                Área de Rehabilitación
              </DialogTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            Gestión y seguimiento de procesos de recuperación de jugadores.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="bg-slate-50 border rounded-lg p-10 text-center flex flex-col items-center justify-center border-dashed border-slate-300">
             <div className="bg-white p-4 rounded-full mb-4 shadow-sm">
                <Activity className="h-8 w-8 text-red-600" />
             </div>
             <h3 className="text-lg font-medium text-slate-900">Módulo en construcción</h3>
             <p className="text-muted-foreground mt-2 max-w-md">
                Estamos trabajando para el sistema de rehabilitacion de jugadores
             </p>
             <div className="mt-4 text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded">
                Sesión activa: {userName}
             </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}