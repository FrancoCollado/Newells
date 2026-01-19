"use client"

import React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Download, Trash2, FileText, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import type { Odontograma } from "@/lib/odontogramas"
import { deleteOdontogramaAction } from "@/app/player/[id]/odontograma/actions"

interface OdontogramaUploaderProps {
  playerId: string
  playerName: string
  existingOdontograma: Odontograma | null
  canUpload: boolean
  onUploadSuccess: () => void
  onDeleteSuccess: () => void
}

export function OdontogramaUploader({
  playerId,
  playerName,
  existingOdontograma,
  canUpload,
  onUploadSuccess,
  onDeleteSuccess,
}: OdontogramaUploaderProps) {
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type (PDF or images)
      const validTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"]
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Tipo de archivo inválido",
          description: "Solo se permiten archivos PDF o imágenes (JPG, PNG)",
          variant: "destructive",
        })
        return
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Archivo muy grande",
          description: "El archivo no debe superar los 10MB",
          variant: "destructive",
        })
        return
      }

      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    try {
      // Upload file to Supabase Storage
      const fileExt = selectedFile.name.split(".").pop()
      const fileName = `${playerId}-${Date.now()}.${fileExt}`
      const filePath = `odontogramas/${fileName}`

      const { error: uploadError } = await supabase.storage.from("player-files").upload(filePath, selectedFile)

      if (uploadError) throw uploadError

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("player-files").getPublicUrl(filePath)

      // Save to database
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error("User not authenticated")

      const { error: dbError } = await supabase.from("odontogramas").insert({
        player_id: playerId,
        file_name: selectedFile.name,
        file_url: publicUrl,
        uploaded_by: userData.user.id,
      })

      if (dbError) throw dbError

      toast({
        title: "Odontograma subido exitosamente",
        description: `El archivo "${selectedFile.name}" ha sido guardado`,
      })

      setSelectedFile(null)
      onUploadSuccess()
    } catch (error: any) {
      console.error("[v0] Error uploading odontograma:", error)
      toast({
        title: "Error al subir el archivo",
        description: error.message || "Ocurrió un error inesperado",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!existingOdontograma) return

    if (!confirm("¿Estás seguro de que deseas eliminar este odontograma?")) return

    setDeleting(true)
    try {
      // Extract file path from URL
      const url = new URL(existingOdontograma.fileUrl)
      const pathParts = url.pathname.split("/")
      const filePath = pathParts.slice(-2).join("/") // Get last two parts: "odontogramas/filename"

      // Delete from storage
      const { error: storageError } = await supabase.storage.from("player-files").remove([filePath])

      if (storageError) throw storageError

      // Delete from database using server action
      await deleteOdontogramaAction(existingOdontograma.id)

      toast({
        title: "Odontograma eliminado",
        description: "El archivo ha sido eliminado exitosamente",
      })

      onDeleteSuccess()
    } catch (error: any) {
      console.error("[v0] Error deleting odontograma:", error)
      toast({
        title: "Error al eliminar el archivo",
        description: error.message || "Ocurrió un error inesperado",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Odontograma</CardTitle>
        <CardDescription>Documento odontológico de {playerName}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {existingOdontograma ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">{existingOdontograma.fileName}</p>
                <p className="text-xs text-muted-foreground">
                  Subido el {new Date(existingOdontograma.uploadedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button asChild className="flex-1 bg-transparent" variant="outline">
                <a href={existingOdontograma.fileUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar
                </a>
              </Button>

              {canUpload && (
                <Button onClick={handleDelete} disabled={deleting} variant="destructive">
                  {deleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
        ) : (
          <>
            {canUpload ? (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="odontograma-file">Seleccionar archivo (PDF o imagen, máx. 10MB)</Label>
                  <Input
                    id="odontograma-file"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    disabled={uploading}
                  />
                </div>

                {selectedFile && (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <p className="text-sm flex-1">{selectedFile.name}</p>
                    <Button onClick={handleUpload} disabled={uploading} size="sm">
                      {uploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Subiendo...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Subir
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay odontograma disponible para este jugador
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
