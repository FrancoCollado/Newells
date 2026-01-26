import { formatDistanceToNowStrict } from "date-fns"
import { es } from "date-fns/locale"

export function formatPresence(lastSeen: string | null | undefined, isOnline: boolean): string {
  if (isOnline) return "En línea"
  if (!lastSeen) return ""

  const date = new Date(lastSeen)
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

  // Menos de 1 hora
  if (diffInHours < 1) {
    return "Activo recientemente"
  }

  // Entre 1 hora y 24 horas (exclusivo)
  if (diffInHours < 24) {
    const hours = Math.floor(diffInHours)
    return `Activo hace ${hours} hs`
  }

  // 24 horas o más: Usar librería para días, meses, años
  return `Activo ${formatDistanceToNowStrict(date, { addSuffix: true, locale: es })}`
}