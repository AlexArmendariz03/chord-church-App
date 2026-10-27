import { NextResponse } from "next/server"
import { parseSongBody, type SongBody } from "@/features/songs/server/song-input"
import { deleteSong, findSong, updateSong } from "@/features/songs/server/song-queries"
import { errorResponse, forbidden, handle, unauthorized } from "@/shared/server/http"
import { requirePermission, requireUser } from "@/shared/server/session"

type RouteContext = {
  params: Promise<{ id: string }>
}

const NOT_FOUND = "Alabanza no encontrada"

export async function GET(_req: Request, context: RouteContext) {
  if (!(await requireUser())) return unauthorized()

  return handle(async () => {
    const song = await findSong((await context.params).id)
    return song ? NextResponse.json(song) : errorResponse(NOT_FOUND, 404)
  }, { failed: "Error al cargar la alabanza" })
}

export async function PUT(req: Request, context: RouteContext) {
  if (!(await requirePermission("manageSongs"))) return forbidden("Solo el líder puede editar alabanzas")

  return handle(async () => {
    const parsed = parseSongBody((await req.json()) as SongBody)
    if (parsed.error !== undefined) return errorResponse(parsed.error, 400)
    return NextResponse.json(await updateSong((await context.params).id, parsed.data))
  }, { notFound: NOT_FOUND, failed: "Error al actualizar la alabanza" })
}

export async function DELETE(_req: Request, context: RouteContext) {
  if (!(await requirePermission("manageSongs"))) return forbidden("Solo el líder puede eliminar alabanzas")

  return handle(async () => {
    await deleteSong((await context.params).id)
    return NextResponse.json({ message: "Alabanza eliminada correctamente" })
  }, { notFound: NOT_FOUND, failed: "Error al eliminar la alabanza" })
}
