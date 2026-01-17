import type { UserRole } from "./auth"

export type Permission =
  | "manage_players" // Crear, editar, borrar jugadores
  | "manage_tactics" // Crear y guardar tácticas
  | "manage_matches" // Cargar partidos y estadísticas
  | "manage_trainings" // Cargar entrenamientos
  | "view_all_data" // Ver todos los datos (jugadores, informes, partidos, entrenamientos)
  | "view_reports" // Ver informes
  | "view_all_areas" // Nuevo permiso para ver informes de todas las áreas
  | "view_indices" // Nuevo permiso para ver (pero no editar) índices
  | "create_medical_report" // Crear informes médicos
  | "create_psych_report" // Crear informes psicológicos
  | "create_nutrition_report" // Crear informes nutricionales
  | "create_physio_report" // Crear informes de fisioterapia
  | "create_technical_report" // Crear informes técnicos
  | "create_psicosocial_report" // Nuevo permiso para informes psicosociales
  | "edit_medical_area" // Editar área médica (eventos, informes generales)
  | "edit_psych_area" // Editar área psicológica
  | "edit_nutrition_area" // Editar área nutricional
  | "edit_physio_area" // Editar área de fisioterapia
  | "edit_training_area" // Editar área de entrenamiento
  | "edit_goalkeepers_area" // Nuevo permiso para área arqueros
  | "edit_psicosocial_area" // Nuevo permiso para editar área psicosocial
  | "access_manager_panel" // Entrar a /manager
  | "edit_player_physical_data" // Nuevo permiso para editar datos físicos del jugador
  | "view_medical_records" // Nuevo permiso para ver fichas médicas
  | "edit_medical_records" // Nuevo permiso para editar fichas médicas
  | "view_injured_players" // Nuevo permiso para ver módulo de lesionados
  | "manage_injury_evolutions" // Nuevo permiso para gestionar evoluciones

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  // DIRIGENTE - Puede hacer todo
  dirigente: [
    "manage_players",
    "manage_tactics",
    "manage_matches",
    "manage_trainings",
    "view_all_data",
    "view_reports",
    "view_all_areas", // Dirigente puede ver todas las áreas
    "view_indices", // Dirigente puede ver índices
    "create_medical_report",
    "create_psych_report",
    "create_nutrition_report",
    "create_physio_report",
    "create_technical_report",
    "create_psicosocial_report", // Nuevo permiso para informes psicosociales
    "edit_medical_area",
    "edit_psych_area",
    "edit_nutrition_area",
    "edit_physio_area",
    "edit_training_area",
    "edit_goalkeepers_area", // Nuevo permiso para área arqueros
    "edit_psicosocial_area", // Nuevo permiso para editar área psicosocial
    "access_manager_panel",
    "edit_player_physical_data",
    "view_medical_records", // Dirigente puede ver fichas médicas
    "edit_medical_records", // Dirigente puede editar fichas médicas
    "view_injured_players", // Dirigente puede ver lesionados
    "manage_injury_evolutions", // Dirigente puede gestionar evoluciones
  ],

  // ENTRENADOR - Puede ver informes, cargar partidos y cargar entrenamientos
  entrenador: [
    "view_reports",
    "view_all_data",
    "view_all_areas", // Entrenador puede ver todas las áreas
    "view_indices", // Entrenador puede ver índices
    "manage_matches",
    "manage_trainings",
    "create_technical_report",
    "edit_training_area",
    "view_injured_players", // Entrenador puede ver lesionados
  ],

  // MEDICO - Solo puede emitir informes médicos y editar área médica
  medico: [
    "create_medical_report",
    "edit_medical_area",
    "view_reports",
    "view_all_areas", // Médico puede ver informes de todas las áreas
    "view_indices", // Médico puede ver índices
    "view_medical_records", // Médico puede ver fichas médicas
    "edit_medical_records", // Médico puede editar fichas médicas
    "view_injured_players", // Médico puede ver lesionados
    "manage_injury_evolutions", // Médico puede gestionar evoluciones
  ],

  // PSICOLOGO - Solo puede emitir informes psicológicos y editar área psicológica
  psicologo: [
    "create_psych_report",
    "edit_psych_area",
    "view_reports",
    "view_all_areas", // Psicólogo puede ver informes de todas las áreas
    "view_indices", // Psicólogo puede ver índices
    "view_injured_players", // Psicólogo puede ver lesionados
  ],

  // NUTRICIONISTA - Para mantener compatibilidad con el sistema existente
  nutricionista: [
    "create_nutrition_report",
    "edit_nutrition_area",
    "view_reports",
    "view_all_areas", // Nutricionista puede ver informes de todas las áreas
    "view_indices", // Nutricionista puede ver índices
    "edit_player_physical_data",
    "view_injured_players", // Nutricionista puede ver lesionados
  ],

  // FISIOTERAPEUTA - Para mantener compatibilidad con el sistema existente
  fisioterapeuta: [
    "create_physio_report",
    "edit_physio_area",
    "view_reports",
    "view_all_areas", // Fisioterapeuta puede ver informes de todas las áreas
    "view_indices", // Fisioterapeuta puede ver índices
    "view_injured_players", // Fisioterapeuta puede ver lesionados
    "manage_injury_evolutions", // Fisioterapeuta puede gestionar evoluciones
  ],

  // KINESIOLOGO - Added missing role
  kinesiologo: [
    "create_physio_report",
    "edit_physio_area",
    "view_reports",
    "view_all_areas", // Kinesiólogo puede ver informes de todas las áreas
    "view_indices", // Kinesiólogo puede ver índices
    "view_injured_players", // Kinesiólogo puede ver lesionados
    "manage_injury_evolutions", // Kinesiólogo puede gestionar evoluciones
  ],

  // ENTRENADOR_ARQUEROS - Agregar entrenador_arqueros con los mismos permisos que entrenador
  entrenador_arqueros: [
    "view_reports",
    "view_all_data",
    "view_all_areas",
    "view_indices",
    "manage_matches",
    "manage_trainings",
    "create_technical_report",
    "edit_training_area",
    "edit_goalkeepers_area", // Nuevo permiso para área arqueros
    "view_injured_players",
  ],

  // PSICOSOCIAL - Nuevo rol con permisos similares a otros profesionales
  psicosocial: [
    "create_psicosocial_report",
    "edit_psicosocial_area",
    "view_reports",
    "view_all_areas",
    "view_indices",
    "view_injured_players",
  ],
}

