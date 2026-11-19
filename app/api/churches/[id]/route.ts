import { NextResponse } from "next/server"
import { Prisma } from "@/generated/prisma/client"
import { parseChurchName } from "@/features/churches/church-name"
import { findChurchSummary, renameChurch } from "@/features/churches/server/church-queries"
import { errorResponse, forbidden, handle } from "@/shared/server/http"
import { requirePermission } from "@/shared/server/session"

type RouteContext = {
  params: Promise<{ id: string }>
}

const ONLY_MASTER = "Solo el master puede administrar iglesias"

// Una iglesia con cuánto tiene (página de la iglesia)
export async function GET(_req: Request, context: RouteContext) {
  if (!(await requirePermission("manageChurches"))) return forbidden(ONLY_MASTER)
  return handle(async () => {
    const church = await findChurchSummary((await context.params).id)
    return church ? NextResponse.json(church) : errorResponse("Iglesia no encontrada", 404)
  }, { failed: "Error al cargar la iglesia" })
}

// Renombra una iglesia
export async function PUT(req: Request, context: RouteContext) {
  if (!(await requirePermission("manageChurches"))) return forbidden(ONLY_MASTER)

  return handle(async () => {
    const parsed = parseChurchName(((await req.json()) as { name?: unknown }).name)
    if (parsed.error !== undefined) return errorResponse(parsed.error, 400)
    try {
      return NextResponse.json(await renameChurch((await context.params).id, parsed.name))
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return errorResponse(`Ya existe la iglesia "${parsed.name}"`, 409)
      }
      throw error
    }
  }, { notFound: "Iglesia no encontrada", failed: "Error al renombrar la iglesia" })
}
