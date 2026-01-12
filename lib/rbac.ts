import type { UserRole } from "./auth"

export type Permission =
  | "manage_players"      // Crear, editar, borrar jugadores
  | "manage_tactics"      // Crear y guardar tácticas
  | "manage_matches"      // Cargar partidos y estadísticas
  | "manage_trainings"    // Cargar entrenamientos
  | "view_all_reports"    // Ver reportes de todas las áreas
  | "create_medical_report"
  | "create_psych_report"
  | "create_nutrition_report"
  | "create_physio_report"
  | "create_technical_report"
  | "access_manager_panel" // Entrar a /manager

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  dirigente: [
    "manage_players",
    "manage_tactics",
    "manage_matches",
    "manage_trainings",
    "view_all_reports",
    "access_manager_panel",
    // Dirigentes generally oversee, but might not create specific medical reports, 
    // though for MVP flexibility we often allow them everything. 
    // Let's restrict specific professional reports to keep it realistic.
    "create_technical_report"
  ],
  entrenador: [
    "manage_players", // Can usually suggest players or edit lineup
    "manage_tactics",
    "manage_matches",
    "manage_trainings",
    "create_technical_report",
    "access_manager_panel" // Coaches need access to formations/players
  ],
  medico: [
    "create_medical_report",
    // Can view general player info but not tactics
  ],
  psicologo: [
    "create_psych_report",
  ],
  nutricionista: [
    "create_nutrition_report",
  ],
  fisioterapeuta: [
    "create_physio_report",
  ]
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || []
  return permissions.includes(permission)
}

export function canCreateReport(role: UserRole, reportType: "medico" | "psicologo" | "entrenador" | "nutricionista" | "fisioterapeuta" | "dirigente"): boolean {
    if (role === "dirigente") return true // Dirigente can do anything/override in this MVP
    
    if (role === "entrenador" && reportType === "entrenador") return true
    if (role === "medico" && reportType === "medico") return true
    if (role === "psicologo" && reportType === "psicologo") return true
    if (role === "nutricionista" && reportType === "nutricionista") return true
    if (role === "fisioterapeuta" && reportType === "fisioterapeuta") return true
    
    return false
}
