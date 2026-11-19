import { NextResponse } from "next/server"
import { findChurch } from "@/features/churches/server/church-queries"
import { errorResponse, forbidden, handle } from "@/shared/server/http"
import { requirePermission, setSessionCookie } from "@/shared/server/session"
import { APP_SESSION_MAX_AGE, bearerToken, signSession } from "@/shared/server/session-token"

// El master cambia la iglesia con la que trabaja: la sesión se firma otra vez con esa iglesia, y desde
// ahí Alabanzas, Servicios, En curso y Usuarios muestran los de esa iglesia
export async function PUT(req: Request) {
  const user = await requirePermission("manageChurches")
  if (!user) return forbidden("Solo el master puede cambiar de iglesia")

  return handle(async () => {
    const { churchId } = (await req.json()) as { churchId?: unknown }
    const church = typeof churchId === "string" ? await findChurch(churchId) : null
    if (!church) return errorResponse("Iglesia no encontrada", 404)

    const nextUser = { ...user, churchId: church.id }
    // La app móvil manda su token en Authorization: recibe uno nuevo en lugar de una cookie
    if (bearerToken(req.headers.get("authorization"))) {
      return NextResponse.json({ church, token: await signSession(nextUser, APP_SESSION_MAX_AGE) })
    }
    await setSessionCookie(nextUser)
    return NextResponse.json({ church })
  }, { failed: "Error al cambiar de iglesia" })
}
