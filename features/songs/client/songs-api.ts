import { apiRequest } from "@/shared/client/api"
import type { SongDetail, SongListItem } from "@/features/songs/types"
import type { SheetPayload } from "../sheet-layout"

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

// Sin iglesia, el cancionero de la iglesia de la sesión; con ella, el de esa iglesia (solo el master,
// desde la página de la iglesia)
export const songsApiFor = (churchId?: string) => {
  const base = churchId ? `/api/churches/${churchId}/songs` : "/api/songs"
  return {
    list: () => apiRequest<SongListItem[]>(base, { fallback: "No se pudieron cargar las alabanzas" }),
    get: (id: string) => apiRequest<SongDetail>(`${base}/${id}`, { fallback: "No se pudo cargar la alabanza" }),
    // Sin id crea una nueva
    save: (id: string | null, song: SongInput) =>
      apiRequest(id ? `${base}/${id}` : base, { method: id ? "PUT" : "POST", body: song, fallback: "Error al guardar la canción" }),
    remove: (id: string) => apiRequest(`${base}/${id}`, { method: "DELETE", fallback: "Error al eliminar" })
  }
}

export type SongsApi = ReturnType<typeof songsApiFor>

export const songsApi = songsApiFor()
