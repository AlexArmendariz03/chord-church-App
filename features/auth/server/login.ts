import bcrypt from "bcryptjs"
import { prisma } from "@/shared/server/prisma"

export type UserRole = "leader" | "musico"

type LoginParams = {
  username: string
  password: string
}

type StaticUser = LoginParams & {
  role: UserRole
  displayName: string
}

export const STATIC_USERS: StaticUser[] = [
  {
    username: "leader",
    password: "leader123",
    role: "leader",
    displayName: "Líder"
  },
  {
    username: "musico",
    password: "musico123",
    role: "musico",
    displayName: "Músico"
  }
]

export async function loginUser({ username, password }: LoginParams): Promise<{ message: string; role?: UserRole; status: number }> {
  const normalizedUsername = username.trim().toLowerCase()
  const staticUser = STATIC_USERS.find(candidate => candidate.username === normalizedUsername && candidate.password === password)

  if (staticUser) {
    return {
      status: 200,
      message: `Inicio de sesión exitoso (${staticUser.displayName})`,
      role: staticUser.role
    }
  }

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
    message: "Credenciales incorrectas. Usa leader/leader123 o musico/musico123"
  }
}
