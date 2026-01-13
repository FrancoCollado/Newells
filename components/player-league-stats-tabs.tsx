"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import type { Player } from "@/lib/players"
import { Trophy, Clock, Target, User, Ruler, Weight } from "lucide-react"

interface PlayerLeagueStatsTabsProps {
  player: Player
}

export function PlayerLeagueStatsTabs({ player }: PlayerLeagueStatsTabsProps) {
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
            <p className="text-sm text-muted-foreground">Goles</p>
          </div>
          <p className="text-2xl font-bold">{stats.goals}</p>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-red-900">Información Básica</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <User className="h-5 w-5 text-red-700" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Edad</p>
              <p className="text-xl font-bold text-red-900">{player.age} años</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Ruler className="h-5 w-5 text-red-700" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estatura</p>
              <p className="text-xl font-bold text-red-900">{player.height} cm</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Weight className="h-5 w-5 text-red-700" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Peso</p>
              <p className="text-xl font-bold text-red-900">{player.weight} kg</p>
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
