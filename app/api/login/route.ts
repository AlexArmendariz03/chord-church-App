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
    const { username, password } = (await request.json()) as { username?: unknown; password?: unknown }

    if (typeof username !== "string" || typeof password !== "string" || !username.trim() || !password) {
      return errorResponse("Faltan campos obligatorios", 400)
    }

    if (username.length > MAX_FIELD_LENGTH || password.length > MAX_FIELD_LENGTH) {
      return errorResponse("Usuario o contraseña incorrectos", 401)
    }

    const normalizedUsername = username.trim().toLowerCase()
    const ip = clientIp(request)
    const minutes = blockedMinutes(normalizedUsername, ip)
    if (minutes > 0) {
      return errorResponse(`Demasiados intentos. Vuelve a intentarlo en ${minutes} min.`, 429, { headers: { "Retry-After": String(minutes * 60) } })
    }

    const response = await loginUser({ username, password })

    if (response.status !== 200 || !response.role) {
      recordFailure(normalizedUsername, ip)
      return NextResponse.json({ message: response.message }, { status: response.status })
    }

    clearFailures(normalizedUsername, ip)
    const user = { username: normalizedUsername, role: response.role }
    if (request.headers.get(APP_CLIENT_HEADER) === "app") {
      const token = await signSession(user, APP_SESSION_MAX_AGE)
      return NextResponse.json({ message: response.message, role: response.role, username: user.username, token })
    }
    await setSessionCookie(user)
    return NextResponse.json({ message: response.message, role: response.role })
  } catch (error) {
    console.error(error)
    return errorResponse("Error del servidor", 500)
  }
}
