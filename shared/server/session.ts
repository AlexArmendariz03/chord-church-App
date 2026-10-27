import { cookies } from "next/headers"
import { can, type Permission } from "@/shared/auth/permissions"
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE, signSession, verifySession, type SessionUser } from "./session-token"

export type { SessionUser } from "./session-token"

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

// Route handlers check the session themselves too, so a proxy bypass doesn't expose data
export async function requireUser(): Promise<SessionUser | null> {
  return getSessionUser()
}

// El usuario de la sesión, solo si su rol tiene ese permiso (shared/auth/permissions.ts)
export async function requirePermission(permission: Permission): Promise<SessionUser | null> {
  const user = await getSessionUser()
  return can(user?.role, permission) ? user : null
}
