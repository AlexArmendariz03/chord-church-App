import { NextResponse } from "next/server"
import { songUsage } from "@/features/services/server/service-queries"
import { errorResponse, forbidden, handle } from "@/shared/server/http"
import { requirePermission } from "@/shared/server/session"

// Alcanza para un mes del calendario, y es lo bastante corto para que nadie descargue todo el historial de una vez
const MAX_RANGE_MS = 45 * 24 * 60 * 60 * 1000

// Qué alabanzas usó cada servicio entre `desde` y `hasta`, para que el formulario avise
// cuando una alabanza se repite mucho en el mismo mes
export async function GET(req: Request) {
  if (!(await requirePermission("manageServices"))) return forbidden("Solo el líder puede ver el uso de las alabanzas")

  const params = new URL(req.url).searchParams
  const from = new Date(params.get("desde") ?? "")
  const to = new Date(params.get("hasta") ?? "")
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to <= from || to.getTime() - from.getTime() > MAX_RANGE_MS) {
    return errorResponse("Rango de fechas inválido", 400)
  }

  return handle(async () => NextResponse.json(await songUsage(from, to)), { failed: "Error al revisar el uso de las alabanzas" })
}
