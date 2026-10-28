import type { ThemePreference } from "@/generated/prisma/client"
import { prisma } from "@/shared/server/prisma"

// El tema guardado en la cuenta; null si el usuario ya no existe. Se lee en cada página con sesión:
// si la consulta falla, la página sigue con el tema de la cookie en vez de mostrar un error.
export const findAccountTheme = async (username: string) => {
  try {
    return (await prisma.user.findUnique({ where: { username }, select: { theme: true } }))?.theme ?? null
  } catch (error) {
    console.error("No se pudo leer el tema de la cuenta", error)
    return null
  }
}

export const saveAccountTheme = (username: string, theme: ThemePreference) =>
  prisma.user.update({ where: { username }, data: { theme }, select: { theme: true } })
