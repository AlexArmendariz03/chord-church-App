import { NextResponse } from "next/server"
import { findChurchPrayers, saveChurchPrayers } from "@/features/churches/server/church-queries"
import { optionalText } from "@/features/services/server/service-input"
import { errorResponse, forbidden, handle } from "@/shared/server/http"
import { requirePermission } from "@/shared/server/session"

// Las peticiones de la iglesia de la sesión. Salen en el momento de oración de cada servicio
// que no traiga las suyas; quien arma los servicios las cambia desde el formulario
export async function GET() {
  const user = await requirePermission("manageServices")
  if (!user) return forbidden("Solo el líder puede ver las peticiones")

  return handle(async () => NextResponse.json(await findChurchPrayers(user.churchId)), { failed: "No se pudieron cargar las peticiones" })
}

export async function PUT(req: Request) {
  const user = await requirePermission("manageServices")
  if (!user) return forbidden("Solo el líder puede cambiar las peticiones")

  const body = (await req.json().catch(() => null)) as { prayerGuide?: unknown } | null
  if (!body || typeof body !== "object") return errorResponse("Peticiones inválidas", 400)

  return handle(async () => NextResponse.json(await saveChurchPrayers(user.churchId, { prayerGuide: optionalText(body.prayerGuide) })),
    { failed: "No se pudieron guardar las peticiones" })
}
