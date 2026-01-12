"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, XCircle, Loader2, AlertCircle, ExternalLink } from "lucide-react"

export default function SetupPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])

  const createUsers = async () => {
    setLoading(true)
    setResults([])

    try {
      const response = await fetch("/api/setup-users", {
        method: "POST",
      })

      const data = await response.json()

      if (data.results) {
        setResults(data.results)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-3xl space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Problema de configuración detectado</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>
              Hay un error en el esquema de autenticación de Supabase que impide la creación automática de usuarios. Por
              favor, sigue las instrucciones manuales a continuación.
            </p>
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Método Recomendado: Creación Manual</CardTitle>
            <CardDescription>Crea los usuarios directamente desde el Dashboard de Supabase</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="space-y-4 list-decimal list-inside">
              <li className="space-y-2">
                <span className="font-semibold">Abre el Dashboard de Supabase</span>
                <a
                  href="https://supabase.com/dashboard/project/jhhjkkgzoadtlfldlvsi/auth/users"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline ml-6"
                >
                  Ir a Authentication → Users
                  <ExternalLink className="h-4 w-4" />
                </a>
              </li>

              <li className="space-y-2">
                <span className="font-semibold">Haz clic en "Add user" → "Create new user"</span>
              </li>

              <li className="space-y-3">
                <span className="font-semibold">Crea cada usuario con estos datos:</span>
                <div className="ml-6 space-y-3 text-sm">
                  {[
                    { email: "admin1@newells.com", role: "ADMINISTRADOR", name: "Administrador 1" },
                    { email: "dirigente1@newells.com", role: "DIRIGENTE", name: "Dirigente 1" },
                    { email: "entrenador1@newells.com", role: "ENTRENADOR", name: "Entrenador 1" },
                    { email: "medico1@newells.com", role: "MEDICO", name: "Médico 1" },
                    { email: "psicologo1@newells.com", role: "PSICOLOGO", name: "Psicólogo 1" },
                  ].map((user) => (
                    <div key={user.email} className="border rounded p-3 space-y-2 bg-muted/50">
                      <div className="font-medium">{user.name}</div>
                      <div className="space-y-1 text-xs">
                        <div>
                          <span className="text-muted-foreground">Email:</span>{" "}
                          <code className="bg-background px-1 py-0.5 rounded">{user.email}</code>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Password:</span>{" "}
                          <code className="bg-background px-1 py-0.5 rounded">newells123</code>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Auto Confirm User:</span> ✅ Activado
                        </div>
                        <div className="pt-1">
                          <span className="text-muted-foreground">User Metadata (JSON):</span>
                          <pre className="bg-background px-2 py-1 rounded mt-1 overflow-x-auto">
                            {`{
  "role": "${user.role}",
  "full_name": "${user.name}"
}`}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </li>

              <li>
                <span className="font-semibold">Verifica en la página de login que funcionen</span>
              </li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Método Alternativo: Creación Automática</CardTitle>
            <CardDescription>Solo funcionará si el esquema de auth está correctamente configurado</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h3 className="font-semibold">Usuarios que se intentarán crear:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• admin1@newells.com - Administrador 1 (rol: administrador)</li>
                <li>• dirigente1@newells.com - Dirigente 1 (rol: dirigente)</li>
                <li>• entrenador1@newells.com - Entrenador 1 (rol: entrenador)</li>
                <li>• medico1@newells.com - Médico 1 (rol: medico)</li>
                <li>• psicologo1@newells.com - Psicólogo 1 (rol: psicologo)</li>
              </ul>
              <p className="text-sm font-medium mt-4">
                Contraseña para todos: <code className="bg-muted px-2 py-1 rounded">newells123</code>
              </p>
            </div>

            <Button onClick={createUsers} disabled={loading} className="w-full bg-transparent" variant="outline">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando usuarios...
                </>
              ) : (
                "Intentar Creación Automática"
              )}
            </Button>

            {results.length > 0 && (
              <div className="space-y-2 border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Resultados:</h3>
                {results.map((result, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    {result.status === "success" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : result.alreadyExists ? (
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="font-medium">{result.email}</span>
                    <span className="text-muted-foreground">
                      {result.status === "success"
                        ? result.needsConfirmation
                          ? "✓ Creado (revisa tu email para confirmar)"
                          : "✓ Creado exitosamente"
                        : result.alreadyExists
                          ? "⚠ Ya existe"
                          : `✗ ${result.error}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Diagnóstico del Problema</CardTitle>
            <CardDescription>Para desarrolladores: cómo diagnosticar y reparar el error de auth</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              El error "Database error finding user" indica problemas en el esquema <code>auth</code> de Supabase.
            </p>
            <div className="space-y-2">
              <p className="font-semibold">Para diagnosticar:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2 text-muted-foreground">
                <li>
                  Ejecuta el script <code>scripts/004_diagnose_and_fix_auth.sql</code> en el SQL Editor
                </li>
                <li>Revisa los logs de Postgres en el Dashboard de Supabase</li>
                <li>Verifica que no haya triggers con problemas de permisos</li>
                <li>
                  Consulta el archivo <code>MANUAL_USER_CREATION.md</code> para más detalles
                </li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
