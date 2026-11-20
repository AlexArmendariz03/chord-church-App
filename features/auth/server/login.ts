import "server-only"
import bcrypt from "bcryptjs"
import type { Role } from "@/shared/auth/permissions"
import { prisma } from "@/shared/server/prisma"

type LoginParams = {
  username: string
  password: string
}

// Compared when the user doesn't exist, so the answer takes as long as a wrong password.
// Ya calculado (costo 10, igual que las contraseñas reales) para no gastar tiempo al arrancar la función
const DUMMY_HASH = "$2b$10$fbdj1MkzkzBoRiQtY0NHvuqyM5k4WfHks2YV1g/3Vo8HoUJHOtX.6"

export async function loginUser({ username, password }: LoginParams): Promise<{ message: string; role?: Role; churchId?: string; status: number }> {
  const normalizedUsername = username.trim().toLowerCase()
  const dbUser = await prisma.user.findUnique({ where: { username: normalizedUsername } })
  const isValid = await bcrypt.compare(password, dbUser?.password ?? DUMMY_HASH)

  if (dbUser && isValid) {
    return {
      status: 200,
      message: "Inicio de sesión exitoso",
      role: dbUser.role,
      churchId: dbUser.churchId
    }
  }

  return {
    status: 401,
    message: "Usuario o contraseña incorrectos"
  }
}
