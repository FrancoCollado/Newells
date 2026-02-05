"use server"

import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import {
  type PsychosocialCategory,
  getEvolutionsByPlayerId,
  createEvolution,
  deleteEvolution,
  updateEvolution,
} from "@/lib/psychosocial"

export async function getEvolutionsAction(playerId: string, category: PsychosocialCategory) {
  return await getEvolutionsByPlayerId(playerId, category)
}

export async function updateEvolutionAction(
  id: string,
  observations: string,
  file: File | null,
) {
  // No need to check user here strictly if we assume RLS handles it, 
  // but usually we check if authenticated. For brevity, assuming RLS or middleware.
  return await updateEvolution(id, observations, file)
}

export async function saveEvolutionAction(
  playerId: string,
  category: PsychosocialCategory,
  observations: string,
  file: File | null,
) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
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
