import { prisma } from "@/shared/server/prisma"

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

type ParsedService =
  | { error: string }
  | {
      error?: undefined
      data: {
        title: string
        eventDate: Date
        prayerGuide: string | null
        announcements: string | null
        songs: Array<{ songId: string; category: "jubilo" | "adoracion"; position: number; isOffering: boolean }>
      }
    }

// Empty or whitespace-only text is stored as null
const optionalText = (value: unknown) => (typeof value === "string" && value.trim() ? value.trim() : null)

// Shared by create (POST) and edit (PUT): validates the body and builds the ordered song list
// júbilo → adoración → ofrenda
export async function parseServiceBody(body: ServiceBody): Promise<ParsedService> {
  const { title, eventDate, jubiloSongIds = [], adoracionSongIds = [] } = body
  const offeringSongId = body.offeringSongId || null
  const selectedIds = [...jubiloSongIds, ...adoracionSongIds, ...(offeringSongId ? [offeringSongId] : [])]
  const parsedDate = eventDate ? new Date(eventDate) : null

  if (!title?.trim() || !parsedDate || Number.isNaN(parsedDate.getTime())) {
    return { error: "Título y fecha del evento son obligatorios" }
  }

  if (jubiloSongIds.length < 1 || adoracionSongIds.length < 1 || new Set(selectedIds).size !== selectedIds.length) {
    return { error: "Selecciona al menos 1 canción de júbilo y 1 de adoración, sin repetir" }
  }

  const songs = await prisma.song.findMany({ where: { id: { in: selectedIds } }, select: { id: true, category: true } })
  const categoryOf = new Map(songs.map(song => [song.id, song.category]))
  const matches = (ids: string[], category: "jubilo" | "adoracion") => ids.every(id => categoryOf.get(id) === category)

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
      prayerGuide: optionalText(body.prayerGuide),
      announcements: optionalText(body.announcements),
      songs: ordered.map((song, index) => ({ ...song, position: index + 1 }))
    }
  }
}
