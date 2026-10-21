import bcrypt from "bcryptjs"
import { prisma } from "@/shared/server/prisma"

export type UserRole = "leader" | "musico"

type LoginParams = {
  username: string
  password: string
}

// Compared when the user doesn't exist, so the answer takes as long as a wrong password
const DUMMY_HASH = bcrypt.hashSync("chord-church-dummy-password", 10)

export async function loginUser({ username, password }: LoginParams): Promise<{ message: string; role?: UserRole; status: number }> {
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
