import { NextResponse } from "next/server"
import { parseServiceBody, type ServiceBody } from "@/features/services/server/service-input"
import { createService, listServices } from "@/features/services/server/service-queries"
import { errorResponse, forbidden, handle, unauthorized } from "@/shared/server/http"
import { requirePermission, requireUser } from "@/shared/server/session"

// ?periodo=anteriores para los que ya pasaron; sin él, los próximos (incluido el que está en curso)
export async function GET(req: Request) {
  if (!(await requireUser())) return unauthorized()

  const period = new URL(req.url).searchParams.get("periodo") === "anteriores" ? "past" : "upcoming"
  return handle(async () => NextResponse.json(await listServices(period)), { failed: "Error al cargar los servicios" })
}

export async function POST(req: Request) {
  if (!(await requirePermission("manageServices"))) return forbidden("Solo el líder puede crear servicios")

  return handle(async () => {
    const parsed = await parseServiceBody((await req.json()) as ServiceBody)
    if (parsed.error !== undefined) return errorResponse(parsed.error, 400)
    return NextResponse.json(await createService(parsed.data), { status: 201 })
  }, { failed: "Error al crear el servicio" })
}
