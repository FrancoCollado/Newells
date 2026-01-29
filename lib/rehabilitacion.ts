import { db } from "@/lib/firebase"
import { collection, addDoc, getDocs, query, where, orderBy } from "firebase/firestore"

export type Rehabilitacion = {
  id: string
  playerId: string
  playerName: string
  injuryDetails?: string
  startDate: string
  projectedEndDate?: string
  currentPhase: "fase 1" | "fase 2" | "fase 3" | "alta deportiva"
  status: "activa" | "finalizada" | "pausada"
  notes: string
  createdBy: string
}

// Placeholder para futuras funciones
export async function getRehabilitaciones() {
  // Aquí irá la lógica de Firebase
  return []
}

export async function saveRehabilitacion(data: Omit<Rehabilitacion, "id">) {
  // Aquí irá la lógica de guardado
  console.log("Guardando rehabilitación:", data)
  return { id: "temp-id", ...data }
}