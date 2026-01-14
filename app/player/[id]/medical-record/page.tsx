import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getPlayerById } from "@/lib/players"
import { getMedicalRecord } from "@/lib/medical-records"
import { canViewMedicalRecords } from "@/lib/rbac"
import { MedicalRecordForm } from "@/components/medical-record-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function MedicalRecordPage({
  params,
}: {
  params: { id: string }
}) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  if (!canViewMedicalRecords(user.role)) {
    redirect("/dashboard")
  }

  const player = await getPlayerById(params.id)
  if (!player) redirect("/dashboard")

  const medicalRecord = await getMedicalRecord(params.id)

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-4">
        <Button variant="outline" asChild>
          <Link href={`/player/${params.id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al perfil
          </Link>
        </Button>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Historia Clínica</h1>
        <p className="text-muted-foreground">
          {player.name} - {player.position}
        </p>
      </div>

      <MedicalRecordForm playerId={params.id} existingRecord={medicalRecord} userId={user.id} userRole={user.role} />
    </div>
  )
}
