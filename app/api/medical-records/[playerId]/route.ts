import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { createOrUpdateMedicalRecord } from "@/lib/medical-records"
import { canEditMedicalRecords } from "@/lib/rbac"

export async function POST(request: NextRequest, { params }: { params: { playerId: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || !canEditMedicalRecords(user.role)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const record = await createOrUpdateMedicalRecord(params.playerId, body, user.id)

    return NextResponse.json(record)
  } catch (error) {
    console.error("Error saving medical record:", error)
    return NextResponse.json({ error: "Error al guardar la ficha médica" }, { status: 500 })
  }
}
