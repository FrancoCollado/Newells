"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { getPlayerById } from "@/lib/players"
import { canViewPsychosocialData } from "@/lib/rbac"
import PsychosocialDataManager from "@/components/psychosocial-data-manager"
import type { User } from "@/lib/auth"
import type { Player } from "@/lib/players"

export default function PsychosocialDataPage() {
  const params = useParams()
  const router = useRouter()
  const playerId = params.id as string

  const [user, setUser] = useState<User | null>(null)
  const [player, setPlayer] = useState<Player | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        console.log("[v0] [Psychosocial] Iniciando carga de datos para jugador:", playerId)

        let currentUser
        try {
          currentUser = await getCurrentUser()
          console.log("[v0] [Psychosocial] Usuario obtenido:", currentUser ? currentUser.role : "null")
        } catch (userErr) {
          console.error("[v0] [Psychosocial] Error al obtener usuario:", userErr)
          router.push("/login")
          return
        }

        if (!currentUser) {
          console.log("[v0] [Psychosocial] No hay usuario autenticado, redirigiendo")
          router.push("/login")
          return
        }

        setUser(currentUser)

        const hasPermission = canViewPsychosocialData(currentUser.role)
        console.log("[v0] [Psychosocial] ¿Tiene permisos?", hasPermission, "Rol:", currentUser.role)

        if (!hasPermission) {
          console.log("[v0] [Psychosocial] Usuario no tiene permisos")
          setError("No tienes permisos para ver esta información")
          setLoading(false)
          return
        }

        let playerData
        try {
          playerData = await getPlayerById(playerId)
          console.log("[v0] [Psychosocial] Jugador obtenido:", playerData ? playerData.name : "null")
        } catch (playerErr) {
          console.error("[v0] [Psychosocial] Error al obtener jugador:", playerErr)
          setError("Error al cargar los datos del jugador")
          setLoading(false)
          return
        }

        if (!playerData) {
          console.log("[v0] [Psychosocial] Jugador no encontrado")
          setError("Jugador no encontrado")
          setLoading(false)
          return
        }

        setPlayer(playerData)
        setLoading(false)
        console.log("[v0] [Psychosocial] Carga completada exitosamente")
      } catch (err) {
        console.error("[v0] [Psychosocial] Error general:", err)
        setError(`Error al cargar los datos: ${err instanceof Error ? err.message : String(err)}`)
        setLoading(false)
      }
    }

    if (playerId) {
      loadData()
    } else {
      console.error("[v0] [Psychosocial] No hay playerId")
      setError("ID de jugador no válido")
      setLoading(false)
    }
  }, [playerId, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-2" />
          <p className="text-muted-foreground">Cargando datos psicosociales...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => router.push(playerId ? `/player/${playerId}` : "/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
      </div>
    )
  }

  if (!user || !player) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <p className="text-red-600 mb-4">Error: Datos no disponibles</p>
          <Button onClick={() => router.push(`/player/${playerId}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al perfil
          </Button>
        </div>
      </div>
    )
  }

  console.log("[v0] [Psychosocial] Renderizando componente principal")

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-gradient-to-r from-purple-700 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => router.push(`/player/${playerId}`)}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al perfil
          </Button>
          <h1 className="text-2xl font-bold mt-2">Datos Psicosociales</h1>
          <p className="text-white/90">{player.name}</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <PsychosocialDataManager playerId={playerId} user={user} />
      </main>
    </div>
  )
}
