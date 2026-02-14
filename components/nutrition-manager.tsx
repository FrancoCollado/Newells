"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Apple, Save, History, Plus, User, Calendar } from "lucide-react"
import { saveNutritionReportAction, getPlayerNutritionReportsAction, type NutritionReport } from "@/app/actions/nutrition-actions"
import type { Player } from "@/lib/players"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, ReferenceLine, ResponsiveContainer, Label as RechartsLabel } from "recharts"

interface NutritionManagerProps {
  player: Player
  onClose: () => void
  canEdit: boolean
}

export function NutritionManager({ player, onClose, canEdit }: NutritionManagerProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [reports, setReports] = useState<NutritionReport[]>([])
  const [showHistory, setShowHistory] = useState(false)
  
  // Estado inicial basado en la imagen
  const [formData, setFormData] = useState<Partial<NutritionReport>>({
    playerId: player.id,
    reportDate: new Date().toISOString().split('T')[0],
    weight: player.weight,
    height: player.height,
    muscleKg: 0,
    fatKg: 0,
    musclePercentage: 0,
    fatPercentage: 0,
    imO: 0,
    sum6Pliegues: 0,
    observations: ""
  })

  useEffect(() => {
    loadReports()
  }, [player.id])

  async function loadReports() {
    try {
      const data = await getPlayerNutritionReportsAction(player.id)
      setReports(data)
    } catch (error) {
      console.error("Error loading nutrition reports:", error)
    }
  }

  async function handleSave() {
    if (!canEdit) return
    setLoading(true)
    try {
      const result = await saveNutritionReportAction(formData)
      if (result.success) {
        toast({ title: "Informe guardado correctamente" })
        loadReports()
        setShowHistory(true)
      }
    } catch (error) {
      toast({ 
        title: "Error al guardar", 
        description: "Asegúrate de haber ejecutado el SQL actualizado",
        variant: "destructive" 
      })
    } finally {
      setLoading(false)
    }
  }

  // Datos para el gráfico de cuadrantes
  // El eje X es Tejido Adiposo (Inverso: menos es mejor)
  // El eje Y es Masa Muscular (Arriba es mejor)
  // Normalizamos a una escala de 0 a 100 para el gráfico
  const scatterData = [{
    x: formData.fatPercentage || 0,
    y: formData.musclePercentage || 0,
  }]

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-red-100 p-2 rounded-full">
            <Apple className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">INFORME COMPOSICIÓN CORPORAL</h2>
            <p className="text-sm text-muted-foreground">Club Atlético Newell's Old Boys</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowHistory(!showHistory)}>
            {showHistory ? <Plus className="mr-2 h-4 w-4" /> : <History className="mr-2 h-4 w-4" />}
            {showHistory ? "Nuevo Informe" : "Historial"}
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>Cerrar</Button>
        </div>
      </div>

      {!showHistory ? (
        <div className="space-y-6">
          {/* Header del informe estilo imagen */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-slate-400" />
              <div className="flex-1">
                <p className="text-[10px] uppercase font-bold text-slate-500">Jugador</p>
                <p className="font-semibold text-lg">{player.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-slate-400" />
              <div className="flex-1">
                <p className="text-[10px] uppercase font-bold text-slate-500">Fecha</p>
                <Input 
                  type="date" 
                  className="h-8 border-none bg-transparent p-0 font-semibold text-lg focus-visible:ring-0" 
                  value={formData.reportDate}
                  onChange={e => setFormData({...formData, reportDate: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Grilla de Datos Principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 p-3 bg-slate-100 rounded-lg border border-slate-200">
                  <Label className="text-[10px] uppercase font-black text-slate-600">Peso Actual (kg)</Label>
                  <Input 
                    type="number" step="0.1" 
                    className="h-8 font-bold bg-white" 
                    value={formData.weight || ""} 
                    onChange={e => setFormData({...formData, weight: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-1.5 p-3 bg-slate-100 rounded-lg border border-slate-200">
                  <Label className="text-[10px] uppercase font-black text-slate-600">Talla (cm)</Label>
                  <Input 
                    type="number" step="0.1" 
                    className="h-8 font-bold bg-white" 
                    value={formData.height || ""} 
                    onChange={e => setFormData({...formData, height: parseFloat(e.target.value)})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <Label className="text-[10px] uppercase font-black text-blue-700">KG de Músculo</Label>
                  <Input 
                    type="number" step="0.1" 
                    className="h-8 font-bold bg-white" 
                    value={formData.muscleKg || ""} 
                    onChange={e => setFormData({...formData, muscleKg: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-1.5 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <Label className="text-[10px] uppercase font-black text-blue-700">KG de Tej. Adiposo</Label>
                  <Input 
                    type="number" step="0.1" 
                    className="h-8 font-bold bg-white" 
                    value={formData.fatKg || ""} 
                    onChange={e => setFormData({...formData, fatKg: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-1.5 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <Label className="text-[10px] uppercase font-black text-blue-700">% de Músculo</Label>
                  <Input 
                    type="number" step="0.01" 
                    className="h-8 font-bold bg-white" 
                    value={formData.musclePercentage || ""} 
                    onChange={e => setFormData({...formData, musclePercentage: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-1.5 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <Label className="text-[10px] uppercase font-black text-blue-700">% de Tej. Adiposo</Label>
                  <Input 
                    type="number" step="0.01" 
                    className="h-8 font-bold bg-white" 
                    value={formData.fatPercentage || ""} 
                    onChange={e => setFormData({...formData, fatPercentage: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-1.5 p-3 bg-slate-100 rounded-lg border border-slate-200">
                  <Label className="text-[10px] uppercase font-black text-slate-600">IM/O</Label>
                  <Input 
                    type="number" step="0.1" 
                    className="h-8 font-bold bg-white" 
                    value={formData.imO || ""} 
                    onChange={e => setFormData({...formData, imO: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-1.5 p-3 bg-slate-100 rounded-lg border border-slate-200">
                  <Label className="text-[10px] uppercase font-black text-slate-600">Sumatoria 6 Pliegues</Label>
                  <Input 
                    type="number" step="0.1" 
                    className="h-8 font-bold bg-white" 
                    value={formData.sum6Pliegues || ""} 
                    onChange={e => setFormData({...formData, sum6Pliegues: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
            </div>

            {/* Gráfico de Cuadrantes */}
            <div className="flex flex-col h-full border rounded-xl overflow-hidden shadow-sm bg-white">
              <div className="bg-slate-800 text-white p-2 text-center text-[10px] font-black uppercase tracking-widest">
                Estado Nutricional
              </div>
              <div className="flex-1 p-2 relative h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <XAxis 
                      type="number" 
                      dataKey="x" 
                      name="Adiposo" 
                      domain={[5, 25]} 
                      hide
                    />
                    <YAxis 
                      type="number" 
                      dataKey="y" 
                      name="Músculo" 
                      domain={[40, 60]} 
                      hide
                    />
                    <ZAxis type="number" range={[150]} />
                    
                    {/* Fondos de Cuadrantes */}
                    {/* Top Left - Optimo */}
                    <rect x="0" y="0" width="50%" height="50%" fill="#86efac" fillOpacity="0.4" />
                    {/* Top Right - Disminuir Tej Adiposo */}
                    <rect x="50%" y="0" width="50%" height="50%" fill="#fef08a" fillOpacity="0.4" />
                    {/* Bottom Left - Aumentar Musculo */}
                    <rect x="0" y="50%" width="50%" height="50%" fill="#fef08a" fillOpacity="0.4" />
                    {/* Bottom Right - Critico */}
                    <rect x="50%" y="50%" width="50%" height="50%" fill="#fca5a5" fillOpacity="0.4" />

                    <ReferenceLine x={15} stroke="#475569" strokeWidth={2} />
                    <ReferenceLine y={50} stroke="#475569" strokeWidth={2} />
                    
                    <Scatter 
                      name="Jugador" 
                      data={scatterData} 
                      fill="#000" 
                      shape="circle" 
                    />
                  </ScatterChart>
                </ResponsiveContainer>
                
                {/* Labels de Cuadrantes (Manuales sobre el SVG para control total) */}
                <div className="absolute top-4 left-4 text-[8px] font-black text-green-800 w-1/3 leading-tight">OPTIMO</div>
                <div className="absolute top-4 right-4 text-[8px] font-black text-yellow-800 w-1/3 text-right leading-tight">DISMINUIR TEJ. ADIPOSO</div>
                <div className="absolute bottom-4 left-4 text-[8px] font-black text-yellow-800 w-1/3 leading-tight uppercase">Aumentar Masa Muscular</div>
                <div className="absolute bottom-4 right-4 text-[8px] font-black text-red-800 w-1/3 text-right leading-tight uppercase">Disminuir Tej. Adiposo y Aumentar Masa Muscular</div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Observaciones adicionales</Label>
            <Textarea 
              value={formData.observations || ""} 
              onChange={e => setFormData({...formData, observations: e.target.value})}
              placeholder="Notas del nutricionista..."
              className="min-h-[100px]"
            />
          </div>

          {canEdit && (
            <Button className="w-full bg-red-700 h-12 text-lg font-bold shadow-lg" onClick={handleSave} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
              GUARDAR INFORME DE COMPOSICIÓN CORPORAL
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="font-bold text-slate-700 flex items-center gap-2">
            <History className="h-4 w-4" /> Historial de Evaluaciones
          </h3>
          {reports.length === 0 ? (
            <Card className="p-10 text-center text-muted-foreground border-dashed">
              No hay evaluaciones previas registradas.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reports.map(report => (
                <Card key={report.id} className="hover:border-red-200 transition-colors cursor-pointer" onClick={() => {
                  setFormData(report)
                  setShowHistory(false)
                }}>
                  <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                    <div>
                      <CardTitle className="text-sm">{format(new Date(report.reportDate), "PPP", { locale: es })}</CardTitle>
                      <CardDescription className="text-[10px]">Por: {report.profiles?.name}</CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-red-700">{report.weight}kg</p>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
                      <span>Músculo: {report.musclePercentage}%</span>
                      <span>Grasa: {report.fatPercentage}%</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
