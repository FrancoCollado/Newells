"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getPlayersByDivision, getDivisionLabel, type Division, type Player } from "@/lib/players"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, User, Loader2 } from "lucide-react"
import type { UserRole } from "@/lib/auth"

interface PlayersListProps {
  division?: Division
  userRole: UserRole
}

export function PlayersList({ division, userRole }: PlayersListProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const ITEMS_PER_PAGE = 9

  useEffect(() => {
    const fetchInitialPlayers = async () => {
      setLoading(true)
      setPage(0)
      setHasMore(true)
      const data = await getPlayersByDivision(division, 0, ITEMS_PER_PAGE)
      setPlayers(data)
      if (data.length < ITEMS_PER_PAGE) setHasMore(false)
      setLoading(false)
    }
    fetchInitialPlayers()
  }, [division])

  const handleLoadMore = async () => {
      setLoadingMore(true)
      const nextPage = page + 1
      const newPlayers = await getPlayersByDivision(division, nextPage, ITEMS_PER_PAGE)
      
      if (newPlayers.length < ITEMS_PER_PAGE) {
          setHasMore(false)
      }
      
      setPlayers([...players, ...newPlayers])
      setPage(nextPage)
      setLoadingMore(false)
  }

  const filteredPlayers = players.filter((player) => player.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handlePlayerClick = (playerId: string) => {
    router.push(`/player/${playerId}`)
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
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar jugador..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
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
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handlePlayerClick(player.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <User className="h-6 w-6 text-red-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{player.name}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline">{getDivisionLabel(player.division)}</Badge>
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

      {hasMore && !searchTerm && (
          <div className="flex justify-center pt-4">
              <Button 
                variant="outline" 
                onClick={handleLoadMore} 
                disabled={loadingMore}
                className="w-full md:w-auto"
              >
                  {loadingMore ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Cargar más jugadores"}
              </Button>
          </div>
      )}
    </div>
  )
}
