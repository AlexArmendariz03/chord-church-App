import { prisma } from "@/shared/server/prisma"
import bcrypt from "bcryptjs"
import type { UserRole } from "@prisma/client"

type LoginParams = {
  username: string
  password: string
}

const STATIC_USERS: Array<{ username: string; password: string; role: UserRole }> = [
  { username: "leader", password: "leader123", role: "leader" },
  { username: "musico", password: "musico123", role: "musico" }
]

export async function loginUser({ username, password }: LoginParams): Promise<{ message: string; role?: UserRole; status: number }> {
  const user = await prisma.user.findUnique({ where: { username } })

  if (user) {
    const isValidPassword = await bcrypt.compare(password, user.password)
    return isValidPassword
      ? { status: 200, message: `Inicio de sesión exitoso (${user.role})`, role: user.role }
      : { status: 401, message: "Contraseña incorrecta" }
  }

  const staticUser = STATIC_USERS.find((candidate) => candidate.username === username && candidate.password === password)
  if (!staticUser) return { status: 401, message: "Usuario o contraseña incorrectos" }

  return { status: 200, message: `Inicio de sesión exitoso (${staticUser.role})`, role: staticUser.role }
}
