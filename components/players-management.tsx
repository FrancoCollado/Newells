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
import { Plus, Pencil, Trash2, Search, Loader2, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ExtendedPlayerDataDialog } from "@/components/extended-player-data-dialog"

export function PlayersManagement() {
  const { toast } = useToast()
  const [players, setPlayers] = useState<Player[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [divisionFilter, setDivisionFilter] = useState<Division | "todas">("todas")
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
  const ITEMS_PER_PAGE = 10

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    division: "reserva" as Division,
    age: "",
    position: "Defensor" as Position,
    height: "",
    weight: "",
  })

  // Fetch players on filters change
  useEffect(() => {
    // Debounce search slightly to avoid too many requests
    const timer = setTimeout(() => {
      loadPlayers()
    }, 300)
    return () => clearTimeout(timer)
  }, [divisionFilter, page, searchTerm])

  const loadPlayers = async () => {
    setLoading(true)
    const data = await getPlayersByDivision(divisionFilter, page, ITEMS_PER_PAGE, searchTerm)
    setPlayers(data)
    setHasMore(data.length === ITEMS_PER_PAGE)
    setLoading(false)
  }

  // Reset page when filters change
  const handleFilterChange = (val: Division | "todas") => {
    setDivisionFilter(val)
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
    })
    setExtendedData({})
  }

  const handleAdd = async () => {
    if (!formData.name || !formData.age || !formData.height || !formData.weight) {
      toast({
        title: "Error",
        description: "Todos los campos obligatorios deben completarse",
        variant: "destructive",
      })
      return
    }

    setActionLoading(true)

    const newPlayer = await createPlayer({
      name: formData.name,
      division: formData.division,
      age: Number.parseInt(formData.age),
      position: formData.position,
      height: Number.parseInt(formData.height),
      weight: Number.parseInt(formData.weight),
      extendedData: extendedData,
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
    if (!selectedPlayer || !formData.name || !formData.age || !formData.height || !formData.weight) {
      toast({
        title: "Error",
        description: "Todos los campos obligatorios deben completarse",
        variant: "destructive",
      })
      return
    }

    setActionLoading(true)

    const updatedPlayer = await updatePlayer(selectedPlayer.id, {
      name: formData.name,
      division: formData.division,
      age: Number.parseInt(formData.age),
      position: formData.position,
      height: Number.parseInt(formData.height),
      weight: Number.parseInt(formData.weight),
      extendedData: extendedData,
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
    })
    setExtendedData(player.extendedData || {})
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (player: Player) => {
    setSelectedPlayer(player)
    setIsDeleteDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-red-700" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar jugador..." value={searchTerm} onChange={handleSearchChange} className="pl-10" />
          </div>
          <Select value={divisionFilter} onValueChange={(value) => handleFilterChange(value as Division | "todas")}>
            <SelectTrigger className="w-[200px]">
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
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-red-700 hover:bg-red-800">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Jugador
        </Button>
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
                <TableHead>Posición</TableHead>
                <TableHead>Edad</TableHead>
                <TableHead>Altura</TableHead>
                <TableHead>Peso</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
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
                    <TableCell>{player.position}</TableCell>
                    <TableCell>{player.age} años</TableCell>
                    <TableCell>{player.height} cm</TableCell>
                    <TableCell>{player.weight} kg</TableCell>
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
        <DialogContent className="max-w-md">
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
                <Label htmlFor="add-age">Edad *</Label>
                <Input
                  id="add-age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="18"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-height">Altura (cm) *</Label>
                <Input
                  id="add-height"
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  placeholder="180"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-weight">Peso (kg) *</Label>
                <Input
                  id="add-weight"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="75"
                />
              </div>
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
        <DialogContent className="max-w-md">
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
                <Label htmlFor="edit-age">Edad *</Label>
                <Input
                  id="edit-age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="18"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-height">Altura (cm) *</Label>
                <Input
                  id="edit-height"
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  placeholder="180"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-weight">Peso (kg) *</Label>
                <Input
                  id="edit-weight"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="75"
                />
              </div>
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
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEdit} className="bg-red-700 hover:bg-red-800" disabled={actionLoading}>
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar
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

      <ExtendedPlayerDataDialog
        open={showExtendedDataDialog}
        onOpenChange={setShowExtendedDataDialog}
        extendedData={extendedData}
        onSave={(data) => setExtendedData(data)}
        readOnly={false}
      />
    </div>
  )
}
