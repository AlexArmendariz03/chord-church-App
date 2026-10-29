import { NextResponse } from "next/server"
import { saveAccountTheme } from "@/features/layout/server/theme-queries"
import { isThemePreference } from "@/features/layout/theme"
import { errorResponse, handle, unauthorized } from "@/shared/server/http"
import { getSessionUser } from "@/shared/server/session"

// Guarda el tema elegido en la cuenta de la sesión; cualquier rol puede cambiar el suyo
export async function PUT(req: Request) {
  const user = await getSessionUser()
  if (!user) return unauthorized()

  return handle(async () => {
    const { theme } = (await req.json().catch(() => ({}))) as { theme?: unknown }
    if (!isThemePreference(theme)) return errorResponse("Tema inválido", 400)
    return NextResponse.json(await saveAccountTheme(user.username, theme))
  }, { notFound: "Usuario no encontrado", failed: "No se pudo guardar el tema" })
}
