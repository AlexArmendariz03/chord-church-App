import { NextResponse } from "next/server"
import { demoServiceStore } from "@/shared/server/demo-data"

type CreateServiceBody = {
  title?: string
  eventDate?: string
  jubiloSongIds?: string[]
  adoracionSongIds?: string[]
}

export async function GET() {
  return NextResponse.json(demoServiceStore.listActive())
}

export async function POST(req: Request) {
  try {
    const { title, eventDate, jubiloSongIds = [], adoracionSongIds = [] }: CreateServiceBody = await req.json()
    const selectedIds = [...jubiloSongIds, ...adoracionSongIds]
    const parsedDate = eventDate ? new Date(eventDate) : null

    if (!title?.trim() || !parsedDate || Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json({ message: "Título y fecha del evento son obligatorios" }, { status: 400 })
    }

    if (jubiloSongIds.length !== 2 || adoracionSongIds.length !== 2 || new Set(selectedIds).size !== 4) {
      return NextResponse.json({ message: "Debes seleccionar exactamente 2 júbilo y 2 adoración" }, { status: 400 })
    }

    const songs = demoServiceStore.findSongsByIds(selectedIds)
    const validJubilo = songs.filter((song) => song.category === "jubilo" && jubiloSongIds.includes(song.id)).length
    const validAdoracion = songs.filter((song) => song.category === "adoracion" && adoracionSongIds.includes(song.id)).length

    if (validJubilo !== 2 || validAdoracion !== 2) {
      return NextResponse.json({ message: "La selección no coincide con los tipos de canción" }, { status: 400 })
    }

    const service = demoServiceStore.create({
      title: title.trim(),
      eventDate: parsedDate.toISOString(),
      jubiloSongIds,
      adoracionSongIds
    })

    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    console.error("Error creating demo service:", error)
    return NextResponse.json({ message: "Error al crear el servicio" }, { status: 500 })
  }
}
