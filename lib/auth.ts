import { supabase } from "./supabase"

export type UserRole =
  | "medico"
  | "psicologo"
  | "entrenador"
  | "nutricionista"
  | "fisioterapeuta"
  | "dirigente"
  | "administrador"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
}

export async function login(email: string, password: string): Promise<User | null> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Error en login:", error.message)
      return null
    }

    if (data.user) {
      return {
        id: data.user.id,
        email: data.user.email!,
        name: data.user.user_metadata.name || "Usuario",
        role: (data.user.user_metadata.role as UserRole) || "entrenador",
      }
    }

    return null
  } catch (error) {
    console.error("Error inesperado en login:", error)
    return null
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) return null

    return {
      id: session.user.id,
      email: session.user.email!,
      name: session.user.user_metadata.name || "Usuario",
      role: (session.user.user_metadata.role as UserRole) || "entrenador",
    }
  } catch (error) {
    return null
  }
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut()
}

export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    medico: "Médico",
    psicologo: "Psicólogo",
    entrenador: "Entrenador",
    nutricionista: "Nutricionista",
    fisioterapeuta: "Fisioterapeuta",
    dirigente: "Dirigente",
    administrador: "Administrador",
  }
  return labels[role]
}
