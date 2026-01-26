"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Search, 
  PlusCircle, 
  Trash2, 
  Loader2, 
  ChevronLeft, 
  Calendar, 
  User, 
  Table,
  Plus,
  UserSearch,
  X
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { 
  getCaptacionInformes, 
  createCaptacionInforme, 
  deleteCaptacionInforme, 
  searchJugadorGlobal,
  type CaptacionInforme,
  type JugadorRow 
} from "@/lib/captacion"

interface CaptacionManagerProps {
  userName: string
  onClose: () => void
}

const SECTIONS = [
  "Amistosos", "Canteras de América", "Cierres", "Divisionales fútbol argentino",
  "Fechas de ligas", "Fichajes", "Inserciones", "Reserva", "Selectivos",
  "Sudamericanos (selecciones)", "Torneos"
]

const EMPTY_ROW: JugadorRow = {
  apellido_nombre: "", categoria: "", posicion: "", contacto: "",
  telefono: "", club: "", captador: "", pension: "", puntaje: "", volver_a_citar: ""
}

export function CaptacionManager({ userName, onClose }: CaptacionManagerProps) {
  const { toast } = useToast()
  
  // Estados de Navegación
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [viewingInforme, setViewingInforme] = useState<CaptacionInforme | null>(null)
  
  // Estados de Datos
  const [loading, setLoading] = useState(false)
  const [informes, setInformes] = useState<CaptacionInforme[]>([])
  
  // Estados de Búsqueda Global
  const [globalSearch, setGlobalSearch] = useState("")
  const [searchResults, setSearchResults] = useState<CaptacionInforme[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Estados de Formulario (Nuevo Informe)
  const [newInformeTitle, setNewInformeTitle] = useState("")
  const [rows, setRows] = useState<JugadorRow[]>([{ ...EMPTY_ROW }])

  // Cargar informes de sección
  useEffect(() => {
    if (selectedSection) loadInformes()
  }, [selectedSection])

  async function loadInformes() {
    setLoading(true)
    const data = await getCaptacionInformes(selectedSection!)
    setInformes(data)
    setLoading(false)
  }

  // Lógica de Búsqueda Global
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (globalSearch.length >= 3) {
        handleGlobalSearch()
      } else {
        setSearchResults([])
        setIsSearching(false)
      }
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [globalSearch])

  async function handleGlobalSearch() {
    setIsSearching(true)
    const results = await searchJugadorGlobal(globalSearch)
    setSearchResults(results)
    setIsSearching(false)
  }

  // Handlers de Tabla
  const handleCellChange = (index: number, field: keyof JugadorRow, value: string) => {
    const newRows = [...rows]; newRows[index] = { ...newRows[index], [field]: value }; setRows(newRows)
  }
  const addRow = () => setRows([...rows, { ...EMPTY_ROW }])
  const removeRow = (index: number) => { if (rows.length > 1) setRows(rows.filter((_, i) => i !== index)) }

  async function handleSave() {
    if (!newInformeTitle.trim()) return toast({ title: "Falta título", variant: "destructive" })
    const validRows = rows.filter(r => r.apellido_nombre.trim() !== "")
    if (validRows.length === 0) return toast({ title: "Tabla vacía", variant: "destructive" })

    setLoading(true)
    const result = await createCaptacionInforme(newInformeTitle, selectedSection!, userName, validRows)
    if (result.success) {
      setShowForm(false); setNewInformeTitle(""); setRows([{ ...EMPTY_ROW }]); loadInformes()
      toast({ title: "Guardado correctamente" })
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar informe?")) return
    const result = await deleteCaptacionInforme(id)
    if (result.success) {
      loadInformes()
      if (globalSearch) handleGlobalSearch()
    }
  }

  // --- RENDER VISTA PRINCIPAL (SECCIONES + BUSCADOR) ---
  if (!selectedSection) {
    return (
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex justify-end">
        <div className="w-full md:w-[600px] bg-background shadow-2xl border-l h-full overflow-y-auto p-6 animate-in slide-in-from-right">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex gap-2 items-center text-red-800"><Search/> Captación</h2>
            <Button variant="ghost" onClick={onClose}><X/></Button>
          </div>

          {/* BUSCADOR GLOBAL */}
          <div className="mb-8 relative">
            <label className="text-sm font-semibold mb-2 block">Buscar jugador en todos los informes:</label>
            <div className="relative">
              <UserSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input 
                className="pl-10 h-12 border-red-200 focus:ring-red-500"
                placeholder="Ingresa apellido o nombre del jugador..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
              />
            </div>
            {globalSearch.length > 0 && globalSearch.length < 3 && (
              <p className="text-xs text-muted-foreground mt-1">Escribe al menos 3 letras...</p>
            )}
          </div>

          {/* RESULTADOS DE BÚSQUEDA */}
          {globalSearch.length >= 3 && (
            <div className="mb-8">
              <h3 className="text-sm font-bold uppercase text-muted-foreground mb-3 flex justify-between">
                Resultados encontrados {isSearching && <Loader2 className="animate-spin h-4 w-4"/>}
              </h3>
              <div className="grid gap-3">
                {searchResults.length === 0 && !isSearching ? (
                  <p className="text-sm italic text-muted-foreground bg-slate-50 p-4 rounded-lg border border-dashed">
                    No se encontró ningún jugador con ese nombre en los informes.
                  </p>
                ) : (
                  searchResults.map(inf => (
                    <Card key={inf.id} className="border-l-4 border-l-red-600 hover:bg-slate-50 cursor-pointer" onClick={() => setViewingInforme(inf)}>
                      <CardHeader className="py-3 px-4">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-md">{inf.titulo}</CardTitle>
                          <span className="text-[10px] bg-red-100 text-red-700 px-2 py-1 rounded-full font-bold">{inf.seccion}</span>
                        </div>
                        <div className="text-xs text-muted-foreground flex gap-3">
                          <span>{new Date(inf.created_at).toLocaleDateString()}</span>
                          <span className="font-medium text-red-800">
                             {inf.contenido.find(j => j.apellido_nombre.toLowerCase().includes(globalSearch.toLowerCase()))?.apellido_nombre}
                          </span>
                        </div>
                      </CardHeader>
                    </Card>
                  ))
                )}
              </div>
              <hr className="my-8" />
            </div>
          )}

          {/* LISTA DE SECCIONES */}
          {!globalSearch && (
            <>
              <h3 className="text-sm font-bold uppercase text-muted-foreground mb-3">Secciones</h3>
              <div className="grid gap-3">
                {SECTIONS.map((sec) => (
                  <Card key={sec} className="hover:bg-accent cursor-pointer transition-colors" onClick={() => setSelectedSection(sec)}>
                    <CardHeader className="py-4">
                      <CardTitle className="text-lg flex justify-between items-center">
                        {sec}
                        <ChevronLeft className="rotate-180 h-4 w-4 opacity-30" />
                      </CardTitle>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  // --- RENDER VISTA DE SECCIÓN (HISTORIAL) ---
  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex justify-end">
      <div className="w-full md:w-[900px] bg-background shadow-2xl border-l h-full flex flex-col animate-in slide-in-from-right">
        
        {/* Header Seccion */}
        <div className="p-6 border-b flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="flex gap-3 items-center">
            <Button variant="ghost" size="icon" onClick={() => setSelectedSection(null)}><ChevronLeft/></Button>
            <div>
              <h2 className="text-xl font-bold">{selectedSection}</h2>
              <p className="text-sm text-muted-foreground">Historial de informes</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button className="bg-red-700 hover:bg-red-800" onClick={() => setShowForm(true)}>
              <PlusCircle className="mr-2 h-4 w-4"/> Nuevo Informe
            </Button>
            <Button variant="outline" onClick={onClose}>Cerrar</Button>
          </div>
        </div>

        {/* Lista de Informes de la Sección */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {loading ? (
            <div className="flex justify-center mt-10"><Loader2 className="animate-spin text-red-700"/></div>
          ) : informes.length === 0 ? (
            <div className="text-center mt-10 text-muted-foreground">No hay informes cargados.</div>
          ) : (
            <div className="grid gap-4">
              {informes.map((inf) => (
                <Card key={inf.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2 flex flex-row justify-between items-start">
                    <div onClick={() => setViewingInforme(inf)} className="flex-1">
                      <CardTitle className="text-lg font-bold text-red-800 hover:underline">{inf.titulo}</CardTitle>
                      <div className="text-xs text-muted-foreground mt-1 flex gap-3">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3"/> {new Date(inf.created_at).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><User className="h-3 w-3"/> {inf.subido_por}</span>
                        <span className="flex items-center gap-1"><Table className="h-3 w-3"/> {inf.contenido.length} Jugadores</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-red-500 h-8 w-8" onClick={() => handleDelete(inf.id)}><Trash2 className="h-4 w-4"/></Button>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* --- MODAL NUEVO INFORME (EXCEL) --- */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-[95vw] w-full h-[90vh] flex flex-col p-0">
            <DialogHeader className="px-6 py-4 border-b">
              <DialogTitle>Nuevo Informe: {selectedSection}</DialogTitle>
            </DialogHeader>
            <div className="p-4 border-b bg-slate-50 flex gap-4 items-end">
              <div className="w-1/3">
                <label className="text-sm font-medium mb-1 block">Título del Informe</label>
                <Input placeholder="Ej: Torneo Canteras..." value={newInformeTitle} onChange={(e) => setNewInformeTitle(e.target.value)} />
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-white">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-slate-100 sticky top-0 z-10">
                  <tr>
                    <th className="p-2 border text-left min-w-[200px]">Nombre</th>
                    <th className="p-2 border text-left">Cat.</th>
                    <th className="p-2 border text-left">Pos.</th>
                    <th className="p-2 border text-left">Club</th>
                    <th className="p-2 border text-left">Tel.</th>
                    <th className="p-2 border text-left">Contacto</th>
                    <th className="p-2 border text-left">Cap.</th>
                    <th className="p-2 border text-left">Pensión</th>
                    <th className="p-2 border text-left">Puntaje</th>
                    <th className="p-2 border text-left">Citar</th>
                    <th className="p-2 border"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-1 border"><Input className="h-8 border-transparent focus:border-red-400" value={row.apellido_nombre} onChange={(e) => handleCellChange(i, 'apellido_nombre', e.target.value)} /></td>
                      <td className="p-1 border"><Input className="h-8 border-transparent focus:border-red-400" value={row.categoria} onChange={(e) => handleCellChange(i, 'categoria', e.target.value)} /></td>
                      <td className="p-1 border"><Input className="h-8 border-transparent focus:border-red-400" value={row.posicion} onChange={(e) => handleCellChange(i, 'posicion', e.target.value)} /></td>
                      <td className="p-1 border"><Input className="h-8 border-transparent focus:border-red-400" value={row.club} onChange={(e) => handleCellChange(i, 'club', e.target.value)} /></td>
                      <td className="p-1 border"><Input className="h-8 border-transparent focus:border-red-400" value={row.telefono} onChange={(e) => handleCellChange(i, 'telefono', e.target.value)} /></td>
                      <td className="p-1 border"><Input className="h-8 border-transparent focus:border-red-400" value={row.contacto} onChange={(e) => handleCellChange(i, 'contacto', e.target.value)} /></td>
                      <td className="p-1 border"><Input className="h-8 border-transparent focus:border-red-400" value={row.captador} onChange={(e) => handleCellChange(i, 'captador', e.target.value)} /></td>
                      <td className="p-1 border"><Input className="h-8 border-transparent focus:border-red-400" value={row.pension} onChange={(e) => handleCellChange(i, 'pension', e.target.value)} /></td>
                      <td className="p-1 border"><Input className="h-8 border-transparent focus:border-red-400" value={row.puntaje} onChange={(e) => handleCellChange(i, 'puntaje', e.target.value)} /></td>
                      <td className="p-1 border"><Input className="h-8 border-transparent focus:border-red-400" value={row.volver_a_citar} onChange={(e) => handleCellChange(i, 'volver_a_citar', e.target.value)} /></td>
                      <td className="p-1 border text-center"><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeRow(i)}><Trash2 className="h-4 w-4"/></Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Button variant="outline" className="mt-4 w-full border-dashed" onClick={addRow}><Plus className="mr-2 h-4 w-4"/> Agregar Fila</Button>
            </div>
            <div className="p-4 border-t flex justify-end gap-2 bg-slate-50">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={loading} className="bg-red-700">Guardar Informe</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* --- MODAL VER INFORME --- */}
        {viewingInforme && (
          <Dialog open={!!viewingInforme} onOpenChange={() => setViewingInforme(null)}>
            <DialogContent className="max-w-[95vw] w-full h-[90vh] flex flex-col p-0">
              <DialogHeader className="px-6 py-4 border-b bg-slate-50">
                <DialogTitle className="text-xl text-red-800">{viewingInforme.titulo}</DialogTitle>
                <div className="text-xs text-muted-foreground flex gap-4 mt-1">
                  <span>Sección: <b>{viewingInforme.seccion}</b></span>
                  <span>Fecha: {new Date(viewingInforme.created_at).toLocaleDateString()}</span>
                  <span>Por: {viewingInforme.subido_por}</span>
                </div>
              </DialogHeader>
              <div className="flex-1 overflow-auto p-4">
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="p-2 border text-left">Jugador</th>
                      <th className="p-2 border text-left">Cat.</th>
                      <th className="p-2 border text-left">Pos.</th>
                      <th className="p-2 border text-left">Club</th>
                      <th className="p-2 border text-left">Tel.</th>
                      <th className="p-2 border text-left">Contacto</th>
                      <th className="p-2 border text-left">Cap.</th>
                      <th className="p-2 border text-left">Pensión</th>
                      <th className="p-2 border text-left">Puntaje</th>
                      <th className="p-2 border text-left">Citar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewingInforme.contenido.map((row, i) => (
                      <tr key={i} className={`hover:bg-slate-50 ${globalSearch && row.apellido_nombre.toLowerCase().includes(globalSearch.toLowerCase()) ? 'bg-yellow-50 font-bold' : ''}`}>
                        <td className="p-2 border">{row.apellido_nombre}</td>
                        <td className="p-2 border">{row.categoria}</td>
                        <td className="p-2 border">{row.posicion}</td>
                        <td className="p-2 border">{row.club}</td>
                        <td className="p-2 border">{row.telefono}</td>
                        <td className="p-2 border">{row.contacto}</td>
                        <td className="p-2 border">{row.captador}</td>
                        <td className="p-2 border">{row.pension}</td>
                        <td className="p-2 border">{row.puntaje}</td>
                        <td className="p-2 border">{row.volver_a_citar}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}