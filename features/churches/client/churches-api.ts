import { apiRequest } from "@/shared/client/api"
import type { ChurchListItem, CurrentChurch } from "@/features/churches/types"

// Lo que usa la página Iglesias (solo el master)
export const churchesApi = {
  list: () => apiRequest<ChurchListItem[]>("/api/churches", { fallback: "No se pudieron cargar las iglesias" }),
  get: (id: string) => apiRequest<ChurchListItem>(`/api/churches/${id}`, { fallback: "No se pudo cargar la iglesia" }),
  create: (name: string) =>
    apiRequest<CurrentChurch>("/api/churches", { method: "POST", body: { name }, fallback: "Error al crear la iglesia" }),
  rename: (id: string, name: string) =>
    apiRequest<CurrentChurch>(`/api/churches/${id}`, { method: "PUT", body: { name }, fallback: "Error al renombrar la iglesia" }),
  // Cambia la iglesia de la sesión
  enter: (churchId: string) =>
    apiRequest<{ church: CurrentChurch }>("/api/me/church", { method: "PUT", body: { churchId }, fallback: "Error al cambiar de iglesia" })
}
