import type { Prisma, Song, SongCategory as SchemaSongCategory } from "@/generated/prisma/client"
import type { Serialized } from "./serialized"

// Tipos de alabanzas y servicios tal como los recibe la interfaz. Salen del esquema de Prisma,
// así que un campo nuevo en la base aparece aquí solo. Cada vista pide solo lo que muestra.

export type SongCategory = SchemaSongCategory

// Una alabanza en las listas (Alabanzas y el formulario de servicios): sin la letra completa ni el
// payload del editor, solo el inicio de la letra
export const SONG_LIST_SELECT = {
  id: true,
  name: true,
  key: true,
  category: true,
  isYouth: true,
  isService: true
} as const satisfies Prisma.SongSelect

export type SongListItem = Serialized<Prisma.SongGetPayload<{ select: typeof SONG_LIST_SELECT }>> & {
  preview: string
}

// Una alabanza completa, para editarla (incluye el payload del editor de lienzo)
export type SongDetail = Serialized<Song>

// Un servicio con sus alabanzas en orden y la letra de cada una, para En curso
export const SERVICE_WITH_LYRICS = {
  songs: {
    orderBy: { position: "asc" },
    include: { song: { omit: { payload: true } } }
  }
} as const satisfies Prisma.ServiceInclude

// Lo que muestran las tarjetas de servicio: sin las letras
export const SERVICE_SUMMARY = {
  songs: {
    orderBy: { position: "asc" },
    include: { song: { select: SONG_LIST_SELECT } }
  }
} as const satisfies Prisma.ServiceInclude

export type ServiceWithSongs = Serialized<Prisma.ServiceGetPayload<{ include: typeof SERVICE_WITH_LYRICS }>>
export type ServiceSummary = Serialized<Prisma.ServiceGetPayload<{ include: typeof SERVICE_SUMMARY }>>
