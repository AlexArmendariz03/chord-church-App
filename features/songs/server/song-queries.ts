import type { Prisma } from "@prisma/client"
import { prisma } from "@/shared/server/prisma"

// Consultas de alabanzas; las rutas de la API solo validan y llaman a estas funciones

export const listSongs = () => prisma.song.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] })

export const findSong = (id: string) => prisma.song.findUnique({ where: { id } })

export const createSong = (data: Prisma.SongCreateInput) => prisma.song.create({ data })

export const updateSong = (id: string, data: Prisma.SongUpdateInput) => prisma.song.update({ where: { id }, data })

export const deleteSong = (id: string) => prisma.song.delete({ where: { id } })
