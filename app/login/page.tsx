"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { login } from "@/lib/auth"
import { isSupabaseConfigured, supabase } from "@/lib/supabase"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // Limpiar tokens antiguos al cargar la página de login
  useEffect(() => {
    const cleanupOldTokens = async () => {
      try {
        // Limpiar la sesión de Supabase
        await supabase.auth.signOut()
        // Limpiar localStorage manualmente por si acaso
        const keys = Object.keys(localStorage)
        keys.forEach(key => {
          if (key.includes('supabase')) {
            localStorage.removeItem(key)
          }
        })
        console.log("[v0] Tokens antiguos limpiados")
      } catch (error) {
        console.error("[v0] Error limpiando tokens:", error)
      }
    }
    cleanupOldTokens()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    console.log("[v0] Iniciando proceso de login...")

    try {
      const user = await login(email, password)
      console.log("[v0] Resultado login:", user)

      if (user) {
        console.log("[v0] Login exitoso, guardando usuario y redirigiendo...")
        window.location.href = "/dashboard"
      } else {
        console.log("[v0] Login fallido: credenciales incorrectas")
        setError("Credenciales incorrectas. Verifica tu email y contraseña.")
      }
    } catch (e) {
      console.error("[v0] Excepción en login:", e)
      if (e instanceof Error && e.message.includes("Supabase no está configurado")) {
        setError("Error de configuración: La conexión a la base de datos no está configurada.")
      } else {
        setError("Ocurrió un error al iniciar sesión. Por favor intenta nuevamente.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-950 via-black to-red-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Newell's Old Boys</h1>
          <p className="text-red-200">Sistema de Gestión Deportiva</p>
        </div>

        {!isSupabaseConfigured && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Configuración Requerida</AlertTitle>
            <AlertDescription>
              La integración con Supabase no está configurada. Necesitas agregar las variables de entorno desde el panel
              de configuración.
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-red-900">
          <CardHeader>
            <CardTitle>Iniciar Sesión</CardTitle>
            <CardDescription>Ingrese sus credenciales del club</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@newells.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={!isSupabaseConfigured}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={!isSupabaseConfigured}
                />
              </div>

              {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>}

              <Button
                type="submit"
                className="w-full bg-red-700 hover:bg-red-800"
                disabled={loading || !isSupabaseConfigured}
              >
                {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                {loading ? "Ingresando..." : "Ingresar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
