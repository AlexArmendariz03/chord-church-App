import { NextResponse } from "next/server"
import { prisma } from "@/shared/server/prisma"
import { parseServiceBody, type ServiceBody } from "@/features/services/server/service-input"
import { requireLeader, requireUser } from "@/shared/server/session"

// A service stays listed (and visible in "En curso") for this long after it starts.
const SERVICE_VISIBLE_AFTER_START_MS = 6 * 60 * 60 * 1000
// Past services: the most recent ones, newest first
const PAST_SERVICES_LIMIT = 50

export async function GET(req: Request) {
  if (!(await requireUser())) {
    return NextResponse.json({ message: "Tu sesión expiró. Vuelve a iniciar sesión." }, { status: 401 })
  }

  const cutoff = new Date(Date.now() - SERVICE_VISIBLE_AFTER_START_MS)
  const isPast = new URL(req.url).searchParams.get("periodo") === "anteriores"
  const services = await prisma.service.findMany({
    where: { eventDate: isPast ? { lt: cutoff } : { gte: cutoff } },
    orderBy: { eventDate: isPast ? "desc" : "asc" },
    ...(isPast ? { take: PAST_SERVICES_LIMIT } : {}),
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
    const parsed = await parseServiceBody((await req.json()) as ServiceBody)
    if (parsed.error !== undefined) {
      return NextResponse.json({ message: parsed.error }, { status: 400 })
    }
    const { songs, ...fields } = parsed.data

    const service = await prisma.service.create({
      data: {
        ...fields,
        songs: { create: songs }
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
