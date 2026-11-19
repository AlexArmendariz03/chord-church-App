import { NextResponse } from "next/server"
import { findChurchSafely } from "@/features/churches/server/church-queries"
import { findAccountTheme } from "@/features/layout/server/theme-queries"
import { errorResponse } from "@/shared/server/http"
import { getSessionUser } from "@/shared/server/session"

// La sesión actual. Incluye el tema de la cuenta para que la app móvil lo aplique al abrir, y la
// iglesia con la que trabaja.
export async function GET() {
  const user = await getSessionUser()

  if (!user) {
    return errorResponse("No hay sesión activa", 401)
  }

  const [theme, church] = await Promise.all([findAccountTheme(user.username), findChurchSafely(user.churchId)])
  return NextResponse.json({ ...user, theme, church })
}
