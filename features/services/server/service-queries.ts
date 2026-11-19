import "server-only"
import { prisma } from "@/shared/server/prisma"
import { pastServiceCutoff } from "@/features/services/service-rules"
import { SERVICE_SUMMARY, SERVICE_WITH_LYRICS } from "@/features/services/server/service-selects"
import type { ServiceInput } from "./service-input"

// Consultas de servicios; las rutas de la API solo validan y llaman a estas funciones.
// Cada una recibe la iglesia de la sesión: una iglesia nunca ve ni toca los servicios de otra.

// Anteriores: solo los más recientes, del más nuevo al más viejo
const PAST_SERVICES_LIMIT = 50

export type ServicePeriod = "upcoming" | "past"

const periodQuery = (churchId: string, period: ServicePeriod) => {
  const cutoff = pastServiceCutoff()
  const isPast = period === "past"
  return {
    where: { churchId, eventDate: isPast ? { lt: cutoff } : { gte: cutoff } },
    orderBy: { eventDate: isPast ? "desc" : "asc" },
    ...(isPast ? { take: PAST_SERVICES_LIMIT } : {})
  } as const
}

// Para las tarjetas (Inicio y Servicios): sin las letras
export const listServiceSummaries = (churchId: string, period: ServicePeriod) =>
  prisma.service.findMany({ ...periodQuery(churchId, period), include: SERVICE_SUMMARY })

// Para En curso: con la letra de cada alabanza
export const listServicesWithLyrics = (churchId: string, period: ServicePeriod) =>
  prisma.service.findMany({ ...periodQuery(churchId, period), include: SERVICE_WITH_LYRICS })

export const createService = (churchId: string, { songs, ...fields }: ServiceInput) =>
  prisma.service.create({
    data: { ...fields, churchId, songs: { create: songs } },
    include: SERVICE_SUMMARY
  })

// Las alabanzas se reemplazan completas, en la misma transacción, para que el orden quede tal cual se eligió.
// Si el servicio es de otra iglesia, el update no lo encuentra (404) y la transacción deshace el borrado.
export const updateService = async (churchId: string, id: string, { songs, ...fields }: ServiceInput) => {
  const [, service] = await prisma.$transaction([
    prisma.serviceSong.deleteMany({ where: { serviceId: id, service: { churchId } } }),
    prisma.service.update({
      where: { id, churchId },
      data: { ...fields, songs: { create: songs } },
      include: SERVICE_SUMMARY
    })
  ])
  return service
}

export const deleteService = (churchId: string, id: string) =>
  prisma.service.delete({ where: { id, churchId }, select: { id: true } })

// Qué alabanzas usó cada servicio en un rango de fechas (aviso de alabanzas repetidas en el mes)
export const songUsage = async (churchId: string, from: Date, to: Date) => {
  const services = await prisma.service.findMany({
    where: { churchId, eventDate: { gte: from, lt: to } },
    orderBy: { eventDate: "asc" },
    select: { id: true, eventDate: true, songs: { select: { songId: true } } }
  })
  return services.map(({ songs, ...service }) => ({ ...service, songIds: songs.map(song => song.songId) }))
}
