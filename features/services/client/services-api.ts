import { apiRequest } from "@/shared/client/api"
import type { ChurchPrayers } from "@/features/churches/types"
import type { ServiceSummary, ServiceWithSongs } from "@/features/services/types"

// Lo que el formulario envía al guardar (lo valida features/services/server/service-input.ts)
export type ServiceInput = {
  title: string
  eventDate: string
  jubiloSongIds: string[]
  adoracionSongIds: string[]
  offeringSongId: string | null
  prayerGuide?: string | null
  announcements?: string | null
}

// Servicios de un rango de fechas y las alabanzas que usó cada uno
export type SongUsage = Array<{ id: string; eventDate: string; songIds: string[] }>

export const servicesApi = {
  // Para las tarjetas: sin las letras
  upcoming: () => apiRequest<ServiceSummary[]>("/api/services", { fallback: "No se pudieron cargar los servicios" }),
  past: () => apiRequest<ServiceSummary[]>("/api/services?periodo=anteriores", { fallback: "No se pudieron cargar los servicios anteriores" }),
  // Para En curso: con la letra de cada alabanza
  upcomingWithLyrics: () => apiRequest<ServiceWithSongs[]>("/api/services?letras=1", { fallback: "No se pudo cargar el servicio en curso" }),
  // Sin id crea uno nuevo
  save: (id: string | null, service: ServiceInput) =>
    apiRequest(id ? `/api/services/${id}` : "/api/services", { method: id ? "PUT" : "POST", body: service, fallback: "Error al guardar el servicio" }),
  remove: (id: string) => apiRequest(`/api/services/${id}`, { method: "DELETE", fallback: "Error al eliminar" }),
  // Las peticiones de la iglesia: el momento de oración de cada servicio que no traiga las suyas
  prayers: () => apiRequest<ChurchPrayers>("/api/services/prayers", { fallback: "No se pudieron cargar las peticiones" }),
  savePrayers: (prayers: ChurchPrayers) =>
    apiRequest<ChurchPrayers>("/api/services/prayers", { method: "PUT", body: prayers, fallback: "No se pudieron guardar las peticiones" }),
  usage: (from: Date, to: Date) =>
    apiRequest<SongUsage>(`/api/services/usage?${new URLSearchParams({ desde: from.toISOString(), hasta: to.toISOString() })}`)
}
