"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { login } from "@/lib/auth"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    console.log("Iniciando proceso de login...")

    try {
        const user = await login(email, password)
        console.log("Resultado login:", user)

        if (user) {
          console.log("Login exitoso, guardando usuario y redirigiendo...")
          // Usamos window.location.href en lugar de router.push para asegurar
          // que las cookies de sesión se envíen correctamente al servidor (Middleware)
          window.location.href = "/dashboard"
        } else {
          console.log("Login fallido: credenciales incorrectas")
          setError("Credenciales incorrectas")
        }
    } catch (e) {
        console.error("Excepción en login:", e)
        setError("Ocurrió un error al iniciar sesión")
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
                />
              </div>

              {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>}

              <Button type="submit" className="w-full bg-red-700 hover:bg-red-800" disabled={loading}>
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
