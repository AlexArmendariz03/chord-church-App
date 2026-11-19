import { createUserResponse, listUsersResponse } from "@/features/users/server/user-responses"
import { forbidden } from "@/shared/server/http"
import { requirePermission } from "@/shared/server/session"

// Usuarios de la iglesia de la sesión. Para los de otra iglesia: /api/churches/[id]/users
const ONLY_MASTER = "Solo el master puede administrar usuarios"

export async function GET() {
  const user = await requirePermission("manageUsers")
  if (!user) return forbidden(ONLY_MASTER)
  return listUsersResponse(user.churchId)
}

// El usuario nuevo queda en la iglesia en la que está trabajando el master
export async function POST(req: Request) {
  const user = await requirePermission("manageUsers")
  if (!user) return forbidden(ONLY_MASTER)
  return createUserResponse(user.churchId, req)
}
