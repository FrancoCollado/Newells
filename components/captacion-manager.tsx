"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Search, 
  Users, 
  Trophy, 
  Calendar, 
  ClipboardCheck, 
  Globe, 
  UserPlus, 
  MapPin,
  Upload,
  FileText,
  Download,
  Trash2,
  Loader2,
  ChevronLeft,
  X
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { 
  getCaptacionDocsByCategory, 
  createCaptacionDoc, 
  deleteCaptacionDoc, 
  type CaptacionDoc 
} from "@/lib/captacion"

interface CaptacionManagerProps {
  userName: string
  onClose: () => void
}

export function CaptacionManager({ userName, onClose }: CaptacionManagerProps) {
  const { toast } = useToast()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [titulo, setTitulo] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentos, setDocumentos] = useState<CaptacionDoc[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const opciones = [
    { label: "Amistosos", icon: <Users className="h-5 w-5" /> },
    { label: "Canteras de América", icon: <Globe className="h-5 w-5" /> },
    { label: "Cierres", icon: <ClipboardCheck className="h-5 w-5" /> },
    { label: "Divisionales Fútbol Argentino", icon: <Trophy className="h-5 w-5" /> },
    { label: "Fechas de Ligas", icon: <Calendar className="h-5 w-5" /> },
    { label: "Fichajes", icon: <UserPlus className="h-5 w-5" /> },
    { label: "Inserciones", icon: <MapPin className="h-5 w-5" /> },
    { label: "Reserva", icon: <Users className="h-5 w-5" /> },
    { label: "Selectivos", icon: <Search className="h-5 w-5" /> },
    { label: "Sudamericanos (Selecciones)", icon: <Globe className="h-5 w-5" /> },
    { label: "Torneos", icon: <Trophy className="h-5 w-5" /> },
  ]

  // Cargar documentos cuando se selecciona una categoría
  useEffect(() => {
    if (selectedCategory) {
      loadDocs()
    }
  }, [selectedCategory])

  const loadDocs = async () => {
    if (!selectedCategory) return
    setLoading(true)
    const data = await getCaptacionDocsByCategory(selectedCategory)
    setDocumentos(data)
    setLoading(false)
  }

  const handleUpload = async () => {
    if (!titulo.trim() || !selectedFile || !selectedCategory) {
      toast({
        title: "Error",
        description: "Debe completar el título y seleccionar un archivo",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    const result = await createCaptacionDoc(titulo, selectedCategory, selectedFile, userName)

    if (result.success) {
      toast({
        title: "Éxito",
        description: "Documentación guardada correctamente",
      })
      setTitulo("")
      setSelectedFile(null)
      setShowUploadForm(false)
      loadDocs()
    } else {
      toast({
        title: "Error",
        description: result.error || "No se pudo subir el archivo",
        variant: "destructive",
      })
    }
    setUploading(false)
  }

  const handleDelete = async (doc: CaptacionDoc) => {
    if (!confirm("¿Está seguro de eliminar este documento?")) return

    const result = await deleteCaptacionDoc(doc.id, doc.archivo_url)

    if (result.success) {
      toast({
        title: "Éxito",
        description: "Documento eliminado correctamente",
      })
      loadDocs()
    } else {
      toast({
        title: "Error",
        description: result.error || "No se pudo eliminar",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl flex items-center gap-2 text-red-700">
                {selectedCategory ? (
                  <Button variant="ghost" size="icon" onClick={() => setSelectedCategory(null)} className="mr-2">
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                ) : <Search className="h-7 w-7" />}
                {selectedCategory || "Área de Captación"}
              </DialogTitle>
              <DialogDescription>
                {selectedCategory ? `Historial para ${selectedCategory}` : `Panel de gestión - Usuario: ${userName}`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        {!selectedCategory ? (
          <div className="py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {opciones.map((opcion, index) => (
              <Button 
                key={index}
                variant="outline" 
                className="h-24 flex flex-col items-center justify-center gap-3 hover:bg-red-50 hover:border-red-500 transition-all group"
                onClick={() => setSelectedCategory(opcion.label)}
              >
                <div className="text-red-700 group-hover:scale-110 transition-transform">
                  {opcion.icon}
                </div>
                <span className="text-sm font-semibold text-center px-2">
                  {opcion.label}
                </span>
              </Button>
            ))}
          </div>
        ) : (
          <div className="py-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">Documentación Registrada</h3>
              <Button onClick={() => setShowUploadForm(true)} className="bg-red-700 hover:bg-red-800">
                <Upload className="h-4 w-4 mr-2" />
                Subir Nuevo
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-red-700" />
              </div>
            ) : documentos.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No hay documentos cargados en esta categoría</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {documentos.map((doc) => (
                  <Card key={doc.id} className="border-red-100 overflow-hidden">
                    <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
                      <div>
                        <CardTitle className="text-base">{doc.titulo}</CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {new Date(doc.created_at).toLocaleDateString("es-AR")} • Por: {doc.subido_por}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" asChild className="text-red-700">
                          <a href={doc.archivo_url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-gray-400 hover:text-red-600"
                          onClick={() => handleDelete(doc)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="py-2 px-4 border-t bg-gray-50/50">
                      <p className="text-xs truncate italic text-gray-500">📎 {doc.archivo_nombre}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        <Dialog open={showUploadForm} onOpenChange={setShowUploadForm}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Subir Documentación</DialogTitle>
              <DialogDescription>Categoría: {selectedCategory}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="titulo">Título del Documento</Label>
                <Input 
                  id="titulo" 
                  placeholder="Ej: Informe de Fichajes Enero" 
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="file">Archivo Adjunto</Label>
                <Input 
                  id="file" 
                  type="file" 
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="cursor-pointer file:bg-red-50 file:text-red-700 file:border-0"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowUploadForm(false)}>Cancelar</Button>
              <Button 
                onClick={handleUpload} 
                disabled={uploading}
                className="bg-red-700 hover:bg-red-800"
              >
                {uploading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                {uploading ? "Subiendo..." : "Guardar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="mt-4 pt-4 border-t flex justify-end">
          <Button variant="secondary" onClick={onClose}>Cerrar Panel</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}