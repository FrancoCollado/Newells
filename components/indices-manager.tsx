"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { IndiceType, IndiceSubtype, Indice } from "@/lib/indices"
import { indiceTypeLabels, indiceSubtypeLabels } from "@/lib/indices"
import { getIndicesByDivisionAction, createIndiceAction, deleteIndiceAction, uploadIndiceFileAction } from "@/app/dashboard/indices-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload as LucideUpload, Download as LucideDownload, Trash2 as LucideTrash2, Loader2 as LucideLoader2, X as LucideX } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Activity, Heart, TrendingUp } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface IndicesManagerProps {
  division: string
  userName: string
  userId: string // Added userId prop
  onClose: () => void
  canEdit?: boolean // Nuevo prop para controlar si puede editar o solo ver
}

const indiceTypeIcons: Record<IndiceType, React.ReactNode> = {
  GPS: <Activity className="h-4 w-4" />,
  RPE: <Heart className="h-4 w-4" />,
  PAUTAS_FUERZA: <TrendingUp className="h-4 w-4" />,
  WELLNESS: <BarChart3 className="h-4 w-4" />,
  UNIDAD_ARBITRARIA: <BarChart3 className="h-4 w-4" />,
  ONDULACIONES: <Activity className="h-4 w-4" />,
  EVALUACIONES: <BarChart3 className="h-4 w-4" />,
}

