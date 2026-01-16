"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { BarChart3, Upload, FileText, Download, Trash2, Loader2, X, Activity, Heart, TrendingUp } from "lucide-react"
import {
  type Indice,
  type IndiceType,
  type IndiceSubtype,
  getIndicesByDivision,
  createIndice,
  deleteIndice,
  indiceTypeLabels,
  indiceSubtypeLabels,
} from "@/lib/indices"

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
}

export function IndicesManager({ division, userName, userId, onClose, canEdit = true }: IndicesManagerProps) {
  const { toast } = useToast()
  const [selectedType, setSelectedType] = useState<IndiceType | null>(null)
  const [selectedSubtype, setSelectedSubtype] = useState<IndiceSubtype | undefined>(undefined)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [observations, setObservations] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [indices, setIndices] = useState<Indice[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const indiceTypes: IndiceType[] = ["GPS", "RPE", "PAUTAS_FUERZA", "WELLNESS", "UNIDAD_ARBITRARIA", "ONDULACIONES"]

  useEffect(() => {
    if (selectedType) {
      loadIndices()
    }
  }, [selectedType, selectedSubtype])

  const loadIndices = async () => {
    if (!selectedType) return
    setLoading(true)
    const data = await getIndicesByDivision(division, selectedType, selectedSubtype)
    setIndices(data)
    setLoading(false)
  }

  const handleUpload = async () => {
    if (!selectedType) return

    if (!observations.trim() && !selectedFile) {
      toast({
        title: "Error",
        description: "Debe agregar observaciones o un archivo",
        variant: "destructive",
      })
      return
    }

    setUploading(true)

    const result = await createIndice(
      division,
      selectedType,
      selectedSubtype,
      observations,
      selectedFile,
      userName,
      userId,
    )

    if (result.success) {
      toast({
        title: "Éxito",
        description: "El índice se guardó correctamente",
      })
      setObservations("")
      setSelectedFile(null)
      setShowUploadForm(false)
      loadIndices()
    } else {
      toast({
        title: "Error",
        description: result.error || "No se pudo guardar el índice",
        variant: "destructive",
      })
    }

    setUploading(false)
  }

  const handleDelete = async (indice: Indice) => {
    if (!confirm("¿Está seguro de eliminar este índice?")) return

    const result = await deleteIndice(indice.id, indice.file_url)

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
            <Upload className="h-4 w-4 mr-2" />
            Subir
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-red-700" />
        </div>
      ) : indices.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
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
                      <Trash2 className="h-4 w-4" />
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
                    <Download className="h-4 w-4" />
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
                      file:bg-red-50 file:text-red-700
                      hover:file:bg-red-100"
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
                <Button onClick={handleUpload} disabled={uploading} className="bg-red-700 hover:bg-red-800">
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Subir
                    </>
                  )}
                </Button>
              </div>
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
                <X className="h-4 w-4 mr-2" />
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
