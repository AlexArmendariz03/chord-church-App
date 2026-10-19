import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { prisma } from "@/shared/server/prisma"
import { parseServiceBody, type ServiceBody } from "@/features/services/server/service-input"
import { requireLeader } from "@/shared/server/session"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function PUT(req: Request, context: RouteContext) {
  const leader = await requireLeader()
  if (!leader) {
    return NextResponse.json({ message: "Solo el líder puede editar servicios" }, { status: 403 })
  }

  try {
    const { id } = await context.params
    const parsed = await parseServiceBody((await req.json()) as ServiceBody)
    if (parsed.error !== undefined) {
      return NextResponse.json({ message: parsed.error }, { status: 400 })
    }
    const { title, eventDate, songs } = parsed.data

    const [, service] = await prisma.$transaction([
      prisma.serviceSong.deleteMany({ where: { serviceId: id } }),
      prisma.service.update({
        where: { id },
        data: {
          title,
          eventDate,
          songs: { create: songs }
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
