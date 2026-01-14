"use server"

import { getActiveInjuries, addInjuryEvolution, deleteInjury } from "@/lib/injuries"
import { updatePlayerInjuryStatus } from "@/lib/players"

export async function getActiveInjuriesAction() {
  console.log("[v0] Obteniendo lesiones activas...")
  const injuries = await getActiveInjuries()
  console.log("[v0] Lesiones activas encontradas:", injuries.length)
  return injuries
}

export async function addEvolutionAction(injuryId: string, evolutionText: string) {
  console.log("[v0] Agregando evolución a lesión:", injuryId)
  return await addInjuryEvolution(injuryId, evolutionText)
}

export async function dischargeInjuryAction(playerId: string, injuryId: string) {
  console.log("[v0] Dando de alta al jugador:", playerId)

  // Actualizar el estado del jugador a no lesionado
  await updatePlayerInjuryStatus(playerId, false)

  // Eliminar el registro de lesión
  await deleteInjury(injuryId)

  console.log("[v0] Alta médica completada exitosamente")
}
