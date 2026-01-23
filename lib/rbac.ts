import type { UserRole } from "./auth"

export type Permission =
  | "manage_players"
  | "manage_tactics"
  | "manage_matches"
  | "manage_trainings"
  | "view_all_data"
  | "view_reports"
  | "view_all_areas"
  | "view_indices"
  | "create_medical_report"
  | "create_psych_report"
  | "create_nutrition_report"
  | "create_physio_report"
  | "create_technical_report"
  | "create_psicosocial_report"
  | "create_dental_report"
  | "create_videoanalysis_report"
  | "edit_medical_area"
  | "edit_psych_area"
  | "edit_nutrition_area"
  | "edit_physio_area"
  | "edit_training_area"
  | "edit_goalkeepers_area"
  | "edit_psicosocial_area"
  | "edit_dental_area"
  | "edit_videoanalysis_area"
  | "access_manager_panel"
  | "edit_player_physical_data"
  | "view_medical_records"
  | "edit_medical_records"
  | "view_injured_players"
  | "manage_injury_evolutions"

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  dirigente: [
    "manage_players", "manage_tactics", "manage_matches", "manage_trainings", "view_all_data",
    "view_reports", "view_all_areas", "view_indices", "create_medical_report", "create_psych_report",
    "create_nutrition_report", "create_physio_report", "create_technical_report", "create_psicosocial_report",
    "create_dental_report", "edit_medical_area", "edit_psych_area", "edit_nutrition_area", "edit_physio_area",
    "edit_training_area", "edit_goalkeepers_area", "edit_psicosocial_area", "edit_dental_area", "access_manager_panel",
    "edit_player_physical_data", "view_medical_records", "edit_medical_records", "view_injured_players", "manage_injury_evolutions",
  ],
  entrenador: [
    "view_reports", "view_all_data", "view_all_areas", "view_indices", "manage_matches",
    "manage_trainings", "create_technical_report", "edit_training_area", "view_injured_players",
  ],
  medico: [
    "create_medical_report", "edit_medical_area", "view_reports", "view_all_areas", "view_indices",
    "view_medical_records", "edit_medical_records", "view_injured_players", "manage_injury_evolutions",
  ],
  psicologo: [
    "create_psych_report", "edit_psych_area", "view_reports", "view_all_areas", "view_indices", "view_injured_players",
  ],
  nutricionista: [
    "create_nutrition_report", "edit_nutrition_area", "view_reports", "view_all_areas", "view_indices",
    "edit_player_physical_data", "view_injured_players",
  ],
  fisioterapeuta: [
    "create_physio_report", "edit_physio_area", "view_reports", "view_all_areas", "view_indices",
    "view_injured_players", "manage_injury_evolutions",
  ],
  kinesiologo: [
    "create_physio_report", "edit_physio_area", "view_reports", "view_all_areas", "view_indices",
    "view_injured_players", "manage_injury_evolutions",
  ],
  entrenador_arqueros: [
    "view_reports", "view_all_data", "view_all_areas", "view_indices", "manage_matches",
    "manage_trainings", "create_technical_report", "edit_training_area", "edit_goalkeepers_area", "view_injured_players",
  ],
  psicosocial: [
    "create_psicosocial_report", "edit_psicosocial_area", "view_reports", "view_all_areas", "view_indices", "view_injured_players",
  ],
  odontologo: [
    "create_dental_report", "edit_dental_area", "view_reports", "view_all_areas", "view_indices", "view_injured_players", "view_medical_records",
  ],
  videoanalisis: [
    "create_videoanalysis_report", "edit_videoanalysis_area", "view_reports", "view_all_areas", "view_indices", "view_injured_players",
  ],
  // DEFINICIÓN DE PERMISOS PARA CAPTACIÓN
  captacion: [
    "view_reports",
    "view_all_data",
    "view_all_areas",
    "view_indices",
  ],
}

export type ExtendedUserRole = UserRole | "administrador"

export const ADMINISTRADOR_PERMISSIONS: Permission[] = [
  "manage_players", "view_all_data", "view_reports", "manage_tactics", "access_manager_panel",
]

export function hasPermission(role: ExtendedUserRole, permission: Permission): boolean {
  if (role === "administrador") {
    return ADMINISTRADOR_PERMISSIONS.includes(permission)
  }
  const permissions = ROLE_PERMISSIONS[role as UserRole] || []
  return permissions.includes(permission)
}

export function canCreateReport(role: ExtendedUserRole, reportType: UserRole | "administrador"): boolean {
  if (role === "administrador") return false
  if (role === "dirigente") return true
  return role === reportType
}

export function canEditArea(role: ExtendedUserRole, area: string): boolean {
  if (role === "administrador") return false
  if (role === "dirigente") return true
  const areaPermissionMap: Record<string, Permission> = {
    medica: "edit_medical_area", psicologica: "edit_psych_area", nutricional: "edit_nutrition_area",
    entrenamiento: "edit_training_area", fisioterapia: "edit_physio_area", arqueros: "edit_goalkeepers_area",
    psicosocial: "edit_psicosocial_area", odontologia: "edit_dental_area", videoanalisis: "edit_videoanalysis_area",
  }
  const requiredPermission = areaPermissionMap[area]
  return requiredPermission ? hasPermission(role, requiredPermission) : false
}

export function canViewAllAreas(role: ExtendedUserRole): boolean { return hasPermission(role, "view_all_areas") }
export function canViewMedicalRecords(role: ExtendedUserRole): boolean { return hasPermission(role, "view_medical_records") }
export function canEditMedicalRecords(role: ExtendedUserRole): boolean { return hasPermission(role, "edit_medical_records") }
export function canViewInjuredPlayers(role: ExtendedUserRole): boolean { return hasPermission(role, "view_injured_players") }
export function canManageInjuryEvolutions(role: ExtendedUserRole): boolean { return hasPermission(role, "manage_injury_evolutions") }
export function canViewPsychosocialData(role: ExtendedUserRole): boolean { return hasPermission(role, "view_all_areas") }