export function IndicesManager({ division, userName, userId, onClose, canEdit = true }: IndicesManagerProps) {
  const { toast } = useToast()
  const [selectedType, setSelectedType] = useState<IndiceType | null>(null)
  const [selectedSubtype, setSelectedSubtype] = useState<IndiceSubtype | undefined>(undefined)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [observations, setObservations] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]) // Declared selectedFiles variable
  const [indices, setIndices] = useState<Indice[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const indiceTypes: IndiceType[] = ["GPS", "RPE", "PAUTAS_FUERZA", "WELLNESS", "UNIDAD_ARBITRARIA", "ONDULACIONES", "EVALUACIONES"]

  useEffect(() => {
    if (selectedType) {
      loadIndices()
    }
  }, [selectedType, selectedSubtype])

  const loadIndices = async () => {
    if (!selectedType) return
    setLoading(true)
    const data = await getIndicesByDivisionAction(division, selectedType, selectedSubtype)
    setIndices(data)
    setLoading(false)
  }

  const handleUpload = async () => {
    console.log("[v0] handleUpload iniciado")
    if (!selectedType) {
      console.log("[v0] No selectedType")
      return
    }

    if (!observations.trim() && selectedFiles.length === 0) {
      console.log("[v0] Sin observaciones ni archivos")
      toast({
        title: "Error",
        description: "Debe agregar observaciones o al menos un archivo",
        variant: "destructive",
      })
      return
    }

    console.log("[v0] Iniciando upload, archivos:", selectedFiles.length)
    setUploading(true)

    // Subir múltiples archivos
    for (const file of selectedFiles) {
      try {
        console.log("[v0] Procesando archivo:", file.name)
        // 1. Subir archivo al storage mediante Server Action
        let fileUrl: string | null = null
        let fileName: string | null = null

        if (file) {
          console.log("[v0] Llamando uploadIndiceFileAction para:", file.name)
          const uploadResult = await uploadIndiceFileAction(file)
          console.log("[v0] Upload result:", uploadResult)
          fileUrl = uploadResult.fileUrl
          fileName = uploadResult.fileName
        }

        // 2. Guardar el índice en la base de datos usando Server Action
        console.log("[v0] Llamando createIndiceAction")
        const result = await createIndiceAction(
          division,
          selectedType,
          selectedSubtype,
          observations,
          fileUrl,
          fileName,
          userName,
        )

        console.log("[v0] createIndiceAction result:", result)
        if (!result.success) {
          toast({
            title: "Error",
            description: result.error || `No se pudo guardar el archivo: ${file.name}`,
            variant: "destructive",
          })
          setUploading(false)
          return
        }
      } catch (error) {
        console.error("[v0] Error uploading file:", error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Error al procesar el archivo",
          variant: "destructive",
        })
        setUploading(false)
        return
      }
    }

    console.log("[v0] Upload completado exitosamente")
    toast({
      title: "Éxito",
      description: `Se guardaron ${selectedFiles.length} archivo(s) correctamente`,
    })
    setObservations("")
    setSelectedFiles([])
    setShowUploadForm(false)
    loadIndices()
    setUploading(false)
  }

  const handleDelete = async (indice: Indice) => {
    if (!confirm("¿Está seguro de eliminar este índice?")) return

    const result = await deleteIndiceAction(indice.id, indice.file_url)

    if (result.success) {
      toast({
        title: "Éxito",
        description: "El índice se eliminó correctamente",
      })
      loadIndices()
    } else {
      toast({
        title: "Error",
        description: result.error || "No se pudo eliminar el índice",
        variant: "destructive",
      })
    }
  }

  const renderTypeSelection = () => (
    <div className="grid grid-cols-2 gap-3">
      {indiceTypes.map((type) => (
        <Button
          key={type}
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-red-50 hover:border-red-300 bg-transparent"
          onClick={() => {
            setSelectedType(type)
            setSelectedSubtype(undefined)
          }}
        >
          {indiceTypeIcons[type]}
          <span className="text-sm font-medium">{indiceTypeLabels[type]}</span>
        </Button>
      ))}
    </div>
  )

  const renderTypeContent = () => {
    if (!selectedType) return null

    const hasSubtypes = selectedType === "GPS" || selectedType === "RPE"

    if (hasSubtypes) {
      return (
        <Tabs
          defaultValue={selectedType === "GPS" ? "CRONICO" : "PRE_SESION"}
          onValueChange={(value) => setSelectedSubtype(value as IndiceSubtype)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            {selectedType === "GPS" ? (
              <>
                <TabsTrigger value="CRONICO">Índice Crónico</TabsTrigger>
                <TabsTrigger value="AGUDO">Índice Agudo</TabsTrigger>
              </>
            ) : (
              <>
                <TabsTrigger value="PRE_SESION">Recuperación Pre-Sesión</TabsTrigger>
                <TabsTrigger value="POST_SESION">Carga Post-Sesión</TabsTrigger>
              </>
            )}
          </TabsList>
          <TabsContent value={selectedType === "GPS" ? "CRONICO" : "PRE_SESION"} className="mt-4">
            {renderIndicesList()}
          </TabsContent>
          <TabsContent value={selectedType === "GPS" ? "AGUDO" : "POST_SESION"} className="mt-4">
            {renderIndicesList()}
          </TabsContent>
        </Tabs>
      )
    }

    return renderIndicesList()
  }

  const renderIndicesList = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">
          {indiceTypeLabels[selectedType!]}
          {selectedSubtype && ` - ${indiceSubtypeLabels[selectedSubtype]}`}
        </h3>
        {canEdit && (
          <Button onClick={() => setShowUploadForm(true)} size="sm" className="bg-red-700 hover:bg-red-800">
            <LucideUpload className="h-4 w-4 mr-2" />
            Subir
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <LucideLoader2 className="h-8 w-8 animate-spin text-red-700" />
        </div>
      ) : indices.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No hay registros aún</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {indices.map((indice) => (
            <Card key={indice.id} className="border-red-200">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-sm font-medium">
                      {new Date(indice.created_at).toLocaleDateString("es-AR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </CardTitle>
                    <CardDescription className="text-xs">Por: {indice.created_by}</CardDescription>
                  </div>
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(indice)}
                    >
                      <LucideTrash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                {indice.observations && <p className="text-sm mb-2 whitespace-pre-wrap">{indice.observations}</p>}
                {indice.file_url && (
                  <a
                    href={indice.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-red-700 hover:text-red-800 font-medium hover:underline"
                  >
                    <LucideDownload className="h-4 w-4" />
                    {indice.file_name || "Descargar archivo"}
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showUploadForm && canEdit && (
        <Dialog open={showUploadForm} onOpenChange={setShowUploadForm}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                Subir {indiceTypeLabels[selectedType!]}
                {selectedSubtype && ` - ${indiceSubtypeLabels[selectedSubtype]}`}
              </DialogTitle>
              <DialogDescription>Complete los campos para registrar un nuevo índice</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="observations">Observaciones</Label>
                <Textarea
                  id="observations"
                  placeholder="Ingrese observaciones sobre este índice..."
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  rows={4}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="files">Archivos adjuntos (opcional)</Label>
                <div className="mt-2">
                  <input
                    id="files"
                    type="file"
                    multiple
                    onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-red-50 file:text-red-700
                      hover:file:bg-red-100"
                  />
                  {selectedFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-sm font-medium">Archivos seleccionados ({selectedFiles.length}):</p>
                      <ul className="space-y-1">
                        {selectedFiles.map((file, index) => (
                          <li key={index} className="flex items-center justify-between text-sm text-muted-foreground bg-gray-50 p-2 rounded">
                            <span>{file.name}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== index))}
                              className="h-6 w-6 p-0"
                            >
                              ✕
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowUploadForm(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpload} disabled={uploading} className="bg-red-700 hover:bg-red-800">
                {uploading ? (
                  <>
                    <LucideLoader2 className="mr-2 h-4 w-4 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <LucideUpload className="mr-2 h-4 w-4" />
                    Subir
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">
                {canEdit ? "Gestión de Índices" : "Visualización de Índices"}
              </DialogTitle>
              <DialogDescription>División: {division}</DialogDescription>
            </div>
            {selectedType && (
              <Button variant="ghost" size="sm" onClick={() => setSelectedType(null)}>
                <LucideX className="h-4 w-4 mr-2" />
                Volver
              </Button>
            )}
          </div>
        </DialogHeader>
        <div className="py-4">{selectedType ? renderTypeContent() : renderTypeSelection()}</div>
      </DialogContent>
    </Dialog>
  )
}
