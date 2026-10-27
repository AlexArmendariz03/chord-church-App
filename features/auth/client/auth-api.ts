import { apiRequest } from "@/shared/client/api"
import type { LoginFormData } from "@/types/auth"

export const authApi = {
  // Responde con el mensaje de bienvenida
  login: (credentials: LoginFormData) =>
    apiRequest<{ message: string }>("/api/login", { method: "POST", body: credentials, fallback: "Error al intentar iniciar sesión" }),
  logout: () => apiRequest("/api/logout", { method: "POST" })
}
