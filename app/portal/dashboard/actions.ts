"use server"

import { createAdminClient } from "@/lib/supabase"
import { requirePlayerSession } from "@/lib/portal-auth"
import { revalidatePath } from "next/cache"

export async function updatePlayerPhysicals(formData: FormData) {
  const session = await requirePlayerSession()
  
  // Get and trim string values
  const document = (formData.get("document") as string)?.trim() || ""
  const birth_date = (formData.get("birth_date") as string)?.trim() || ""
  const province = (formData.get("province") as string)?.trim() || ""
  const phone = (formData.get("phone") as string)?.trim() || ""
  const address = (formData.get("address") as string)?.trim() || ""
  const nationality = (formData.get("nationality") as string)?.trim() || ""
  
  // New Fields
  const tutor_name = (formData.get("tutor_name") as string)?.trim() || ""
  const parents_phone = (formData.get("parents_phone") as string)?.trim() || ""
  const health_insurance = (formData.get("health_insurance") as string)?.trim() || ""
  
  // Nuevos campos solicitados
  const representative = (formData.get("representative") as string)?.trim() || ""
  const representative_phone = (formData.get("representative_phone") as string)?.trim() || ""
  const passport_number = (formData.get("passport_number") as string)?.trim() || ""
  const passport_origin = (formData.get("passport_origin") as string)?.trim() || ""
  const rosario_address = (formData.get("rosario_address") as string)?.trim() || ""

  // --- VALIDACIONES ---

  // 1. Validaciones de Texto (Longitud y Formato)
  if (document.length > 20) return { error: "El documento es demasiado largo." }
  if (province.length > 100) return { error: "La provincia excede el límite de caracteres." }
  if (address.length > 150) return { error: "La dirección excede el límite de caracteres." }
  if (nationality.length > 50) return { error: "La nacionalidad excede el límite de caracteres." }
  
  if (tutor_name.length > 100) return { error: "El nombre del tutor es demasiado largo." }
  if (health_insurance.length > 100) return { error: "La obra social excede el límite de caracteres." }
  
  if (representative.length > 100) return { error: "El nombre del representante es demasiado largo." }
  if (passport_number.length > 50) return { error: "El número de pasaporte es demasiado largo." }
  if (passport_origin.length > 100) return { error: "El dato de origen del pasaporte es demasiado largo." }
  if (rosario_address.length > 150) return { error: "El domicilio en Rosario excede el límite de caracteres." }

  // 2. Validación de Teléfono (Regex básico: números, espacios, +, -)
  const phoneRegex = /^[0-9+\-\s()]*$/
  
  const validatePhone = (p: string, label: string) => {
      if (p.length > 0) {
        if (!phoneRegex.test(p)) return `El formato del teléfono (${label}) no es válido.`
        if (p.length < 6 || p.length > 25) return `El teléfono (${label}) debe tener entre 6 y 25 caracteres.`
      }
      return null
  }

  const phoneError = validatePhone(phone, "Personal")
  if (phoneError) return { error: phoneError }

  const emergencyPhoneError = validatePhone(parents_phone, "Emergencia")
  if (emergencyPhoneError) return { error: emergencyPhoneError }
  
  const repPhoneError = validatePhone(representative_phone, "Representante")
  if (repPhoneError) return { error: repPhoneError }

  // 3. Validación de Fecha de Nacimiento
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

  const updateData: any = {}

  // Solo agregar campos si tienen valor
  if (document) updateData.document = document
  if (birth_date) updateData.birth_date = birth_date
  if (province) updateData.province = province
  if (phone) updateData.phone = phone
  if (address) updateData.address = address
  if (nationality) updateData.nationality = nationality
  
  if (tutor_name) updateData.tutor_name = tutor_name
  if (parents_phone) updateData.parents_phone = parents_phone
  if (health_insurance) updateData.health_insurance = health_insurance
  
  if (representative) updateData.representative = representative
  if (representative_phone) updateData.representative_phone = representative_phone
  if (passport_number) updateData.passport_number = passport_number
  if (passport_origin) updateData.passport_origin = passport_origin
  if (rosario_address) updateData.rosario_address = rosario_address

  // Si no hay datos para actualizar (porque height/weight se ignoran), retornar éxito o error
  if (Object.keys(updateData).length === 0) {
      // Si el usuario solo intentó editar read-only fields, no hacemos nada
      return { success: true }
  }

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