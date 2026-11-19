import { deleteSongResponse, getSongResponse, updateSongResponse } from "@/features/songs/server/song-responses"
import { forbidden } from "@/shared/server/http"
import { requirePermission } from "@/shared/server/session"

type RouteContext = {
  params: Promise<{ id: string; songId: string }>
}

// Una alabanza del cancionero de esa iglesia; si es de otra, responde que no existe
const ONLY_MASTER = "Solo el master puede administrar iglesias"

export async function GET(_req: Request, context: RouteContext) {
  if (!(await requirePermission("manageChurches"))) return forbidden(ONLY_MASTER)
  const { id, songId } = await context.params
  return getSongResponse(id, songId)
}

export async function PUT(req: Request, context: RouteContext) {
  if (!(await requirePermission("manageChurches"))) return forbidden(ONLY_MASTER)
  const { id, songId } = await context.params
  return updateSongResponse(id, songId, req)
}

export async function DELETE(_req: Request, context: RouteContext) {
  if (!(await requirePermission("manageChurches"))) return forbidden(ONLY_MASTER)
  const { id, songId } = await context.params
  return deleteSongResponse(id, songId)
}
