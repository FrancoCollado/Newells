"use server"

import { getOdontogramaByPlayerId, deleteOdontograma, type Odontograma } from "@/lib/odontogramas"

export async function getOdontogramaAction(playerId: string): Promise<Odontograma | null> {
  return await getOdontogramaByPlayerId(playerId)
}

export async function fetchOdontogramaForPlayer(playerId: string): Promise<Odontograma | null> {
  try {
    return await getOdontogramaByPlayerId(playerId)
  } catch (error) {
    console.error("[v0] Error fetching odontograma:", error)
    return null
  }
}

export async function deleteOdontogramaAction(odontogramaId: string): Promise<void> {
  await deleteOdontograma(odontogramaId)
}
