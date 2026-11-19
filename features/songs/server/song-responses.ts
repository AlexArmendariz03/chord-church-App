import "server-only"
import { NextResponse } from "next/server"
import { errorResponse, handle } from "@/shared/server/http"
import { parseSongBody, type SongBody } from "./song-input"
import { createSong, deleteSong, findSong, listSongs, updateSong } from "./song-queries"

// Lo que hacen las rutas de alabanzas, para una iglesia dada. Las usan /api/songs (la iglesia de la
// sesión) y /api/churches/[id]/songs (cualquier iglesia, solo el master), así las dos responden igual.
// Cada ruta revisa el permiso antes de llamar aquí.

const NOT_FOUND = "Alabanza no encontrada"

export const listSongsResponse = (churchId: string) =>
  handle(async () => NextResponse.json(await listSongs(churchId)), { failed: "Error al cargar las alabanzas" })

export const getSongResponse = (churchId: string, id: string) =>
  handle(async () => {
    const song = await findSong(churchId, id)
    return song ? NextResponse.json(song) : errorResponse(NOT_FOUND, 404)
  }, { failed: "Error al cargar la alabanza" })

export const createSongResponse = (churchId: string, req: Request) =>
  handle(async () => {
    const parsed = parseSongBody((await req.json()) as SongBody)
    if (parsed.error !== undefined) return errorResponse(parsed.error, 400)
    return NextResponse.json(await createSong(churchId, parsed.data), { status: 201 })
  }, { failed: "Error al guardar la canción" })

export const updateSongResponse = (churchId: string, id: string, req: Request) =>
  handle(async () => {
    const parsed = parseSongBody((await req.json()) as SongBody)
    if (parsed.error !== undefined) return errorResponse(parsed.error, 400)
    return NextResponse.json(await updateSong(churchId, id, parsed.data))
  }, { notFound: NOT_FOUND, failed: "Error al actualizar la alabanza" })

export const deleteSongResponse = (churchId: string, id: string) =>
  handle(async () => {
    await deleteSong(churchId, id)
    return NextResponse.json({ message: "Alabanza eliminada correctamente" })
  }, { notFound: NOT_FOUND, failed: "Error al eliminar la alabanza" })
