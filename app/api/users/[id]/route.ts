import { NextResponse } from "next/server"
import { parseUserUpdate, type UserUpdateBody } from "@/features/users/server/user-input"
import { findUser, updateUser } from "@/features/users/server/user-queries"
import { errorResponse, forbidden, handle } from "@/shared/server/http"
import { requirePermission } from "@/shared/server/session"

type RouteContext = {
  params: Promise<{ id: string }>
}

const NOT_FOUND = "Usuario no encontrado"

// Cambia el rol o restablece la contraseña de un usuario
export async function PUT(req: Request, context: RouteContext) {
  const sessionUser = await requirePermission("manageUsers")
  if (!sessionUser) return forbidden("Solo el master puede administrar usuarios")

  return handle(async () => {
    const id = Number((await context.params).id)
    if (!Number.isInteger(id)) return errorResponse(NOT_FOUND, 404)
    const parsed = parseUserUpdate((await req.json()) as UserUpdateBody)
    if (parsed.error !== undefined) return errorResponse(parsed.error, 400)

    const target = await findUser(id)
    if (!target) return errorResponse(NOT_FOUND, 404)
    // Quitarse el rol a uno mismo dejaría la app sin quien administre usuarios
    if (target.username === sessionUser.username && parsed.data.role && parsed.data.role !== target.role) {
      return errorResponse("No puedes cambiar tu propio rol", 400)
    }
    return NextResponse.json(await updateUser(id, parsed.data))
  }, { notFound: NOT_FOUND, failed: "Error al guardar el usuario" })
}
