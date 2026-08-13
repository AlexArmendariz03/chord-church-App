import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { prisma } from "@/shared/server/prisma"
import { requireLeader } from "@/shared/server/session"

type SongCategory = "jubilo" | "adoracion"

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
  const leader = await requireLeader()
  if (!leader) {
    return NextResponse.json({ message: "Solo el líder puede editar alabanzas" }, { status: 403 })
  }

  try {
    const { id } = await context.params
    const { name, key, category, lyrics, payload }: UpdateSongBody = await req.json()

    if (!name?.trim() || !key?.trim() || !lyrics?.trim() || !isSongCategory(category)) {
      return NextResponse.json({ message: "Nombre, tono, tipo y letra son obligatorios" }, { status: 400 })
    }

    const song = await prisma.song.update({
      where: { id },
      data: {
        name: name.trim(),
        key: key.trim(),
        category,
        lyrics: lyrics.trim(),
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
