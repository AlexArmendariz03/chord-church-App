import type { SongCategory } from "@prisma/client"
import { prisma } from "@/shared/server/prisma"
import { isSingleWorshipEvent } from "@/shared/utils/service-rules"

export type ServiceBody = {
  title?: string
  eventDate?: string
  jubiloSongIds?: string[]
  adoracionSongIds?: string[]
  // Optional: one júbilo song played during the offering, after the worship set
  offeringSongId?: string | null
  // Leader's guide after the last song (optional, one item per line)
  prayerGuide?: string | null
  announcements?: string | null
}

// Un servicio ya validado, listo para guardarse (service-queries.ts)
export type ServiceInput = {
  title: string
  eventDate: Date
  prayerGuide: string | null
  announcements: string | null
  songs: Array<{ songId: string; category: SongCategory; position: number; isOffering: boolean }>
}

type ParsedService = { error: string } | { error?: undefined, data: ServiceInput }

const MAX_TITLE_LENGTH = 200
const MAX_GUIDE_LENGTH = 5000
const MAX_SONGS = 50

// Empty or whitespace-only text is stored as null
const optionalText = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim().slice(0, MAX_GUIDE_LENGTH) : null

const isIdList = (value: unknown): value is string[] =>
  Array.isArray(value) && value.length <= MAX_SONGS && value.every(id => typeof id === "string" && id.length <= 100)

// Shared by create (POST) and edit (PUT): validates the body and builds the ordered song list
// júbilo → adoración → ofrenda
export async function parseServiceBody(body: ServiceBody): Promise<ParsedService> {
  const { title, eventDate, jubiloSongIds = [], adoracionSongIds = [] } = body
  const offeringSongId = body.offeringSongId || null

  if (!isIdList(jubiloSongIds) || !isIdList(adoracionSongIds) || (offeringSongId !== null && typeof offeringSongId !== "string")) {
    return { error: "Selección de canciones inválida" }
  }
  const selectedIds = [...jubiloSongIds, ...adoracionSongIds, ...(offeringSongId ? [offeringSongId] : [])]
  const parsedDate = typeof eventDate === "string" && eventDate ? new Date(eventDate) : null

  if (typeof title !== "string" || !title.trim() || title.length > MAX_TITLE_LENGTH || !parsedDate || Number.isNaN(parsedDate.getTime())) {
    return { error: "Título y fecha del evento son obligatorios" }
  }

  // Studies, seminars and the weekend 9:45 gathering: one worship song, no júbilo, offering or leader's guide
  const singleWorship = isSingleWorshipEvent(title, parsedDate)
  if (singleWorship) {
    if (jubiloSongIds.length > 0 || adoracionSongIds.length !== 1 || offeringSongId) {
      return { error: "Este evento lleva solo 1 canción de adoración, sin júbilo ni ofrenda" }
    }
  } else if (jubiloSongIds.length < 1 || adoracionSongIds.length < 1) {
    return { error: "Selecciona al menos 1 canción de júbilo y 1 de adoración, sin repetir" }
  }

  if (new Set(selectedIds).size !== selectedIds.length) {
    return { error: "No repitas canciones en el servicio" }
  }

  const songs = await prisma.song.findMany({ where: { id: { in: selectedIds } }, select: { id: true, category: true } })
  const categoryOf = new Map(songs.map(song => [song.id, song.category]))
  const matches = (ids: string[], category: SongCategory) => ids.every(id => categoryOf.get(id) === category)

  if (!matches(jubiloSongIds, "jubilo") || !matches(adoracionSongIds, "adoracion")) {
    return { error: "La selección no coincide con los tipos de canción" }
  }

  if (offeringSongId && !matches([offeringSongId], "jubilo")) {
    return { error: "La canción de la ofrenda debe ser de júbilo" }
  }

  const ordered = [
    ...jubiloSongIds.map(songId => ({ songId, category: "jubilo" as const, isOffering: false })),
    ...adoracionSongIds.map(songId => ({ songId, category: "adoracion" as const, isOffering: false })),
    ...(offeringSongId ? [{ songId: offeringSongId, category: "jubilo" as const, isOffering: true }] : [])
  ]

  return {
    data: {
      title: title.trim(),
      eventDate: parsedDate,
      prayerGuide: singleWorship ? null : optionalText(body.prayerGuide),
      announcements: singleWorship ? null : optionalText(body.announcements),
      songs: ordered.map((song, index) => ({ ...song, position: index + 1 }))
    }
  }
}
