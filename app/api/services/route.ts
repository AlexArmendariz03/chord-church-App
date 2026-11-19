import { NextResponse } from "next/server"
import { parseServiceBody, type ServiceBody } from "@/features/services/server/service-input"
import { createService, listServicesWithLyrics, listServiceSummaries } from "@/features/services/server/service-queries"
import { errorResponse, forbidden, handle, unauthorized } from "@/shared/server/http"
import { requirePermission, requireUser } from "@/shared/server/session"

// ?periodo=anteriores para los que ya pasaron; sin él, los próximos (incluido el que está en curso).
// ?letras=1 agrega la letra de cada alabanza (En curso); sin él, solo lo que muestran las tarjetas.
export async function GET(req: Request) {
  const user = await requireUser()
  if (!user) return unauthorized()

  const params = new URL(req.url).searchParams
  const period = params.get("periodo") === "anteriores" ? "past" : "upcoming"
  const list = params.get("letras") === "1" ? listServicesWithLyrics : listServiceSummaries
  return handle(async () => NextResponse.json(await list(user.churchId, period)), { failed: "Error al cargar los servicios" })
}

export async function POST(req: Request) {
  const user = await requirePermission("manageServices")
  if (!user) return forbidden("Solo el líder puede crear servicios")

  return handle(async () => {
    const parsed = await parseServiceBody(user.churchId, (await req.json()) as ServiceBody)
    if (parsed.error !== undefined) return errorResponse(parsed.error, 400)
    return NextResponse.json(await createService(user.churchId, parsed.data), { status: 201 })
  }, { failed: "Error al crear el servicio" })
}
