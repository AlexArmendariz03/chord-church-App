import { NextResponse } from "next/server"
import { prisma } from "@/shared/server/prisma"
import { requirePermission } from "@/shared/server/session"

// Alcanza para un mes del calendario, y es lo bastante corto para que nadie descargue todo el historial de una vez
const MAX_RANGE_MS = 45 * 24 * 60 * 60 * 1000

// Qué alabanzas usó cada servicio entre `desde` y `hasta`, para que el formulario avise
// cuando una alabanza se repite mucho en el mismo mes
export async function GET(req: Request) {
  if (!(await requirePermission("manageServices"))) {
    return NextResponse.json({ message: "Solo el líder puede ver el uso de las alabanzas" }, { status: 403 })
  }

  const params = new URL(req.url).searchParams
  const from = new Date(params.get("desde") ?? "")
  const to = new Date(params.get("hasta") ?? "")
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to <= from || to.getTime() - from.getTime() > MAX_RANGE_MS) {
    return NextResponse.json({ message: "Rango de fechas inválido" }, { status: 400 })
  }

  const services = await prisma.service.findMany({
    where: { eventDate: { gte: from, lt: to } },
    orderBy: { eventDate: "asc" },
    select: { id: true, eventDate: true, songs: { select: { songId: true } } }
  })

  return NextResponse.json(services.map(({ songs, ...service }) => ({ ...service, songIds: songs.map(song => song.songId) })))
}
