import { updateUserResponse } from "@/features/users/server/user-responses"
import { forbidden } from "@/shared/server/http"
import { requirePermission } from "@/shared/server/session"

type RouteContext = {
  params: Promise<{ id: string }>
}

// Cambia el rol o restablece la contraseña de un usuario de la iglesia de la sesión
export async function PUT(req: Request, context: RouteContext) {
  const sessionUser = await requirePermission("manageUsers")
  if (!sessionUser) return forbidden("Solo el master puede administrar usuarios")
  return updateUserResponse(sessionUser.churchId, sessionUser, (await context.params).id, req)
}
