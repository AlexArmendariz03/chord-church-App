import { NextResponse } from "next/server"
import { parseSongBody, type SongBody } from "@/features/songs/server/song-input"
import { createSong, listSongs } from "@/features/songs/server/song-queries"
import { errorResponse, forbidden, handle, unauthorized } from "@/shared/server/http"
import { requirePermission, requireUser } from "@/shared/server/session"

export async function GET() {
  if (!(await requireUser())) return unauthorized()
  return handle(async () => NextResponse.json(await listSongs()), { failed: "Error al cargar las alabanzas" })
}

export async function POST(req: Request) {
  if (!(await requirePermission("manageSongs"))) return forbidden("Solo el líder puede crear alabanzas")

  return handle(async () => {
    const parsed = parseSongBody((await req.json()) as SongBody)
    if (parsed.error !== undefined) return errorResponse(parsed.error, 400)
    return NextResponse.json(await createSong(parsed.data), { status: 201 })
  }, { failed: "Error al guardar la canción" })
}
