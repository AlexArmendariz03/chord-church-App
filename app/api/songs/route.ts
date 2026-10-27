import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { prisma } from "@/shared/server/prisma"
import { requirePermission, requireUser } from "@/shared/server/session"
import { trimLyrics } from "@/shared/utils/lyrics"

type SongCategory = "jubilo" | "adoracion"

const isSongCategory = (value: unknown): value is SongCategory => value === "jubilo" || value === "adoracion"

const MAX_LYRICS_LENGTH = 20000
const MAX_FIELD_LENGTH = 200
const MAX_PAYLOAD_LENGTH = 100000
const isText = (value: unknown, max: number): value is string =>
  typeof value === "string" && value.trim().length > 0 && value.length <= max

type CreateSongBody = {
  name?: unknown
  key?: unknown
  category?: unknown
  lyrics?: unknown
  payload?: unknown
  isYouth?: unknown
  isService?: unknown
}

export async function GET() {
  if (!(await requireUser())) {
    return NextResponse.json({ message: "Tu sesión expiró. Vuelve a iniciar sesión." }, { status: 401 })
  }

  const songs = await prisma.song.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }]
  })
  return NextResponse.json(songs)
}

export async function POST(req: Request) {
  const leader = await requirePermission("manageSongs")
  if (!leader) {
    return NextResponse.json({ message: "Solo el líder puede crear alabanzas" }, { status: 403 })
  }

  try {
    const { name, key, category, lyrics, payload, isYouth, isService }: CreateSongBody = await req.json()

    if (!isText(name, MAX_FIELD_LENGTH) || !isText(key, MAX_FIELD_LENGTH) || !isText(lyrics, MAX_LYRICS_LENGTH) || !isSongCategory(category)) {
      return NextResponse.json({ message: "Nombre, tono, tipo y letra son obligatorios" }, { status: 400 })
    }

    if (payload !== undefined && JSON.stringify(payload).length > MAX_PAYLOAD_LENGTH) {
      return NextResponse.json({ message: "La alabanza es demasiado grande" }, { status: 400 })
    }

    const song = await prisma.song.create({
      data: {
        name: name.trim(),
        key: key.trim(),
        category,
        lyrics: trimLyrics(lyrics),
        isYouth: isYouth === true,
        isService: isService === true,
        payload: payload === undefined ? Prisma.JsonNull : (payload as Prisma.InputJsonValue)
      }
    })

    return NextResponse.json(song, { status: 201 })
  } catch (error) {
    console.error("Error creating song:", error)
    return NextResponse.json({ message: "Error al guardar la canción" }, { status: 500 })
  }
}
