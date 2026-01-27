"use server"

import { createAdminClient } from "@/lib/supabase"
import { createPlayerSession } from "@/lib/portal-auth"
import { redirect } from "next/navigation"

export async function loginPlayer(formData: FormData) {
  const name = formData.get("name") as string
  const password = formData.get("password") as string

  if (!name || name.trim().length < 3) {
    return { error: "Ingresa tu nombre completo." }
  }

  if (!password) {
    return { error: "Ingresa tu contraseña." }
  }

  const supabase = createAdminClient()
  
  // 1. Búsqueda Flexible de Jugador
  // Dividimos el nombre buscado en términos para encontrar coincidencias parciales o desordenadas
  let dbQuery = supabase
    .from("players")
    .select("id, name, division")
  
  const searchTerms = name.trim().split(/\s+/).filter(Boolean)
  
  if (searchTerms.length > 0) {
    searchTerms.forEach(term => {
      dbQuery = dbQuery.ilike("name", `%${term}%`)
    })
  }

  const { data: playersFound, error } = await dbQuery

  if (error) {
    console.error("Error en login:", error)
    return { error: "Error de conexión. Intenta nuevamente." }
  }

  let players = playersFound || []

  // Fallback: Fuzzy Search en memoria si no hay resultados directos
  // Esto permite encontrar "Lionel Messi" si el usuario escribe "messilionel" o "lionelmessi" todo junto
  if (players.length === 0) {
      // Traemos una lista ligera de nombres para comparar
      // Optimización: Podríamos traer solo activos, etc.
      const { data: allPlayers } = await supabase
        .from("players")
        .select("id, name, division")
        
      if (allPlayers) {
          const cleanInput = name.toLowerCase().replace(/[^a-z0-9]/g, '')
          
          players = allPlayers.filter(p => {
              const cleanName = p.name.toLowerCase().replace(/[^a-z0-9]/g, '')
              // Chequeamos match directo o inverso
              if (cleanName.includes(cleanInput) || cleanInput.includes(cleanName)) return true
              
              // Chequeamos inversión total (messilionel vs lionelmessi)
              // Generamos permutaciones simples del nombre DB
              const tokens = p.name.toLowerCase().split(/\s+/).filter(Boolean)
              if (tokens.length === 2) {
                  const reverse = tokens[1] + tokens[0]
                  if (reverse === cleanInput) return true
              }
              return false
          })
      }
  }

  // 1.5 Deduplicar resultados por nombre
  // Si aparece la misma persona en varias divisiones, nos quedamos con la primera
  const uniquePlayers = new Map()
  players.forEach(p => {
    const key = p.name.toLowerCase().trim()
    if (!uniquePlayers.has(key)) {
      uniquePlayers.set(key, p)
    }
  })
  players = Array.from(uniquePlayers.values())

  if (players.length === 0) {
    return { error: "Jugador no encontrado." }
  }

  if (players.length > 1) {
    // Si hay múltiples, intentamos ver si alguno coincide exactamente
    const exactMatch = players.find(p => p.name.toLowerCase() === name.trim().toLowerCase())
    if (!exactMatch) {
        return { 
            error: `Hay ${players.length} jugadores con nombres similares. Sé más específico.` 
        }
    }
    // Si hay match exacto, usamos ese
    players.length = 0
    players.push(exactMatch)
  }

  const player = players[0]

  // 2. Validación Flexible de Contraseña
  // Estrategia: Tokenizar -> Ordenar Alfabéticamente -> Unir
  
  const cleanString = (str: string) => str.toLowerCase().replace(/[^a-z0-9\s]/g, ' ')
  const getTokens = (str: string) => cleanString(str).split(/\s+/).filter(Boolean)

  const nameTokens = getTokens(player.name)
  const inputRaw = password.toLowerCase().replace(/[^a-z0-9]/g, '')

  // Generar permutaciones simples del nombre real para aceptar "apellidonombre" todo junto
  // Para 2 o 3 nombres es eficiente.
  const permutations: string[] = []
  
  const permute = (arr: string[], m: string[] = []) => {
    if (arr.length === 0) {
      permutations.push(m.join(''))
    } else {
      for (let i = 0; i < arr.length; i++) {
        let curr = arr.slice()
        let next = curr.splice(i, 1)
        permute(curr.slice(), m.concat(next))
      }
    }
  }
  
  // Limitamos a nombres de hasta 4 partes para evitar explosión factorial (4! = 24 checks, rápido)
  if (nameTokens.length <= 4) {
      permute(nameTokens)
  } else {
      // Si es muy largo, solo probamos directo e inverso simple (todo el string)
      permutations.push(nameTokens.join(''))
      permutations.push(nameTokens.slice().reverse().join(''))
  }

  // Validación final:
  // 1. Input tiene los mismos tokens (con espacios) -> Cubierto por sort() o por permutations si escribe con espacios y clean los quita?
  //    Si el usuario escribe "Messi Lionel", inputRaw es "messilionel". Está en permutations.
  //    Si el usuario escribe "Lionel Messi", inputRaw es "lionelmessi". Está en permutations.
  
  const isValid = permutations.includes(inputRaw)

  if (!isValid) {
    return { error: "Contraseña incorrecta." }
  }

    // Actualizar último acceso
    await supabase
      .from("players")
      .update({ last_seen: new Date().toISOString() })
      .eq("id", player.id)

  // Crear sesión
  await createPlayerSession({
    playerId: player.id,
    name: player.name,
    division: player.division,
  })

  redirect("/portal/dashboard")
}
