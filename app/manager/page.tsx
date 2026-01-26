"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, logout, type User } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, LogOut, Users, ListOrdered, Loader2 } from "lucide-react"
import { PlayersManagement } from "@/components/players-management"
import { FormationsManager } from "@/components/formations-manager"
import { hasPermission } from "@/lib/rbac"
import { ProfessionalLayout } from "@/components/professional-layout"

export default function ManagerPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
        setLoading(true)
        const currentUser = await getCurrentUser()
        if (currentUser) {
          if (!hasPermission(currentUser.role, "access_manager_panel")) {
            router.push("/dashboard")
            return
          }
          setUser(currentUser)
        }
        setLoading(false)
    }
    init()
  }, [router])

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-red-700" /></div>
  }

  if (!user) return null

  return (
    <ProfessionalLayout user={user} onLogout={handleLogout}>
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2">Gestión del Club</h2>
            <p className="text-muted-foreground">
              Administre jugadores, formaciones, posiciones y acceda a informes completos
            </p>
          </div>

          <Tabs defaultValue="players" className="space-y-4">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="players">
                <Users className="h-4 w-4 mr-2" />
                Gestión de Jugadores
              </TabsTrigger>
              <TabsTrigger value="formations">
                <ListOrdered className="h-4 w-4 mr-2" />
                Formaciones
              </TabsTrigger>
            </TabsList>

            <TabsContent value="players">
              <Card>
                <CardHeader>
                  <CardTitle>Gestión de Jugadores</CardTitle>
                  <CardDescription>Agregar, editar y eliminar jugadores del plantel</CardDescription>
                </CardHeader>
                <CardContent>
                  <PlayersManagement />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="formations">
              <Card>
                <CardHeader>
                  <CardTitle>Formaciones y Posiciones</CardTitle>
                  <CardDescription>Configure formaciones tácticas y asigne posiciones a los jugadores</CardDescription>
                </CardHeader>
                <CardContent>
                  <FormationsManager />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
      </ProfessionalLayout>
  )
}
