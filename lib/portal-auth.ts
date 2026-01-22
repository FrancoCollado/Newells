import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const SECRET_KEY = process.env.PLAYER_PORTAL_SECRET || "desarrollo-secret-key-change-in-prod"
const key = new TextEncoder().encode(SECRET_KEY)
const COOKIE_NAME = "player_session"

export interface PlayerSession {
  playerId: string
  name: string
  division: string
}

export async function createPlayerSession(payload: PlayerSession) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d") // Sesión persistente por 1 semana
    .sign(key)

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  })
}

export async function getPlayerSession(): Promise<PlayerSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, key)
    return payload as unknown as PlayerSession
  } catch (error) {
    return null
  }
}

export async function requirePlayerSession() {
  const session = await getPlayerSession()
  if (!session) {
    redirect("/portal/login")
  }
  return session
}

export async function logoutPlayer() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
  redirect("/portal/login")
}
