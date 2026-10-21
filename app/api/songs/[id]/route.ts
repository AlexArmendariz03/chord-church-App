import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { prisma } from "@/shared/server/prisma"
import { requireLeader, requireUser } from "@/shared/server/session"
import { trimLyrics } from "@/shared/utils/lyrics"

type SongCategory = "jubilo" | "adoracion"

const isSongCategory = (value: unknown): value is SongCategory => value === "jubilo" || value === "adoracion"

const MAX_LYRICS_LENGTH = 20000
const MAX_FIELD_LENGTH = 200
const MAX_PAYLOAD_LENGTH = 100000
const isText = (value: unknown, max: number): value is string =>
  typeof value === "string" && value.trim().length > 0 && value.length <= max

type RouteContext = {
  params: Promise<{ id: string }>
}

type UpdateSongBody = {
  name?: unknown
  key?: unknown
  category?: unknown
  lyrics?: unknown
  payload?: unknown
  isYouth?: unknown
}

export async function GET(_req: Request, context: RouteContext) {
  if (!(await requireUser())) {
    return NextResponse.json({ message: "Tu sesión expiró. Vuelve a iniciar sesión." }, { status: 401 })
  }

  try {
    const { id } = await context.params
    const song = await prisma.song.findUnique({ where: { id } })
    if (!song) return NextResponse.json({ message: "Alabanza no encontrada" }, { status: 404 })
    return NextResponse.json(song)
  } catch (error) {
    console.error("Error fetching song:", error)
    return NextResponse.json({ message: "Error al cargar la alabanza" }, { status: 500 })
  }
}

export async function PUT(req: Request, context: RouteContext) {
  const leader = await requireLeader()
  if (!leader) {
    return NextResponse.json({ message: "Solo el líder puede editar alabanzas" }, { status: 403 })
  }

  try {
    const { id } = await context.params
    const { name, key, category, lyrics, payload, isYouth }: UpdateSongBody = await req.json()

    if (!isText(name, MAX_FIELD_LENGTH) || !isText(key, MAX_FIELD_LENGTH) || !isText(lyrics, MAX_LYRICS_LENGTH) || !isSongCategory(category)) {
      return NextResponse.json({ message: "Nombre, tono, tipo y letra son obligatorios" }, { status: 400 })
    }

    if (payload !== undefined && JSON.stringify(payload).length > MAX_PAYLOAD_LENGTH) {
      return NextResponse.json({ message: "La alabanza es demasiado grande" }, { status: 400 })
    }

    const song = await prisma.song.update({
      where: { id },
      data: {
        name: name.trim(),
        key: key.trim(),
        category,
        lyrics: trimLyrics(lyrics),
        ...(typeof isYouth === "boolean" ? { isYouth } : {}),
        ...(payload === undefined ? {} : { payload: payload as Prisma.InputJsonValue })
      }
    })

    return NextResponse.json(song)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ message: "Alabanza no encontrada" }, { status: 404 })
    }
    console.error("Error updating song:", error)
    return NextResponse.json({ message: "Error al actualizar la alabanza" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  const leader = await requireLeader()
  if (!leader) {
    return NextResponse.json({ message: "Solo el líder puede eliminar alabanzas" }, { status: 403 })
  }

  try {
    const { id } = await context.params
    await prisma.song.delete({ where: { id } })
    return NextResponse.json({ message: "Alabanza eliminada correctamente" })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ message: "Alabanza no encontrada" }, { status: 404 })
    }
    console.error("Error deleting song:", error)
    return NextResponse.json({ message: "Error al eliminar la alabanza" }, { status: 500 })
  }
}
