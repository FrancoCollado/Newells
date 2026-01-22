import { createBrowserClient, createServerClient as createSupabaseServerClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Variables de entorno de Supabase no configuradas")
  console.error("Se necesita NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY")
}

export const supabase = createBrowserClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key",
)

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export async function createServerClient() {
  const { cookies } = await import("next/headers")
  const cookieStore = await cookies()

  return createSupabaseServerClient(
    supabaseUrl || "https://placeholder.supabase.co",
    supabaseAnonKey || "placeholder-key",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  )
}

export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!serviceRoleKey) {
    console.warn("⚠️ SUPABASE_SERVICE_ROLE_KEY no está definido. Las operaciones de admin fallarán.")
    // Fallback to anon key but this won't bypass RLS
    return createSupabaseServerClient(
      supabaseUrl || "https://placeholder.supabase.co",
      supabaseAnonKey || "placeholder-key",
      { cookies: { getAll: () => [], setAll: () => {} } }
    )
  }

  return createSupabaseServerClient(
    supabaseUrl || "https://placeholder.supabase.co",
    serviceRoleKey,
    {
      cookies: {
        getAll() { return [] },
        setAll() {},
      },
    },
  )
}
