import { apiRequest } from "@/shared/client/api"
import type { SongDetail, SongListItem } from "@/types/services"
import type { SheetPayload } from "./editor/sheet-layout"

// Lo que el editor envía al guardar (lo valida features/songs/server/song-input.ts)
export type SongInput = {
  name: string
  key: string
  category: SongListItem["category"]
  isYouth: boolean
  isService: boolean
  lyrics: string
  // Dónde quedó cada bloque en la hoja del editor
  payload: SheetPayload
}

export const songsApi = {
  list: () => apiRequest<SongListItem[]>("/api/songs", { fallback: "No se pudieron cargar las alabanzas" }),
  get: (id: string) => apiRequest<SongDetail>(`/api/songs/${id}`, { fallback: "No se pudo cargar la alabanza" }),
  // Sin id crea una nueva
  save: (id: string | null, song: SongInput) =>
    apiRequest(id ? `/api/songs/${id}` : "/api/songs", { method: id ? "PUT" : "POST", body: song, fallback: "Error al guardar la canción" }),
  remove: (id: string) => apiRequest(`/api/songs/${id}`, { method: "DELETE", fallback: "Error al eliminar" })
}
