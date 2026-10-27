import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"

// Respuestas de la API: todas las de error llevan el mismo formato, { message }, que muestra la interfaz

export const errorResponse = (message: string, status: number, init?: ResponseInit) =>
  NextResponse.json({ message }, { ...init, status })

export const unauthorized = () => errorResponse("Tu sesión expiró. Vuelve a iniciar sesión.", 401)

export const forbidden = (message: string) => errorResponse(message, 403)

// El registro que se quería editar o eliminar ya no existe
const isNotFound = (error: unknown) => error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025"

type HandleMessages = {
  // Si se da, un registro inexistente responde 404 con este mensaje
  notFound?: string
  // Lo que ve el usuario si algo falla de forma inesperada (500); el detalle va al log
  failed: string
}

// Corre el cuerpo de una ruta y convierte sus errores en respuestas, para no repetir try/catch en cada una
export const handle = async (action: () => Promise<Response>, { notFound, failed }: HandleMessages) => {
  try {
    return await action()
  } catch (error) {
    if (notFound && isNotFound(error)) return errorResponse(notFound, 404)
    console.error(failed, error)
    return errorResponse(failed, 500)
  }
}
