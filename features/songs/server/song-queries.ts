import "server-only"
import type { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/shared/server/prisma"
import { SONG_LIST_SELECT } from "@/features/songs/server/song-selects"
import type { SongListItem } from "@/features/songs/types"

// Consultas de alabanzas; las rutas de la API solo validan y llaman a estas funciones.
// Cada una recibe la iglesia de la sesión: una iglesia nunca ve ni toca el cancionero de otra.

// Lo que alcanza a verse del inicio de la letra en la lista: una línea con puntos suspensivos.
// Los saltos y espacios se juntan como los mostraría la página.
const PREVIEW_LENGTH = 160
const lyricsPreview = (lyrics: string) => lyrics.replace(/\s+/g, " ").trim().slice(0, PREVIEW_LENGTH)

export const listSongs = async (churchId: string): Promise<SongListItem[]> => {
  const songs = await prisma.song.findMany({
    where: { churchId },
    orderBy: [{ category: "asc" }, { name: "asc" }],
    select: { ...SONG_LIST_SELECT, lyrics: true }
  })
  return songs.map(({ lyrics, ...song }) => ({ ...song, preview: lyricsPreview(lyrics) }))
}

export const findSong = (churchId: string, id: string) => prisma.song.findFirst({ where: { id, churchId } })

// Al guardar solo hace falta saber que salió bien: no se devuelve la letra ni el payload
export const createSong = (churchId: string, data: Prisma.SongCreateInput) =>
  prisma.song.create({ data: { ...data, church: { connect: { id: churchId } } }, select: SONG_LIST_SELECT })

// Con la iglesia en el where, una alabanza de otra iglesia responde como si no existiera (404)
export const updateSong = (churchId: string, id: string, data: Prisma.SongUpdateInput) =>
  prisma.song.update({ where: { id, churchId }, data, select: SONG_LIST_SELECT })

export const deleteSong = (churchId: string, id: string) => prisma.song.delete({ where: { id, churchId }, select: { id: true } })
