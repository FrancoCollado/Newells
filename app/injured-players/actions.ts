"use server"

import { getActiveInjuries, addInjuryEvolution, updateInjury, getAllInjuries } from "@/lib/injuries"
import { updatePlayerInjuryStatus } from "@/lib/players"

export async function getActiveInjuriesAction() {
  console.log("[v0] Obteniendo lesiones activas...")
  const injuries = await getActiveInjuries()
  console.log("[v0] Lesiones activas encontradas:", injuries.length)
  return injuries
}

export async function getAllInjuriesAction() {
  console.log("[v0] Obteniendo todas las lesiones...")
  const injuries = await getAllInjuries()
  console.log("[v0] Todas las lesiones encontradas:", injuries.length)
  return injuries
}

export async function addEvolutionAction(injuryId: string, evolutionText: string) {
  console.log("[v0] Agregando evolución a lesión:", injuryId)
  return await addInjuryEvolution(injuryId, evolutionText)
}

export async function dischargeInjuryAction(playerId: string, injuryId: string) {
  console.log("[v0] Dando de alta al jugador:", playerId)

  // Marcar la lesión como descargada con la fecha de hoy
  const today = new Date().toISOString().split("T")[0]
  await updateInjury(injuryId, {
    isDischarged: true,
    dischargeDate: today,
  })

  // Actualizar el estado del jugador a no lesionado
  await updatePlayerInjuryStatus(playerId, false)

  console.log("[v0] Alta médica completada exitosamente")
}
