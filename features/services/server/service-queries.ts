import { prisma } from "@/shared/server/prisma"
import { pastServiceCutoff } from "@/shared/utils/service-rules"
import { SERVICE_WITH_SONGS } from "@/types/services"
import type { ServiceInput } from "./service-input"

// Consultas de servicios; las rutas de la API solo validan y llaman a estas funciones

// Anteriores: solo los más recientes, del más nuevo al más viejo
const PAST_SERVICES_LIMIT = 50

export type ServicePeriod = "upcoming" | "past"

export const listServices = (period: ServicePeriod) => {
  const cutoff = pastServiceCutoff()
  const isPast = period === "past"
  return prisma.service.findMany({
    where: { eventDate: isPast ? { lt: cutoff } : { gte: cutoff } },
    orderBy: { eventDate: isPast ? "desc" : "asc" },
    ...(isPast ? { take: PAST_SERVICES_LIMIT } : {}),
    include: SERVICE_WITH_SONGS
  })
}

export const createService = ({ songs, ...fields }: ServiceInput) =>
  prisma.service.create({
    data: { ...fields, songs: { create: songs } },
    include: SERVICE_WITH_SONGS
  })

// Las alabanzas se reemplazan completas, en la misma transacción, para que el orden quede tal cual se eligió
export const updateService = async (id: string, { songs, ...fields }: ServiceInput) => {
  const [, service] = await prisma.$transaction([
    prisma.serviceSong.deleteMany({ where: { serviceId: id } }),
    prisma.service.update({
      where: { id },
      data: { ...fields, songs: { create: songs } },
      include: SERVICE_WITH_SONGS
    })
  ])
  return service
}

export const deleteService = (id: string) => prisma.service.delete({ where: { id } })

// Qué alabanzas usó cada servicio en un rango de fechas (aviso de alabanzas repetidas en el mes)
export const songUsage = async (from: Date, to: Date) => {
  const services = await prisma.service.findMany({
    where: { eventDate: { gte: from, lt: to } },
    orderBy: { eventDate: "asc" },
    select: { id: true, eventDate: true, songs: { select: { songId: true } } }
  })
  return services.map(({ songs, ...service }) => ({ ...service, songIds: songs.map(song => song.songId) }))
}
