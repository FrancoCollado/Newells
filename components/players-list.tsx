"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  getPlayersByDivision,
  getDivisionLabel,
  updatePlayerAttendance,
  type Division,
  type Player,
  type LeagueType,
} from "@/lib/players"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, User, Loader2, Edit2, Save, X, Home } from "lucide-react"
import type { UserRole } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

interface PlayersListProps {
  division?: Division
  userRole: UserRole
  leagueType?: LeagueType | "PRESTAMO" | "LIBRE" | "all"
}

export function PlayersList({ division, userRole, leagueType }: PlayersListProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [editingAttendanceId, setEditingAttendanceId] = useState<string | null>(null)
  const [editingAttendanceValue, setEditingAttendanceValue] = useState("")
  const [pensionFilter, setPensionFilter] = useState<"todos" | "pensionados" | "no-pensionados">("todos")

  const ITEMS_PER_PAGE = 9

  const canEdit = userRole === "dirigente" || userRole === "entrenador"

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    const fetchInitialPlayers = async () => {
      setLoading(true)
      setPage(0)
      setHasMore(true)
      const leagueFilter = leagueType === "all" ? "todas" : leagueType
      const data = await getPlayersByDivision(division, 0, ITEMS_PER_PAGE, debouncedSearchTerm, leagueFilter)
      setPlayers(data)
      if (data.length < ITEMS_PER_PAGE) setHasMore(false)
      setLoading(false)
    }
    fetchInitialPlayers()
  }, [division, leagueType, debouncedSearchTerm])

  const handleLoadMore = async () => {
    setLoadingMore(true)
    const nextPage = page + 1
    const leagueFilter = leagueType === "all" ? "todas" : leagueType
    const newPlayers = await getPlayersByDivision(division, nextPage, ITEMS_PER_PAGE, debouncedSearchTerm, leagueFilter)

    if (newPlayers.length < ITEMS_PER_PAGE) {
      setHasMore(false)
    }

    setPlayers([...players, ...newPlayers])
    setPage(nextPage)
    setLoadingMore(false)
  }

  const filteredPlayers = players.filter((player) => {
      if (pensionFilter === "pensionados") return player.isPensioned === true
      if (pensionFilter === "no-pensionados") return !player.isPensioned
      return true
    })

  const handlePlayerClick = (playerId: string) => {
    if (editingAttendanceId === playerId) return // Don't navigate if editing
    router.push(`/player/${playerId}`)
  }

  const handleEditAttendance = (e: React.MouseEvent, player: Player) => {
    e.stopPropagation()
    setEditingAttendanceId(player.id)
    setEditingAttendanceValue(player.attendancePercentage.toString())
  }

  const handleSaveAttendance = async (e: React.MouseEvent, playerId: string) => {
    e.stopPropagation()
    const value = Number.parseFloat(editingAttendanceValue)

    if (isNaN(value) || value < 0 || value > 100) {
      toast({
        title: "Error",
        description: "El porcentaje debe estar entre 0 y 100",
        variant: "destructive",
      })
      return
    }

    const success = await updatePlayerAttendance(playerId, value)

    if (success) {
      setPlayers(players.map((p) => (p.id === playerId ? { ...p, attendancePercentage: value } : p)))
      setEditingAttendanceId(null)
      toast({
        title: "Asistencia actualizada",
        description: "El porcentaje de asistencia se actualizó correctamente",
      })
    } else {
      toast({
        title: "Error",
        description: "No se pudo actualizar el porcentaje",
        variant: "destructive",
      })
    }
  }

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingAttendanceId(null)
    setEditingAttendanceValue("")
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
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar jugador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={pensionFilter}
          onValueChange={(value) => setPensionFilter(value as "todos" | "pensionados" | "no-pensionados")}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <Home className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filtrar pensión" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="pensionados">Pensionados</SelectItem>
            <SelectItem value="no-pensionados">No pensionados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Players Grid */}
      {filteredPlayers.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No se encontraron jugadores</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlayers.map((player) => (
            <Card
              key={player.id}
              className="hover:shadow-lg transition-shadow cursor-pointer relative"
              onClick={() => handlePlayerClick(player.id)}
            >
              <div className="absolute top-2 right-2 z-10">
                {player.isPensioned && (
                  <Badge className="bg-blue-600 text-white">
                    <Home className="h-3 w-3 mr-1" />
                    Pensionado
                  </Badge>
                )}
              </div>
              <div className="absolute top-2 left-2 z-10">
                {editingAttendanceId === player.id ? (
                  <div
                    className="flex items-center gap-1 bg-white rounded-lg shadow-lg p-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={editingAttendanceValue}
                      onChange={(e) => setEditingAttendanceValue(e.target.value)}
                      className="w-16 h-7 text-sm"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="text-xs">%</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={(e) => handleSaveAttendance(e, player.id)}
                    >
                      <Save className="h-3 w-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleCancelEdit}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <Badge
                    className={`${
                      player.attendancePercentage >= 80
                        ? "bg-green-600"
                        : player.attendancePercentage >= 60
                          ? "bg-yellow-600"
                          : "bg-red-600"
                    } text-white hover:opacity-90 flex items-center gap-1`}
                  >
                    {player.attendancePercentage}% Asistencia
                    {canEdit && (
                      <Edit2 className="h-3 w-3 ml-1 cursor-pointer" onClick={(e) => handleEditAttendance(e, player)} />
                    )}
                  </Badge>
                )}
              </div>

              <CardContent className="p-4 pt-12">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <User className="h-6 w-6 text-red-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{player.name}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {player.division.map((div) => (
                        <Badge key={div} variant="outline">
                          {getDivisionLabel(div)}
                        </Badge>
                      ))}
                      <Badge variant="secondary">{player.position}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-3 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Edad</p>
                        <p className="font-medium">{player.age} años</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Altura</p>
                        <p className="font-medium">{player.height} cm</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Peso</p>
                        <p className="font-medium">{player.weight} kg</p>
                      </div>
                    </div>
                  </div>
                </div>
                <Button className="w-full mt-4 bg-red-700 hover:bg-red-800" size="sm">
                  Ver Detalles
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {hasMore && !debouncedSearchTerm && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="w-full md:w-auto bg-transparent"
          >
            {loadingMore ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Cargar más jugadores"}
          </Button>
        </div>
      )}
    </div>
  )
}
