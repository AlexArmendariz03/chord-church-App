import { NextResponse } from "next/server"
import { getSessionUser } from "@/shared/server/session"

export async function GET() {
  const user = await getSessionUser()

  if (!user) {
    return NextResponse.json({ message: "No hay sesión activa" }, { status: 401 })
  }

  return NextResponse.json(user)
}
