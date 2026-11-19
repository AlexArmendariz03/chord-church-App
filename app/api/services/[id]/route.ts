import { NextResponse } from "next/server"
import { parseServiceBody, type ServiceBody } from "@/features/services/server/service-input"
import { deleteService, updateService } from "@/features/services/server/service-queries"
import { errorResponse, forbidden, handle } from "@/shared/server/http"
import { requirePermission } from "@/shared/server/session"

type RouteContext = {
  params: Promise<{ id: string }>
}

const NOT_FOUND = "Servicio no encontrado"

export async function PUT(req: Request, context: RouteContext) {
  const user = await requirePermission("manageServices")
  if (!user) return forbidden("Solo el líder puede editar servicios")

  return handle(async () => {
    const parsed = await parseServiceBody(user.churchId, (await req.json()) as ServiceBody)
    if (parsed.error !== undefined) return errorResponse(parsed.error, 400)
    return NextResponse.json(await updateService(user.churchId, (await context.params).id, parsed.data))
  }, { notFound: NOT_FOUND, failed: "Error al actualizar el servicio" })
}

export async function DELETE(_req: Request, context: RouteContext) {
  const user = await requirePermission("manageServices")
  if (!user) return forbidden("Solo el líder puede eliminar servicios")

  return handle(async () => {
    await deleteService(user.churchId, (await context.params).id)
    return NextResponse.json({ message: "Servicio eliminado correctamente" })
  }, { notFound: NOT_FOUND, failed: "Error al eliminar el servicio" })
}
