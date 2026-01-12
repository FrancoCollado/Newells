"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { getCurrentUser, type User } from "@/lib/auth"
import { getPlayerById, type Player } from "@/lib/players"
import { addReport } from "@/lib/reports"
import { canCreateReport } from "@/lib/rbac"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Upload, X, FileText, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function NewReportPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [user, setUser] = useState<User | null>(null)
  const [player, setPlayer] = useState<Player | null>(null)
  const [content, setContent] = useState("")
  const [attachments, setAttachments] = useState<
    Array<{
      id: string
      name: string
      type: string
      url: string
    }>
  >([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const init = async () => {
      const currentUser = await getCurrentUser()
      if (currentUser) {
        setUser(currentUser)

        // Verificar que el usuario puede crear informes
        // Check permission using RBAC helper
        const canCreate = canCreateReport(currentUser.role, currentUser.role)

        if (!canCreate) {
          toast({
            title: "Acceso denegado",
            description: "No tiene permisos para crear informes",
            variant: "destructive",
          })
          router.push("/dashboard")
          return
        }
      }

      const playerId = params.id as string
      const foundPlayer = await getPlayerById(playerId)
      if (foundPlayer) {
        setPlayer(foundPlayer)
      }
    }
    init()
  }, [params.id, router, toast])

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

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Debe ingresar el contenido del informe",
        variant: "destructive",
      })
      return
    }

    if (!user || !player) return

    setLoading(true)

    try {
      addReport({
        playerId: player.id,
        professionalId: user.id,
        professionalName: user.name,
        professionalRole: user.role,
        content: content.trim(),
        attachments,
      })

      toast({
        title: "Informe creado",
        description: "El informe se ha guardado correctamente",
      })

      router.push(`/player/${player.id}/reports`)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el informe",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user || !player) return null

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-gradient-to-r from-red-700 to-black text-white">
          <div className="container mx-auto px-4 py-4">
            <Button
              variant="ghost"
              onClick={() => router.push(`/player/${player.id}/reports`)}
              className="text-white hover:bg-white/20 mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Informes
            </Button>
            <h1 className="text-2xl font-bold">Nuevo Informe para {player.name}</h1>
            <p className="text-sm text-red-100">Complete la información del informe</p>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Contenido del Informe</CardTitle>
                  <CardDescription>Ingrese la información detallada del informe</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="content">Informe *</Label>
                    <Textarea
                      id="content"
                      placeholder="Ingrese el contenido del informe aquí..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={12}
                      required
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground">Escriba un informe detallado sobre el jugador</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Archivos Adjuntos</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors">
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileChange}
                        multiple
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm font-medium mb-1">Arrastre archivos o haga clic para seleccionar</p>
                        <p className="text-xs text-muted-foreground">PDF, imágenes, documentos</p>
                      </label>
                    </div>

                    {attachments.length > 0 && (
                      <div className="space-y-2 mt-4">
                        <p className="text-sm font-medium">Archivos seleccionados ({attachments.length})</p>
                        {attachments.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center gap-2 p-3 bg-muted rounded-lg group hover:bg-muted/80 transition-colors"
                          >
                            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm flex-1 truncate">{file.name}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeAttachment(file.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Summary */}
              <Card className="lg:col-span-1 h-fit">
                <CardHeader>
                  <CardTitle>Resumen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Jugador</p>
                    <p className="font-semibold">{player.name}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Profesional</p>
                    <p className="font-semibold">{user.name}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Fecha</p>
                    <p className="font-semibold">
                      {new Date().toLocaleDateString("es-AR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Archivos adjuntos</p>
                    <p className="font-semibold">{attachments.length}</p>
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <Button type="submit" className="w-full bg-red-700 hover:bg-red-800" disabled={loading}>
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? "Guardando..." : "Guardar Informe"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => router.push(`/player/${player.id}/reports`)}
                      disabled={loading}
                    >
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </form>
        </main>
      </div>
    </AuthGuard>
  )
}
