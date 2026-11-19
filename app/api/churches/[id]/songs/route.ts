import { findChurch } from "@/features/churches/server/church-queries"
import { createSongResponse, listSongsResponse } from "@/features/songs/server/song-responses"
import { errorResponse, forbidden } from "@/shared/server/http"
import { requirePermission } from "@/shared/server/session"

type RouteContext = {
  params: Promise<{ id: string }>
}

// Cancionero de cualquier iglesia, para el master desde la página de esa iglesia, sin cambiar la
// iglesia de su sesión
const ONLY_MASTER = "Solo el master puede administrar iglesias"
const NOT_FOUND = "Iglesia no encontrada"

export async function GET(_req: Request, context: RouteContext) {
  if (!(await requirePermission("manageChurches"))) return forbidden(ONLY_MASTER)
  const church = await findChurch((await context.params).id)
  return church ? listSongsResponse(church.id) : errorResponse(NOT_FOUND, 404)
}

export async function POST(req: Request, context: RouteContext) {
  if (!(await requirePermission("manageChurches"))) return forbidden(ONLY_MASTER)
  const church = await findChurch((await context.params).id)
  return church ? createSongResponse(church.id, req) : errorResponse(NOT_FOUND, 404)
}
