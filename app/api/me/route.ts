import { NextResponse } from "next/server"
import { errorResponse } from "@/shared/server/http"
import { getSessionUser } from "@/shared/server/session"

export async function GET() {
  const user = await getSessionUser()

  if (!user) {
    return errorResponse("No hay sesión activa", 401)
  }

  return NextResponse.json(user)
}
