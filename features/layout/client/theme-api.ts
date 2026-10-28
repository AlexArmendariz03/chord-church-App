import { apiRequest } from "@/shared/client/api"
import type { ThemePreference } from "../theme"

export const themeApi = {
  save: (theme: ThemePreference) =>
    apiRequest<{ theme: ThemePreference }>("/api/me/theme", { method: "PUT", body: { theme }, fallback: "No se pudo guardar el tema" })
}
