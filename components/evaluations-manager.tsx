"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Upload, Download, Trash2, Loader2, X, FileText } from "lucide-react"
import { getEvaluationsByDivision, saveEvaluation, deleteEvaluation, uploadEvaluationFile } from "@/lib/evaluations"
import type { Evaluation } from "@/lib/evaluations"

interface EvaluationsManagerProps {
  division: string
  userName: string
  onClose: () => void
  canEdit?: boolean
}

export function EvaluationsManager({ division, userName, onClose, canEdit = true }: EvaluationsManagerProps) {
  const { toast } = useToast()
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadEvaluations()
  }, [])

  const loadEvaluations = async () => {
    setLoading(true)
    const data = await getEvaluationsByDivision(division)
    setEvaluations(data)
    setLoading(false)
  }

  const handleUpload = async () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Debe agregar un título",
        variant: "destructive",
      })
      return
    }

    setUploading(true)

    try {
      let fileUrl = ""
      let fileName = ""

      if (selectedFile) {
        fileUrl = await uploadEvaluationFile(selectedFile, division)
        fileName = selectedFile.name
      }

      await saveEvaluation({
        division,
        title,
        description: description || undefined,
        file_url: fileUrl || undefined,
        file_name: fileName || undefined,
        created_by: userName,
      })

      toast({
        title: "Éxito",
        description: "La evaluación se guardó correctamente",
      })
      setTitle("")
      setDescription("")
      setSelectedFile(null)
      setShowUploadForm(false)
      loadEvaluations()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la evaluación",
        variant: "destructive",
      })
    }

    setUploading(false)
  }

  const handleDelete = async (evaluation: Evaluation) => {
    if (!confirm("¿Está seguro de eliminar esta evaluación?")) return

    try {
      await deleteEvaluation(evaluation.id)
      toast({
        title: "Éxito",
        description: "La evaluación se eliminó correctamente",
      })
      loadEvaluations()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la evaluación",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Evaluaciones - {division}
          </DialogTitle>
          <DialogDescription>Gestiona las evaluaciones de la división</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {evaluations.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No hay evaluaciones cargadas</p>
                ) : (
                  evaluations.map((evaluation) => (
                    <Card key={evaluation.id} className="border-l-4 border-l-orange-500">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{evaluation.title}</h3>
                            {evaluation.description && (
                              <p className="text-sm text-muted-foreground mt-1">{evaluation.description}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              Cargado por: {evaluation.created_by} •{" "}
                              {new Date(evaluation.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {evaluation.file_url && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(evaluation.file_url, "_blank")}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                            {canEdit && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(evaluation)}
                                className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {canEdit && (
                <Button
                  onClick={() => setShowUploadForm(true)}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Cargar Evaluación
                </Button>
              )}
            </>
          )}
        </div>

        {showUploadForm && (
          <Dialog open={showUploadForm} onOpenChange={setShowUploadForm}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cargar Nueva Evaluación</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Título</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej: Evaluación Física Q1"
                  />
                </div>
                <div>
                  <Label>Descripción (Opcional)</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Notas o descripción de la evaluación"
                  />
                </div>
                <div>
                  <Label>Archivo (Opcional)</Label>
                  <input
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-muted-foreground"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                  >
                    {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                    {uploading ? "Cargando..." : "Guardar"}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowUploadForm(false)
                      setTitle("")
                      setDescription("")
                      setSelectedFile(null)
                    }}
                    variant="outline"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  )
}
