import { NextResponse } from "next/server"
import { demoSongStore, type DemoSongCategory } from "@/shared/server/demo-data"

const isSongCategory = (value: unknown): value is DemoSongCategory => value === "jubilo" || value === "adoracion"

type CreateSongBody = {
  name?: string
  key?: string
  category?: unknown
  lyrics?: string
  payload?: unknown
}

export async function GET() {
  return NextResponse.json(demoSongStore.list())
}

export async function POST(req: Request) {
  try {
    const { name, key, category, lyrics, payload }: CreateSongBody = await req.json()

    if (!name?.trim() || !key?.trim() || !lyrics?.trim() || !isSongCategory(category)) {
      return NextResponse.json({ message: "Nombre, tono, tipo y letra son obligatorios" }, { status: 400 })
    }

    const song = demoSongStore.create({
      name: name.trim(),
      key: key.trim(),
      category,
      lyrics: lyrics.trim(),
      payload
    })

    return NextResponse.json(song, { status: 201 })
  } catch (error) {
    console.error("Error creating demo song:", error)
    return NextResponse.json({ message: "Error al guardar la canción" }, { status: 500 })
  }
}
