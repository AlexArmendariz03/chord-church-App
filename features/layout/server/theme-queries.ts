import "server-only"
import type { ThemePreference } from "@/generated/prisma/client"
import { sessionAccountWhere } from "@/features/auth/server/session-account"
import { prisma } from "@/shared/server/prisma"
import type { SessionUser } from "@/shared/server/session-token"

// El tema guardado en la cuenta; null si el usuario ya no existe. Se lee en cada página con sesión:
// si la consulta falla, la página sigue con el tema de la cookie en vez de mostrar un error.
export const findAccountTheme = async (user: SessionUser) => {
  try {
    return (await prisma.user.findUnique({ where: sessionAccountWhere(user), select: { theme: true } }))?.theme ?? null
  } catch (error) {
    console.error("No se pudo leer el tema de la cuenta", error)
    return null
  }
}

export const saveAccountTheme = (user: SessionUser, theme: ThemePreference) =>
  prisma.user.update({ where: sessionAccountWhere(user), data: { theme }, select: { theme: true } })
