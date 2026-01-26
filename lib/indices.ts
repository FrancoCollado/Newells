export type IndiceType = "GPS" | "RPE" | "PAUTAS_FUERZA" | "WELLNESS" | "UNIDAD_ARBITRARIA" | "ONDULACIONES" | "EVALUACIONES"

export type IndiceSubtype = "CRONICO" | "AGUDO" | "PRE_SESION" | "POST_SESION"

export interface Indice {
  id: string
  division: string
  type: IndiceType
  subtype?: IndiceSubtype
  observations: string
  file_url?: string
  file_name?: string
  created_by: string
  created_at: string
  updated_at: string
  user_id?: string
}

export const indiceTypeLabels: Record<IndiceType, string> = {
  GPS: "GPS",
  RPE: "RPE",
  PAUTAS_FUERZA: "Pautas de fuerza",
  WELLNESS: "Wellness",
  UNIDAD_ARBITRARIA: "Unidad arbitraria",
  ONDULACIONES: "Ondulaciones",
  EVALUACIONES: "Evaluaciones",
}

export const indiceSubtypeLabels: Record<IndiceSubtype, string> = {
  CRONICO: "Índice crónico",
  AGUDO: "Índice agudo",
  PRE_SESION: "Recuperación pre-sesión",
  POST_SESION: "Carga post-sesión",
}
