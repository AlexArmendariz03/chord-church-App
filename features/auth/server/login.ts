import "server-only"
import bcrypt from "bcryptjs"
import type { Role } from "@/shared/auth/permissions"
import { prisma } from "@/shared/server/prisma"

type LoginParams = {
  username: string
  password: string
  // Solo cuando la misma cuenta (usuario y contraseña) existe en varias iglesias y la persona eligió la suya
  churchId?: string
}

export type ChurchChoice = { id: string; name: string }

export type LoginResult =
  | { status: 200; message: string; user: { userId: number; username: string; role: Role; churchId: string } }
  | { status: 401; message: string }
  // Ese usuario y esa contraseña son de una cuenta en cada una de estas iglesias: hay que elegir
  | { status: 409; message: string; churches: ChurchChoice[] }

// Compared when the user doesn't exist, so the answer takes as long as a wrong password.
// Ya calculado (costo 10, igual que las contraseñas reales) para no gastar tiempo al arrancar la función
const DUMMY_HASH = "$2b$10$fbdj1MkzkzBoRiQtY0NHvuqyM5k4WfHks2YV1g/3Vo8HoUJHOtX.6"

// Nadie repite su usuario en tantas iglesias; el límite evita comparar contraseñas sin fin
const MAX_CANDIDATES = 20

const WRONG = { status: 401, message: "Usuario o contraseña incorrectos" } as const

// El usuario es único dentro de cada iglesia, no en toda la app: puede haber un "juan" en varias.
// Se prueba la contraseña con cada "juan" y se entra con el que coincida, así el login no pide la
// iglesia. Solo si coincide en más de una (la misma persona con cuenta en dos iglesias, o dos con la
// misma contraseña) se responde con esas iglesias para que elija.
export async function loginUser({ username, password, churchId }: LoginParams): Promise<LoginResult> {
  const candidates = await prisma.user.findMany({
    where: { username: username.trim().toLowerCase(), ...(churchId ? { churchId } : {}) },
    select: { id: true, username: true, password: true, role: true, church: { select: { id: true, name: true } } },
    orderBy: { id: "asc" },
    take: MAX_CANDIDATES
  })

  if (candidates.length === 0) {
    await bcrypt.compare(password, DUMMY_HASH)
    return WRONG
  }

  const matches = []
  for (const candidate of candidates) {
    if (await bcrypt.compare(password, candidate.password)) matches.push(candidate)
  }

  if (matches.length === 1) {
    const [{ id, username: savedUsername, role, church }] = matches
    return { status: 200, message: "Inicio de sesión exitoso", user: { userId: id, username: savedUsername, role, churchId: church.id } }
  }
  if (matches.length > 1) {
    return {
      status: 409,
      message: "Tienes cuenta en más de una iglesia. Elige con cuál quieres entrar.",
      churches: matches.map(({ church }) => church).sort((a, b) => a.name.localeCompare(b.name, "es"))
    }
  }
  return WRONG
}
