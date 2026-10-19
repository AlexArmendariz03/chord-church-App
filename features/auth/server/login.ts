import bcrypt from "bcryptjs"
import { prisma } from "@/shared/server/prisma"

export type UserRole = "leader" | "musico"

type LoginParams = {
  username: string
  password: string
}

export async function loginUser({ username, password }: LoginParams): Promise<{ message: string; role?: UserRole; status: number }> {
  const normalizedUsername = username.trim().toLowerCase()
  const dbUser = await prisma.user.findUnique({ where: { username: normalizedUsername } })
  if (dbUser && (await bcrypt.compare(password, dbUser.password))) {
    return {
      status: 200,
      message: "Inicio de sesión exitoso",
      role: dbUser.role
    }
  }

  return {
    status: 401,
    message: "Usuario o contraseña incorrectos"
  }
}
