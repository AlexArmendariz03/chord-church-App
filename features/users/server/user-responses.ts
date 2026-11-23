import "server-only"
import { NextResponse } from "next/server"
import { Prisma } from "@/generated/prisma/client"
import { errorResponse, handle } from "@/shared/server/http"
import type { SessionUser } from "@/shared/server/session"
import { isSessionAccount } from "@/features/auth/server/session-account"
import { parseNewUser, parseUserUpdate, type NewUserBody, type UserUpdateBody } from "./user-input"
import { createUser, findUser, listUsers, updateUser } from "./user-queries"

// Lo que hacen las rutas de usuarios, para una iglesia dada. Las usan /api/users (la iglesia de la
// sesión) y /api/churches/[id]/users (cualquier iglesia, solo el master), así las dos responden igual.
// Cada ruta revisa el permiso antes de llamar aquí.

const NOT_FOUND = "Usuario no encontrado"

export const listUsersResponse = (churchId: string) =>
  handle(async () => NextResponse.json(await listUsers(churchId)), { failed: "Error al cargar los usuarios" })

export const createUserResponse = (churchId: string, req: Request) =>
  handle(async () => {
    const parsed = parseNewUser((await req.json()) as NewUserBody)
    if (parsed.error !== undefined) return errorResponse(parsed.error, 400)
    try {
      return NextResponse.json(await createUser(churchId, parsed.data), { status: 201 })
    } catch (error) {
      // El nombre de usuario es único dentro de la iglesia (en otra iglesia sí puede repetirse)
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return errorResponse(`Ya existe el usuario "${parsed.data.username}" en esta iglesia`, 409)
      }
      throw error
    }
  }, { failed: "Error al crear el usuario" })

// Cambia el rol o restablece la contraseña de un usuario de esa iglesia
export const updateUserResponse = (churchId: string, sessionUser: SessionUser, rawId: string, req: Request) =>
  handle(async () => {
    const id = Number(rawId)
    if (!Number.isInteger(id)) return errorResponse(NOT_FOUND, 404)
    const parsed = parseUserUpdate((await req.json()) as UserUpdateBody)
    if (parsed.error !== undefined) return errorResponse(parsed.error, 400)

    const target = await findUser(churchId, id)
    if (!target) return errorResponse(NOT_FOUND, 404)
    // Quitarse el rol a uno mismo dejaría la app sin quien administre usuarios
    if (isSessionAccount(sessionUser, { ...target, churchId }) && parsed.data.role && parsed.data.role !== target.role) {
      return errorResponse("No puedes cambiar tu propio rol", 400)
    }
    // Un master solo cambia de rol con el script create-user
    if (target.role === "master" && parsed.data.role) {
      return errorResponse("El rol de un master no se cambia desde la app", 400)
    }
    return NextResponse.json(await updateUser(churchId, id, parsed.data))
  }, { notFound: NOT_FOUND, failed: "Error al guardar el usuario" })
