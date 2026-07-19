import { NextResponse } from "next/server"
import { demoSongStore, type DemoSongCategory } from "@/shared/server/demo-data"

const isSongCategory = (value: unknown): value is DemoSongCategory => value === "jubilo" || value === "adoracion"

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

    const song = demoSongStore.update(id, {
      name: name.trim(),
      key: key.trim(),
      category,
      lyrics: lyrics.trim(),
      ...(payload === undefined ? {} : { payload })
    })

    if (!song) return NextResponse.json({ message: "Alabanza no encontrada" }, { status: 404 })

    return NextResponse.json(song)
  } catch (error) {
    console.error("Error updating demo song:", error)
    return NextResponse.json({ message: "Error al actualizar la alabanza" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const deleted = demoSongStore.delete(id)
    if (!deleted) return NextResponse.json({ message: "Alabanza no encontrada" }, { status: 404 })
    return NextResponse.json({ message: "Alabanza eliminada correctamente" })
  } catch (error) {
    console.error("Error deleting demo song:", error)
    return NextResponse.json({ message: "Error al eliminar la alabanza" }, { status: 500 })
  }
}
