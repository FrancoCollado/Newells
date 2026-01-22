"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, type User } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { 
  ArrowLeft, 
  LogOut, 
  HeartPulse, 
  Plus, 
  FileText, 
  Save, 
  Trash2, 
  Loader2, 
  Upload, 
  X, 
  Link as LinkIcon 
} from "lucide-react"
import { 
  type AreaReport, 
  getAreaReports, 
  saveAreaReport, 
  deleteAreaReport 
} from "@/lib/areas"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function ReadaptacionPage() {
  const router = useRouter()
  const AREA_ID = "readaptacion" // Identificador único para esta sección
  
  // Estados de Usuario y Carga
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  
  // Estados de Informes
  const [reports, setReports] = useState<AreaReport[]>([])
  const [showNewReportForm, setShowNewReportForm] = useState(false)
  const [editingReport, setEditingReport] = useState<AreaReport | null>(null)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)

  // Estados del Formulario
  const [newReportTitle, setNewReportTitle] = useState("")
  const [newReportContent, setNewReportContent] = useState("")
  const [newReportHyperlink, setNewReportHyperlink] = useState("")
  const [newReportAttachments, setNewReportAttachments] = useState<any[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // --- Lógica de Archivos ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        setNewReportAttachments((prev) => [...prev, {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type || "application/octet-stream",
          url: event.target?.result as string,
        }])
      }
      reader.readAsDataURL(file)
    })
  };

  // --- Guardar Informe (Basado en tu archivo original) ---
  const handleSaveReport = async () => {
    if (!newReportTitle.trim() || !newReportContent.trim() || !user) return
    setActionLoading(true)

    const reportData = {
      id: editingReport?.id,
      area: AREA_ID,
      title: newReportTitle,
      content: newReportContent,
      createdBy: user.name,
      hyperlink: newReportHyperlink,
      attachments: newReportAttachments,
    }

    const saved = await saveAreaReport(reportData)
    if (saved) {
      if (editingReport) {
        setReports(prev => prev.map(r => r.id === editingReport.id ? saved : r))
      } else {
        setReports([saved, ...reports])
      }
      resetForm()
    }
    setActionLoading(false)
  }

  const resetForm = () => {
    setNewReportTitle(""); setNewReportContent(""); setNewReportHyperlink("")
    setNewReportAttachments([]); setEditingReport(null); setShowNewReportForm(false)
  }

  // --- Carga Inicial ---
  useEffect(() => {
    const init = async () => {
      const currentUser = await getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
        const fetched = await getAreaReports(AREA_ID, 0, 50)
        setReports(fetched)
      }
      setLoading(false)
    }
    init()
  }, [])

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-red-700" /></div>

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-gradient-to-r from-red-700 to-black text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard")} className="text-white hover:bg-white/20">
              <ArrowLeft className="h-4 w-4 mr-2" /> Dashboard
            </Button>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <HeartPulse className="h-6 w-6" /> Readaptación
            </h1>
          </div>
          <Button variant="ghost" size="icon" onClick={() => router.push("/login")} className="hover:bg-white/20">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Informes de Readaptación</CardTitle>
              <CardDescription>Seguimiento de procesos de recuperación</CardDescription>
            </div>
            <Button onClick={() => setShowNewReportForm(!showNewReportForm)}>
              <Plus className="h-4 w-4 mr-2" /> Nuevo Informe
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Formulario de Nuevo/Editar (Copiado de tu lógica) */}
            {showNewReportForm && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <Input placeholder="Título" value={newReportTitle} onChange={e => setNewReportTitle(e.target.value)} />
                <Textarea placeholder="Contenido..." rows={4} value={newReportContent} onChange={e => setNewReportContent(e.target.value)} />
                <Input placeholder="Hipervínculo (opcional)" value={newReportHyperlink} onChange={e => setNewReportHyperlink(e.target.value)} />
                
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple className="hidden" id="file-up" />
                  <label htmlFor="file-up" className="cursor-pointer text-xs">
                    <Upload className="h-6 w-6 mx-auto mb-1" /> Adjuntar archivos
                  </label>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSaveReport} className="flex-1" disabled={actionLoading}>
                    {actionLoading ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4 mr-2" />} Guardar
                  </Button>
                  <Button variant="outline" onClick={resetForm}>Cancelar</Button>
                </div>
              </div>
            )}

            {/* Listado de Informes */}
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="border rounded-lg p-4 hover:bg-muted/30">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold">{report.title}</h4>
                      <p className="text-xs text-muted-foreground">{new Date(report.date).toLocaleDateString()} - {report.createdBy}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => {
                        setEditingReport(report); setNewReportTitle(report.title);
                        setNewReportContent(report.content); setShowNewReportForm(true);
                      }}>✏️</Button>
                      <Button variant="ghost" size="sm" onClick={() => setItemToDelete(report.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  <p className="text-sm mt-2 whitespace-pre-wrap">{report.content}</p>
                  {report.hyperlink && (
                    <a href={report.hyperlink} target="_blank" className="text-xs text-blue-600 flex items-center gap-1 mt-2">
                      <LinkIcon className="h-3 w-3" /> {report.hyperlink}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Dialogo de eliminación */}
      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>¿Eliminar informe?</AlertDialogTitle></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive" onClick={async () => {
              if (itemToDelete) await deleteAreaReport(itemToDelete)
              setReports(reports.filter(r => r.id !== itemToDelete))
              setItemToDelete(null)
            }}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}