"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Save, X } from "lucide-react"
import type { Player } from "@/lib/players"
import { updatePlayerObservations } from "@/lib/players"
import { useToast } from "@/hooks/use-toast"

interface PlayerObservationsDialogProps {
  player: Player
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (observations: string) => void
  readOnly?: boolean
}

export function PlayerObservationsDialog({
  player,
  open,
  onOpenChange,
  onUpdate,
  readOnly = false,
}: PlayerObservationsDialogProps) {
  const { toast } = useToast()
  const [observations, setObservations] = useState(player.observations || "")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setObservations(player.observations || "")
  }, [player, open])

  const handleSave = async () => {
    setIsSaving(true)
    const success = await updatePlayerObservations(player.id, observations)

    if (success) {
      onUpdate(observations)
      toast({
        title: "Observaciones guardadas",
        description: "Las observaciones se guardaron correctamente",
      })
      onOpenChange(false)
    } else {
      toast({
        title: "Error",
        description: "No se pudieron guardar las observaciones",
        variant: "destructive",
      })
    }
    setIsSaving(false)
  }

  const handleCancel = () => {
    setObservations(player.observations || "")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {readOnly ? "Observaciones del Jugador" : "Editar Observaciones"}
          </DialogTitle>
          <DialogDescription>
            {readOnly
              ? `Observaciones registradas sobre ${player.name}`
              : `Agrega observaciones generales sobre ${player.name}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {readOnly ? (
            <div className="bg-muted p-4 rounded-lg min-h-[200px]">
              {observations ? (
                <p className="text-foreground whitespace-pre-wrap">{observations}</p>
              ) : (
                <p className="text-muted-foreground italic">No hay observaciones registradas para este jugador.</p>
              )}
            </div>
          ) : (
            <>
              <Textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Escribe observaciones generales sobre el jugador..."
                className="min-h-[300px] resize-none"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={isSaving} className="bg-red-700 hover:bg-red-800">
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Guardando..." : "Guardar"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
