"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  createPlayer,
  updatePlayer,
  deletePlayer,
  getDivisionLabel,
  getPlayersByDivision,
  type Player,
  type Division,
  type Position,
  type PlayerExtendedData,
  type LeagueType,
} from "@/lib/players"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, Search, Loader2, FileText, Home, Printer } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ExtendedPlayerDataDialog } from "@/components/extended-player-data-dialog"
import { Checkbox } from "@/components/ui/checkbox"

export function PlayersManagement() {
  const { toast } = useToast()
  const [players, setPlayers] = useState<Player[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [divisionFilter, setDivisionFilter] = useState<Division | "todas">("todas")
  const [pensionFilter, setPensionFilter] = useState<"todos" | "pensionados" | "no-pensionados">("todos")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [showExtendedDataDialog, setShowExtendedDataDialog] = useState(false)
  const [extendedData, setExtendedData] = useState<PlayerExtendedData>({})

  // Pagination
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [totalPlayers, setTotalPlayers] = useState(0)
  const ITEMS_PER_PAGE = 10

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    division: "reserva" as Division,
    age: "",
    position: "Defensor" as Position,
    height: "",
    weight: "",
    leagueTypes: ["ROSARINA"] as LeagueType[],
    isOnLoan: false,
  })

  // Fetch players on filters change
  useEffect(() => {
    // Debounce search slightly to avoid too many requests
    const timer = setTimeout(() => {
      loadPlayers()
    }, 300)
    return () => clearTimeout(timer)
  }, [divisionFilter, page, searchTerm, pensionFilter])

  const loadPlayers = async () => {
    setLoading(true)
    try {
      // Cargar TODOS los jugadores sin paginación en la BD (limit 10000)
      const allPlayers = await getPlayersByDivision(divisionFilter, 0, 10000, searchTerm)
      console.log("[v0] Total de jugadores cargados:", allPlayers.length)

      let filteredData = allPlayers
      if (pensionFilter === "pensionados") {
        filteredData = allPlayers.filter((p) => p.isPensioned === true)
      } else if (pensionFilter === "no-pensionados") {
        filteredData = allPlayers.filter((p) => !p.isPensioned)
      }

      // Ordenar alfabéticamente por nombre
      filteredData.sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }))

      // Aplicar paginación en cliente después de ordenar
      const startIdx = page * ITEMS_PER_PAGE
      const paginatedData = filteredData.slice(startIdx, startIdx + ITEMS_PER_PAGE)

      console.log("[v0] Jugadores en página actual:", paginatedData.length, "de", filteredData.length)
      setPlayers(paginatedData)
      setTotalPlayers(filteredData.length)
      setHasMore(startIdx + ITEMS_PER_PAGE < filteredData.length)
    } finally {
      setLoading(false)
    }
  }

  // Reset page when filters change
  const handleFilterChange = (val: Division | "todas") => {
    setDivisionFilter(val)
    setPage(0)
  }

  const handlePensionFilterChange = (val: "todos" | "pensionados" | "no-pensionados") => {
    setPensionFilter(val)
    setPage(0)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setPage(0)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      division: "reserva",
      age: "",
      position: "Defensor",
      height: "",
      weight: "",
      leagueTypes: ["ROSARINA"],
      isOnLoan: false,
    })
    setExtendedData({})
  }

  const handleAdd = async () => {
    if (!formData.name) {
      toast({
        title: "Error",
        description: "El nombre del jugador es obligatorio",
        variant: "destructive",
      })
      return
    }

    if (formData.leagueTypes.length === 0) {
      toast({
        title: "Error",
        description: "Debe seleccionar al menos una liga (AFA o ROSARINA)",
        variant: "destructive",
      })
      return
    }

    setActionLoading(true)

    const newPlayer = await createPlayer({
      name: formData.name,
      division: formData.division,
      age: formData.age ? Number.parseInt(formData.age) : 0,
      position: formData.position,
      height: formData.height ? Number.parseInt(formData.height) : 0,
      weight: formData.weight ? Number.parseInt(formData.weight) : 0,
      extendedData: extendedData,
      leagueTypes: formData.leagueTypes,
      loanStatus: formData.isOnLoan ? "PRESTAMO" : null,
      leagueStats: [],
    })

    if (newPlayer) {
      setIsAddDialogOpen(false)
      resetForm()
      loadPlayers()

      toast({
        title: "Jugador agregado",
        description: `${newPlayer.name} ha sido agregado al plantel`,
      })
    } else {
      toast({
        title: "Error",
        description: "No se pudo crear el jugador",
        variant: "destructive",
      })
    }
    setActionLoading(false)
  }

  const handleEdit = async () => {
    if (!selectedPlayer || !formData.name) {
      toast({
        title: "Error",
        description: "El nombre del jugador es obligatorio",
        variant: "destructive",
      })
      return
    }

    if (formData.leagueTypes.length === 0) {
      toast({
        title: "Error",
        description: "Debe seleccionar al menos una liga (AFA o ROSARINA)",
        variant: "destructive",
      })
      return
    }

    setActionLoading(true)

    const updatedPlayer = await updatePlayer(selectedPlayer.id, {
      name: formData.name,
      division: formData.division,
      age: formData.age ? Number.parseInt(formData.age) : 0,
      position: formData.position,
      height: formData.height ? Number.parseInt(formData.height) : 0,
      weight: formData.weight ? Number.parseInt(formData.weight) : 0,
      extendedData: extendedData,
      leagueTypes: formData.leagueTypes,
      loanStatus: formData.isOnLoan ? "PRESTAMO" : null,
    })

    if (updatedPlayer) {
      setIsEditDialogOpen(false)
      setSelectedPlayer(null)
      resetForm()
      loadPlayers()

      toast({
        title: "Jugador actualizado",
        description: `Los datos de ${formData.name} han sido actualizados`,
      })
    } else {
      toast({
        title: "Error",
        description: "No se pudo actualizar el jugador",
        variant: "destructive",
      })
    }
    setActionLoading(false)
  }

  const handleDelete = async () => {
    if (!selectedPlayer) return

    setActionLoading(true)
    const success = await deletePlayer(selectedPlayer.id)

    if (success) {
      setIsDeleteDialogOpen(false)
      setSelectedPlayer(null)
      loadPlayers()

      toast({
        title: "Jugador eliminado",
        description: `${selectedPlayer.name} ha sido eliminado del plantel`,
      })
    } else {
      toast({
        title: "Error",
        description: "No se pudo eliminar el jugador",
        variant: "destructive",
      })
    }
    setActionLoading(false)
  }

  const openEditDialog = (player: Player) => {
    setSelectedPlayer(player)
    setFormData({
      name: player.name,
      division: player.division,
      age: player.age.toString(),
      position: player.position,
      height: player.height.toString(),
      weight: player.weight.toString(),
      leagueTypes: player.leagueTypes || ["ROSARINA"],
      isOnLoan: player.loanStatus === "PRESTAMO",
    })
    setExtendedData(player.extendedData || {})
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (player: Player) => {
    setSelectedPlayer(player)
    setIsDeleteDialogOpen(true)
  }

  const toggleLeagueType = (leagueType: LeagueType) => {
    setFormData((prev) => {
      const newLeagueTypes = prev.leagueTypes.includes(leagueType)
        ? prev.leagueTypes.filter((lt) => lt !== leagueType)
        : [...prev.leagueTypes, leagueType]
      return { ...prev, leagueTypes: newLeagueTypes }
    })
  }

  const handlePrint = async () => {
    try {
      // Cargar todos los jugadores para imprimir
      const allPlayers = await getPlayersByDivision(divisionFilter, 0, 10000, searchTerm)
      
      let printData = allPlayers
      if (pensionFilter === "pensionados") {
        printData = allPlayers.filter((p) => p.isPensioned === true)
      } else if (pensionFilter === "no-pensionados") {
        printData = allPlayers.filter((p) => !p.isPensioned)
      }
      
      // Ordenar alfabéticamente
      printData.sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }))
      
      // Crear contenido para imprimir
      let content = `<html><head><title>Listado de Jugadores</title>`
      content += `<style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { text-align: center; color: #991b1b; border-bottom: 3px solid #991b1b; padding-bottom: 10px; }
        h2 { color: #666; margin-top: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { background-color: #991b1b; color: white; padding: 8px; text-align: left; font-weight: bold; }
        td { padding: 8px; border-bottom: 1px solid #ddd; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .total { font-weight: bold; margin-top: 10px; font-size: 14px; }
        .division-label { color: #666; font-size: 12px; }
      </style></head><body>`
      
      content += `<h1>Listado de Jugadores</h1>`
      
      // Filtros aplicados
      let filterInfo = "Filtros aplicados: "
      if (divisionFilter !== "todas") {
        filterInfo += `División: ${getDivisionLabel(divisionFilter)} | `
      }
      if (pensionFilter !== "todos") {
        filterInfo += `Pensión: ${pensionFilter} | `
      }
      if (searchTerm) {
        filterInfo += `Búsqueda: ${searchTerm}`
      }
      if (filterInfo !== "Filtros aplicados: ") {
        content += `<p class="division-label">${filterInfo}</p>`
      }
      
      content += `<table>
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>División</th>
            <th>Posición</th>
            <th>Edad</th>
            <th>Altura</th>
            <th>Peso</th>
          </tr>
        </thead>
        <tbody>`
      
      printData.forEach((player, idx) => {
        content += `<tr>
          <td>${idx + 1}</td>
          <td>${player.name}</td>
          <td>${getDivisionLabel(player.division)}</td>
          <td>${player.position}</td>
          <td>${player.age || "-"}</td>
          <td>${player.height || "-"}</td>
          <td>${player.weight || "-"}</td>
        </tr>`
      })
      
      content += `</tbody></table>`
      content += `<p class="total">Total de jugadores: <strong>${printData.length}</strong></p>`
      content += `<p style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">Impreso el ${new Date().toLocaleDateString()}</p>`
      content += `</body></html>`
      
      // Abrir ventana de impresión
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(content)
        printWindow.document.close()
        printWindow.print()
      }
    } catch (error) {
      console.error("Error al imprimir:", error)
      toast({
        title: "Error",
        description: "No se pudo generar el documento de impresión",
        variant: "destructive",
      })
    }
  }

  if (loading && players.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-red-700" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 flex-1 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar jugador..." value={searchTerm} onChange={handleSearchChange} className="pl-10" />
          </div>
          <Select value={divisionFilter} onValueChange={(value) => handleFilterChange(value as Division | "todas")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por división" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las divisiones</SelectItem>
              <SelectItem value="4ta">4ta División</SelectItem>
              <SelectItem value="1eralocal">1era Local</SelectItem>
              <SelectItem value="reserva">Reserva</SelectItem>
              <SelectItem value="5ta">5ta División</SelectItem>
              <SelectItem value="6ta">6ta División</SelectItem>
              <SelectItem value="7ma">7ma División</SelectItem>
              <SelectItem value="8va">8va División</SelectItem>
              <SelectItem value="9na">9na División</SelectItem>
              <SelectItem value="10ma">10ma División</SelectItem>
              <SelectItem value="11">11va División</SelectItem>
              <SelectItem value="12">12va División</SelectItem>
              <SelectItem value="13">13va División</SelectItem>
              <SelectItem value="arqueros">Arqueros</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={pensionFilter}
            onValueChange={(value) => handlePensionFilterChange(value as "todos" | "pensionados" | "no-pensionados")}
          >
            <SelectTrigger className="w-[180px]">
              <Home className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filtrar por pensión" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="pensionados">Pensionados</SelectItem>
              <SelectItem value="no-pensionados">No pensionados</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button onClick={handlePrint} variant="outline" className="border-red-700 text-red-700 hover:bg-red-50 bg-transparent">
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)} className="bg-red-700 hover:bg-red-800">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Jugador
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-red-700" />
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>División</TableHead>
                <TableHead>Liga</TableHead>
                <TableHead>Posición</TableHead>
                <TableHead>Edad</TableHead>
                <TableHead>Altura</TableHead>
                <TableHead>Peso</TableHead>
                <TableHead>Pensión</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No se encontraron jugadores
                  </TableCell>
                </TableRow>
              ) : (
                players.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell className="font-medium">{player.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getDivisionLabel(player.division)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={player.leagueTypes?.[0] || "AMBAS"}
                        onValueChange={async (value: LeagueType) => {
                          const result = await updatePlayer(player.id, {
                            leagueTypes: [value],
                          })
                          if (result) {
                            toast({
                              title: "Liga actualizada",
                              description: `Liga cambiada a ${value}`,
                            })
                            loadPlayers()
                          } else {
                            toast({
                              title: "Error",
                              description: "No se pudo actualizar la liga",
                              variant: "destructive",
                            })
                          }
                        }}
                      >
                        <SelectTrigger className="w-fit">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AFA">AFA</SelectItem>
                          <SelectItem value="ROSARINA">ROSARINA</SelectItem>
                          <SelectItem value="AMBAS">AMBAS</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{player.position}</TableCell>
                    <TableCell>{player.age} años</TableCell>
                    <TableCell>{player.height} cm</TableCell>
                    <TableCell>{player.weight} kg</TableCell>
                    <TableCell>
                      {player.isPensioned ? (
                        <Badge className="bg-blue-600 text-white">
                          <Home className="h-3 w-3 mr-1" />
                          Sí
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">No</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(player)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(player)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0 || loading}
        >
          Anterior
        </Button>
        <div className="text-sm font-medium">Página {page + 1}</div>
        <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={!hasMore || loading}>
          Siguiente
        </Button>
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Jugador</DialogTitle>
            <DialogDescription>Complete los datos del nuevo jugador</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="add-name">Nombre Completo *</Label>
              <Input
                id="add-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre del jugador"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-division">División *</Label>
                <Select
                  value={formData.division}
                  onValueChange={(value: Division) => setFormData({ ...formData, division: value })}
                >
                  <SelectTrigger id="add-division">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4ta">4ta División</SelectItem>
                    <SelectItem value="1eralocal">1era Local</SelectItem>
                    <SelectItem value="reserva">Reserva</SelectItem>
                    <SelectItem value="5ta">5ta División</SelectItem>
                    <SelectItem value="6ta">6ta División</SelectItem>
                    <SelectItem value="7ma">7ma División</SelectItem>
                    <SelectItem value="8va">8va División</SelectItem>
                    <SelectItem value="9na">9na División</SelectItem>
                    <SelectItem value="10ma">10ma División</SelectItem>
                    <SelectItem value="11">11va División</SelectItem>
                    <SelectItem value="12">12va División</SelectItem>
                    <SelectItem value="13">13va División</SelectItem>
                    <SelectItem value="arqueros">Arqueros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-position">Posición *</Label>
                <Select
                  value={formData.position}
                  onValueChange={(value: Position) => setFormData({ ...formData, position: value })}
                >
                  <SelectTrigger id="add-position">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Arquero">Arquero</SelectItem>
                    <SelectItem value="Defensor">Defensor</SelectItem>
                    <SelectItem value="Mediocampista">Mediocampista</SelectItem>
                    <SelectItem value="Delantero">Delantero</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-age">Edad</Label>
                <Input
                  id="add-age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="18"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-height">Altura (cm)</Label>
                <Input
                  id="add-height"
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  placeholder="180"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-weight">Peso (kg)</Label>
                <Input
                  id="add-weight"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="75"
                />
              </div>
            </div>

            <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
              <Label className="text-base font-semibold">Ligas *</Label>
              <p className="text-sm text-muted-foreground">Seleccione en qué liga(s) participa el jugador</p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="add-league-afa"
                    checked={formData.leagueTypes.includes("AFA")}
                    onCheckedChange={() => toggleLeagueType("AFA")}
                  />
                  <Label htmlFor="add-league-afa" className="font-normal cursor-pointer">
                    AFA (Asociación del Fútbol Argentino)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="add-league-rosarina"
                    checked={formData.leagueTypes.includes("ROSARINA")}
                    onCheckedChange={() => toggleLeagueType("ROSARINA")}
                  />
                  <Label htmlFor="add-league-rosarina" className="font-normal cursor-pointer">
                    Liga Rosarina de Fútbol
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 p-4 border rounded-lg bg-muted/50">
              <Checkbox
                id="add-loan-status"
                checked={formData.isOnLoan}
                onCheckedChange={(checked) => setFormData({ ...formData, isOnLoan: checked === true })}
              />
              <Label htmlFor="add-loan-status" className="font-normal cursor-pointer">
                Jugador en préstamo
              </Label>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => setShowExtendedDataDialog(true)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Datos Administrativos (Opcional)
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAdd} className="bg-red-700 hover:bg-red-800" disabled={actionLoading}>
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Agregar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Jugador</DialogTitle>
            <DialogDescription>Modifique los datos del jugador</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre Completo *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre del jugador"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-division">División *</Label>
                <Select
                  value={formData.division}
                  onValueChange={(value: Division) => setFormData({ ...formData, division: value })}
                >
                  <SelectTrigger id="edit-division">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4ta">4ta División</SelectItem>
                    <SelectItem value="1eralocal">1era Local</SelectItem>
                    <SelectItem value="reserva">Reserva</SelectItem>
                    <SelectItem value="5ta">5ta División</SelectItem>
                    <SelectItem value="6ta">6ta División</SelectItem>
                    <SelectItem value="7ma">7ma División</SelectItem>
                    <SelectItem value="8va">8va División</SelectItem>
                    <SelectItem value="9na">9na División</SelectItem>
                    <SelectItem value="10ma">10ma División</SelectItem>
                    <SelectItem value="11">11va División</SelectItem>
                    <SelectItem value="12">12va División</SelectItem>
                    <SelectItem value="13">13va División</SelectItem>
                    <SelectItem value="arqueros">Arqueros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-position">Posición *</Label>
                <Select
                  value={formData.position}
                  onValueChange={(value: Position) => setFormData({ ...formData, position: value })}
                >
                  <SelectTrigger id="edit-position">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Arquero">Arquero</SelectItem>
                    <SelectItem value="Defensor">Defensor</SelectItem>
                    <SelectItem value="Mediocampista">Mediocampista</SelectItem>
                    <SelectItem value="Delantero">Delantero</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-age">Edad</Label>
                <Input
                  id="edit-age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="18"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-height">Altura (cm)</Label>
                <Input
                  id="edit-height"
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  placeholder="180"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-weight">Peso (kg)</Label>
                <Input
                  id="edit-weight"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="75"
                />
              </div>
            </div>

            <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
              <Label className="text-base font-semibold">Ligas *</Label>
              <p className="text-sm text-muted-foreground">Seleccione en qué liga(s) participa el jugador</p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-league-afa"
                    checked={formData.leagueTypes.includes("AFA")}
                    onCheckedChange={() => toggleLeagueType("AFA")}
                  />
                  <Label htmlFor="edit-league-afa" className="font-normal cursor-pointer">
                    AFA (Asociación del Fútbol Argentino)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-league-rosarina"
                    checked={formData.leagueTypes.includes("ROSARINA")}
                    onCheckedChange={() => toggleLeagueType("ROSARINA")}
                  />
                  <Label htmlFor="edit-league-rosarina" className="font-normal cursor-pointer">
                    Liga Rosarina de Fútbol
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 p-4 border rounded-lg bg-muted/50">
              <Checkbox
                id="edit-loan-status"
                checked={formData.isOnLoan}
                onCheckedChange={(checked) => setFormData({ ...formData, isOnLoan: checked === true })}
              />
              <Label htmlFor="edit-loan-status" className="font-normal cursor-pointer">
                Jugador en préstamo
              </Label>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => setShowExtendedDataDialog(true)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Datos Administrativos
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEdit} className="bg-red-700 hover:bg-red-800" disabled={actionLoading}>
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Jugador</DialogTitle>
            <DialogDescription>
              ¿Está seguro que desea eliminar a {selectedPlayer?.name}? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={actionLoading}>
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Extended Data Dialog */}
      <ExtendedPlayerDataDialog
        open={showExtendedDataDialog}
        onOpenChange={setShowExtendedDataDialog}
        extendedData={extendedData}
        onSave={(data) => {
          setExtendedData(data)
          setShowExtendedDataDialog(false)
        }}
      />
    </div>
  )
}
