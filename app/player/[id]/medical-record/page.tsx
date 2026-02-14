import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createServerClient as createSupabaseServerClient } from "@supabase/ssr"
import { getPlayerById } from "@/lib/players"
import { getMedicalRecord } from "@/lib/medical-records"
import { canViewMedicalRecords } from "@/lib/rbac"
import { MedicalRecordForm } from "@/components/medical-record-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { UserRole } from "@/lib/auth"

export default async function MedicalRecordPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  console.log("[v0] Intentando acceder a historia clínica, player ID:", id)

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
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // Server component, ignore set errors
          }
        },
      },
    },
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    console.log("[v0] No hay usuario, redirigiendo a login")
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  const user = profile
    ? {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role as UserRole,
      }
    : {
        id: session.user.id,
        email: session.user.email!,
        name: session.user.user_metadata.name || "Usuario",
        role: (session.user.user_metadata.role as UserRole) || "entrenador",
      }

  console.log("[v0] Usuario obtenido:", { id: user.id, email: user.email, role: user.role })

  const canView = canViewMedicalRecords(user.role)
  console.log("[v0] ¿Puede ver historia clínica?", canView, "Role:", user.role)

  if (!canView) {
    console.log("[v0] Usuario no tiene permisos, redirigiendo a dashboard")
    redirect("/dashboard")
  }

  const player = await getPlayerById(id)
  console.log("[v0] Jugador obtenido:", player ? player.name : "null")

  if (!player) {
    console.log("[v0] Jugador no encontrado, redirigiendo a dashboard")
    redirect("/dashboard")
  }

  const medicalRecord = await getMedicalRecord(id)
  console.log("[v0] Registro médico:", medicalRecord ? "existe" : "no existe")

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-4">
        <Button variant="outline" asChild>
          <Link href={`/player/${id}`}>
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

      <MedicalRecordForm 
        playerId={id} 
        player={player}
        existingRecord={medicalRecord} 
        userId={user.id} 
        userName={user.name} 
        userRole={user.role} 
      />
    </div>
  )
}
