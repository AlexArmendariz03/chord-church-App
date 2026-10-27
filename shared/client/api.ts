// Llamadas a la API desde el navegador. Todas responden JSON y, si algo falla, { message } con lo
// que hay que mostrar (shared/server/http.ts); aquí ese mensaje se convierte en un Error.

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
    this.name = "ApiError"
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE"
  // Se envía como JSON
  body?: unknown
  // Mensaje si la respuesta no trae uno (por ejemplo, sin conexión o un error del hosting)
  fallback?: string
}

export async function apiRequest<T>(url: string, { method = "GET", body, fallback = "Algo salió mal. Intenta de nuevo." }: RequestOptions = {}): Promise<T> {
  let response: Response
  try {
    response = await fetch(url, body === undefined ? { method } : {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })
  } catch {
    throw new ApiError("Sin conexión. Revisa tu internet e intenta de nuevo.", 0)
  }
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new ApiError(typeof data?.message === "string" ? data.message : fallback, response.status)
  return data as T
}

// El texto para el usuario de cualquier error atrapado en un catch
export const errorMessage = (error: unknown, fallback: string) => (error instanceof Error && error.message ? error.message : fallback)
