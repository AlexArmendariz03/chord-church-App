import "server-only"
import bcrypt from "bcryptjs"
import type { AssignableRole } from "@/shared/auth/permissions"
import { prisma } from "@/shared/server/prisma"
import type { UserListItem } from "@/features/users/types"

// Consultas de usuarios; las rutas de la API solo validan y llaman a estas funciones.
// La contraseña se guarda cifrada (bcrypt, como el script create-user) y nunca sale de aquí.
// Cada una recibe la iglesia de la sesión: solo se ven y se cambian los usuarios de esa iglesia.

const USER_SELECT = { id: true, username: true, role: true } as const
const hash = (password: string) => bcrypt.hash(password, 10)

export const listUsers = (churchId: string): Promise<UserListItem[]> =>
  prisma.user.findMany({ where: { churchId }, select: USER_SELECT, orderBy: { username: "asc" } })

export const findUser = (churchId: string, id: number) =>
  prisma.user.findFirst({ where: { id, churchId }, select: USER_SELECT })

export const createUser = async (churchId: string, { username, password, role }: { username: string; password: string; role: AssignableRole }) =>
  prisma.user.create({ data: { username, role, churchId, password: await hash(password) }, select: USER_SELECT })

export const updateUser = async (churchId: string, id: number, { password, role }: { password?: string; role?: AssignableRole }) =>
  prisma.user.update({
    where: { id, churchId },
    data: { ...(role ? { role } : {}), ...(password ? { password: await hash(password) } : {}) },
    select: USER_SELECT
  })
