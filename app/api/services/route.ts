import { NextResponse } from "next/server"
import { prisma } from "@/shared/server/prisma"
import { requireLeader } from "@/shared/server/session"

type CreateServiceBody = {
  title?: string
  eventDate?: string
  jubiloSongIds?: string[]
  adoracionSongIds?: string[]
}

export async function GET() {
  const services = await prisma.service.findMany({
    where: { eventDate: { gte: new Date() } },
    orderBy: { eventDate: "asc" },
    include: {
      songs: {
        orderBy: { position: "asc" },
        include: { song: true }
      }
    }
  })

  return NextResponse.json(services)
}

export async function POST(req: Request) {
  const leader = await requireLeader()
  if (!leader) {
    return NextResponse.json({ message: "Solo el líder puede crear servicios" }, { status: 403 })
  }

  try {
    const { title, eventDate, jubiloSongIds = [], adoracionSongIds = [] }: CreateServiceBody = await req.json()
    const selectedIds = [...jubiloSongIds, ...adoracionSongIds]
    const parsedDate = eventDate ? new Date(eventDate) : null

    if (!title?.trim() || !parsedDate || Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json({ message: "Título y fecha del evento son obligatorios" }, { status: 400 })
    }

    if (jubiloSongIds.length < 1 || adoracionSongIds.length < 1 || new Set(selectedIds).size !== selectedIds.length) {
      return NextResponse.json({ message: "Selecciona al menos 1 canción de júbilo y 1 de adoración, sin repetir" }, { status: 400 })
    }

    const songs = await prisma.song.findMany({ where: { id: { in: selectedIds } } })
    const validJubilo = songs.filter(song => song.category === "jubilo" && jubiloSongIds.includes(song.id)).length
    const validAdoracion = songs.filter(song => song.category === "adoracion" && adoracionSongIds.includes(song.id)).length

    if (validJubilo !== jubiloSongIds.length || validAdoracion !== adoracionSongIds.length) {
      return NextResponse.json({ message: "La selección no coincide con los tipos de canción" }, { status: 400 })
    }

    const service = await prisma.service.create({
      data: {
        title: title.trim(),
        eventDate: parsedDate,
        songs: {
          create: [
            ...jubiloSongIds.map((songId, index) => ({ songId, category: "jubilo" as const, position: index + 1 })),
            ...adoracionSongIds.map((songId, index) => ({ songId, category: "adoracion" as const, position: jubiloSongIds.length + index + 1 }))
          ]
        }
      },
      include: {
        songs: {
          orderBy: { position: "asc" },
          include: { song: true }
        }
      }
    })

    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    console.error("Error creating service:", error)
    return NextResponse.json({ message: "Error al crear el servicio" }, { status: 500 })
  }
}