// ADMINISTRADOR was missing from UserRole type, so we'll handle it separately
export type ExtendedUserRole = UserRole | "administrador"

export const ADMINISTRADOR_PERMISSIONS: Permission[] = [
  "manage_players",
  "view_all_data",
  "view_reports",
  "manage_tactics",
  "access_manager_panel",
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
  if (role === "kinesiologo" && reportType === "kinesiologo") return true
  if (role === "entrenador_arqueros" && reportType === "entrenador_arqueros") return true
  if (role === "psicosocial" && reportType === "psicosocial") return true

  return false
}

export function canEditArea(role: ExtendedUserRole, area: string): boolean {
  if (role === "administrador") {
    return false
  }

  if (role === "dirigente") {
    return true
  }

  const areaPermissionMap: Record<string, Permission> = {
    medica: "edit_medical_area",
    psicologica: "edit_psych_area",
    nutricional: "edit_nutrition_area",
    entrenamiento: "edit_training_area",
    fisioterapia: "edit_physio_area",
    arqueros: "edit_goalkeepers_area", // Nuevo mapeo para área arqueros
    psicosocial: "edit_psicosocial_area", // Nuevo mapeo para área psicosocial
  }

  const requiredPermission = areaPermissionMap[area]
  if (!requiredPermission) return false

  return hasPermission(role, requiredPermission)
}

export function canViewAllAreas(role: ExtendedUserRole): boolean {
  return hasPermission(role, "view_all_areas")
}

export function canViewMedicalRecords(role: ExtendedUserRole): boolean {
  return hasPermission(role, "view_medical_records")
}

export function canEditMedicalRecords(role: ExtendedUserRole): boolean {
  return hasPermission(role, "edit_medical_records")
}

export function canViewInjuredPlayers(role: ExtendedUserRole): boolean {
  return hasPermission(role, "view_injured_players")
}

export function canManageInjuryEvolutions(role: ExtendedUserRole): boolean {
  return hasPermission(role, "manage_injury_evolutions")
}

export function canViewPsychosocialData(role: ExtendedUserRole): boolean {
  return role === "psicosocial" || role === "dirigente"
}
