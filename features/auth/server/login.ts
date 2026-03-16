import { prisma } from "@/shared/server/prisma"
import { verifyPassword } from "@/shared/server/password"

export type UserRole = "leader" | "musico"

type StaticUser = {
  username: string
  password: string
  role: UserRole
}

const STATIC_USERS: StaticUser[] = [
  {
    username: "leader",
    password: "leader123",
    role: "leader"
  },
  {
    username: "musico",
    password: "musico123",
    role: "musico"
  }
]

type LoginParams = {
  username: string
  password: string
}

export async function loginUser({ username, password }: LoginParams): Promise<{ message: string; role?: UserRole; status: number }> {
  const staticUser = STATIC_USERS.find(user => user.username === username)

  if (staticUser && staticUser.password === password) {
    return {
      status: 200,
      message: `Inicio de sesión exitoso (${staticUser.role})`,
      role: staticUser.role
    }
  }

  const user = await prisma.user.findUnique({
    where: { username }
  })

  if (!user) {
    return { status: 401, message: "Usuario no encontrado" }
  }

  const isPasswordValid = verifyPassword(password, user.password)

  if (!isPasswordValid) {
    return { status: 401, message: "Contraseña incorrecta" }
  }

  return { status: 200, message: "Inicio de sesión exitoso" }
}
