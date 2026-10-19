import { cookies } from "next/headers"
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE, signSession, verifySession, type SessionUser } from "./session-token"

export type { SessionRole, SessionUser } from "./session-token"

export async function setSessionCookie(user: SessionUser) {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, await signSession(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE
  })
}

export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  return verifySession(cookieStore.get(SESSION_COOKIE_NAME)?.value)
}

export async function requireLeader(): Promise<SessionUser | null> {
  const user = await getSessionUser()
  return user?.role === "leader" ? user : null
}
