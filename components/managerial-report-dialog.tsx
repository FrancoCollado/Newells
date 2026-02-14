"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Download, X, Search, FilterX, FileSpreadsheet } from "lucide-react"
import { getManagerialReportData } from "@/app/actions/managerial-report-actions"
import { cn } from "@/lib/utils"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface ManagerialReportDialogProps {
  division: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ManagerialReportDialog({ division, open, onOpenChange }: ManagerialReportDialogProps) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any[]>([])
  
  // Filtering states
  const [filters, setFilters] = useState({
    name: "",
    isInjured: "all",
    hasEuPassport: "all",
    isPensioned: "all",
    diagnosis: ""
  })

  useEffect(() => {
    if (open) {
      loadData()
    }
  }, [open, division])

  async function loadData() {
    setLoading(true)
    try {
      const result = await getManagerialReportData(division)
      setData(result)
    } catch (error) {
      console.error("Error loading managerial report:", error)
    } finally {
      setLoading(false)
    }
  }

  const getImoColor = (imo: number | null) => {
    if (imo === null) return ""
    if (imo < 4) return "bg-red-500 text-white"
    if (imo >= 4 && imo <= 4.5) return "bg-yellow-400 text-black"
    return "bg-green-500 text-white"
  }

  const getPlieguesColor = (sum: number | null) => {
    if (sum === null) return ""
    if (sum <= 40) return "bg-green-500 text-white"
    if (sum > 40 && sum <= 45) return "bg-yellow-400 text-black"
    return "bg-red-500 text-white"
  }

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesName = item.name.toLowerCase().includes(filters.name.toLowerCase())
      const matchesInjury = filters.isInjured === "all" ? true : (filters.isInjured === "si" ? item.isInjured : !item.isInjured)
      const matchesPassport = filters.hasEuPassport === "all" ? true : (filters.hasEuPassport === "si" ? item.hasEuPassport : !item.hasEuPassport)
      const matchesPension = filters.isPensioned === "all" ? true : (filters.isPensioned === "si" ? item.isPensioned : !item.isPensioned)
      const matchesDiagnosis = item.injuryDiagnosis.toLowerCase().includes(filters.diagnosis.toLowerCase())
      
      return matchesName && matchesInjury && matchesPassport && matchesPension && matchesDiagnosis
    })
  }, [data, filters])

  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })
    
    // Title
    doc.setFontSize(16)
    doc.setTextColor(30, 41, 59) // Slate 800
    doc.text(`INFORME GERENCIAL - ${division.toUpperCase()}`, 14, 15)
    
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Fecha: ${new Date().toLocaleDateString()} | Jugadores: ${filteredData.length}`, 14, 22)

    const tableColumn = [
      "Jugador", "Edad", "Talla", "Peso", "Min", "Goles", "IMO", "6 Plieg", "Lesión", "Diagnóstico", "EU", "Pens"
    ]
    
    const tableRows = filteredData.map(row => [
      row.name,
      row.age,
      `${row.height}cm`,
      `${row.weight}kg`,
      row.minutesPlayed,
      row.goals,
      row.imo || "-",
      row.sum6Pliegues || "-",
      row.isInjured ? "SÍ" : "NO",
      row.injuryDiagnosis || "-",
      row.hasEuPassport ? "SÍ" : "NO",
      row.isPensioned ? "SÍ" : "NO"
    ])

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 28,
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
      didParseCell: (data) => {
        // IMO Color
        if (data.column.index === 6 && data.cell.section === 'body') {
          const val = parseFloat(data.cell.text[0])
          if (!isNaN(val)) {
            if (val < 4) data.cell.styles.fillColor = [239, 68, 68] // Red 500
            else if (val <= 4.5) data.cell.styles.fillColor = [250, 204, 21] // Yellow 400
            else data.cell.styles.fillColor = [34, 197, 94] // Green 500
            if (val < 4 || val > 4.5) data.cell.styles.textColor = [255, 255, 255]
          }
        }
        // 6 Pliegues Color
        if (data.column.index === 7 && data.cell.section === 'body') {
          const val = parseFloat(data.cell.text[0])
          if (!isNaN(val)) {
            if (val <= 40) data.cell.styles.fillColor = [34, 197, 94]
            else if (val <= 45) data.cell.styles.fillColor = [250, 204, 21]
            else data.cell.styles.fillColor = [239, 68, 68]
            if (val <= 40 || val > 45) data.cell.styles.textColor = [255, 255, 255]
          }
        }
        // Injury Color
        if (data.column.index === 8 && data.cell.section === 'body') {
          if (data.cell.text[0] === 'SÍ') {
            data.cell.styles.fillColor = [239, 68, 68] // Red 500
            data.cell.styles.textColor = [255, 255, 255]
          } else {
            data.cell.styles.fillColor = [34, 197, 94] // Green 500
            data.cell.styles.textColor = [255, 255, 255]
          }
        }
      }
    })

    doc.save(`Informe_Gerencial_${division}_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const resetFilters = () => {
    setFilters({
      name: "",
      isInjured: "all",
      hasEuPassport: "all",
      isPensioned: "all",
      diagnosis: ""
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col w-screen h-screen overflow-hidden">
        <div className="p-6 pb-2 bg-white border-b shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-4">
              <div className="bg-slate-900 p-2 rounded-lg">
                  <FileSpreadsheet className="h-6 w-6 text-white" />
              </div>
              <div>
                  <h2 className="text-2xl font-bold tracking-tighter uppercase italic text-slate-900">
                      Informe Gerencial - {division}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                      Vista completa de rendimiento, salud y datos administrativos.
                  </p>
              </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2 border-slate-300" onClick={resetFilters}>
              <FilterX className="h-4 w-4" /> Limpiar Filtros
            </Button>
            <Button variant="default" size="sm" className="gap-2 bg-red-700 hover:bg-red-800" onClick={exportToPDF}>
              <Download className="h-4 w-4" /> Exportar PDF
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Excel-like Filters Bar */}
        <div className="bg-slate-50 border-b p-4 grid grid-cols-1 md:grid-cols-5 gap-4 shrink-0">
            <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold text-slate-500">Filtrar por Nombre</Label>
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <Input 
                        placeholder="Buscar jugador..." 
                        className="pl-8 h-9 bg-white" 
                        value={filters.name}
                        onChange={e => setFilters({...filters, name: e.target.value})}
                    />
                </div>
            </div>
            <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold text-slate-500">Estado Lesión</Label>
                <select 
                    className="w-full h-9 rounded-md border border-input bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={filters.isInjured}
                    onChange={e => setFilters({...filters, isInjured: e.target.value})}
                >
                    <option value="all">Todos</option>
                    <option value="si">Lesionados</option>
                    <option value="no">Sanos</option>
                </select>
            </div>
            <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold text-slate-500">Pasaporte EU</Label>
                <select 
                    className="w-full h-9 rounded-md border border-input bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={filters.hasEuPassport}
                    onChange={e => setFilters({...filters, hasEuPassport: e.target.value})}
                >
                    <option value="all">Todos</option>
                    <option value="si">Con Pasaporte</option>
                    <option value="no">Sin Pasaporte</option>
                </select>
            </div>
            <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold text-slate-500">Pensión</Label>
                <select 
                    className="w-full h-9 rounded-md border border-input bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={filters.isPensioned}
                    onChange={e => setFilters({...filters, isPensioned: e.target.value})}
                >
                    <option value="all">Todos</option>
                    <option value="si">Pensionados</option>
                    <option value="no">No pensionados</option>
                </select>
            </div>
            <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold text-slate-500">Diagnóstico</Label>
                <Input 
                    placeholder="Filtrar por diagnóstico..." 
                    className="h-9 bg-white" 
                    value={filters.diagnosis}
                    onChange={e => setFilters({...filters, diagnosis: e.target.value})}
                />
            </div>
        </div>

        <div className="flex-1 overflow-auto p-4 bg-white">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-10 w-10 animate-spin text-red-700 mx-auto mb-2" />
                <p className="text-slate-500 font-medium">Generando reporte consolidado...</p>
              </div>
            </div>
          ) : (
            <div className="border rounded-lg shadow-sm">
              <Table>
                <TableHeader className="bg-slate-900 sticky top-0 z-20">
                  <TableRow className="hover:bg-slate-900 border-none">
                    <TableHead className="text-white font-bold h-12 sticky left-0 bg-slate-900 z-30 min-w-[200px]">JUGADOR</TableHead>
                    <TableHead className="text-white font-bold text-center">EDAD</TableHead>
                    <TableHead className="text-white font-bold text-center">TALLA</TableHead>
                    <TableHead className="text-white font-bold text-center">PESO</TableHead>
                    <TableHead className="text-white font-bold text-center">MINUTOS</TableHead>
                    <TableHead className="text-white font-bold text-center">GOLES</TableHead>
                    <TableHead className="text-white font-bold text-center">IMO</TableHead>
                    <TableHead className="text-white font-bold text-center">6 PLIEGUES</TableHead>
                    <TableHead className="text-white font-bold text-center">LESIÓN</TableHead>
                    <TableHead className="text-white font-bold">LOCALIZACIÓN</TableHead>
                    <TableHead className="text-white font-bold">TRATAMIENTO</TableHead>
                    <TableHead className="text-white font-bold">DIAGNÓSTICO</TableHead>
                    <TableHead className="text-white font-bold">OBSERVACIONES</TableHead>
                    <TableHead className="text-white font-bold text-center">EU</TableHead>
                    <TableHead className="text-white font-bold text-center">PENS.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((row) => (
                    <TableRow key={row.id} className="hover:bg-slate-50 border-b">
                      <TableCell className="font-bold border-r sticky left-0 bg-white z-10 whitespace-nowrap shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                        {row.name}
                      </TableCell>
                      <TableCell className="text-center">{row.age}</TableCell>
                      <TableCell className="text-center whitespace-nowrap">{row.height} cm</TableCell>
                      <TableCell className="text-center whitespace-nowrap">{row.weight} kg</TableCell>
                      <TableCell className="text-center">{row.minutesPlayed}</TableCell>
                      <TableCell className="text-center font-black text-red-700">{row.goals}</TableCell>
                      <TableCell className={cn("text-center font-bold border-x", getImoColor(row.imo))}>
                        {row.imo || "-"}
                      </TableCell>
                      <TableCell className={cn("text-center font-bold border-x", getPlieguesColor(row.sum6Pliegues))}>
                        {row.sum6Pliegues || "-"}
                      </TableCell>
                      <TableCell className={cn("text-center font-bold border-x", row.isInjured ? "bg-red-500 text-white" : "bg-green-500 text-white")}>
                        {row.isInjured ? "SÍ" : "NO"}
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate text-xs font-medium" title={row.injuryLocation}>
                        {row.injuryLocation}
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate text-xs" title={row.injuryTreatment}>
                        {row.injuryTreatment}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-xs italic" title={row.injuryDiagnosis}>
                        {row.injuryDiagnosis}
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate text-[10px] text-slate-500" title={row.observations}>
                        {row.observations}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={cn("px-2 py-0.5 rounded text-[10px] font-black", row.hasEuPassport ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-400")}>
                            {row.hasEuPassport ? "SÍ" : "NO"}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={cn("px-2 py-0.5 rounded text-[10px] font-black", row.isPensioned ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-400")}>
                            {row.isPensioned ? "SÍ" : "NO"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredData.length === 0 && (
                <div className="py-20 text-center text-slate-400">
                    No se encontraron jugadores con los filtros aplicados.
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Footer info bar */}
        <div className="bg-slate-900 text-white px-6 py-2 text-[10px] flex justify-between items-center shrink-0">
            <p className="uppercase font-bold tracking-widest">Newell's Old Boys - Sistema de Gestión Deportiva</p>
            <p>Total de registros mostrados: {filteredData.length}</p>
        </div>
    </div>
  )
}
