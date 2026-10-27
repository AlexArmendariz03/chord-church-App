import bcrypt from "bcryptjs"
import type { Role } from "@/shared/auth/permissions"
import { prisma } from "@/shared/server/prisma"

type LoginParams = {
  username: string
  password: string
}

// Compared when the user doesn't exist, so the answer takes as long as a wrong password
const DUMMY_HASH = bcrypt.hashSync("chord-church-dummy-password", 10)

export async function loginUser({ username, password }: LoginParams): Promise<{ message: string; role?: Role; status: number }> {
  const normalizedUsername = username.trim().toLowerCase()
  const dbUser = await prisma.user.findUnique({ where: { username: normalizedUsername } })
  const isValid = await bcrypt.compare(password, dbUser?.password ?? DUMMY_HASH)

  if (dbUser && isValid) {
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
