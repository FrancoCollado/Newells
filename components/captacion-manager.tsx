"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Search, PlusCircle, Trash2, Loader2, ChevronLeft, 
  Camera, X, UserSearch, FileText, Plus, Pencil
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { 
  getCaptacionInformes, createCaptacionInforme, searchJugadorGlobal,
  deleteCaptacionInforme, updateCaptacionInforme,
  type CaptacionInforme, type JugadorRow 
} from "@/lib/captacion"
import { DialogDescription } from "@/components/ui/dialog"

const SECTIONS = [
  "Amistosos", "Canteras de América", "Cierres", "Divisionales fútbol argentino",
  "Fechas de ligas", "Fichajes", "Inserciones", "Reserva", "Selectivos",
  "Sudamericanos (selecciones)", "Torneos"
]

const EMPTY_ROW: JugadorRow = {
  apellido_nombre: "", categoria: "", posicion: "", club: "",
  telefono: "", contacto: "", captador: "", pension: "", 
  caracteristicas: "", puntaje: "", volver_a_citar: ""
}

export function CaptacionManager({ userName, onClose }: { userName: string, onClose: () => void }) {
  const { toast } = useToast()
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingInformeId, setEditingInformeId] = useState<string | null>(null)
  const [viewingInforme, setViewingInforme] = useState<CaptacionInforme | null>(null)
  const [loading, setLoading] = useState(false)
  const [informes, setInformes] = useState<CaptacionInforme[]>([])
  const [globalSearch, setGlobalSearch] = useState("")
  const [searchResults, setSearchResults] = useState<CaptacionInforme[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const [newInformeTitle, setNewInformeTitle] = useState("")
  const [rows, setRows] = useState<JugadorRow[]>([{ ...EMPTY_ROW }])
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([])

  useEffect(() => { if (selectedSection) loadInformes() }, [selectedSection])

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (globalSearch.trim().length > 2) {
        setIsSearching(true)
        const results = await searchJugadorGlobal(globalSearch)
        setSearchResults(results)
        setIsSearching(false)
      } else {
        setSearchResults([])
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [globalSearch])

  async function loadInformes() {
    setLoading(true)
    const data = await getCaptacionInformes(selectedSection!)
    setInformes(data)
    setLoading(false)
  }

  const handleCellChange = (index: number, field: keyof JugadorRow, value: string) => {
    const newRows = [...rows]; 
    newRows[index] = { ...newRows[index], [field]: value }; 
    setRows(newRows)
  }

  async function handleSave() {
    if (!newInformeTitle.trim()) return toast({ title: "Falta título", variant: "destructive" })
    setLoading(true)
    
    let result;
    if (editingInformeId) {
      result = await updateCaptacionInforme(editingInformeId, newInformeTitle, rows)
    } else {
      result = await createCaptacionInforme(newInformeTitle, selectedSection!, userName, rows, selectedPhotos)
    }

    if (result.success) {
      setShowForm(false); setEditingInformeId(null); setNewInformeTitle(""); setRows([{ ...EMPTY_ROW }]); setSelectedPhotos([]); loadInformes()
      toast({ title: editingInformeId ? "Informe actualizado" : "Informe guardado" })
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" })
    }
    setLoading(false)
  }

  const handleEdit = (inf: CaptacionInforme) => {
    setEditingInformeId(inf.id)
    setNewInformeTitle(inf.titulo)
    setRows(inf.contenido)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este informe?")) return
    setLoading(true)
    const result = await deleteCaptacionInforme(id)
    if (result.success) {
      loadInformes()
      toast({ title: "Informe eliminado" })
    }
    setLoading(false)
  }

  if (!selectedSection) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end">
        <div className="w-full md:w-[450px] bg-white h-full p-6 overflow-y-auto shadow-xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-red-800 flex items-center gap-2"><Search/> Captación</h2>
            <Button variant="ghost" onClick={onClose}><X/></Button>
          </div>
          <div className="space-y-4">
            <div className="relative mb-6">
              <UserSearch className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input className="pl-10" placeholder="Buscar jugador..." value={globalSearch} onChange={(e) => setGlobalSearch(e.target.value)} />
            </div>
            <div className="grid gap-2">
              {globalSearch.trim().length > 2 ? (
                <div className="space-y-2">
                  <p className="text-sm text-slate-500 font-medium mb-2">
                    {isSearching ? "Buscando..." : `Resultados (${searchResults.length})`}
                  </p>
                  {searchResults.map(inf => {
                    const matches = inf.contenido.filter(j => 
                      j.apellido_nombre.toLowerCase().includes(globalSearch.toLowerCase())
                    )
                    return (
                      <Card key={inf.id} className="cursor-pointer hover:border-red-300 transition-all group relative" onClick={() => setViewingInforme(inf)}>
                        <CardHeader className="p-3">
                          <CardTitle className="text-sm font-bold text-red-800 pr-12">{inf.titulo}</CardTitle>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {matches.map((m, idx) => (
                              <span key={idx} className="text-[10px] bg-red-50 text-red-700 border border-red-100 px-1.5 py-0.5 rounded font-medium">
                                {m.apellido_nombre}
                              </span>
                            ))}
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-500 uppercase mt-2">
                            <span>{inf.seccion}</span>
                            <span>{new Date(inf.created_at).toLocaleDateString()}</span>
                          </div>
                        </CardHeader>
                        <div className="absolute right-2 top-2 hidden group-hover:flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-blue-600" onClick={(e) => { e.stopPropagation(); handleEdit(inf); }}><Pencil className="h-3 w-3"/></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-600" onClick={(e) => { e.stopPropagation(); handleDelete(inf.id); }}><Trash2 className="h-3 w-3"/></Button>
                        </div>
                      </Card>
                    )
                  })}
                  {!isSearching && searchResults.length === 0 && (
                    <div className="text-center text-slate-400 py-8 text-sm">No se encontraron resultados</div>
                  )}
                </div>
              ) : (
                SECTIONS.map(sec => (
                  <Button key={sec} variant="outline" className="justify-start h-12 text-md hover:bg-red-50 hover:text-red-800 border-slate-200" onClick={() => setSelectedSection(sec)}>
                    {sec}
                  </Button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end">
      <div className="w-full md:w-[800px] bg-white h-full flex flex-col shadow-xl">
        <div className="p-4 border-b flex justify-between items-center bg-white">
          <Button variant="ghost" onClick={() => setSelectedSection(null)}><ChevronLeft className="mr-1"/> Volver</Button>
          <h2 className="font-bold text-lg text-slate-700">{selectedSection}</h2>
          <Button className="bg-red-700 hover:bg-red-800" onClick={() => { setEditingInformeId(null); setNewInformeTitle(""); setRows([{ ...EMPTY_ROW }]); setShowForm(true); }}><PlusCircle className="mr-2 h-4 w-4"/> Nuevo Informe</Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="animate-spin mb-2" /> <p>Cargando...</p>
            </div>
          ) : informes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-xl bg-white text-slate-400">
              <FileText className="h-10 w-10 mb-2 opacity-20" />
              <p>No hay informes aún</p>
            </div>
          ) : (
            informes.map(inf => (
              <Card key={inf.id} className="cursor-pointer hover:border-red-300 transition-all group relative" onClick={() => setViewingInforme(inf)}>
                <CardHeader className="p-4 flex flex-row justify-between items-center space-y-0">
                  <div className="pr-12">
                    <CardTitle className="text-red-800 text-base font-bold">{inf.titulo}</CardTitle>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase font-semibold">{new Date(inf.created_at).toLocaleDateString()} — {inf.subido_por}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {inf.fotos && inf.fotos.length > 0 && <Camera className="text-slate-300 h-4 w-4" />}
                    <div className="hidden group-hover:flex items-center gap-1 ml-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600" onClick={(e) => { e.stopPropagation(); handleEdit(inf); }}><Pencil className="h-4 w-4"/></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600" onClick={(e) => { e.stopPropagation(); handleDelete(inf.id); }}><Trash2 className="h-4 w-4"/></Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>

        {/* PANTALLA COMPLETA NUEVO/EDITAR INFORME (SIN DIALOG) */}
        {showForm && (
          <div className="fixed inset-0 z-[60] bg-white flex flex-col">
            {/* HEADER */}
            <div className="p-4 bg-red-800 text-white flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold italic uppercase">
                {editingInformeId ? "Editar Informe" : "Nuevo Informe"} de {selectedSection}
              </h2>
              <Button variant="ghost" className="text-white hover:bg-red-700" onClick={() => { setShowForm(false); setEditingInformeId(null); }}>
                <X className="h-6 w-6" />
              </Button>
            </div>

            {/* CONTENIDO DEL FORMULARIO */}
            <div className="flex-1 overflow-auto flex flex-col">
              <div className="p-4 border-b bg-slate-100 grid grid-cols-2 gap-6 shrink-0">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Título / Evento</label>
                  <Input value={newInformeTitle} onChange={(e) => setNewInformeTitle(e.target.value)} placeholder="Ej: Scouting..." className="bg-white border-slate-300 h-10" />
                </div>
                {!editingInformeId && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Fotos Opcionales</label>
                    <Input type="file" multiple accept="image/*" onChange={(e) => setSelectedPhotos(Array.from(e.target.files || []))} className="bg-white border-slate-300 h-10 pt-1.5 shadow-sm" />
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-auto bg-white">
                <table className="w-full border-collapse text-sm min-w-[1800px]">
                  <thead className="sticky top-0 bg-slate-800 text-white z-20">
                    <tr className="h-12">
                      <th className="px-3 border border-slate-700 text-left w-[220px]">Nombre</th>
                      <th className="px-1 border border-slate-700 w-[60px]">Cat.</th>
                      <th className="px-2 border border-slate-700 w-[100px]">Pos.</th>
                      <th className="px-3 border border-slate-700 w-[150px]">Club</th>
                      <th className="px-3 border border-slate-700 w-[120px]">Tel.</th>
                      <th className="px-3 border border-slate-700 w-[150px]">Contacto</th>
                      <th className="px-3 border border-slate-700 w-[120px]">Cap.</th>
                      <th className="px-2 border border-slate-700 w-[80px]">Pensión</th>
                      <th className="px-3 border border-slate-700 text-left min-w-[450px]">Características</th>
                      <th className="px-1 border border-slate-700 w-[70px]">Puntaje</th>
                      <th className="px-1 border border-slate-700 w-[70px]">Citar</th>
                      <th className="px-1 border border-slate-700 w-[40px]"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {rows.map((row, i) => (
                      <tr key={i} className="hover:bg-red-50/50 group">
                        <td className="border p-0"><input className="w-full h-14 px-3 outline-none bg-transparent font-semibold" value={row.apellido_nombre} onChange={(e) => handleCellChange(i, 'apellido_nombre', e.target.value)} /></td>
                        <td className="border p-0"><input className="w-full h-14 px-1 outline-none bg-transparent text-center" value={row.categoria} onChange={(e) => handleCellChange(i, 'categoria', e.target.value)} /></td>
                        <td className="border p-0"><input className="w-full h-14 px-2 outline-none bg-transparent" value={row.posicion} onChange={(e) => handleCellChange(i, 'posicion', e.target.value)} /></td>
                        <td className="border p-0"><input className="w-full h-14 px-3 outline-none bg-transparent text-slate-600" value={row.club} onChange={(e) => handleCellChange(i, 'club', e.target.value)} /></td>
                        <td className="border p-0"><input className="w-full h-14 px-3 outline-none bg-transparent" value={row.telefono} onChange={(e) => handleCellChange(i, 'telefono', e.target.value)} /></td>
                        <td className="border p-0"><input className="w-full h-14 px-3 outline-none bg-transparent text-slate-600" value={row.contacto} onChange={(e) => handleCellChange(i, 'contacto', e.target.value)} /></td>
                        <td className="border p-0"><input className="w-full h-14 px-3 outline-none bg-transparent" value={row.captador} onChange={(e) => handleCellChange(i, 'captador', e.target.value)} /></td>
                        <td className="border p-0"><input className="w-full h-14 px-1 outline-none bg-transparent text-center" value={row.pension} onChange={(e) => handleCellChange(i, 'pension', e.target.value)} /></td>
                        <td className="border p-0">
                          <textarea 
                            className="w-full min-h-[80px] px-3 py-3 text-sm resize-y leading-relaxed outline-none bg-transparent" 
                            value={row.caracteristicas} 
                            onChange={(e) => handleCellChange(i, 'caracteristicas', e.target.value)} 
                          />
                        </td>
                        <td className="border p-0"><input className="w-full h-14 px-1 outline-none bg-transparent text-center font-bold text-red-700" value={row.puntaje} onChange={(e) => handleCellChange(i, 'puntaje', e.target.value)} /></td>
                        <td className="border p-0"><input className="w-full h-14 px-1 outline-none bg-transparent text-center" value={row.volver_a_citar} onChange={(e) => handleCellChange(i, 'volver_a_citar', e.target.value)} /></td>
                        <td className="border text-center">
                          <Button variant="ghost" size="sm" className="h-14 w-full text-red-400" onClick={() => setRows(rows.filter((_, idx) => idx !== i))} disabled={rows.length === 1}><Trash2 className="h-4 w-4 mx-auto"/></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="p-8 flex justify-center bg-slate-50 border-t">
                  <Button variant="outline" className="px-10 h-14 border-dashed border-2 bg-white" onClick={() => setRows([...rows, {...EMPTY_ROW}])}>
                    <Plus className="mr-2 h-4 w-4"/> AGREGAR JUGADOR
                  </Button>
                </div>
              </div>

              {/* FOOTER FIJO */}
              <div className="p-4 border-t bg-white flex justify-end gap-3 shrink-0">
                <Button variant="ghost" className="h-12" onClick={() => setShowForm(false)}>Descartar</Button>
                <Button className="bg-red-800 px-10 h-12 font-bold shadow-lg text-white" onClick={handleSave} disabled={loading}>
                  {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : "GUARDAR INFORME"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* VISUALIZADOR SE MANTIENE COMO DIALOG PORQUE ES SOLO LECTURA */}
        {viewingInforme && (
          <Dialog open={!!viewingInforme} onOpenChange={() => setViewingInforme(null)}>
            <DialogContent className="max-w-[95vw] h-[88vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl bg-slate-50" showCloseButton={false}>
              <div className="p-4 bg-red-800 text-white flex justify-between items-center shrink-0">
                <div>
                   <DialogTitle className="text-xl font-bold italic uppercase text-white">{viewingInforme.titulo}</DialogTitle>
                   <DialogDescription className="text-xs opacity-80 text-white/90">
                     {viewingInforme.seccion} — {new Date(viewingInforme.created_at).toLocaleDateString()} — {viewingInforme.subido_por}
                   </DialogDescription>
                </div>
                <Button variant="ghost" className="text-white hover:bg-red-700" onClick={() => setViewingInforme(null)}>
                  <X className="h-6 w-6" />
                </Button>
              </div>

              <div className="flex-1 overflow-auto p-4">
                 {viewingInforme.fotos && viewingInforme.fotos.length > 0 && (
                   <div className="mb-6 flex gap-4 overflow-x-auto pb-4">
                     {viewingInforme.fotos.map((url, idx) => (
                       // eslint-disable-next-line @next/next/no-img-element
                       <img key={idx} src={url} alt={`Foto ${idx}`} className="h-40 rounded-lg shadow-md border hover:scale-105 transition-transform" />
                     ))}
                   </div>
                 )}

                 <div className="bg-white rounded-lg shadow border overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-sm min-w-[1500px]">
                        <thead className="bg-slate-100 text-slate-700">
                          <tr className="h-10 text-xs uppercase">
                            <th className="px-3 border text-left w-[200px]">Nombre</th>
                            <th className="px-1 border w-[60px]">Cat.</th>
                            <th className="px-2 border w-[80px]">Pos.</th>
                            <th className="px-3 border w-[150px]">Club</th>
                            <th className="px-3 border w-[120px]">Tel.</th>
                            <th className="px-3 border w-[150px]">Contacto</th>
                            <th className="px-3 border w-[120px]">Cap.</th>
                            <th className="px-2 border w-[80px]">Pensión</th>
                            <th className="px-3 border text-left min-w-[400px]">Características</th>
                            <th className="px-1 border w-[70px]">Puntaje</th>
                            <th className="px-1 border w-[70px]">Citar</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {viewingInforme.contenido.map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="border px-3 py-2 font-semibold">{row.apellido_nombre}</td>
                              <td className="border px-1 py-2 text-center">{row.categoria}</td>
                              <td className="border px-2 py-2 text-center">{row.posicion}</td>
                              <td className="border px-3 py-2 text-slate-600">{row.club}</td>
                              <td className="border px-3 py-2 text-xs">{row.telefono}</td>
                              <td className="border px-3 py-2 text-slate-600 text-xs">{row.contacto}</td>
                              <td className="border px-3 py-2 text-xs">{row.captador}</td>
                              <td className="border px-1 py-2 text-center">{row.pension}</td>
                              <td className="border px-3 py-2 whitespace-pre-wrap leading-relaxed text-slate-700">{row.caracteristicas}</td>
                              <td className="border px-1 py-2 text-center font-bold text-red-700">{row.puntaje}</td>
                              <td className="border px-1 py-2 text-center font-medium">{row.volver_a_citar}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                 </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}