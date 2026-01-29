"use client"

import React, { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Save, Loader2, Search } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { getRehabilitacionPlanillaAction, saveRehabilitacionFieldsAction } from "@/lib/rehabilitacion-actions"

// Estructura de datos según el PDF
interface LesionData {
  id: string
  nombre: string
  lesionFecha: string
  gravedad: string
  cx: string
  fechaCx: string
  estudios: string
  piernaLesionada: string
  piernaHabil: string
  recidiva: string
  puesto: string
  // Campos editables
  rtr: string
  rtt: string
  rtp: string
}

export function RehabilitacionManager({ userName, onClose }: { userName: string, onClose: () => void }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState<LesionData[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [modifiedIds, setModifiedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const result = await getRehabilitacionPlanillaAction()
        setData(result)
      } catch (error) {
        console.error("Error al cargar datos de rehabilitación:", error)
        toast({ title: "Error", description: "No se pudieron cargar los datos de rehabilitación.", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleUpdateField = (id: string, field: 'rtr' | 'rtt' | 'rtp', value: string) => {
    setData(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item))
    setModifiedIds(prev => new Set(prev).add(id))
  }

  const handleSave = async () => {
    if (modifiedIds.size === 0) {
        toast({ title: "Información", description: "No hay cambios para guardar." })
        return
    }

    setSaving(true)
    try {
      const savePromises = Array.from(modifiedIds).map(id => {
          const item = data.find(d => d.id === id)
          if (!item) return Promise.resolve()
          return saveRehabilitacionFieldsAction(id, { rtr: item.rtr, rtt: item.rtt, rtp: item.rtp })
      })

      await Promise.all(savePromises)
      
      setModifiedIds(new Set())
      toast({ title: "Cambios guardados", description: "La planilla de rehabilitación se actualizó correctamente." })
    } catch (error) {
      console.error("Error al guardar cambios:", error)
      toast({ title: "Error", description: "No se pudieron guardar algunos cambios.", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const filteredData = data.filter(item => 
    item.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between border-b bg-red-700 text-white p-4">
          <div>
            <CardTitle className="text-xl">Área Kinesiología - Rehabilitación</CardTitle>
            <p className="text-xs opacity-80 text-white">Newell's Old Boys | Usuario: {userName}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-red-800">
            <X className="h-6 w-6" />
          </Button>
        </CardHeader>
        
        <div className="p-4 bg-gray-50 border-b flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar jugador..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto" disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Guardar Cambios
          </Button>
        </div>

        <CardContent className="flex-1 overflow-auto p-0">
          {loading ? (
            <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-red-700" /></div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-100 sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="font-bold text-black min-w-[150px]">Nombre y Apellido</TableHead>
                    <TableHead className="font-bold text-black min-w-[200px]">Lesión / Fecha</TableHead>
                    <TableHead className="font-bold text-black">Gravedad</TableHead>
                    <TableHead className="font-bold text-black">Cx</TableHead>
                    <TableHead className="font-bold text-black">Fecha Cx</TableHead>
                    <TableHead className="font-bold text-black">Estudios</TableHead>
                    <TableHead className="font-bold text-black">P. Lesionada</TableHead>
                    <TableHead className="font-bold text-black">P. Hábil</TableHead>
                    <TableHead className="font-bold text-black">Recidiva</TableHead>
                    <TableHead className="font-bold text-black">Puesto</TableHead>
                    {/* Columnas editables basadas en el PDF  */}
                    <TableHead className="font-bold text-red-700 bg-red-50 min-w-[100px]">RTR</TableHead>
                    <TableHead className="font-bold text-red-700 bg-red-50 min-w-[100px]">RTT</TableHead>
                    <TableHead className="font-bold text-red-700 bg-red-50 min-w-[100px]">RTP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item) => (
                    <TableRow key={item.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{item.nombre}</TableCell>
                      <TableCell className="text-xs">{item.lesionFecha}</TableCell>
                      <TableCell>{item.gravedad}</TableCell>
                      <TableCell>{item.cx}</TableCell>
                      <TableCell>{item.fechaCx}</TableCell>
                      <TableCell className="text-xs">{item.estudios}</TableCell>
                      <TableCell>{item.piernaLesionada}</TableCell>
                      <TableCell>{item.piernaHabil}</TableCell>
                      <TableCell>{item.recidiva}</TableCell>
                      <TableCell>{item.puesto}</TableCell>
                      {/* Inputs para texto libre según pedido  */}
                      <TableCell className="bg-red-50/30">
                        <Input 
                          value={item.rtr} 
                          onChange={(e) => handleUpdateField(item.id, 'rtr', e.target.value)}
                          className="h-8 text-xs border-red-200 focus:ring-red-500"
                        />
                      </TableCell>
                      <TableCell className="bg-red-50/30">
                        <Input 
                          value={item.rtt} 
                          onChange={(e) => handleUpdateField(item.id, 'rtt', e.target.value)}
                          className="h-8 text-xs border-red-200 focus:ring-red-500"
                        />
                      </TableCell>
                      <TableCell className="bg-red-50/30">
                        <Input 
                          value={item.rtp} 
                          onChange={(e) => handleUpdateField(item.id, 'rtp', e.target.value)}
                          className="h-8 text-xs border-red-200 focus:ring-red-500"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}