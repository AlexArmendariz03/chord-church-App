import "server-only"
import { prisma } from "@/shared/server/prisma"
import type { ChurchListItem, CurrentChurch } from "@/features/churches/types"

// Consultas de iglesias; solo las usa el master (permiso manageChurches), salvo findChurch,
// que da el nombre de la iglesia de la sesión para el encabezado

const CHURCH_SELECT = { id: true, name: true } as const

const SUMMARY_SELECT = { ...CHURCH_SELECT, createdAt: true, _count: { select: { users: true, songs: true, services: true } } } as const

const toListItem = ({ _count, createdAt, ...church }: { id: string; name: string; createdAt: Date; _count: { users: number; songs: number; services: number } }): ChurchListItem =>
  ({ ...church, ..._count, createdAt: createdAt.toISOString() })

export const listChurches = async (): Promise<ChurchListItem[]> =>
  (await prisma.church.findMany({ orderBy: { name: "asc" }, select: SUMMARY_SELECT })).map(toListItem)

// Una iglesia con cuánto tiene, para su página de administración
export const findChurchSummary = async (id: string): Promise<ChurchListItem | null> => {
  const church = await prisma.church.findUnique({ where: { id }, select: SUMMARY_SELECT })
  return church ? toListItem(church) : null
}

export const findChurch = (id: string): Promise<CurrentChurch | null> =>
  prisma.church.findUnique({ where: { id }, select: CHURCH_SELECT })

// Si la consulta falla, la página sigue sin el nombre de la iglesia en vez de mostrar un error
export const findChurchSafely = async (id: string) => {
  try {
    return await findChurch(id)
  } catch (error) {
    console.error("No se pudo leer la iglesia de la sesión", error)
    return null
  }
}

export const createChurch = (name: string) => prisma.church.create({ data: { name }, select: CHURCH_SELECT })

export const renameChurch = (id: string, name: string) =>
  prisma.church.update({ where: { id }, data: { name }, select: CHURCH_SELECT })
