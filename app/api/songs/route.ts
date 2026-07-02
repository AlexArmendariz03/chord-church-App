import { NextResponse } from "next/server"
import { prisma } from "@/shared/server/prisma"
import type { SongCategory } from "@prisma/client"

const isSongCategory = (value: unknown): value is SongCategory => value === "jubilo" || value === "adoracion"

type CreateSongBody = {
  name?: string
  key?: string
  category?: unknown
  lyrics?: string
  payload?: unknown
}

export async function GET() {
  const songs = await prisma.song.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] })
  return NextResponse.json(songs)
}

export async function POST(req: Request) {
  try {
    const { name, key, category, lyrics, payload }: CreateSongBody = await req.json()

    if (!name?.trim() || !key?.trim() || !lyrics?.trim() || !isSongCategory(category)) {
      return NextResponse.json({ message: "Nombre, tono, tipo y letra son obligatorios" }, { status: 400 })
    }

    const song = await prisma.song.create({
      data: {
        name: name.trim(),
        key: key.trim(),
        category,
        lyrics: lyrics.trim(),
        payload: payload ?? undefined
      }
    })

    return NextResponse.json(song, { status: 201 })
  } catch (error) {
    console.error("Error creating song:", error)
    return NextResponse.json({ message: "Error al guardar la canción" }, { status: 500 })
  }
}
