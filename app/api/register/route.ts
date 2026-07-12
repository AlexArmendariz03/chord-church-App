import { NextResponse } from "next/server"

export async function POST() {
  return NextResponse.json(
    { message: "El registro está deshabilitado. Usa las credenciales hardcodeadas de dirigente o músico." },
    { status: 405 }
  )
}
