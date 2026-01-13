import type { UserRole } from "./auth"

export type Permission =
  | "manage_players" // Crear, editar, borrar jugadores
  | "manage_tactics" // Crear y guardar tácticas
  | "manage_matches" // Cargar partidos y estadísticas
  | "manage_trainings" // Cargar entrenamientos
  | "view_all_data" // Ver todos los datos (jugadores, informes, partidos, entrenamientos)
  | "view_reports" // Ver informes
  | "create_medical_report" // Crear informes médicos
  | "create_psych_report" // Crear informes psicológicos
  | "create_nutrition_report" // Crear informes nutricionales
  | "create_physio_report" // Crear informes de fisioterapia
  | "create_technical_report" // Crear informes técnicos
  | "edit_medical_area" // Editar área médica (eventos, informes generales)
  | "edit_psych_area" // Editar área psicológica
  | "edit_nutrition_area" // Editar área nutricional
  | "edit_physio_area" // Editar área de fisioterapia
  | "edit_training_area" // Editar área de entrenamiento
  | "access_manager_panel" // Entrar a /manager
  | "edit_player_physical_data" // Nuevo permiso para editar datos físicos del jugador

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  // DIRIGENTE - Puede hacer todo
  dirigente: [
    "manage_players",
    "manage_tactics",
    "manage_matches",
    "manage_trainings",
    "view_all_data",
    "view_reports",
    "create_medical_report",
    "create_psych_report",
    "create_nutrition_report",
    "create_physio_report",
    "create_technical_report",
    "edit_medical_area",
    "edit_psych_area",
    "edit_nutrition_area",
    "edit_physio_area",
    "edit_training_area",
    "access_manager_panel",
    "edit_player_physical_data", // Dirigente puede editar datos físicos
  ],

  // ENTRENADOR - Puede ver informes, cargar partidos y cargar entrenamientos
  entrenador: [
    "view_reports",
    "view_all_data",
    "manage_matches",
    "manage_trainings",
    "create_technical_report",
    "edit_training_area",
  ],

  // MEDICO - Solo puede emitir informes médicos y editar área médica
  medico: [
    "create_medical_report",
    "edit_medical_area",
    "view_reports", // Puede ver sus propios informes
  ],

  // PSICOLOGO - Solo puede emitir informes psicológicos y editar área psicológica
  psicologo: [
    "create_psych_report",
    "edit_psych_area",
    "view_reports", // Puede ver sus propios informes
  ],

  // NUTRICIONISTA - Para mantener compatibilidad con el sistema existente
  nutricionista: [
    "create_nutrition_report",
    "edit_nutrition_area",
    "view_reports",
    "edit_player_physical_data", // Nuevo permiso para nutricionista
  ],

  // FISIOTERAPEUTA - Para mantener compatibilidad con el sistema existente
  fisioterapeuta: ["create_physio_report", "edit_physio_area", "view_reports"],
}

// ADMINISTRADOR was missing from UserRole type, so we'll handle it separately
export type ExtendedUserRole = UserRole | "administrador"

export const ADMINISTRADOR_PERMISSIONS: Permission[] = [
  "manage_players", // Puede agregar/eliminar jugadores
  "view_all_data", // Puede ver todos los datos
  "view_reports", // Puede ver informes
  "manage_tactics", // Puede ver formaciones
  "access_manager_panel", // Necesita acceso al panel de gestión para administrar jugadores
  // NO tiene: manage_matches, manage_trainings, create_*_report
]

export function hasPermission(role: ExtendedUserRole, permission: Permission): boolean {
  if (role === "administrador") {
    return ADMINISTRADOR_PERMISSIONS.includes(permission)
  }

  const permissions = ROLE_PERMISSIONS[role as UserRole] || []
  return permissions.includes(permission)
}

export function canCreateReport(role: ExtendedUserRole, reportType: UserRole | "administrador"): boolean {
  if (role === "administrador") {
    return false
  }

  // Dirigente can create any report
  if (role === "dirigente") return true

  // Each professional can only create their own type of report
  if (role === "entrenador" && reportType === "entrenador") return true
  if (role === "medico" && reportType === "medico") return true
  if (role === "psicologo" && reportType === "psicologo") return true
  if (role === "nutricionista" && reportType === "nutricionista") return true
  if (role === "fisioterapeuta" && reportType === "fisioterapeuta") return true

  return false
}

export function canEditArea(role: ExtendedUserRole, area: string): boolean {
  if (role === "administrador") {
    return false // Administrador cannot edit any areas
  }

  if (role === "dirigente") {
    return true // Dirigente can edit all areas
  }

  const areaPermissionMap: Record<string, Permission> = {
    medica: "edit_medical_area",
    psicologica: "edit_psych_area",
    nutricional: "edit_nutrition_area",
    entrenamiento: "edit_training_area",
    fisioterapia: "edit_physio_area",
  }

  const requiredPermission = areaPermissionMap[area]
  if (!requiredPermission) return false

  return hasPermission(role, requiredPermission)
}
