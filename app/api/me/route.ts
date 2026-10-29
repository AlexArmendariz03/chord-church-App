import { NextResponse } from "next/server"
import { findAccountTheme } from "@/features/layout/server/theme-queries"
import { errorResponse } from "@/shared/server/http"
import { getSessionUser } from "@/shared/server/session"

// La sesión actual. Incluye el tema de la cuenta para que la app móvil lo aplique al abrir.
export async function GET() {
  const user = await getSessionUser()

  if (!user) {
    return errorResponse("No hay sesión activa", 401)
  }

  return NextResponse.json({ ...user, theme: await findAccountTheme(user.username) })
}
