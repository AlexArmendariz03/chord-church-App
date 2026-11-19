import { deleteSongResponse, getSongResponse, updateSongResponse } from "@/features/songs/server/song-responses"
import { forbidden, unauthorized } from "@/shared/server/http"
import { requirePermission, requireUser } from "@/shared/server/session"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(_req: Request, context: RouteContext) {
  const user = await requireUser()
  if (!user) return unauthorized()
  return getSongResponse(user.churchId, (await context.params).id)
}

export async function PUT(req: Request, context: RouteContext) {
  const user = await requirePermission("manageSongs")
  if (!user) return forbidden("Solo el líder puede editar alabanzas")
  return updateSongResponse(user.churchId, (await context.params).id, req)
}

export async function DELETE(_req: Request, context: RouteContext) {
  const user = await requirePermission("manageSongs")
  if (!user) return forbidden("Solo el líder puede eliminar alabanzas")
  return deleteSongResponse(user.churchId, (await context.params).id)
}
