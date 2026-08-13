import bcrypt from "bcryptjs"
import { prisma } from "@/shared/server/prisma"
import { STATIC_USERS } from "./login"

type RegisterParams = {
  username: string
  password: string
}

const RESERVED_USERNAMES = new Set(STATIC_USERS.map(user => user.username))

export async function registerUser({ username, password }: RegisterParams): Promise<{ message: string; status: number }> {
  const normalizedUsername = username.trim().toLowerCase()

  if (!normalizedUsername || !password) {
    return { status: 400, message: "Usuario y contraseña son obligatorios" }
  }

  if (RESERVED_USERNAMES.has(normalizedUsername)) {
    return { status: 409, message: "El nombre de usuario ya está en uso" }
  }

  const existingUser = await prisma.user.findUnique({ where: { username: normalizedUsername } })
  if (existingUser) {
    return { status: 409, message: "El nombre de usuario ya está en uso" }
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  await prisma.user.create({
    data: {
      username: normalizedUsername,
      password: hashedPassword,
      role: "musico"
    }
  })

  return { status: 201, message: "Usuario registrado exitosamente" }
}
