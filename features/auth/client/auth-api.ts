import { ApiError, apiRequest } from "@/shared/client/api"
import type { LoginChurchChoice, LoginFormData } from "@/features/auth/types"

export const authApi = {
  // Responde con el mensaje de bienvenida
  login: (credentials: LoginFormData) =>
    apiRequest<{ message: string }>("/api/login", { method: "POST", body: credentials, fallback: "Error al intentar iniciar sesión" }),
  logout: () => apiRequest("/api/logout", { method: "POST" })
}

// Las iglesias para elegir, si el login respondió que la cuenta existe en más de una
export const churchChoicesOf = (error: unknown): LoginChurchChoice[] | null => {
  if (!(error instanceof ApiError) || error.status !== 409) return null
  const churches = (error.data as { churches?: unknown } | null)?.churches
  return Array.isArray(churches) && churches.length > 1 ? churches as LoginChurchChoice[] : null
}
