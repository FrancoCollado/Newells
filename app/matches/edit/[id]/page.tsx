"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { getCurrentUser, logout, type User } from "@/lib/auth"
import { getDivisionLabel, type Division } from "@/lib/players"
import { getMatchById, type Match } from "@/lib/matches"
import { Loader2 } from "lucide-react"
import { ProfessionalLayout } from "@/components/professional-layout"
import { MatchForm } from "@/components/match-form"
import { useToast } from "@/hooks/use-toast"

export default function EditMatchPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [match, setMatch] = useState<Match | null>(null)
  const [loading, setLoading] = useState(true)

  const matchId = params.id as string

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      const [currentUser, matchData] = await Promise.all([
        getCurrentUser(),
        getMatchById(matchId)
      ])
      
      if (currentUser) {
        setUser(currentUser)
      }

      if (matchData) {
        setMatch(matchData)
      } else {
        toast({
          title: "Error",
          description: "No se encontró el partido",
          variant: "destructive",
        })
        router.push("/dashboard")
      }
      setLoading(false)
    }
    init()
  }, [matchId, router, toast])

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-red-700" />
      </div>
    )
  }

  if (!user || !match || (user.role !== "dirigente" && user.role !== "entrenador")) {
    // Optionally redirect or show unauthorized
    return null
  }

  return (
    <ProfessionalLayout user={user} onLogout={handleLogout}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Editar Partido - {getDivisionLabel(match.division)}</h1>
      </div>

      <div className="max-w-4xl mx-auto">
        <MatchForm 
          division={match.division} 
          initialMatch={match} 
          user={user}
        />
      </div>
    </ProfessionalLayout>
  )
}
