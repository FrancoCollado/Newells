"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Upload, FileText, Download, Trash2, Loader2, BookOpen, Users, Heart } from "lucide-react"
import type { PsychosocialCategory, PsychosocialEvolution } from "@/lib/psychosocial"
import { categoryLabels } from "@/lib/psychosocial"
import {
  getEvolutionsAction,
  saveEvolutionAction,
  deleteEvolutionAction,
} from "@/app/player/[id]/psychosocial-data/actions"

interface PsychosocialDataManagerProps {
  playerId: string
  user: { id: string; role: string; name?: string }
}

const categoryIcons = {
  trayectoria_educativa: <BookOpen className="h-4 w-4" />,
  situacion_vincular: <Users className="h-4 w-4" />,
  trayectoria_salud: <Heart className="h-4 w-4" />,
}

export function PsychosocialDataManager({ playerId, user }: PsychosocialDataManagerProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<PsychosocialCategory>("trayectoria_educativa")
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [observations, setObservations] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [evolutions, setEvolutions] = useState<PsychosocialEvolution[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadEvolutions()
  }, [activeTab])

  const loadEvolutions = async () => {
    setLoading(true)
    const data = await getEvolutionsAction(playerId, activeTab)
    setEvolutions(data)
    setLoading(false)
  }

  const handleUpload = async () => {
    if (!observations.trim() && !selectedFile) {
      toast({
        title: "Error",
        description: "Debe agregar observaciones o un archivo",
        variant: "destructive",
      })
      return
    }

    setUploading(true)

    const result = await saveEvolutionAction(playerId, activeTab, observations, selectedFile)

    if (result.success) {
      toast({
        title: "Éxito",
        description: "La evolución se guardó correctamente",
      })
      setObservations("")
      setSelectedFile(null)
      setShowUploadForm(false)
      loadEvolutions()
    } else {
      toast({
        title: "Error",
        description: result.error || "No se pudo guardar la evolución",
        variant: "destructive",
      })
    }

    setUploading(false)
  }

  const handleDelete = async (evolution: PsychosocialEvolution) => {
    if (!confirm("¿Está seguro de eliminar esta evolución?")) return

    const result = await deleteEvolutionAction(evolution.id, evolution.file_url)

    if (result.success) {
      toast({
        title: "Éxito",
        description: "La evolución se eliminó correctamente",
      })
      loadEvolutions()
    } else {
      toast({
        title: "Error",
        description: result.error || "No se pudo eliminar la evolución",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registro de Evoluciones Psicosociales</CardTitle>
        <CardDescription>Gestione los datos psicosociales del jugador por categoría</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as PsychosocialCategory)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trayectoria_educativa" className="flex items-center gap-2">
              {categoryIcons.trayectoria_educativa}
              <span className="hidden sm:inline">Trayectoria Educativa</span>
              <span className="sm:hidden">Educativa</span>
            </TabsTrigger>
            <TabsTrigger value="situacion_vincular" className="flex items-center gap-2">
              {categoryIcons.situacion_vincular}
              <span className="hidden sm:inline">Situación Vincular</span>
              <span className="sm:hidden">Vincular</span>
            </TabsTrigger>
            <TabsTrigger value="trayectoria_salud" className="flex items-center gap-2">
              {categoryIcons.trayectoria_salud}
              <span className="hidden sm:inline">Trayectoria de Salud</span>
              <span className="sm:hidden">Salud</span>
            </TabsTrigger>
          </TabsList>

          {(["trayectoria_educativa", "situacion_vincular", "trayectoria_salud"] as PsychosocialCategory[]).map(
            (category) => (
              <TabsContent key={category} value={category} className="mt-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">{categoryLabels[category]}</h3>
                    <Button
                      onClick={() => setShowUploadForm(true)}
                      size="sm"
                      className="bg-purple-700 hover:bg-purple-800"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Registrar Evolución
                    </Button>
                  </div>

                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-purple-700" />
                    </div>
                  ) : evolutions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No hay evoluciones registradas aún</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {evolutions.map((evolution) => (
                        <Card key={evolution.id} className="border-purple-200">
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-sm font-medium">
                                  {new Date(evolution.created_at).toLocaleDateString("es-AR", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </CardTitle>
                                <CardDescription className="text-xs">Registrado por el profesional</CardDescription>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                onClick={() => handleDelete(evolution)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pb-3">
                            {evolution.observations && (
                              <p className="text-sm mb-2 whitespace-pre-wrap">{evolution.observations}</p>
                            )}
                            {evolution.file_url && (
                              <a
                                href={evolution.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm text-purple-700 hover:text-purple-800 font-medium hover:underline"
                              >
                                <Download className="h-4 w-4" />
                                {evolution.file_name || "Descargar archivo"}
                              </a>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            ),
          )}
        </Tabs>
      </CardContent>

      {showUploadForm && (
        <Dialog open={showUploadForm} onOpenChange={setShowUploadForm}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Registrar Evolución - {categoryLabels[activeTab]}</DialogTitle>
              <DialogDescription>Agregar observaciones y archivos</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="observations">Observaciones</Label>
                <Textarea
                  id="observations"
                  placeholder="Ingrese observaciones sobre esta evolución..."
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  rows={4}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="file">Archivo adjunto (opcional)</Label>
                <div className="mt-2">
                  <input
                    id="file"
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-purple-50 file:text-purple-700
                      hover:file:bg-purple-100"
                  />
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground mt-2">Archivo seleccionado: {selectedFile.name}</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowUploadForm(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleUpload} disabled={uploading} className="bg-purple-700 hover:bg-purple-800">
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Guardar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  )
}

export default PsychosocialDataManager
