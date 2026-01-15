import { supabase, isSupabaseConfigured } from "./supabase"

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
    if (!isSupabaseConfigured) {
      console.error("Error en login: Supabase no está configurado. Verifica las variables de entorno.")
      throw new Error("Supabase no está configurado correctamente")
    }

    console.log("[v0] Intentando login con email:", email)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("[v0] Error en signInWithPassword:", error.message)
      return null
    }

    if (data.user) {
      console.log("[v0] Usuario autenticado, obteniendo perfil...")

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single()

      if (profileError) {
        console.error("[v0] Error obteniendo perfil:", profileError.message)
        // Fallback a user_metadata si no existe el perfil
        return {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata.name || "Usuario",
          role: (data.user.user_metadata.role as UserRole) || "entrenador",
        }
      }

      console.log("[v0] Perfil obtenido:", profile)

      return {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role as UserRole,
      }
    }

    return null
  } catch (error) {
    console.error("[v0] Error inesperado en login:", error)
    throw error
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    if (!isSupabaseConfigured) {
      return null
    }

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return null
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single()

    if (profileError) {
      console.error("[v0] Error obteniendo perfil:", profileError.message)
      // Fallback a user_metadata
      return {
        id: session.user.id,
        email: session.user.email!,
        name: session.user.user_metadata.name || "Usuario",
        role: (session.user.user_metadata.role as UserRole) || "entrenador",
      }
    }

    return {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role as UserRole,
    }
  } catch (error) {
    console.error("[v0] getCurrentUser: Error inesperado:", error)
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
