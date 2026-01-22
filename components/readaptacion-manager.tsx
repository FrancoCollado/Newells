"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  FileText,
  Upload,
  Trash2,
  Loader2,
  Plus,
  Link as LinkIcon,
  X,
  HeartPulse,
  Save,
  Download
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  getReadaptacionReports,
  saveReadaptacionReport,
  deleteReadaptacionReport
} from "@/lib/readaptacion"
import { AreaReport } from "@/lib/areas"

interface ReadaptacionManagerProps {
  userName: string
  onClose: () => void
}

export function ReadaptacionManager({ userName, onClose }: ReadaptacionManagerProps) {
  const { toast } = useToast()
  
  // Estados de datos
  const [reports, setReports] = useState<AreaReport[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  // Estados del Formulario (Modal secundario)
  const [showForm, setShowForm] = useState(false)
  const [editingReport, setEditingReport] = useState<AreaReport | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [hyperlink, setHyperlink] = useState("")
  const [attachments, setAttachments] = useState<any[]>([])
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Cargar informes al iniciar
  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    setLoading(true)
    const data = await getReadaptacionReports(0, 50)
    setReports(data)
    setLoading(false)
  }

  // --- FUNCIÓN PARA DESCARGAR ---
  const downloadFile = (file: { name: string; url: string }) => {
    try {
      const link = document.createElement("a");
      link.href = file.url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "No se pudo descargar el archivo", 
        variant: "destructive" 
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const newAttachment = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type || "application/octet-stream",
          url: event.target?.result as string,
        }
        setAttachments((prev) => [...prev, newAttachment])
      }
      reader.readAsDataURL(file)
    })
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast({ title: "Error", description: "Completa título y contenido", variant: "destructive" })
      return
    }

    setActionLoading(true)
    try {
      const reportData = {
        id: editingReport?.id,
        title,
        content,
        hyperlink,
        attachments,
        createdBy: userName, // Se asegura de enviar el nombre del prop
        area: "readaptacion"
      }

      const saved = await saveReadaptacionReport(reportData)
      
      if (saved) {
        toast({ title: "Éxito", description: "Informe guardado correctamente" })
        closeForm()
        loadReports()
      }
    } catch (error) {
      toast({ title: "Error", description: "No se pudo guardar el informe", variant: "destructive" })
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar este informe?")) return
    const success = await deleteReadaptacionReport(id)
    if (success) {
      toast({ title: "Eliminado", description: "El informe ha sido borrado" })
      loadReports()
    }
  }

  const openEdit = (report: AreaReport) => {
    setEditingReport(report)
    setTitle(report.title)
    setContent(report.content)
    setHyperlink(report.hyperlink || "")
    setAttachments(report.attachments || [])
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingReport(null)
    setTitle(""); setContent(""); setHyperlink(""); setAttachments([])
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[850px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl flex items-center gap-2 text-red-700">
                <HeartPulse className="h-7 w-7" />
                Área de Readaptación
              </DialogTitle>
              <DialogDescription>
                Gestión de informes de recuperación - Usuario: {userName}
              </DialogDescription>
            </div>
            <Button onClick={() => setShowForm(true)} className="bg-red-700 hover:bg-red-800">
              <Plus className="h-4 w-4 mr-2" /> Nuevo Informe
            </Button>
          </div>
        </DialogHeader>

        <div className="py-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-red-700" />
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>No hay informes de readaptación registrados</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {reports.map((report) => (
                <Card key={report.id} className="border-red-100 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="py-3 px-4 flex flex-row items-start justify-between space-y-0">
                    <div>
                      <CardTitle className="text-lg text-red-900">{report.title}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {new Date(report.date).toLocaleDateString("es-AR")} • Por: {report.createdBy || "Profesional"}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(report)} className="text-blue-600">
                        ✏️
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(report.id)} className="text-gray-400 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="py-3 px-4 border-t">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap mb-3">{report.content}</p>
                    
                    {report.hyperlink && (
                      <a href={report.hyperlink} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-red-700 hover:underline mb-2">
                        <LinkIcon className="h-3 w-3" /> {report.hyperlink}
                      </a>
                    )}

                    {report.attachments && report.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {report.attachments.map((file) => (
                          <div 
                            key={file.id} 
                            onClick={() => downloadFile(file)}
                            className="flex items-center gap-2 p-1.5 bg-red-50 rounded border border-red-100 text-[10px] text-red-800 cursor-pointer hover:bg-red-100 transition-colors"
                          >
                            <Download className="h-3 w-3" />
                            <span className="truncate max-w-[120px] font-medium">{file.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Dialog open={showForm} onOpenChange={closeForm}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>{editingReport ? "Editar Informe" : "Nuevo Informe de Readaptación"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Título</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Evolución de ligamentos" />
              </div>
              <div className="grid gap-2">
                <Label>Contenido</Label>
                <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={5} placeholder="Detalles..." />
              </div>
              <div className="grid gap-2">
                <Label>Hipervínculo (YouTube, Drive, etc)</Label>
                <Input value={hyperlink} onChange={(e) => setHyperlink(e.target.value)} placeholder="https://..." />
              </div>
              <div className="grid gap-2">
                <Label>Adjuntos</Label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-red-200 rounded-lg p-4 text-center cursor-pointer hover:bg-red-50 transition-colors"
                >
                  <Upload className="h-6 w-6 mx-auto mb-1 text-red-400" />
                  <span className="text-xs text-red-700 font-medium">Click para subir archivos</span>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple className="hidden" />
                </div>
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {attachments.map(a => (
                      <div key={a.id} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md text-[10px]">
                        {a.name} <X className="h-3 w-3 cursor-pointer" onClick={() => setAttachments(attachments.filter(x => x.id !== a.id))} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={closeForm}>Cancelar</Button>
              <Button onClick={handleSave} disabled={actionLoading} className="bg-red-700 hover:bg-red-800">
                {actionLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                {editingReport ? "Actualizar" : "Guardar Informe"}
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