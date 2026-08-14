import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { prisma } from "@/shared/server/prisma"
import { requireLeader } from "@/shared/server/session"

type RouteContext = {
  params: Promise<{ id: string }>
}

type UpdateServiceBody = {
  title?: string
  eventDate?: string
  jubiloSongIds?: string[]
  adoracionSongIds?: string[]
}

export async function PUT(req: Request, context: RouteContext) {
  const leader = await requireLeader()
  if (!leader) {
    return NextResponse.json({ message: "Solo el líder puede editar servicios" }, { status: 403 })
  }

  try {
    const { id } = await context.params
    const { title, eventDate, jubiloSongIds = [], adoracionSongIds = [] }: UpdateServiceBody = await req.json()
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

    const [, service] = await prisma.$transaction([
      prisma.serviceSong.deleteMany({ where: { serviceId: id } }),
      prisma.service.update({
        where: { id },
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
    ])

    return NextResponse.json(service)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ message: "Servicio no encontrado" }, { status: 404 })
    }
    console.error("Error updating service:", error)
    return NextResponse.json({ message: "Error al actualizar el servicio" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  const leader = await requireLeader()
  if (!leader) {
    return NextResponse.json({ message: "Solo el líder puede eliminar servicios" }, { status: 403 })
  }

  try {
    const { id } = await context.params
    await prisma.service.delete({ where: { id } })
    return NextResponse.json({ message: "Servicio eliminado correctamente" })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ message: "Servicio no encontrado" }, { status: 404 })
    }
    console.error("Error deleting service:", error)
    return NextResponse.json({ message: "Error al eliminar el servicio" }, { status: 500 })
  }
}
