import type { Prisma } from "@/generated/prisma/client"
import { SONG_LIST_SELECT } from "@/features/songs/server/song-selects"

// Qué pide cada vista de servicios a la base. Los tipos de features/services/types.ts salen de aquí

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
