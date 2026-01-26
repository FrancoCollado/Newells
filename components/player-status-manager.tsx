"use client"

import { useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { updateLastSeenAction } from "@/app/portal/status-actions"

interface PlayerStatusManagerProps {
  playerId: string
  initialLastSeen?: string | null
}

export function PlayerStatusManager({ playerId, initialLastSeen }: PlayerStatusManagerProps) {
  const lastUpdateRef = useRef<number>(Date.now())

  useEffect(() => {
    if (!playerId) return

    // 1. Unirse al canal de Presence para estado "En línea" (RAM)
    const channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: playerId,
        },
      },
    })

    channel.on('presence', { event: 'sync' }, () => {
      // Estado sincronizado
    }).subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          online_at: new Date().toISOString(),
          player_id: playerId,
        })
      }
    })

    // 2. Actualizar 'last_seen' en DB (Persistencia) - Vía Server Action
    const updateLastSeen = async () => {
      // Solo actualizar si pasaron más de 5 minutos desde la última vez (Throttling)
      // O si es la primera carga y el initialLastSeen es viejo
      const fiveMinutes = 5 * 60 * 1000
      const now = Date.now()
      
      const shouldUpdate = !initialLastSeen || (now - new Date(initialLastSeen).getTime() > fiveMinutes)

      if (shouldUpdate) {
        // Doble check local para evitar múltiples llamadas en la misma sesión si se desmonta/monta rápido
        if (now - lastUpdateRef.current < fiveMinutes && initialLastSeen) return

        try {
          const result = await updateLastSeenAction(playerId)
          
          if (!result.success) {
             console.error('[Presence] Error updating last_seen (Server Action):', result.error)
          } else {
             lastUpdateRef.current = now
             console.log('[Presence] last_seen updated in DB via Server Action')
          }
        } catch (error) {
          console.error('[Presence] Unexpected error calling action:', error)
        }
      }
    }

    updateLastSeen()

    // Opcional: Intervalo para mantener actualizado si la sesión es muy larga
    const interval = setInterval(() => {
      // Forzamos actualización cada 10 min si sigue activo
      const tenMinutes = 10 * 60 * 1000
      if (Date.now() - lastUpdateRef.current > tenMinutes) {
         updateLastSeen()
      }
    }, 60 * 1000) // Chequear cada minuto

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [playerId, initialLastSeen])

  return null // Componente sin UI
}