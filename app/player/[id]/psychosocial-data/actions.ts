"use server"

import { cookies } from "next/headers"
import { createSupabaseServerClient } from "@supabase/ssr"
import {
  type PsychosocialCategory,
  getEvolutionsByPlayerId,
  createEvolution,
  deleteEvolution,
} from "@/lib/psychosocial"

export async function getEvolutionsAction(playerId: string, category: PsychosocialCategory) {
  return await getEvolutionsByPlayerId(playerId, category)
}

export async function saveEvolutionAction(
  playerId: string,
  category: PsychosocialCategory,
  observations: string,
  file: File | null,
) {
  const cookieStore = await cookies()
  const supabase = createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "No autenticado" }
  }

  return await createEvolution(playerId, category, observations, file, user.id)
}

export async function deleteEvolutionAction(id: string, fileUrl: string | null) {
  return await deleteEvolution(id, fileUrl)
}
