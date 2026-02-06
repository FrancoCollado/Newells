"use client"

import { useTransition } from "react"
import { updatePlayerPhysicals } from "@/app/portal/dashboard/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { 
  Ruler, 
  Weight, 
  CreditCard,
  Calendar,
  Flag,
  Phone,
  MapPin,
  Loader2,
  Briefcase
} from "lucide-react"

interface PortalProfileFormProps {
  player: any
}

export function PortalProfileForm({ player }: PortalProfileFormProps) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await updatePlayerPhysicals(formData)

      if (result?.error) {
        toast({
          title: "Error al actualizar",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "¡Perfil actualizado!",
          description: result?.message || "Tus datos personales se han guardado correctamente.",
          // Using a style consistent with a success notification
          className: "bg-green-600 border-green-700 text-white", 
        })
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Datos Físicos */}
        <div className="space-y-3">
            <Label htmlFor="height" className="flex items-center gap-2 text-base">
            <Ruler className="w-4 h-4 text-muted-foreground" /> Altura
            </Label>
            <div className="relative group">
            <Input 
                id="height" 
                name="height" 
                type="number" 
                defaultValue={player.height} 
                className="pr-12 h-12 text-lg transition-all focus:ring-red-500/20 border-zinc-200"
                placeholder="180"
                min={140}
                max={230}
            />
            <span className="absolute right-4 top-3.5 text-muted-foreground font-medium">cm</span>
            </div>
        </div>

        <div className="space-y-3">
            <Label htmlFor="weight" className="flex items-center gap-2 text-base">
            <Weight className="w-4 h-4 text-muted-foreground" /> Peso
            </Label>
            <div className="relative group">
            <Input 
                id="weight" 
                name="weight" 
                type="number" 
                step="0.1"
                defaultValue={player.weight} 
                className="pr-12 h-12 text-lg transition-all focus:ring-red-500/20 border-zinc-200"
                placeholder="75.5"
                min={40}
                max={150}
            />
            <span className="absolute right-4 top-3.5 text-muted-foreground font-medium">kg</span>
            </div>
        </div>

        {/* Datos Personales */}
        <div className="space-y-3">
            <Label htmlFor="document" className="flex items-center gap-2 text-base">
            <CreditCard className="w-4 h-4 text-muted-foreground" /> DNI / Documento
            </Label>
            <div className="relative group">
            <Input 
                id="document" 
                name="document" 
                type="text"
                defaultValue={player.document || ""} 
                className="h-12 text-lg transition-all focus:ring-red-500/20 border-zinc-200"
                placeholder="Ingresá tu número de documento"
            />
            </div>
        </div>

        <div className="space-y-3">
            <Label htmlFor="birth_date" className="flex items-center gap-2 text-base">
            <Calendar className="w-4 h-4 text-muted-foreground" /> Fecha de Nacimiento
            </Label>
            <div className="relative group">
            <Input 
                id="birth_date" 
                name="birth_date" 
                type="date"
                defaultValue={player.birth_date || ""} 
                className="h-12 text-lg transition-all focus:ring-red-500/20 border-zinc-200"
            />
            </div>
        </div>

        <div className="space-y-3 md:col-span-2">
            <Label htmlFor="nationality" className="flex items-center gap-2 text-base">
            <Flag className="w-4 h-4 text-muted-foreground" /> Nacionalidad
            </Label>
            <div className="relative group">
            <Input 
                id="nationality" 
                name="nationality" 
                type="text"
                defaultValue={player.nationality || ""} 
                className="h-12 text-lg transition-all focus:ring-red-500/20 border-zinc-200"
                placeholder="Ej: Argentina"
            />
            </div>
        </div>

        <div className="space-y-3 md:col-span-2">
            <Label htmlFor="phone" className="flex items-center gap-2 text-base">
            <Phone className="w-4 h-4 text-muted-foreground" /> Teléfono
            </Label>
            <div className="relative group">
            <Input 
                id="phone" 
                name="phone" 
                type="tel"
                defaultValue={player.phone || ""} 
                className="h-12 text-lg transition-all focus:ring-red-500/20 border-zinc-200"
                placeholder="Ej: +54 9 341 1234567"
            />
            </div>
        </div>

        <div className="space-y-3">
            <Label htmlFor="province" className="flex items-center gap-2 text-base">
            <MapPin className="w-4 h-4 text-muted-foreground" /> Provincia
            </Label>
            <div className="relative group">
            <Input 
                id="province" 
                name="province" 
                type="text"
                defaultValue={player.province || ""} 
                className="h-12 text-lg transition-all focus:ring-red-500/20 border-zinc-200"
                placeholder="Ej: Santa Fe"
            />
            </div>
        </div>

        <div className="space-y-3">
            <Label htmlFor="address" className="flex items-center gap-2 text-base">
            <MapPin className="w-4 h-4 text-muted-foreground" /> Domicilio Personal
            </Label>
            <div className="relative group">
            <Input 
                id="address" 
                name="address" 
                type="text"
                defaultValue={player.address || ""} 
                className="h-12 text-lg transition-all focus:ring-red-500/20 border-zinc-200"
                placeholder="Ej: Calle 123 (Origen)"
            />
            </div>
        </div>

        <div className="space-y-3">
            <Label htmlFor="rosario_address" className="flex items-center gap-2 text-base">
            <MapPin className="w-4 h-4 text-muted-foreground" /> Domicilio en Rosario
            </Label>
            <div className="relative group">
            <Input 
                id="rosario_address" 
                name="rosario_address" 
                type="text"
                defaultValue={player.rosario_address || ""} 
                className="h-12 text-lg transition-all focus:ring-red-500/20 border-zinc-200"
                placeholder="Ej: Calle Rosario 456"
            />
            </div>
        </div>

        <div className="space-y-3">
            <Label htmlFor="passport_number" className="flex items-center gap-2 text-base">
            <CreditCard className="w-4 h-4 text-muted-foreground" /> Pasaporte
            </Label>
            <div className="relative group">
            <Input 
                id="passport_number" 
                name="passport_number" 
                type="text"
                defaultValue={player.passport_number || ""} 
                className="h-12 text-lg transition-all focus:ring-red-500/20 border-zinc-200"
                placeholder="Número de pasaporte"
            />
            </div>
        </div>

        <div className="space-y-3">
            <Label htmlFor="passport_origin" className="flex items-center gap-2 text-base">
            <Flag className="w-4 h-4 text-muted-foreground" /> Pasaporte (Origen/Emisión)
            </Label>
            <div className="relative group">
            <Input 
                id="passport_origin" 
                name="passport_origin" 
                type="text"
                defaultValue={player.passport_origin || ""} 
                className="h-12 text-lg transition-all focus:ring-red-500/20 border-zinc-200"
                placeholder="Ej: Renovado en Italia"
            />
            </div>
        </div>

        <div className="space-y-3">
            <Label htmlFor="representative" className="flex items-center gap-2 text-base">
            <Briefcase className="w-4 h-4 text-muted-foreground" /> Representante
            </Label>
            <div className="relative group">
            <Input 
                id="representative" 
                name="representative" 
                type="text"
                defaultValue={player.representative || ""} 
                className="h-12 text-lg transition-all focus:ring-red-500/20 border-zinc-200"
                placeholder="Nombre y Apellido"
            />
            </div>
        </div>

        <div className="space-y-3">
            <Label htmlFor="representative_phone" className="flex items-center gap-2 text-base">
            <Phone className="w-4 h-4 text-muted-foreground" /> Tel. Representante
            </Label>
            <div className="relative group">
            <Input 
                id="representative_phone" 
                name="representative_phone" 
                type="tel"
                defaultValue={player.representative_phone || ""} 
                className="h-12 text-lg transition-all focus:ring-red-500/20 border-zinc-200"
                placeholder="Ej: +54 9 ..."
            />
            </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button 
            type="submit" 
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700 text-white font-medium px-8 h-11 shadow-lg shadow-red-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            "Guardar Actualización"
          )}
        </Button>
      </div>
    </form>
  )
}