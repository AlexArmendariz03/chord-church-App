import { NextResponse } from "next/server"
import { Prisma } from "@/generated/prisma/client"
import { parseChurchName } from "@/features/churches/church-name"
import { createChurch, listChurches } from "@/features/churches/server/church-queries"
import { errorResponse, forbidden, handle } from "@/shared/server/http"
import { requirePermission } from "@/shared/server/session"

const ONLY_MASTER = "Solo el master puede administrar iglesias"

export async function GET() {
  if (!(await requirePermission("manageChurches"))) return forbidden(ONLY_MASTER)
  return handle(async () => NextResponse.json(await listChurches()), { failed: "Error al cargar las iglesias" })
}

// Una iglesia nueva empieza vacía: sin usuarios, cancionero ni servicios
export async function POST(req: Request) {
  if (!(await requirePermission("manageChurches"))) return forbidden(ONLY_MASTER)

  return handle(async () => {
    const parsed = parseChurchName(((await req.json()) as { name?: unknown }).name)
    if (parsed.error !== undefined) return errorResponse(parsed.error, 400)
    try {
      return NextResponse.json(await createChurch(parsed.name), { status: 201 })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return errorResponse(`Ya existe la iglesia "${parsed.name}"`, 409)
      }
      throw error
    }
  }, { failed: "Error al crear la iglesia" })
}
