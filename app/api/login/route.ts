import { NextResponse } from "next/server"
import { loginUser } from "@/features/auth/server/login"
import { setSessionCookie } from "@/shared/server/session"

export async function POST(request: Request) {
  try {
    const { username, password } = (await request.json()) as { username?: string; password?: string }

    if (!username || !password) {
      return NextResponse.json({ message: "Faltan campos obligatorios" }, { status: 400 })
    }

    const response = await loginUser({ username, password })

    if (response.status === 200 && response.role) {
      await setSessionCookie({ username: username.trim().toLowerCase(), role: response.role })
    }

    return NextResponse.json({ message: response.message, role: response.role }, { status: response.status })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Error del servidor" }, { status: 500 })
  }
}
