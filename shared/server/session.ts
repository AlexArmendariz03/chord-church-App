import { cookies } from "next/headers"

export type SessionRole = "leader" | "musico"

export type SessionUser = {
  username: string
  role: SessionRole
}

const COOKIE_NAME = "user"
const COOKIE_MAX_AGE = 60 * 60 * 24

export async function setSessionCookie(user: SessionUser) {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, JSON.stringify(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE
  })
}

export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const raw = cookieStore.get(COOKIE_NAME)?.value
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as Partial<SessionUser>
    if (parsed.username && (parsed.role === "leader" || parsed.role === "musico")) {
      return { username: parsed.username, role: parsed.role }
    }
    return null
  } catch {
    return null
  }
}

export async function requireLeader(): Promise<SessionUser | null> {
  const user = await getSessionUser()
  return user?.role === "leader" ? user : null
}
