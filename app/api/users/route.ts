import { NextResponse } from "next/server"
import { Prisma } from "@/generated/prisma/client"
import { parseNewUser, type NewUserBody } from "@/features/users/server/user-input"
import { createUser, listUsers } from "@/features/users/server/user-queries"
import { errorResponse, forbidden, handle } from "@/shared/server/http"
import { requirePermission } from "@/shared/server/session"

const ONLY_MASTER = "Solo el master puede administrar usuarios"

export async function GET() {
  if (!(await requirePermission("manageUsers"))) return forbidden(ONLY_MASTER)
  return handle(async () => NextResponse.json(await listUsers()), { failed: "Error al cargar los usuarios" })
}

export async function POST(req: Request) {
  if (!(await requirePermission("manageUsers"))) return forbidden(ONLY_MASTER)

  return handle(async () => {
    const parsed = parseNewUser((await req.json()) as NewUserBody)
    if (parsed.error !== undefined) return errorResponse(parsed.error, 400)
    try {
      return NextResponse.json(await createUser(parsed.data), { status: 201 })
    } catch (error) {
      // El nombre de usuario es único
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return errorResponse(`Ya existe el usuario "${parsed.data.username}"`, 409)
      }
      throw error
    }
  }, { failed: "Error al crear el usuario" })
}
