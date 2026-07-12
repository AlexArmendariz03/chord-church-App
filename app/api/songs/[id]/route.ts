import { NextResponse } from "next/server"
import { prisma } from "@/shared/server/prisma"
import { Prisma, type SongCategory } from "@prisma/client"

const isSongCategory = (value: unknown): value is SongCategory => value === "jubilo" || value === "adoracion"

type RouteContext = {
  params: Promise<{ id: string }>
}

type UpdateSongBody = {
  name?: string
  key?: string
  category?: unknown
  lyrics?: string
  payload?: unknown
}

export async function PUT(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const { name, key, category, lyrics, payload }: UpdateSongBody = await req.json()

    if (!name?.trim() || !key?.trim() || !lyrics?.trim() || !isSongCategory(category)) {
      return NextResponse.json({ message: "Nombre, tono, tipo y letra son obligatorios" }, { status: 400 })
    }

    const songData: Prisma.SongUpdateInput = {
      name: name.trim(),
      key: key.trim(),
      category,
      lyrics: lyrics.trim()
    }

    if (payload !== undefined) {
      songData.payload = payload === null ? Prisma.JsonNull : (payload as Prisma.InputJsonValue)
    }

    const song = await prisma.song.update({
      where: { id },
      data: songData
    })

    return NextResponse.json(song)
  } catch (error) {
    console.error("Error updating song:", error)
    return NextResponse.json({ message: "Error al actualizar la alabanza" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    await prisma.song.delete({ where: { id } })
    return NextResponse.json({ message: "Alabanza eliminada correctamente" })
  } catch (error) {
    console.error("Error deleting song:", error)
    return NextResponse.json({ message: "Error al eliminar la alabanza" }, { status: 500 })
  }
}
