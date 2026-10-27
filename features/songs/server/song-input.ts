import type { Prisma, SongCategory } from "@/generated/prisma/client"
import { trimLyrics } from "@/shared/utils/lyrics"

// Valida el cuerpo para crear (POST) y editar (PUT) una alabanza, como service-input.ts con los servicios

export type SongBody = {
  name?: unknown
  key?: unknown
  category?: unknown
  lyrics?: unknown
  // Lo que guarda el editor de lienzo (bloques de texto y su configuración)
  payload?: unknown
  isYouth?: unknown
  isService?: unknown
}

type ParsedSong =
  | { error: string }
  | { error?: undefined, data: Prisma.SongCreateInput }

const MAX_LYRICS_LENGTH = 20000
const MAX_FIELD_LENGTH = 200
const MAX_PAYLOAD_LENGTH = 100000

const isText = (value: unknown, max: number): value is string =>
  typeof value === "string" && value.trim().length > 0 && value.length <= max

const isSongCategory = (value: unknown): value is SongCategory => value === "jubilo" || value === "adoracion"

// Las etiquetas y el payload que no vienen se dejan como están: al crear toman su valor por defecto
// y al editar no se tocan
export function parseSongBody({ name, key, category, lyrics, payload, isYouth, isService }: SongBody): ParsedSong {
  if (!isText(name, MAX_FIELD_LENGTH) || !isText(key, MAX_FIELD_LENGTH) || !isText(lyrics, MAX_LYRICS_LENGTH) || !isSongCategory(category)) {
    return { error: "Nombre, tono, tipo y letra son obligatorios" }
  }

  if (payload !== undefined && JSON.stringify(payload).length > MAX_PAYLOAD_LENGTH) {
    return { error: "La alabanza es demasiado grande" }
  }

  return {
    data: {
      name: name.trim(),
      key: key.trim(),
      category,
      lyrics: trimLyrics(lyrics),
      ...(typeof isYouth === "boolean" ? { isYouth } : {}),
      ...(typeof isService === "boolean" ? { isService } : {}),
      ...(payload === undefined ? {} : { payload: payload as Prisma.InputJsonValue })
    }
  }
}
