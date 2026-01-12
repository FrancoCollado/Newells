"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { getCurrentUser, type User } from "@/lib/auth"
import { getPlayerById, type Player } from "@/lib/players"
import { getReportsByPlayer, getReportsByPlayerAndRole } from "@/lib/reports"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Plus, FileText, Loader2 } from "lucide-react"
import { ReportCard } from "@/components/report-card"
import type { Report } from "@/lib/reports"
import { canCreateReport } from "@/lib/rbac"

export default function PlayerReportsPage() {
  const router = useRouter()
  const params = useParams()
  const [user, setUser] = useState<User | null>(null)
  const [player, setPlayer] = useState<Player | null>(null)
  
  // Pagination State
  const [reports, setReports] = useState<Report[]>([])
  const [activeTab, setActiveTab] = useState("todos")
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const [loadingTab, setLoadingTab] = useState(false)
  
  const LIMIT = 10

  useEffect(() => {
    const init = async () => {
        setLoading(true)
        const currentUser = await getCurrentUser()
        if (currentUser) {
            setUser(currentUser)
        }

        const playerId = params.id as string
        const foundPlayer = await getPlayerById(playerId)
        if (foundPlayer) {
            setPlayer(foundPlayer)
        }

        // Initial load for default tab "todos"
        if (currentUser) {
            await loadReports(currentUser, playerId, "todos", 0, true)
        }
        setLoading(false)
    }
    init()
  }, [params.id])

  const loadReports = async (currentUser: User, playerId: string, tab: string, pageToLoad: number, reset: boolean) => {
    setLoadingTab(true)
    let fetchedReports: Report[] = []
    
    // Mapping tab to role if needed, or passing tab directly if it matches role names
    // Tabs: todos, medico, psicologo, entrenador, nutricionista, fisioterapeuta
    
    if (tab === "todos") {
        // Only Dirigente can see "todos" effectively via this call usually, but we'll use the generic getter
        // If current user is NOT dirigente, they shouldn't see "todos" tab ideally, but if they do, we restrict content?
        // Current logic: Dirigente sees all. Professionals see only theirs.
        if (currentUser.role === "dirigente") {
             fetchedReports = await getReportsByPlayer(playerId, pageToLoad, LIMIT)
        } else {
             // Fallback for professionals seeing "todos" -> show only theirs
             fetchedReports = await getReportsByPlayerAndRole(playerId, currentUser.role, pageToLoad, LIMIT)
        }
    } else {
        // Specific role tab
        // Cast tab string to UserRole. Note: "entrenador" matches, etc.
        fetchedReports = await getReportsByPlayerAndRole(playerId, tab as any, pageToLoad, LIMIT)
    }

    if (reset) {
        setReports(fetchedReports)
        setHasMore(fetchedReports.length === LIMIT)
    } else {
        setReports(prev => [...prev, ...fetchedReports])
        setHasMore(fetchedReports.length === LIMIT)
    }
    
    setPage(pageToLoad)
    setLoadingTab(false)
  }

  const handleTabChange = (value: string) => {
      setActiveTab(value)
      if (user && player) {
          loadReports(user, player.id, value, 0, true)
      }
  }

  const handleLoadMore = () => {
      if (user && player) {
          loadReports(user, player.id, activeTab, page + 1, false)
      }
  }

  if (loading) {
     return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-red-700" /></div>
  }

  if (!user || !player) return null

  const showCreateButton = canCreateReport(user.role, user.role)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-gradient-to-r from-red-700 to-black text-white">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => router.push(`/player/${player.id}`)}
            className="text-white hover:bg-white/20 mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Perfil
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Informes de {player.name}</h1>
              <p className="text-sm text-red-100">Historial y nuevos informes profesionales</p>
            </div>
            {showCreateButton && (
              <Button
                onClick={() => router.push(`/player/${player.id}/reports/new`)}
                className="bg-white text-red-700 hover:bg-red-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Informe
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Reports Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Historial de Informes</CardTitle>
            <CardDescription>
              {user.role === "dirigente"
                ? "Ver todos los informes de los profesionales"
                : "Ver y gestionar sus informes"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user.role === "dirigente" ? (
              <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="flex flex-wrap h-auto">
                  <TabsTrigger value="todos">Todos</TabsTrigger>
                  <TabsTrigger value="medico">Médicos</TabsTrigger>
                  <TabsTrigger value="psicologo">Psicológicos</TabsTrigger>
                  <TabsTrigger value="entrenador">Entrenamiento</TabsTrigger>
                  <TabsTrigger value="nutricionista">Nutrición</TabsTrigger>
                  <TabsTrigger value="fisioterapeuta">Fisioterapia</TabsTrigger>
                </TabsList>

                <div className="space-y-4 mt-4">
                  {loadingTab && page === 0 ? (
                      <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-red-700" /></div>
                  ) : reports.length === 0 ? (
                    <EmptyReports />
                  ) : (
                    <>
                      {reports.map((report) => (
                        <ReportCard key={report.id} report={report} showDownload={user.role === "dirigente"} />
                      ))}
                      {hasMore && (
                        <div className="text-center pt-4">
                          <Button
                            variant="outline"
                            onClick={handleLoadMore}
                            disabled={loadingTab}
                            className="border-red-700 text-red-700 hover:bg-red-50"
                          >
                            {loadingTab ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cargar más informes"}
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </Tabs>
            ) : (
              // Vista de otros profesionales: solo sus informes (sin tabs)
              <div className="space-y-4">
                {reports.length === 0 ? (
                  <EmptyReports />
                ) : (
                  <>
                    {reports.map((report) => (
                      <ReportCard key={report.id} report={report} showDownload={false} />
                    ))}
                    {hasMore && (
                      <div className="text-center pt-4">
                        <Button
                          variant="outline"
                          onClick={handleLoadMore}
                          disabled={loadingTab}
                          className="border-red-700 text-red-700 hover:bg-red-50"
                        >
                          {loadingTab ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cargar más informes"}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

function EmptyReports({ type }: { type?: string }) {
  return (
    <div className="text-center py-12 text-muted-foreground">
      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
      <p>No hay informes {type || ""} disponibles</p>
      <p className="text-sm mt-2">Los informes aparecerán aquí cuando se creen</p>
    </div>
  )
}
