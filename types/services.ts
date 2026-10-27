import type { Prisma, Song, SongCategory as SchemaSongCategory } from "@prisma/client"
import type { Serialized } from "./serialized"

// Tipos de alabanzas y servicios tal como los recibe la interfaz. Salen del esquema de Prisma,
// así que un campo nuevo en la base aparece aquí solo.

export type SongCategory = SchemaSongCategory

// El payload del editor de lienzo solo lo usa el editor, que lo lee aparte
export type SongWithMeta = Serialized<Omit<Song, "payload">>

// Un servicio con sus alabanzas en orden, como lo devuelve la API; las consultas usan esta misma forma
export const SERVICE_WITH_SONGS = {
  songs: {
    orderBy: { position: "asc" },
    include: { song: true }
  }
} as const satisfies Prisma.ServiceInclude

export type ServiceWithSongs = Serialized<Prisma.ServiceGetPayload<{ include: typeof SERVICE_WITH_SONGS }>>
