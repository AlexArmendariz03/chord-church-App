import { createSongResponse, listSongsResponse } from "@/features/songs/server/song-responses"
import { forbidden, unauthorized } from "@/shared/server/http"
import { requirePermission, requireUser } from "@/shared/server/session"

// Cancionero de la iglesia de la sesión. El de otra iglesia: /api/churches/[id]/songs
export async function GET() {
  const user = await requireUser()
  if (!user) return unauthorized()
  return listSongsResponse(user.churchId)
}

export async function POST(req: Request) {
  const user = await requirePermission("manageSongs")
  if (!user) return forbidden("Solo el líder puede crear alabanzas")
  return createSongResponse(user.churchId, req)
}
