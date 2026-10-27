import type { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/shared/server/prisma"
import { SONG_LIST_SELECT, type SongListItem } from "@/types/services"

// Consultas de alabanzas; las rutas de la API solo validan y llaman a estas funciones

// Lo que alcanza a verse del inicio de la letra en la lista: una línea con puntos suspensivos.
// Los saltos y espacios se juntan como los mostraría la página.
const PREVIEW_LENGTH = 160
const lyricsPreview = (lyrics: string) => lyrics.replace(/\s+/g, " ").trim().slice(0, PREVIEW_LENGTH)

export const listSongs = async (): Promise<SongListItem[]> => {
  const songs = await prisma.song.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
    select: { ...SONG_LIST_SELECT, lyrics: true }
  })
  return songs.map(({ lyrics, ...song }) => ({ ...song, preview: lyricsPreview(lyrics) }))
}

export const findSong = (id: string) => prisma.song.findUnique({ where: { id } })

// Al guardar solo hace falta saber que salió bien: no se devuelve la letra ni el payload
export const createSong = (data: Prisma.SongCreateInput) => prisma.song.create({ data, select: SONG_LIST_SELECT })

export const updateSong = (id: string, data: Prisma.SongUpdateInput) => prisma.song.update({ where: { id }, data, select: SONG_LIST_SELECT })

export const deleteSong = (id: string) => prisma.song.delete({ where: { id }, select: { id: true } })
