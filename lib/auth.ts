import { supabase, isSupabaseConfigured } from "./supabase"

export type UserRole =
  | "medico"
  | "psicologo"
  | "entrenador"
  | "nutricionista"
  | "fisioterapeuta"
  | "dirigente"
  | "administrador"
  | "entrenador_arqueros"
  | "kinesiologo"
  | "psicosocial" // Agregado rol psicosocial
  | "odontologo" // Agregado rol odontólogo

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
      error: sessionError,
    } = await supabase.auth.getSession()

    // Si hay un error de sesión (como user_not_found), limpiar la sesión
    if (sessionError) {
      console.warn("[v0] Error de sesión, limpiando:", sessionError.message)
      await supabase.auth.signOut()
      return null
    }

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
      // Si el perfil no existe, limpiar la sesión
      await supabase.auth.signOut()
      return null
    }

    return {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role as UserRole,
    }
  } catch (error: any) {
    console.error("[v0] getCurrentUser: Error inesperado:", error)
    // Si es un error de usuario no encontrado, limpiar la sesión
    if (error?.message?.includes("user_not_found") || error?.code === "user_not_found") {
      console.warn("[v0] Usuario no encontrado en la base de datos, limpiando sesión")
      await supabase.auth.signOut()
    }
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
    entrenador_arqueros: "Entrenador de Arqueros",
    nutricionista: "Nutricionista",
    fisioterapeuta: "Fisioterapeuta",
    dirigente: "Dirigente",
    administrador: "Administrador",
    kinesiologo: "Kinesiólogo",
    psicosocial: "Psicosocial", // Agregada etiqueta para rol psicosocial
    odontologo: "Odontólogo", // Agregada etiqueta para rol odontólogo
  }
  return labels[role]
}
