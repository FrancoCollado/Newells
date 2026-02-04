"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Player } from "@/lib/players"
import { Trophy, Clock, Target, User, Ruler, Weight, Edit2, Save, X } from "lucide-react"

interface PlayerLeagueStatsTabsProps {
  player: Player
  canEditPhysicalData?: boolean
  isEditingPhysicalData?: boolean
  editedAge?: string
  editedWeight?: string
  editedHeight?: string
  onEditPhysicalData?: () => void
  onSavePhysicalData?: () => void
  onCancelPhysicalDataEdit?: () => void
  onAgeChange?: (value: string) => void
  onWeightChange?: (value: string) => void
  onHeightChange?: (value: string) => void
}

export function PlayerLeagueStatsTabs({
  player,
  canEditPhysicalData = false,
  isEditingPhysicalData = false,
  editedAge = "",
  editedWeight = "",
  editedHeight = "",
  onEditPhysicalData,
  onSavePhysicalData,
  onCancelPhysicalDataEdit,
  onAgeChange,
  onWeightChange,
  onHeightChange,
}: PlayerLeagueStatsTabsProps) {
  const afaStats = player.leagueStats?.find((s) => s.leagueType === "AFA") || {
    leagueType: "AFA" as const,
    minutesPlayed: 0,
    matchesPlayed: 0,
    goals: 0,
  }

  const rosarinaStats = player.leagueStats?.find((s) => s.leagueType === "ROSARINA") || {
    leagueType: "ROSARINA" as const,
    minutesPlayed: 0,
    matchesPlayed: 0,
    goals: 0,
  }

  const isGoalkeeper = player.division.includes("arqueros")

  const StatsGrid = ({ stats }: { stats: typeof afaStats }) => (
    <div className="grid grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-4 w-4 text-red-700" />
            <p className="text-sm text-muted-foreground">Partidos</p>
          </div>
          <p className="text-2xl font-bold">{stats.matchesPlayed}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-red-700" />
            <p className="text-sm text-muted-foreground">Minutos</p>
          </div>
          <p className="text-2xl font-bold">{stats.minutesPlayed}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-red-700" />
            <p className="text-sm text-muted-foreground">{isGoalkeeper ? "Goles e/c" : "Goles"}</p>
          </div>
          <p className="text-2xl font-bold">{stats.goals}</p>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-red-900">Información Básica</h3>
          {canEditPhysicalData && !isEditingPhysicalData && (
            <Button
              variant="outline"
              size="sm"
              onClick={onEditPhysicalData}
              className="gap-2 border-red-600 text-red-700 hover:bg-red-100 bg-transparent"
            >
              <Edit2 className="h-4 w-4" />
              Editar
            </Button>
          )}
          {canEditPhysicalData && isEditingPhysicalData && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onCancelPhysicalDataEdit} className="gap-2 bg-transparent">
                <X className="h-4 w-4" />
                Cancelar
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={onSavePhysicalData}
                className="gap-2 bg-red-600 hover:bg-red-700"
              >
                <Save className="h-4 w-4" />
                Guardar
              </Button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <User className="h-5 w-5 text-red-700" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Edad</p>
              {isEditingPhysicalData ? (
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={editedAge}
                    onChange={(e) => onAgeChange?.(e.target.value)}
                    className="w-16 h-9 text-lg font-bold"
                  />
                  <span className="text-sm font-medium">años</span>
                </div>
              ) : (
                <p className="text-xl font-bold text-red-900">{player.age} años</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Ruler className="h-5 w-5 text-red-700" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Estatura</p>
              {isEditingPhysicalData ? (
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    min="50"
                    max="250"
                    value={editedHeight}
                    onChange={(e) => onHeightChange?.(e.target.value)}
                    className="w-16 h-9 text-lg font-bold"
                  />
                  <span className="text-sm font-medium">cm</span>
                </div>
              ) : (
                <p className="text-xl font-bold text-red-900">{player.height} cm</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Weight className="h-5 w-5 text-red-700" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Peso</p>
              {isEditingPhysicalData ? (
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    min="1"
                    max="200"
                    step="0.1"
                    value={editedWeight}
                    onChange={(e) => onWeightChange?.(e.target.value)}
                    className="w-16 h-9 text-lg font-bold"
                  />
                  <span className="text-sm font-medium">kg</span>
                </div>
              ) : (
                <p className="text-xl font-bold text-red-900">{player.weight} kg</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Estadísticas por Liga</h3>
        <Tabs defaultValue="rosarina" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="rosarina" className="data-[state=active]:bg-red-700 data-[state=active]:text-white">
              Rosarina
            </TabsTrigger>
            <TabsTrigger value="afa" className="data-[state=active]:bg-blue-700 data-[state=active]:text-white">
              AFA
            </TabsTrigger>
          </TabsList>
          <TabsContent value="rosarina">
            <StatsGrid stats={rosarinaStats} />
          </TabsContent>
          <TabsContent value="afa">
            <StatsGrid stats={afaStats} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
