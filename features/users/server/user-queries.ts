import "server-only"
import bcrypt from "bcryptjs"
import type { Role } from "@/shared/auth/permissions"
import { prisma } from "@/shared/server/prisma"
import type { UserListItem } from "@/features/users/types"

// Consultas de usuarios; las rutas de la API solo validan y llaman a estas funciones.
// La contraseña se guarda cifrada (bcrypt, como el script create-user) y nunca sale de aquí.

const USER_SELECT = { id: true, username: true, role: true } as const
const hash = (password: string) => bcrypt.hash(password, 10)

export const listUsers = (): Promise<UserListItem[]> =>
  prisma.user.findMany({ select: USER_SELECT, orderBy: { username: "asc" } })

export const findUser = (id: number) => prisma.user.findUnique({ where: { id }, select: USER_SELECT })

export const createUser = async ({ username, password, role }: { username: string; password: string; role: Role }) =>
  prisma.user.create({ data: { username, role, password: await hash(password) }, select: USER_SELECT })

export const updateUser = async (id: number, { password, role }: { password?: string; role?: Role }) =>
  prisma.user.update({
    where: { id },
    data: { ...(role ? { role } : {}), ...(password ? { password: await hash(password) } : {}) },
    select: USER_SELECT
  })
