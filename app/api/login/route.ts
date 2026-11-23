import { NextResponse } from "next/server"
import { loginUser } from "@/features/auth/server/login"
import { blockedMinutes, clearFailures, clientIp, recordFailure } from "@/features/auth/server/login-attempts"
import { errorResponse } from "@/shared/server/http"
import { setSessionCookie } from "@/shared/server/session"
import { APP_SESSION_MAX_AGE, signSession } from "@/shared/server/session-token"

const MAX_FIELD_LENGTH = 200
// La app móvil se identifica con este encabezado y recibe el token en la respuesta, no en una cookie
const APP_CLIENT_HEADER = "x-chord-client"

export async function POST(request: Request) {
  try {
    const { username, password, churchId } = (await request.json()) as { username?: unknown; password?: unknown; churchId?: unknown }

    if (typeof username !== "string" || typeof password !== "string" || !username.trim() || !password) {
      return errorResponse("Faltan campos obligatorios", 400)
    }

    const badChurch = churchId !== undefined && (typeof churchId !== "string" || churchId.length > MAX_FIELD_LENGTH)
    if (username.length > MAX_FIELD_LENGTH || password.length > MAX_FIELD_LENGTH || badChurch) {
      return errorResponse("Usuario o contraseña incorrectos", 401)
    }

    const normalizedUsername = username.trim().toLowerCase()
    const ip = clientIp(request)
    const minutes = blockedMinutes(normalizedUsername, ip)
    if (minutes > 0) {
      return errorResponse(`Demasiados intentos. Vuelve a intentarlo en ${minutes} min.`, 429, { headers: { "Retry-After": String(minutes * 60) } })
    }

    const response = await loginUser({ username, password, churchId: typeof churchId === "string" && churchId ? churchId : undefined })

    if (response.status === 409) {
      // La contraseña sí era correcta: no cuenta como intento fallido
      return NextResponse.json({ message: response.message, churches: response.churches }, { status: 409 })
    }
    if (response.status !== 200) {
      recordFailure(normalizedUsername, ip)
      return NextResponse.json({ message: response.message }, { status: response.status })
    }

    clearFailures(normalizedUsername, ip)
    const { user } = response
    if (request.headers.get(APP_CLIENT_HEADER) === "app") {
      const token = await signSession(user, APP_SESSION_MAX_AGE)
      return NextResponse.json({ message: response.message, role: user.role, username: user.username, token })
    }
    await setSessionCookie(user)
    return NextResponse.json({ message: response.message, role: user.role })
  } catch (error) {
    console.error(error)
    return errorResponse("Error del servidor", 500)
  }
}
