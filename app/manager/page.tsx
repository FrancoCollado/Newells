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
    <div className="min-h-screen bg-background">
      {/* Header */}
        <header className="border-b bg-gradient-to-r from-red-700 to-black text-white">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => router.push("/dashboard")}
                  className="text-white hover:bg-white/20"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout} className="hover:bg-white/20">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
            <h1 className="text-2xl font-bold">Panel de Dirigente</h1>
            <p className="text-sm text-red-100">Gestión avanzada de jugadores y formaciones</p>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
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
        </main>
      </div>
  )
}
