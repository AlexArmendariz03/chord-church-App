import { updateUserResponse } from "@/features/users/server/user-responses"
import { forbidden } from "@/shared/server/http"
import { requirePermission } from "@/shared/server/session"

type RouteContext = {
  params: Promise<{ id: string; userId: string }>
}

// Cambia el rol o restablece la contraseña de un usuario de esa iglesia; si el usuario es de otra,
// responde que no existe
export async function PUT(req: Request, context: RouteContext) {
  const sessionUser = await requirePermission("manageChurches")
  if (!sessionUser) return forbidden("Solo el master puede administrar iglesias")
  const { id, userId } = await context.params
  return updateUserResponse(id, sessionUser, userId, req)
}
