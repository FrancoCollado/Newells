"use server"

import { createAdminClient } from "@/lib/supabase"
import { requirePlayerSession } from "@/lib/portal-auth"
import { revalidatePath } from "next/cache"

export async function updatePlayerPhysicals(formData: FormData) {
  const session = await requirePlayerSession()
  
  const weight = parseFloat(formData.get("weight") as string)
  const height = parseFloat(formData.get("height") as string)
  
  // Get and trim string values
  const document = (formData.get("document") as string)?.trim() || ""
  const birth_date = (formData.get("birth_date") as string)?.trim() || ""
  const province = (formData.get("province") as string)?.trim() || ""
  const phone = (formData.get("phone") as string)?.trim() || ""
  const address = (formData.get("address") as string)?.trim() || ""
  const nationality = (formData.get("nationality") as string)?.trim() || ""

  // --- VALIDACIONES ---

  // 1. Validaciones Numéricas (Rango físico)
  if (isNaN(weight) || isNaN(height)) {
    return { error: "Peso o altura inválidos." }
  }
  if (weight < 40 || weight > 150) {
    return { error: "El peso debe estar entre 40kg y 150kg." }
  }
  if (height < 140 || height > 230) {
    return { error: "La altura debe estar entre 140cm y 230cm." }
  }

  // 2. Validaciones de Texto (Longitud y Formato)
  if (document.length > 20) return { error: "El documento es demasiado largo." }
  if (province.length > 100) return { error: "La provincia excede el límite de caracteres." }
  if (address.length > 150) return { error: "La dirección excede el límite de caracteres." }
  if (nationality.length > 50) return { error: "La nacionalidad excede el límite de caracteres." }

  // 3. Validación de Teléfono (Regex básico: números, espacios, +, -)
  const phoneRegex = /^[0-9+\-\s()]*$/
  if (phone.length > 0) {
    if (!phoneRegex.test(phone)) {
      return { error: "El formato del teléfono no es válido." }
    }
    if (phone.length < 6 || phone.length > 25) {
      return { error: "El teléfono debe tener entre 6 y 25 caracteres." }
    }
  }

  // 4. Validación de Fecha de Nacimiento
  if (birth_date.length > 0) {
    const dateObj = new Date(birth_date)
    const now = new Date()
    // Verificar si es una fecha válida
    if (isNaN(dateObj.getTime())) {
      return { error: "La fecha de nacimiento no es válida." }
    }
    // Verificar que no sea futura
    if (dateObj > now) {
      return { error: "La fecha de nacimiento no puede ser futura." }
    }
    // Verificar rango razonable (ej. no más de 100 años atrás ni menos de 5 años)
    const minDate = new Date()
    minDate.setFullYear(minDate.getFullYear() - 100)
    if (dateObj < minDate) {
      return { error: "La fecha de nacimiento no es válida." }
    }
  }

  // --- PREPARACIÓN DE DATOS ---

  const updateData: any = { 
    weight, 
    height 
  }

  // Solo agregar campos si tienen valor (para no borrar datos existentes con strings vacíos si el form falla en enviarlos, 
  // aunque con el value={defaultValue} del form esto es raro, es buena práctica)
  
  if (document) updateData.document = document
  if (birth_date) updateData.birth_date = birth_date
  if (province) updateData.province = province
  if (phone) updateData.phone = phone
  if (address) updateData.address = address
  if (nationality) updateData.nationality = nationality

  const supabase = createAdminClient()

  const { error } = await supabase
    .from("players")
    .update(updateData)
    .eq("id", session.playerId)

  if (error) {
    console.error("Error actualizando datos:", error)
    return { error: "Ocurrió un error al guardar los cambios." }
  }

  revalidatePath("/portal/dashboard")
  return { success: true }
}

export async function logoutAction() {
  const { logoutPlayer } = await import("@/lib/portal-auth")
  await logoutPlayer()
}