import { NextResponse } from "next/server"
import { prisma } from "@/shared/server/prisma"

type CreateServiceBody = {
  title?: string
  eventDate?: string
  jubiloSongIds?: string[]
  adoracionSongIds?: string[]
}

const includeSongs = {
  songs: {
    orderBy: { position: "asc" as const },
    include: { song: true }
  }
}

export async function GET() {
  const now = new Date()
  const services = await prisma.service.findMany({
    where: { eventDate: { gte: now } },
    orderBy: { eventDate: "asc" },
    include: includeSongs
  })

  return NextResponse.json(services)
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

    const songs = await prisma.song.findMany({ where: { id: { in: selectedIds } } })
    const validJubilo = songs.filter((song) => song.category === "jubilo" && jubiloSongIds.includes(song.id)).length
    const validAdoracion = songs.filter((song) => song.category === "adoracion" && adoracionSongIds.includes(song.id)).length

    if (validJubilo !== 2 || validAdoracion !== 2) {
      return NextResponse.json({ message: "La selección no coincide con los tipos de canción" }, { status: 400 })
    }

    const service = await prisma.service.create({
      data: {
        title: title.trim(),
        eventDate: parsedDate,
        songs: {
          create: [
            ...jubiloSongIds.map((songId, index) => ({ songId, category: "jubilo" as const, position: index + 1 })),
            ...adoracionSongIds.map((songId, index) => ({ songId, category: "adoracion" as const, position: index + 3 }))
          ]
        }
      },
      include: includeSongs
    })

    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    console.error("Error creating service:", error)
    return NextResponse.json({ message: "Error al crear el servicio" }, { status: 500 })
  }
}
