"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { getRoleLabel } from "@/lib/auth"
import { type Report, updateReport, deleteReport } from "@/lib/reports"
import { Calendar, User, Paperclip, FileText, Download, Link as LinkIcon, Edit2, Trash2, Save, X, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ReportCardProps {
  report: Report
  showDownload?: boolean
  currentUser?: { id: string; role: string } | null
}

export function ReportCard({ report, showDownload = false, currentUser }: ReportCardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(report.content)
  const [loading, setLoading] = useState(false)

  const reportDate = new Date(report.date)
  const formattedDate = reportDate.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
  const formattedTime = reportDate.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  })

  const handleDownload = (attachment: { id: string; name: string; url: string; type: string }) => {
    const link = document.createElement("a")
    link.href = attachment.url
    link.download = attachment.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const canEdit = currentUser && (
    currentUser.id === report.professionalId || 
    currentUser.role === "dirigente" || 
    currentUser.role === "administrador"
  )

  const handleSave = async () => {
    if (!editedContent.trim()) {
      toast({
        title: "Error",
        description: "El contenido no puede estar vacío",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      await updateReport({ ...report, content: editedContent })
      setIsEditing(false)
      toast({
        title: "Éxito",
        description: "Informe actualizado correctamente",
      })
      router.refresh()
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el informe",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("¿Está seguro de eliminar este informe?")) return

    setLoading(true)
    try {
      await deleteReport(report.id)
      toast({
        title: "Éxito",
        description: "Informe eliminado correctamente",
      })
      router.refresh()
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el informe",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge>{getRoleLabel(report.professionalRole)}</Badge>
              <span className="text-sm text-muted-foreground">•</span>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <User className="h-3 w-3" />
                {report.professionalName}
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {formattedDate} - {formattedTime}
            </div>
          </div>
          {canEdit && !isEditing && (
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleDelete} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <Textarea 
              value={editedContent} 
              onChange={(e) => setEditedContent(e.target.value)} 
              className="min-h-[100px]"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)} disabled={loading}>
                <X className="h-4 w-4 mr-2" /> Cancelar
              </Button>
              <Button size="sm" onClick={handleSave} disabled={loading} className="bg-red-700 hover:bg-red-800">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />} Guardar
              </Button>
            </div>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none mb-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{report.content}</p>
          </div>
        )}

        {report.hyperlink && (
          <div className="mb-4 p-3 bg-muted/50 rounded-lg border">
            <div className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-blue-600" />
              <a 
                href={report.hyperlink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium break-all"
              >
                {report.hyperlink}
              </a>
            </div>
          </div>
        )}

        {report.attachments && report.attachments.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Paperclip className="h-4 w-4" />
              Archivos Adjuntos ({report.attachments.length})
            </h4>
            <div className="space-y-2">
              {report.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center gap-2 p-2 bg-muted rounded hover:bg-muted/80 transition-colors"
                >
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm flex-1 truncate">{attachment.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {attachment.type}
                  </Badge>
                  {showDownload && (
                    <Button size="sm" variant="ghost" onClick={() => handleDownload(attachment)} className="h-7 px-2">
                      <Download className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
