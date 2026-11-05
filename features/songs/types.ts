import type { Prisma, Song, SongCategory as SchemaSongCategory } from "@/generated/prisma/client"
import type { Serialized } from "@/shared/types/serialized"
import type { SONG_LIST_SELECT } from "./server/song-selects"

// Tipos de alabanzas tal como los recibe la interfaz. Salen del esquema de Prisma,
// así que un campo nuevo en la base aparece aquí solo. Cada vista pide solo lo que muestra.

export type SongCategory = SchemaSongCategory

export type SongListItem = Serialized<Prisma.SongGetPayload<{ select: typeof SONG_LIST_SELECT }>> & {
  preview: string
}

// Una alabanza completa, para editarla (incluye el payload del editor de lienzo)
export type SongDetail = Serialized<Song>
