import { NextResponse } from "next/server"
import { loginUser } from "@/features/auth/server/login"
import { blockedMinutes, clearFailures, clientIp, recordFailure } from "@/features/auth/server/login-attempts"
import { setSessionCookie } from "@/shared/server/session"

const MAX_FIELD_LENGTH = 200

export async function POST(request: Request) {
  try {
    const { username, password } = (await request.json()) as { username?: unknown; password?: unknown }

    if (typeof username !== "string" || typeof password !== "string" || !username.trim() || !password) {
      return NextResponse.json({ message: "Faltan campos obligatorios" }, { status: 400 })
    }

    if (username.length > MAX_FIELD_LENGTH || password.length > MAX_FIELD_LENGTH) {
      return NextResponse.json({ message: "Usuario o contraseña incorrectos" }, { status: 401 })
    }

    const normalizedUsername = username.trim().toLowerCase()
    const ip = clientIp(request)
    const minutes = blockedMinutes(normalizedUsername, ip)
    if (minutes > 0) {
      return NextResponse.json(
        { message: `Demasiados intentos. Vuelve a intentarlo en ${minutes} min.` },
        { status: 429, headers: { "Retry-After": String(minutes * 60) } }
      )
    }

    const response = await loginUser({ username, password })

    if (response.status === 200 && response.role) {
      clearFailures(normalizedUsername, ip)
      await setSessionCookie({ username: normalizedUsername, role: response.role })
    } else {
      recordFailure(normalizedUsername, ip)
    }

    return NextResponse.json({ message: response.message, role: response.role }, { status: response.status })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Error del servidor" }, { status: 500 })
  }
}
