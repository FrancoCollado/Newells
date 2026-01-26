import { createClient } from "@supabase/supabase-js"
import { createServerClient } from "@/lib/supabase"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export type Evaluation = {
  id: string
  division: string
  title: string
  description?: string
  file_url?: string
  file_name?: string
  created_by: string
  created_at: string
  updated_at: string
}

// Server-side function - only call from Server Actions or Server Components
export async function getEvaluationsByDivision(division: string): Promise<Evaluation[]> {
  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from("evaluations")
      .select("*")
      .eq("division", division)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching evaluations:", error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error("[v0] Error in getEvaluationsByDivision:", error)
    return []
  }
}

// Server-side function - only call from Server Actions or Server Components
export async function saveEvaluation(evaluation: Omit<Evaluation, "id" | "created_at" | "updated_at">): Promise<Evaluation | null> {
  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from("evaluations")
      .insert([evaluation])
      .select()
      .single()

    if (error) {
      console.error("[v0] Error saving evaluation:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("[v0] Error in saveEvaluation:", error)
    return null
  }
}

// Server-side function - only call from Server Actions or Server Components
export async function deleteEvaluation(evaluationId: string): Promise<boolean> {
  try {
    const supabase = await createServerClient()

    const { error } = await supabase
      .from("evaluations")
      .delete()
      .eq("id", evaluationId)

    if (error) {
      console.error("[v0] Error deleting evaluation:", error)
      throw error
    }

    return true
  } catch (error) {
    console.error("[v0] Error in deleteEvaluation:", error)
    return false
  }
}

// Client-side utility function for uploading files to storage
export async function uploadEvaluationFile(file: File): Promise<{ fileUrl: string; fileName: string }> {
  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  const fileName = `${Date.now()}-${file.name}`
  const { data, error } = await supabase.storage
    .from("evaluations")
    .upload(fileName, file)

  if (error) {
    throw new Error(`Upload failed: ${error.message}`)
  }

  const { data: publicUrl } = supabase.storage
    .from("evaluations")
    .getPublicUrl(fileName)

  return {
    fileUrl: publicUrl.publicUrl,
    fileName: fileName,
  }
}
